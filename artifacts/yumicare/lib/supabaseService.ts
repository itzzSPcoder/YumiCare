/**
 * YumiCare Supabase Service Layer
 * All database operations go through here.
 * The AppContext calls these functions instead of manipulating local state directly.
 */
import { supabase } from "./supabase";
import type {
  DbVital,
  DbAppointment,
  DbPrescription,
  DbChatMessage,
  DbBedAllocation,
  DbAuditLog,
  DbKickSession,
  DbUltrasoundUpload,
} from "./supabase";

// ─── Vitals ─────────────────────────────────────────────

export async function fetchVitals(patientId: string): Promise<DbVital[]> {
  const { data, error } = await supabase
    .from("vitals")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });
  if (error) { console.error("fetchVitals:", error.message); return []; }
  return data ?? [];
}

export async function insertVital(vital: Omit<DbVital, "id" | "created_at">) {
  const { data, error } = await supabase.from("vitals").insert(vital).select().single();
  if (error) console.error("insertVital:", error.message);
  return data;
}

// ─── Appointments ───────────────────────────────────────

export async function fetchAppointments(filters?: { patientId?: string; doctorId?: string; hospitalId?: string }): Promise<DbAppointment[]> {
  let query = supabase.from("appointments").select("*").order("date", { ascending: false });
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId);
  if (filters?.hospitalId) query = query.eq("hospital_id", filters.hospitalId);
  const { data, error } = await query;
  if (error) { console.error("fetchAppointments:", error.message); return []; }
  return data ?? [];
}

export async function insertAppointment(apt: Omit<DbAppointment, "id" | "created_at">) {
  const { data, error } = await supabase.from("appointments").insert(apt).select().single();
  if (error) console.error("insertAppointment:", error.message);
  return data;
}

export async function updateAppointmentStatus(id: string, status: DbAppointment["status"]) {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) console.error("updateAppointmentStatus:", error.message);
}

// ─── Prescriptions ──────────────────────────────────────

export async function fetchPrescriptions(filters?: { patientId?: string; doctorId?: string }): Promise<DbPrescription[]> {
  let query = supabase.from("prescriptions").select("*").order("date", { ascending: false });
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.doctorId) query = query.eq("doctor_id", filters.doctorId);
  const { data, error } = await query;
  if (error) { console.error("fetchPrescriptions:", error.message); return []; }
  return data ?? [];
}

export async function insertPrescription(rx: Omit<DbPrescription, "id" | "created_at">) {
  const { data, error } = await supabase.from("prescriptions").insert(rx).select().single();
  if (error) console.error("insertPrescription:", error.message);
  return data;
}

// ─── Chat Messages ──────────────────────────────────────

export async function fetchChatMessages(conversationKey: string): Promise<DbChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_key", conversationKey)
    .order("created_at", { ascending: true });
  if (error) { console.error("fetchChatMessages:", error.message); return []; }
  return data ?? [];
}

export async function insertChatMessage(msg: Omit<DbChatMessage, "id" | "created_at">) {
  const { data, error } = await supabase.from("chat_messages").insert(msg).select().single();
  if (error) console.error("insertChatMessage:", error.message);
  return data;
}

export function subscribeToChatMessages(conversationKey: string, onMessage: (msg: DbChatMessage) => void) {
  return supabase
    .channel(`chat:${conversationKey}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "chat_messages",
      filter: `conversation_key=eq.${conversationKey}`,
    }, (payload) => {
      onMessage(payload.new as DbChatMessage);
    })
    .subscribe();
}

// ─── Bed Allocations ────────────────────────────────────

export async function fetchBeds(hospitalId: string): Promise<DbBedAllocation[]> {
  const { data, error } = await supabase
    .from("bed_allocations")
    .select("*")
    .eq("hospital_id", hospitalId)
    .order("bed_number");
  if (error) { console.error("fetchBeds:", error.message); return []; }
  return data ?? [];
}

export async function updateBedStatus(bedId: string, updates: Partial<DbBedAllocation>) {
  const { error } = await supabase.from("bed_allocations").update(updates).eq("id", bedId);
  if (error) console.error("updateBedStatus:", error.message);
}

// ─── Audit Logs ─────────────────────────────────────────

export async function fetchAuditLogs(limit = 100): Promise<DbAuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("fetchAuditLogs:", error.message); return []; }
  return data ?? [];
}

export async function insertAuditLog(log: Omit<DbAuditLog, "id" | "created_at">) {
  const { data, error } = await supabase.from("audit_logs").insert(log).select().single();
  if (error) console.error("insertAuditLog:", error.message);
  return data;
}

// ─── Kick Sessions ──────────────────────────────────────

export async function fetchKickSessions(patientId: string): Promise<DbKickSession[]> {
  const { data, error } = await supabase
    .from("kick_sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchKickSessions:", error.message); return []; }
  return data ?? [];
}

export async function insertKickSession(session: Omit<DbKickSession, "id" | "created_at">) {
  const { data, error } = await supabase.from("kick_sessions").insert(session).select().single();
  if (error) console.error("insertKickSession:", error.message);
  return data;
}

// ─── Ultrasound Uploads ─────────────────────────────────

export async function uploadUltrasoundImage(file: { uri: string; name: string; type: string }, patientId: string) {
  const path = `${patientId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("ultrasound-images")
    .upload(path, { uri: file.uri, type: file.type, name: file.name } as any);
  if (error) { console.error("uploadUltrasoundImage:", error.message); return null; }
  const { data: urlData } = supabase.storage.from("ultrasound-images").getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

export async function insertUltrasoundRecord(record: Omit<DbUltrasoundUpload, "id" | "created_at">) {
  const { data, error } = await supabase.from("ultrasound_uploads").insert(record).select().single();
  if (error) console.error("insertUltrasoundRecord:", error.message);
  return data;
}

export async function fetchUltrasounds(patientId: string): Promise<DbUltrasoundUpload[]> {
  const { data, error } = await supabase
    .from("ultrasound_uploads")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchUltrasounds:", error.message); return []; }
  return data ?? [];
}

// ─── Profiles / Users ───────────────────────────────────

export async function fetchAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchAllProfiles:", error.message); return []; }
  return data ?? [];
}

export async function updateProfile(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) console.error("updateProfile:", error.message);
}

// ─── Patients ──────────────────────────────────────────

export async function fetchPatients(doctorId?: string): Promise<any[]> {
  let query = supabase.from("patients").select("*").order("name");
  if (doctorId) query = query.eq("primary_doctor_id", doctorId);
  const { data, error } = await query;
  if (error) { console.error("fetchPatients:", error.message); return []; }
  return data ?? [];
}

// ─── Doctors ───────────────────────────────────────────

export async function fetchDoctors(hospitalId?: string): Promise<any[]> {
  let query = supabase.from("doctors").select("*").order("name");
  if (hospitalId) query = query.eq("hospital_id", hospitalId);
  const { data, error } = await query;
  if (error) { console.error("fetchDoctors:", error.message); return []; }
  return data ?? [];
}

// ─── Hospitals ──────────────────────────────────────────

export async function fetchHospitals(): Promise<any[]> {
  const { data, error } = await supabase.from("hospitals").select("*").order("name");
  if (error) { console.error("fetchHospitals:", error.message); return []; }
  return data ?? [];
}
