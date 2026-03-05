CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  base_cost DECIMAL(10,2) NOT NULL,
  max_technicians INT NOT NULL,
  ticket_quota INT NOT NULL,
  has_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  plan_id UUID REFERENCES plans(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('Technicien','Admin','SuperAdmin')),
  hotel_id UUID REFERENCES hotels(id),
  skills TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'actif',
  login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#0D9488',
  hotel_id UUID REFERENCES hotels(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scan_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(20) DEFAULT 'Chambre',
  floor VARCHAR(50),
  wing VARCHAR(50),
  hotel_id UUID REFERENCES hotels(id),
  qr_code_url TEXT,
  status VARCHAR(20) DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predefined_faults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES categories(id),
  default_priority VARCHAR(20) DEFAULT 'NORMALE',
  hotel_id UUID REFERENCES hotels(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'OPEN',
  priority VARCHAR(20) DEFAULT 'NORMALE',
  hotel_id UUID REFERENCES hotels(id),
  category_id UUID REFERENCES categories(id),
  scan_point_id UUID REFERENCES scan_points(id),
  predefined_fault_id UUID REFERENCES predefined_faults(id),
  client_email VARCHAR(200),
  client_phone VARCHAR(50),
  client_name VARCHAR(200),
  assigned_to UUID REFERENCES users(id),
  assigned_by_ai BOOLEAN DEFAULT false,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(300) NOT NULL,
  assigned_by_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) UNIQUE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  sentiment VARCHAR(20) DEFAULT 'NEUTRE',
  sentiment_score DECIMAL(5,2) DEFAULT 0,
  themes TEXT[] DEFAULT '{}',
  visible BOOLEAN DEFAULT false,
  review_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id),
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(300),
  paid_at TIMESTAMP DEFAULT NOW(),
  next_payment_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'paid'
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(300) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans
INSERT INTO plans (id, name, base_cost, max_technicians, ticket_quota, has_ai) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Starter', 49, 2, 50, false),
  ('22222222-2222-2222-2222-222222222222', 'Pro', 149, 10, 500, true),
  ('33333333-3333-3333-3333-333333333333', 'Enterprise', 499, 999, 999999, true)
ON CONFLICT DO NOTHING;

-- Hotels
INSERT INTO hotels (id, name, address, status, plan_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hotel Le Grand Bleu', '15 Promenade des Anglais, Nice', 'active', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hotel des Pins', '8 Rue du Parc, Bordeaux', 'active', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Users (mot de passe = "password")
INSERT INTO users (id, email, password_hash, first_name, last_name, role, hotel_id, skills) VALUES
  ('00000000-0000-0000-0000-000000000001', 'superadmin@tickethotel.com', '$2a$10$mod5UuNNOGaGhR7TslG34.HgG0s8n3ncWJS5LWArO.rvtVxIvOx7W', 'Super', 'Admin', 'SuperAdmin', NULL, '{}'),
  ('00000000-0000-0000-0000-000000000002', 'admin@grandbleu.com', '$2a$10$mod5UuNNOGaGhR7TslG34.HgG0s8n3ncWJS5LWArO.rvtVxIvOx7W', 'Sarah', 'Connor', 'Admin', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{}'),
  ('00000000-0000-0000-0000-000000000003', 'thomas@grandbleu.com', '$2a$10$mod5UuNNOGaGhR7TslG34.HgG0s8n3ncWJS5LWArO.rvtVxIvOx7W', 'Thomas', 'Dubois', 'Technicien', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Plomberie","CVC"}'),
  ('00000000-0000-0000-0000-000000000004', 'sophie@grandbleu.com', '$2a$10$mod5UuNNOGaGhR7TslG34.HgG0s8n3ncWJS5LWArO.rvtVxIvOx7W', 'Sophie', 'Martin', 'Technicien', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Electricite","Reseau"}')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (id, name, color, hotel_id) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'Plomberie', '#3B82F6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('a0000002-0000-0000-0000-000000000000', 'Electricite', '#F59E0B', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('a0000003-0000-0000-0000-000000000000', 'CVC', '#10B981', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('a0000004-0000-0000-0000-000000000000', 'Reseau', '#8B5CF6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Scan points
INSERT INTO scan_points (id, name, type, floor, hotel_id, status) VALUES
  ('b0000001-0000-0000-0000-000000000000', 'Chambre 101', 'Chambre', '1er Etage', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'actif'),
  ('b0000002-0000-0000-0000-000000000000', 'Chambre 304', 'Chambre', '3eme Etage', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'actif'),
  ('b0000003-0000-0000-0000-000000000000', 'Hall Principal', 'Zone', 'Rez-de-chaussee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'actif')
ON CONFLICT DO NOTHING;

-- Pannes predefinies
INSERT INTO predefined_faults (name, category_id, default_priority, hotel_id) VALUES
  ('Fuite d''eau', 'a0000001-0000-0000-0000-000000000000', 'URGENT', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('Climatisation en panne', 'a0000003-0000-0000-0000-000000000000', 'URGENT', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('Ampoule grillee', 'a0000002-0000-0000-0000-000000000000', 'BASSE', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('Probleme Wi-Fi', 'a0000004-0000-0000-0000-000000000000', 'MOYENNE', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Tickets de demo
INSERT INTO tickets (reference, title, description, status, priority, hotel_id, category_id, scan_point_id, client_email, client_name, assigned_to) VALUES
  ('TH-12345', 'Fuite d''eau - SDB', 'Fuite importante sous le lavabo', 'IN_PROGRESS', 'URGENT', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000001-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'jean@email.com', 'Mr. Jean Martin', '00000000-0000-0000-0000-000000000003'),
  ('TH-12344', 'Panne Climatisation', 'Clim hors service', 'OPEN', 'HAUTE', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000003-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'alice@email.com', 'Mme. Alice', NULL),
  ('TH-12341', 'Ampoule grillee', 'Entree sombre', 'OPEN', 'NORMALE', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a0000002-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'bob@email.com', 'Mr. Bob', NULL)
ON CONFLICT DO NOTHING;

-- Paiements
INSERT INTO payments (hotel_id, amount, description, paid_at, next_payment_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 149.00, 'Abonnement Pro', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 149.00, 'Abonnement Pro', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;