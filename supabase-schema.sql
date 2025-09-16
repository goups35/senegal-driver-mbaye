-- Création des tables pour le MVP du chauffeur sénégalais

-- Table des demandes de voyage
CREATE TABLE trip_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure TEXT DEFAULT 'Dakar',
  destination TEXT DEFAULT 'Aéroport Léopold Sédar Senghor',
  date DATE NOT NULL,
  time TIME DEFAULT '08:00',
  passengers INTEGER NOT NULL CHECK (passengers >= 1 AND passengers <= 8),
  duration INTEGER NOT NULL DEFAULT 7 CHECK (duration >= 1 AND duration <= 30),
  vehicle_type TEXT DEFAULT 'standard' CHECK (vehicle_type IN ('standard', 'premium', 'suv')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
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