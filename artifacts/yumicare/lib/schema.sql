-- ╔══════════════════════════════════════════════════════════════╗
-- ║  YumiCare — Supabase Database Schema                       ║
-- ║  Run this in: Supabase Dashboard → SQL Editor → New Query   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'hospital', 'doctor', 'patient');
CREATE TYPE patient_status AS ENUM ('stable', 'attention', 'critical');
CREATE TYPE doctor_status AS ENUM ('active', 'inactive');
CREATE TYPE hospital_status AS ENUM ('active', 'inactive');
CREATE TYPE appointment_type AS ENUM ('routine', 'ultrasound', 'lab', 'follow-up', 'emergency');
CREATE TYPE appointment_status AS ENUM ('upcoming', 'completed', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE bed_ward AS ENUM ('general', 'labor', 'icu', 'private');
CREATE TYPE bed_status AS ENUM ('available', 'occupied');
CREATE TYPE message_type AS ENUM ('text', 'voice', 'image', 'video');
CREATE TYPE scan_type AS ENUM ('2d', '3d', '4d', 'color_doppler');
CREATE TYPE ai_health_status AS ENUM ('normal', 'review_needed', 'anomaly_detected');

-- ─── 1. PROFILES (extends Supabase auth.users) ─────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. HOSPITALS ──────────────────────────────────────────
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  accreditation TEXT DEFAULT '',
  departments TEXT[] DEFAULT '{}',
  total_beds INTEGER DEFAULT 0,
  status hospital_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. DOCTORS ────────────────────────────────────────────
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialization TEXT DEFAULT '',
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT DEFAULT '',
  patients_count INTEGER DEFAULT 0,
  status doctor_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. PATIENTS ───────────────────────────────────────────
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER DEFAULT 0,
  blood_group TEXT DEFAULT '',
  pregnancy_week INTEGER DEFAULT 0,
  due_date TEXT DEFAULT '',
  primary_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  primary_doctor_name TEXT DEFAULT '',
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  status patient_status DEFAULT 'stable',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. VITALS ────────────────────────────────────────────
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  weight_kg NUMERIC(5,2),
  glucose_mg_dl INTEGER,
  hemoglobin_g_dl NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. APPOINTMENTS ──────────────────────────────────────
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name TEXT DEFAULT '',
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type appointment_type DEFAULT 'routine',
  status appointment_status DEFAULT 'upcoming',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. PRESCRIPTIONS ────────────────────────────────────
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT DEFAULT '',
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name TEXT DEFAULT '',
  date TEXT NOT NULL,
  status prescription_status DEFAULT 'active',
  clinical_notes TEXT,
  medications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. CHAT MESSAGES ────────────────────────────────────
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_key TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 9. BED ALLOCATIONS ─────────────────────────────────
CREATE TABLE bed_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
  bed_number TEXT NOT NULL,
  ward bed_ward DEFAULT 'general',
  status bed_status DEFAULT 'available',
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_name TEXT,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  doctor_name TEXT,
  admission_date TEXT,
  notes TEXT
);

-- ─── 10. ULTRASOUND UPLOADS ─────────────────────────────
CREATE TABLE ultrasound_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  scan_type scan_type DEFAULT '2d',
  gestational_week INTEGER DEFAULT 0,
  ai_detections JSONB DEFAULT '{}',
  measurements JSONB DEFAULT '{}',
  ai_health_status ai_health_status DEFAULT 'normal',
  ai_confidence NUMERIC(3,2) DEFAULT 0,
  doctor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 11. AUDIT LOGS ─────────────────────────────────────
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 12. KICK SESSIONS ─────────────────────────────────
CREATE TABLE kick_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  kicks INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 13. TIMELINE ENTRIES ───────────────────────────────
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  doctor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_vitals_patient ON vitals(patient_id);
CREATE INDEX idx_vitals_date ON vitals(date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_chat_conversation ON chat_messages(conversation_key);
CREATE INDEX idx_chat_created ON chat_messages(created_at);
CREATE INDEX idx_beds_hospital ON bed_allocations(hospital_id);
CREATE INDEX idx_ultrasound_patient ON ultrasound_uploads(patient_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_kicks_patient ON kick_sessions(patient_id);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ultrasound_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users full access.
-- In production, tighten these per-role.
CREATE POLICY "Allow full access for authenticated users" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON hospitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON bed_allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON ultrasound_uploads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON kick_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for authenticated users" ON timeline_entries FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- REALTIME (for live chat)
-- ═══════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE vitals;

-- ═══════════════════════════════════════════════════════════
-- STORAGE BUCKETS (run these in Dashboard → Storage)
-- ═══════════════════════════════════════════════════════════
-- Create these buckets manually in Supabase Dashboard:
-- 1. "ultrasound-images"  (public: false)
-- 2. "ultrasound-ai-results" (public: false)
-- 3. "patient-documents" (public: false)

-- ═══════════════════════════════════════════════════════════
-- SEED DATA — Demo accounts
-- ═══════════════════════════════════════════════════════════
-- NOTE: These are inserted AFTER you create auth users via
-- Supabase Dashboard → Authentication → Add User
-- The UUIDs below should match the auth.users IDs.
-- For now, we'll use the app-level login which handles
-- seeding automatically.

SELECT 'YumiCare schema created successfully! 🎉' AS status;
