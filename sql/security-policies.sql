-- Security policies for Senegal Driver MVP
-- Enable Row Level Security (RLS) on all tables

-- Enable RLS on existing tables
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distance_matrix ENABLE ROW LEVEL SECURITY;

-- Create roles for different access levels
CREATE ROLE IF NOT EXISTS senegal_public;
CREATE ROLE IF NOT EXISTS senegal_authenticated;
CREATE ROLE IF NOT EXISTS senegal_admin;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO senegal_public;
GRANT USAGE ON SCHEMA public TO senegal_authenticated;
GRANT USAGE ON SCHEMA public TO senegal_admin;

-- Policies for saved_itineraries table
CREATE POLICY "Allow public read access to published itineraries" ON public.saved_itineraries
    FOR SELECT 
    USING (
        status = 'published' OR 
        status IS NULL OR
        auth.role() = 'senegal_admin'::text
    );

CREATE POLICY "Allow public insert for new itineraries" ON public.saved_itineraries
    FOR INSERT 
    WITH CHECK (
        -- Anyone can create itineraries, but they start as draft
        status IS NULL OR 
        status = 'draft' OR
        auth.role() = 'senegal_admin'::text
    );

CREATE POLICY "Allow update own itineraries" ON public.saved_itineraries
    FOR UPDATE 
    USING (
        -- Allow updates to own itineraries (by session or admin)
        auth.role() = 'senegal_admin'::text OR
        (client_phone IS NOT NULL AND auth.jwt() ->> 'phone' = client_phone) OR
        (created_at > NOW() - INTERVAL '24 hours' AND auth.role() = 'senegal_public'::text)
    );

CREATE POLICY "Prevent deletion of itineraries" ON public.saved_itineraries
    FOR DELETE 
    USING (
        -- Only admin can delete
        auth.role() = 'senegal_admin'::text
    );

-- Policies for distance_matrix table (read-only for public)
CREATE POLICY "Allow public read access to distances" ON public.distance_matrix
    FOR SELECT 
    USING (true);

CREATE POLICY "Prevent public modification of distances" ON public.distance_matrix
    FOR INSERT 
    WITH CHECK (auth.role() = 'senegal_admin'::text);

CREATE POLICY "Prevent public update of distances" ON public.distance_matrix
    FOR UPDATE 
    USING (auth.role() = 'senegal_admin'::text);

CREATE POLICY "Prevent public deletion of distances" ON public.distance_matrix
    FOR DELETE 
    USING (auth.role() = 'senegal_admin'::text);

-- Create function to validate itinerary data
CREATE OR REPLACE FUNCTION validate_itinerary_data(data jsonb)
RETURNS boolean AS $$
BEGIN
    -- Basic validation for required fields
    IF data IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check for required itinerary structure
    IF NOT (data ? 'itinerary') THEN
        RETURN false;
    END IF;
    
    -- Validate destinations array exists
    IF NOT (data->'itinerary' ? 'destinations') THEN
        RETURN false;
    END IF;
    
    -- Check destinations is an array with at least one item
    IF jsonb_array_length(data->'itinerary'->'destinations') < 1 THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure valid itinerary data
ALTER TABLE public.saved_itineraries 
ADD CONSTRAINT valid_itinerary_data 
CHECK (validate_itinerary_data(itinerary_data));

-- Create function to sanitize client input
CREATE OR REPLACE FUNCTION sanitize_text_input(input_text text)
RETURNS text AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove potentially dangerous characters and limit length
    RETURN LEFT(TRIM(regexp_replace(input_text, '[<>"\'';&]', '', 'g')), 1000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sanitize inputs on insert/update
CREATE OR REPLACE FUNCTION sanitize_itinerary_inputs()
RETURNS TRIGGER AS $$
BEGIN
    -- Sanitize text fields
    NEW.title := sanitize_text_input(NEW.title);
    NEW.client_name := sanitize_text_input(NEW.client_name);
    NEW.client_phone := sanitize_text_input(NEW.client_phone);
    NEW.whatsapp_message := sanitize_text_input(NEW.whatsapp_message);
    
    -- Ensure status is valid
    IF NEW.status IS NOT NULL AND NEW.status NOT IN ('draft', 'confirmed', 'published', 'cancelled') THEN
        NEW.status := 'draft';
    END IF;
    
    -- Set default status if null
    IF NEW.status IS NULL THEN
        NEW.status := 'draft';
    END IF;
    
    -- Validate numeric fields
    IF NEW.duration IS NOT NULL AND (NEW.duration < 1 OR NEW.duration > 365) THEN
        NEW.duration := NULL;
    END IF;
    
    IF NEW.group_size IS NOT NULL AND (NEW.group_size < 1 OR NEW.group_size > 50) THEN
        NEW.group_size := 1;
    END IF;
    
    -- Validate budget fields
    IF NEW.budget_min IS NOT NULL AND NEW.budget_min < 0 THEN
        NEW.budget_min := NULL;
    END IF;
    
    IF NEW.budget_max IS NOT NULL AND NEW.budget_max < 0 THEN
        NEW.budget_max := NULL;
    END IF;
    
    -- Ensure budget_max >= budget_min
    IF NEW.budget_min IS NOT NULL AND NEW.budget_max IS NOT NULL AND NEW.budget_max < NEW.budget_min THEN
        NEW.budget_max := NEW.budget_min;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sanitize_itinerary_trigger ON public.saved_itineraries;
CREATE TRIGGER sanitize_itinerary_trigger
    BEFORE INSERT OR UPDATE ON public.saved_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION sanitize_itinerary_inputs();

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    operation text NOT NULL,
    record_id text,
    old_data jsonb,
    new_data jsonb,
    user_id text,
    ip_address inet,
    user_agent text,
    request_id text,
    created_at timestamptz DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin can read audit logs
CREATE POLICY "Admin only access to audit logs" ON public.audit_log
    FOR ALL 
    USING (auth.role() = 'senegal_admin'::text);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_data jsonb := jsonb_build_object();
    user_info jsonb := auth.jwt();
BEGIN
    -- Build audit data
    audit_data := jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW(),
        'user_info', user_info
    );
    
    -- Add record ID if available
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        audit_data := audit_data || jsonb_build_object('record_id', COALESCE(OLD.id::text, 'unknown'));
        audit_data := audit_data || jsonb_build_object('old_data', to_jsonb(OLD));
    END IF;
    
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        audit_data := audit_data || jsonb_build_object('record_id', COALESCE(NEW.id::text, 'unknown'));
        audit_data := audit_data || jsonb_build_object('new_data', to_jsonb(NEW));
    END IF;
    
    -- Insert audit record (this bypasses RLS as it's a security function)
    INSERT INTO public.audit_log (
        table_name,
        operation,
        record_id,
        old_data,
        new_data,
        user_id,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(
            CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
            'unknown'
        ),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        COALESCE(user_info ->> 'sub', 'anonymous'),
        NOW()
    );
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
DROP TRIGGER IF EXISTS audit_saved_itineraries ON public.saved_itineraries;
CREATE TRIGGER audit_saved_itineraries
    AFTER INSERT OR UPDATE OR DELETE ON public.saved_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION audit_table_changes();

-- Create function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
BEGIN
    -- Delete old draft itineraries (older than 30 days)
    DELETE FROM public.saved_itineraries 
    WHERE status = 'draft' 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old audit logs (older than 90 days)
    DELETE FROM public.audit_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Log cleanup operation
    INSERT INTO public.audit_log (
        table_name,
        operation,
        user_id,
        new_data,
        created_at
    ) VALUES (
        'system_cleanup',
        'DELETE',
        'system',
        jsonb_build_object('cleanup_timestamp', NOW()),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_status ON public.saved_itineraries(status);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_created_at ON public.saved_itineraries(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_client_phone ON public.saved_itineraries(client_phone) WHERE client_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation ON public.audit_log(table_name, operation);

-- Grant permissions to roles
GRANT SELECT ON public.saved_itineraries TO senegal_public;
GRANT INSERT ON public.saved_itineraries TO senegal_public;
GRANT SELECT ON public.distance_matrix TO senegal_public;

GRANT ALL ON public.saved_itineraries TO senegal_authenticated;
GRANT SELECT ON public.distance_matrix TO senegal_authenticated;
GRANT SELECT ON public.audit_log TO senegal_authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO senegal_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO senegal_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO senegal_admin;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-old-records', '0 2 * * *', 'SELECT cleanup_old_records();');

COMMENT ON TABLE public.saved_itineraries IS 'Stores user-generated travel itineraries with RLS protection';
COMMENT ON TABLE public.audit_log IS 'Security audit log for tracking data changes';
COMMENT ON FUNCTION validate_itinerary_data(jsonb) IS 'Validates itinerary data structure before storage';
COMMENT ON FUNCTION sanitize_text_input(text) IS 'Sanitizes user text input to prevent injection attacks';
COMMENT ON FUNCTION cleanup_old_records() IS 'Scheduled function to clean up old draft records and audit logs';