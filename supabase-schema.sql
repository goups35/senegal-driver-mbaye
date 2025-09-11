-- Création des tables pour le MVP du chauffeur sénégalais

-- Table des demandes de voyage
CREATE TABLE trip_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure TEXT NOT NULL,
  destination TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  passengers INTEGER NOT NULL CHECK (passengers >= 1 AND passengers <= 8),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('standard', 'premium', 'suv')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des devis/itinéraires générés
CREATE TABLE trip_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_request_id UUID REFERENCES trip_requests(id) ON DELETE CASCADE,
  distance DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  route JSONB NOT NULL, -- Stockage des étapes de l'itinéraire
  vehicle_info JSONB NOT NULL, -- Informations sur le véhicule
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_trip_requests_created_at ON trip_requests(created_at);
CREATE INDEX idx_trip_requests_customer_phone ON trip_requests(customer_phone);
CREATE INDEX idx_trip_quotes_trip_request_id ON trip_quotes(trip_request_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_trip_requests_updated_at 
    BEFORE UPDATE ON trip_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - optionnel pour le MVP
-- ALTER TABLE trip_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trip_quotes ENABLE ROW LEVEL SECURITY;

-- Politique simple pour permettre toutes les opérations (MVP uniquement)
-- CREATE POLICY "Allow all operations on trip_requests" ON trip_requests FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on trip_quotes" ON trip_quotes FOR ALL USING (true);

-- Table des itinéraires sauvegardés (Phase 2A)
CREATE TABLE saved_itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  destinations JSONB NOT NULL, -- Liste des destinations principales
  itinerary_data JSONB NOT NULL, -- Données complètes de l'itinéraire
  ai_recommendation JSONB NOT NULL, -- Réponse IA complète
  whatsapp_message TEXT NOT NULL, -- Message formaté pour WhatsApp
  duration INTEGER NOT NULL, -- Durée en jours
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  budget_currency TEXT DEFAULT 'FCFA',
  group_size INTEGER DEFAULT 1,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour optimiser les requêtes sur les itinéraires
CREATE INDEX idx_saved_itineraries_created_at ON saved_itineraries(created_at);
CREATE INDEX idx_saved_itineraries_status ON saved_itineraries(status);
CREATE INDEX idx_saved_itineraries_client_phone ON saved_itineraries(client_phone);

-- Trigger pour updated_at sur saved_itineraries
CREATE TRIGGER update_saved_itineraries_updated_at 
    BEFORE UPDATE ON saved_itineraries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();