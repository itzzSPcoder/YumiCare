import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Config ───────────────────────────────────
const SUPABASE_URL = "https://zbdlqysysbqaodkwsfxp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__C0osx_-2zxv_mUKycz-2g__-gOTP-w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Database Types (matching Supabase tables) ─────────
export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "hospital" | "doctor" | "patient";
  is_active: boolean;
  phone?: string;
  created_at: string;
  last_login?: string;
}

export interface DbPatient {
  id: string;
  user_id: string;
  name: string;
  age: number;
  blood_group: string;
  pregnancy_week: number;
  due_date: string;
  primary_doctor_id?: string;
  primary_doctor_name?: string;
  hospital_id?: string;
  allergies: string[];
  medications: string[];
  status: "stable" | "attention" | "critical";
  created_at: string;
}

export interface DbDoctor {
  id: string;
  user_id: string;
  name: string;
  specialization: string;
  hospital_id: string;
  hospital_name: string;
  patients_count: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface DbHospital {
  id: string;
  user_id: string;
  name: string;
  city: string;
  accreditation: string;
  departments: string[];
  total_beds: number;
  status: "active" | "inactive";
  created_at: string;
}

export interface DbVital {
  id: string;
  patient_id: string;
  date: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  weight_kg?: number;
  glucose_mg_dl?: number;
  hemoglobin_g_dl?: number;
  notes?: string;
  created_at: string;
}

export interface DbAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  hospital_id: string;
  date: string;
  time: string;
  type: "routine" | "ultrasound" | "lab" | "follow-up" | "emergency";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

export interface DbPrescription {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  status: "active" | "completed" | "cancelled";
  clinical_notes?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  created_at: string;
}

export interface DbChatMessage {
  id: string;
  conversation_key: string;
  sender_id: string;
  sender_role: "doctor" | "patient";
  message_type: "text" | "voice" | "image" | "video";
  content?: string;
  media_url?: string;
  duration?: string;
  created_at: string;
}

export interface DbBedAllocation {
  id: string;
  hospital_id: string;
  bed_number: string;
  ward: "general" | "labor" | "icu" | "private";
  status: "available" | "occupied";
  patient_id?: string;
  patient_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  admission_date?: string;
  notes?: string;
}

export interface DbUltrasoundUpload {
  id: string;
  patient_id: string;
  doctor_id: string;
  image_url: string;
  scan_type: "2d" | "3d" | "4d" | "color_doppler";
  gestational_week: number;
  ai_detections?: Record<string, any>;
  measurements?: Record<string, any>;
  ai_health_status?: "normal" | "review_needed" | "anomaly_detected";
  ai_confidence?: number;
  doctor_notes?: string;
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity?: string;
  details?: string;
  created_at: string;
}

export interface DbKickSession {
  id: string;
  patient_id: string;
  date: string;
  start_time: string;
  kicks: number;
  duration_minutes: number;
  completed: boolean;
  created_at: string;
}
