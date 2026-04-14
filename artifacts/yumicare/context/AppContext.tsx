import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "patient" | "doctor" | "hospital" | "admin";

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  pregnancyWeek: number;
  dueDate: string;
  allergies: string[];
  medications: string[];
  primaryDoctor: string;
  qrCode: string;
  email: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  hospitalId: string;
  licenseNo: string;
  yearsExp: number;
  patientsCount: number;
  phone: string;
  email: string;
}

export interface HospitalProfile {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  type: string;
  beds: number;
  doctors: number;
  patients: number;
  accreditation: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdBy?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  loginAttempts: number;
  lockedUntil?: string;
}

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  pregnancyWeek: number;
  bloodGroup: string;
  dueDate: string;
  lastVisit: string;
  status: "stable" | "attention" | "critical";
  allergies: string[];
  medications: string[];
  email: string;
  doctorId: string;
  hospitalId: string;
}

export interface DoctorAccount {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNo: string;
  phone: string;
  patientsCount: number;
  hospitalId: string;
  status: "active" | "inactive";
  joinDate: string;
}

// ─── New Models ──────────────────────────────────────────────────────────────

export interface Vital {
  id: string;
  patientId: string;
  date: string;
  time: string;
  systolic?: number;
  diastolic?: number;
  weight?: number;
  glucose?: number;
  hemoglobin?: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  date: string;
  time: string;
  type: "routine" | "lab" | "ultrasound" | "emergency" | "follow-up";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: PrescriptionMed[];
  clinicalNotes: string;
  status: "active" | "completed";
}

export interface PrescriptionMed {
  name: string;
  dosage: string;
  frequency: "OD" | "BD" | "TDS" | "QID" | "SOS" | "HS";
  duration: string;
  instructions: string;
}

export interface ChatMessage {
  id: string;
  conversationKey: string;
  from: "doctor" | "patient";
  fromId: string;
  type: "text" | "voice" | "image" | "video";
  text?: string;
  duration?: string;
  mediaLabel?: string;
  time: string;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details?: string;
}

export interface BedAllocation {
  id: string;
  bedNumber: string;
  ward: "general" | "icu" | "labor" | "private";
  hospitalId: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  admissionDate?: string;
  dischargeDate?: string;
  status: "available" | "occupied";
  notes?: string;
}

export interface KickSession {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  kicks: number;
  durationMinutes: number;
  completed: boolean;
}

export interface TimelineEntry {
  id: string;
  date: string;
  type: "ultrasound" | "lab" | "medication" | "symptom" | "visit" | "prescription" | "vital";
  title: string;
  details: string;
  values?: Record<string, string | number>;
  doctor?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "alert" | "info" | "success" | "request";
  read: boolean;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const SEED_USERS: UserAccount[] = [
  { id: "admin-001", email: "admin@yumicare.com", password: "YumiAdmin@2024", role: "admin", name: "Super Admin", createdAt: "2024-01-01T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "hosp-001", email: "citywmc@yumicare.com", password: "CityWMC@123", role: "hospital", name: "City Women's Medical Center", createdBy: "admin-001", createdAt: "2024-02-15T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "hosp-002", email: "apollo@yumicare.com", password: "Apollo@123", role: "hospital", name: "Apollo Maternity Hospital", createdBy: "admin-001", createdAt: "2024-03-01T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "doc-001", email: "dr.priya@yumicare.com", password: "DrPriya@123", role: "doctor", name: "Dr. Priya Sharma", createdBy: "hosp-001", createdAt: "2024-03-15T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "doc-002", email: "dr.mehta@yumicare.com", password: "DrMehta@123", role: "doctor", name: "Dr. Raj Mehta", createdBy: "hosp-001", createdAt: "2024-06-01T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "pat-001", email: "aisha@yumicare.com", password: "Aisha@123", role: "patient", name: "Aisha Rahman", createdBy: "doc-001", createdAt: "2025-12-01T00:00:00Z", isActive: true, loginAttempts: 0 },
  { id: "pat-002", email: "sara@yumicare.com", password: "Sara@123", role: "patient", name: "Sara Khan", createdBy: "doc-001", createdAt: "2025-10-10T00:00:00Z", isActive: true, loginAttempts: 0 },
];

const SEED_HOSPITALS: HospitalProfile[] = [
  { id: "hosp-001", name: "City Women's Medical Center", city: "Mumbai", address: "42, Linking Road, Bandra West, Mumbai 400050", phone: "+91 22 6789 0100", email: "citywmc@yumicare.com", type: "Multi-Specialty", beds: 250, doctors: 8, patients: 124, accreditation: "NABH Accredited" },
  { id: "hosp-002", name: "Apollo Maternity Hospital", city: "Delhi", address: "Plot 1A, Sector 26, Noida 201301", phone: "+91 11 4567 8900", email: "apollo@yumicare.com", type: "Maternity", beds: 180, doctors: 5, patients: 86, accreditation: "JCI Accredited" },
];

const SEED_DOCTORS: DoctorAccount[] = [
  { id: "doc-001", name: "Dr. Priya Sharma", email: "dr.priya@yumicare.com", specialization: "Obstetrics & Gynecology", licenseNo: "MCI-OBG-2018-4472", phone: "+91 98765 43210", patientsCount: 4, hospitalId: "hosp-001", status: "active", joinDate: "2020-03-15" },
  { id: "doc-002", name: "Dr. Raj Mehta", email: "dr.mehta@yumicare.com", specialization: "Maternal-Fetal Medicine", licenseNo: "MCI-MFM-2015-3310", phone: "+91 98123 45678", patientsCount: 2, hospitalId: "hosp-001", status: "active", joinDate: "2021-07-01" },
];

const SEED_PATIENTS: DoctorPatient[] = [
  { id: "pat-001", name: "Aisha Rahman", age: 28, pregnancyWeek: 24, bloodGroup: "B+", dueDate: "2026-07-15", lastVisit: "2026-03-25", status: "stable", allergies: ["Penicillin", "Sulfa drugs"], medications: ["Folic Acid 5mg", "Iron Supplement", "Vitamin D3"], email: "aisha@yumicare.com", doctorId: "doc-001", hospitalId: "hosp-001" },
  { id: "pat-002", name: "Sara Khan", age: 31, pregnancyWeek: 32, bloodGroup: "O+", dueDate: "2026-05-02", lastVisit: "2026-03-27", status: "attention", allergies: ["Aspirin"], medications: ["Metformin 500mg", "Folic Acid", "Iron"], email: "sara@yumicare.com", doctorId: "doc-001", hospitalId: "hosp-001" },
  { id: "pat-003", name: "Mia Johnson", age: 25, pregnancyWeek: 14, bloodGroup: "A-", dueDate: "2026-09-10", lastVisit: "2026-03-20", status: "stable", allergies: [], medications: ["Folic Acid 5mg", "Vitamin B12"], email: "mia@yumicare.com", doctorId: "doc-001", hospitalId: "hosp-001" },
  { id: "pat-004", name: "Nadia Malik", age: 34, pregnancyWeek: 38, bloodGroup: "AB+", dueDate: "2026-04-10", lastVisit: "2026-03-28", status: "critical", allergies: ["Latex", "Codeine"], medications: ["Labetalol 100mg", "Aspirin 75mg", "Calcium"], email: "nadia@yumicare.com", doctorId: "doc-001", hospitalId: "hosp-001" },
];

const SEED_VITALS: Vital[] = [
  { id: "v1", patientId: "pat-001", date: "2026-03-25", time: "09:30", systolic: 118, diastolic: 76, weight: 62.5, glucose: 95, hemoglobin: 11.2, notes: "Normal readings" },
  { id: "v2", patientId: "pat-001", date: "2026-03-18", time: "10:00", systolic: 116, diastolic: 74, weight: 62.0, glucose: 92, hemoglobin: 11.0 },
  { id: "v3", patientId: "pat-001", date: "2026-03-10", time: "09:45", systolic: 120, diastolic: 78, weight: 61.5, glucose: 98 },
  { id: "v4", patientId: "pat-002", date: "2026-03-27", time: "11:00", systolic: 132, diastolic: 86, weight: 71.0, glucose: 128, hemoglobin: 10.8 },
  { id: "v5", patientId: "pat-002", date: "2026-03-15", time: "10:30", systolic: 128, diastolic: 82, weight: 70.5, glucose: 115 },
  { id: "v6", patientId: "pat-004", date: "2026-03-28", time: "08:00", systolic: 148, diastolic: 96, weight: 76.0, glucose: 110, hemoglobin: 10.2, notes: "Elevated BP — monitoring" },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: "apt-001", patientId: "pat-001", patientName: "Aisha Rahman", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", hospitalId: "hosp-001", date: "2026-04-04", time: "10:00 AM", type: "routine", status: "upcoming", createdAt: "2026-03-25T00:00:00Z" },
  { id: "apt-002", patientId: "pat-002", patientName: "Sara Khan", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", hospitalId: "hosp-001", date: "2026-04-02", time: "11:30 AM", type: "ultrasound", status: "upcoming", createdAt: "2026-03-20T00:00:00Z" },
  { id: "apt-003", patientId: "pat-004", patientName: "Nadia Malik", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", hospitalId: "hosp-001", date: "2026-04-01", time: "09:00 AM", type: "emergency", status: "upcoming", notes: "Monitor BP closely", createdAt: "2026-03-28T00:00:00Z" },
  { id: "apt-004", patientId: "pat-001", patientName: "Aisha Rahman", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", hospitalId: "hosp-001", date: "2026-03-25", time: "10:00 AM", type: "routine", status: "completed", createdAt: "2026-03-18T00:00:00Z" },
  { id: "apt-005", patientId: "pat-003", patientName: "Mia Johnson", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", hospitalId: "hosp-001", date: "2026-04-08", time: "02:00 PM", type: "lab", status: "upcoming", createdAt: "2026-03-22T00:00:00Z" },
];

const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx-001", patientId: "pat-001", patientName: "Aisha Rahman", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", date: "2026-03-25", status: "active",
    clinicalNotes: "Continue prenatal supplements. Iron levels slightly low — monitor at next visit.",
    medications: [
      { name: "Folic Acid", dosage: "5mg", frequency: "OD", duration: "90 days", instructions: "After breakfast" },
      { name: "Ferrous Sulphate", dosage: "200mg", frequency: "BD", duration: "60 days", instructions: "After meals with Vitamin C" },
      { name: "Vitamin D3", dosage: "1000 IU", frequency: "OD", duration: "90 days", instructions: "With breakfast" },
    ],
  },
  {
    id: "rx-002", patientId: "pat-002", patientName: "Sara Khan", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", date: "2026-03-27", status: "active",
    clinicalNotes: "GDM management. Monitor blood glucose before and after meals.",
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "BD", duration: "30 days", instructions: "After meals" },
      { name: "Folic Acid", dosage: "5mg", frequency: "OD", duration: "90 days", instructions: "Morning" },
      { name: "Iron Supplement", dosage: "100mg", frequency: "OD", duration: "60 days", instructions: "Before bed with juice" },
    ],
  },
  {
    id: "rx-003", patientId: "pat-004", patientName: "Nadia Malik", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", date: "2026-03-28", status: "active",
    clinicalNotes: "Pre-eclampsia risk. Strict BP monitoring required. Report headache or visual disturbances immediately.",
    medications: [
      { name: "Labetalol", dosage: "100mg", frequency: "TDS", duration: "14 days", instructions: "With meals" },
      { name: "Aspirin", dosage: "75mg", frequency: "OD", duration: "Until delivery", instructions: "Night time" },
      { name: "Calcium Carbonate", dosage: "500mg", frequency: "BD", duration: "30 days", instructions: "Between meals" },
    ],
  },
];

const SEED_CHAT_MESSAGES: ChatMessage[] = [
  { id: "cm-1", conversationKey: "doc-001_pat-001", from: "patient", fromId: "pat-001", type: "text", text: "Good morning doctor! I wanted to ask about my recent blood report.", time: "9:10 AM", timestamp: Date.now() - 7200000 },
  { id: "cm-2", conversationKey: "doc-001_pat-001", from: "doctor", fromId: "doc-001", type: "text", text: "Good morning Aisha! Your hemoglobin is slightly low at 11.2. Continue with iron supplements.", time: "9:25 AM", timestamp: Date.now() - 6300000 },
  { id: "cm-3", conversationKey: "doc-001_pat-001", from: "patient", fromId: "pat-001", type: "text", text: "Should I be worried about the glucose level too?", time: "10:30 AM", timestamp: Date.now() - 5400000 },
  { id: "cm-4", conversationKey: "doc-001_pat-001", from: "doctor", fromId: "doc-001", type: "text", text: "The glucose of 95 is normal. Keep up the healthy diet. Avoid refined sugars.", time: "11:02 AM", timestamp: Date.now() - 4500000 },
  { id: "cm-5", conversationKey: "doc-001_pat-001", from: "patient", fromId: "pat-001", type: "text", text: "Doctor, I've been having mild swelling in my feet.", time: "11:15 AM", timestamp: Date.now() - 3600000 },
  { id: "cm-6", conversationKey: "doc-001_pat-001", from: "doctor", fromId: "doc-001", type: "text", text: "Some swelling is normal at 24 weeks. Elevate your feet when resting. Call me if it worsens or you notice facial swelling.", time: "11:28 AM", timestamp: Date.now() - 2700000 },
  { id: "cm-7", conversationKey: "doc-001_pat-002", from: "patient", fromId: "pat-002", type: "text", text: "Doctor, the morning sickness is very severe today.", time: "8:00 AM", timestamp: Date.now() - 86400000 },
  { id: "cm-8", conversationKey: "doc-001_pat-002", from: "doctor", fromId: "doc-001", type: "text", text: "Try ginger tea and eat small meals frequently. Avoid spicy food. Your glucose is borderline so please follow the diet chart.", time: "8:30 AM", timestamp: Date.now() - 84600000 },
  { id: "cm-9", conversationKey: "doc-001_pat-004", from: "patient", fromId: "pat-004", type: "text", text: "Doctor I have severe headache since morning.", time: "7:00 AM", timestamp: Date.now() - 172800000 },
  { id: "cm-10", conversationKey: "doc-001_pat-004", from: "patient", fromId: "pat-004", type: "text", text: "My vision is also slightly blurred.", time: "7:05 AM", timestamp: Date.now() - 172500000 },
  { id: "cm-11", conversationKey: "doc-001_pat-004", from: "doctor", fromId: "doc-001", type: "text", text: "⚠️ This sounds serious. Please come to the emergency room immediately. Your BP was 148/96 — these are signs of preeclampsia.", time: "7:15 AM", timestamp: Date.now() - 171900000 },
];

const SEED_BEDS: BedAllocation[] = [
  { id: "bed-001", bedNumber: "G-101", ward: "general", hospitalId: "hosp-001", status: "available" },
  { id: "bed-002", bedNumber: "G-102", ward: "general", hospitalId: "hosp-001", patientId: "pat-004", patientName: "Nadia Malik", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", admissionDate: "2026-03-28", status: "occupied", notes: "Pre-eclampsia monitoring" },
  { id: "bed-003", bedNumber: "G-103", ward: "general", hospitalId: "hosp-001", status: "available" },
  { id: "bed-004", bedNumber: "G-104", ward: "general", hospitalId: "hosp-001", status: "available" },
  { id: "bed-005", bedNumber: "L-201", ward: "labor", hospitalId: "hosp-001", status: "available" },
  { id: "bed-006", bedNumber: "L-202", ward: "labor", hospitalId: "hosp-001", status: "available" },
  { id: "bed-007", bedNumber: "I-301", ward: "icu", hospitalId: "hosp-001", status: "available" },
  { id: "bed-008", bedNumber: "I-302", ward: "icu", hospitalId: "hosp-001", status: "available" },
  { id: "bed-009", bedNumber: "P-401", ward: "private", hospitalId: "hosp-001", patientId: "pat-002", patientName: "Sara Khan", doctorId: "doc-001", doctorName: "Dr. Priya Sharma", admissionDate: "2026-03-30", status: "occupied", notes: "GDM monitoring" },
  { id: "bed-010", bedNumber: "P-402", ward: "private", hospitalId: "hosp-001", status: "available" },
  { id: "bed-011", bedNumber: "G-501", ward: "general", hospitalId: "hosp-002", status: "available" },
  { id: "bed-012", bedNumber: "G-502", ward: "general", hospitalId: "hosp-002", status: "available" },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: "al-1", userId: "admin-001", userName: "Super Admin", userRole: "admin", action: "Created Hospital", entity: "Hospital", entityId: "hosp-001", timestamp: "2024-02-15T10:00:00Z", details: "City Women's Medical Center" },
  { id: "al-2", userId: "hosp-001", userName: "City WMC", userRole: "hospital", action: "Added Doctor", entity: "Doctor", entityId: "doc-001", timestamp: "2024-03-15T14:00:00Z", details: "Dr. Priya Sharma — OB-GYN" },
  { id: "al-3", userId: "doc-001", userName: "Dr. Priya Sharma", userRole: "doctor", action: "Added Patient", entity: "Patient", entityId: "pat-001", timestamp: "2025-12-01T09:00:00Z", details: "Aisha Rahman" },
  { id: "al-4", userId: "doc-001", userName: "Dr. Priya Sharma", userRole: "doctor", action: "Wrote Prescription", entity: "Prescription", entityId: "rx-001", timestamp: "2026-03-25T11:30:00Z", details: "Prenatal supplements for Aisha Rahman" },
  { id: "al-5", userId: "doc-001", userName: "Dr. Priya Sharma", userRole: "doctor", action: "Uploaded Ultrasound", entity: "Ultrasound", entityId: "u1", timestamp: "2026-03-25T12:00:00Z", details: "Anomaly Scan for Aisha Rahman" },
];

const DEFAULT_TIMELINE: TimelineEntry[] = [
  { id: "1", date: "2026-03-25", type: "ultrasound", title: "Anomaly Scan", details: "Second trimester anatomy scan completed", values: { BPD: 61, FL: 44, HC: 220, EFW: 680 }, doctor: "Dr. Priya Sharma" },
  { id: "2", date: "2026-03-18", type: "lab", title: "Blood Work Panel", details: "Routine blood tests completed", values: { Hemoglobin: 11.2, BloodSugar: 95, BP_Systolic: 118, BP_Diastolic: 76 }, doctor: "Dr. Priya Sharma" },
  { id: "3", date: "2026-03-10", type: "medication", title: "Prescription Updated", details: "Added Iron supplement to daily regimen", doctor: "Dr. Priya Sharma" },
  { id: "4", date: "2026-02-28", type: "visit", title: "Prenatal Checkup", details: "Routine 22-week checkup. Baby's heartbeat strong at 148 bpm", doctor: "Dr. Priya Sharma" },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Lab results ready", body: "Your blood work panel from Mar 18 is now available.", time: "2 hours ago", type: "success", read: false },
  { id: "n2", title: "Upcoming appointment", body: "Reminder: Prenatal checkup on Apr 4 at 10:00 AM.", time: "5 hours ago", type: "info", read: false },
  { id: "n3", title: "New prescription", body: "Dr. Priya Sharma has prescribed new medications. Check your medications tab.", time: "1 day ago", type: "info", read: false },
  { id: "n4", title: "Medication reminder", body: "Time to take your Iron Supplement 200mg.", time: "2 days ago", type: "alert", read: true },
];

// ─── Context ─────────────────────────────────────────────────────────────────

export interface AppContextType {
  // Auth
  currentUser: UserAccount | null;
  role: UserRole | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  // Patient data
  patient: PatientProfile | null;
  // Doctor data
  doctorProfile: DoctorProfile | null;
  doctorPatients: DoctorPatient[];
  // Hospital data
  hospitals: HospitalProfile[];
  hospitalDoctors: DoctorAccount[];
  allPatients: DoctorPatient[];
  // Admin data
  adminProfile: AdminProfile;
  allHospitals: HospitalProfile[];
  allDoctors: DoctorAccount[];
  allUsers: UserAccount[];
  // Timeline
  timeline: TimelineEntry[];
  addTimelineEntry: (entry: Omit<TimelineEntry, "id">) => void;
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  // Create operations
  addHospital: (data: { name: string; city: string; address: string; phone: string; email: string; type: string; beds: number }) => { success: boolean; credentials?: { email: string; password: string }; error?: string };
  addDoctor: (data: { name: string; specialization: string; licenseNo: string; phone: string; email: string }) => { success: boolean; credentials?: { email: string; password: string }; error?: string };
  addPatient: (data: { name: string; age: number; bloodGroup: string; pregnancyWeek: number; dueDate: string; email: string; allergies: string[]; medications: string[] }) => { success: boolean; credentials?: { email: string; password: string }; error?: string };
  // Vitals
  vitals: Vital[];
  addVital: (vital: Omit<Vital, "id">) => void;
  getPatientVitals: (patientId: string) => Vital[];
  getLatestVitals: (patientId: string) => Vital | null;
  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, "id" | "createdAt">) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  getPatientAppointments: (patientId: string) => Appointment[];
  getDoctorAppointments: (doctorId: string) => Appointment[];
  // Prescriptions
  prescriptions: Prescription[];
  addPrescription: (rx: Omit<Prescription, "id">) => void;
  getPatientPrescriptions: (patientId: string) => Prescription[];
  // Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  getConversation: (doctorId: string, patientId: string) => ChatMessage[];
  // Audit
  auditLogs: AuditLog[];
  logAudit: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  // Beds
  beds: BedAllocation[];
  allocateBed: (bedId: string, patientId: string, patientName: string, doctorId: string, doctorName: string, notes?: string) => void;
  dischargeBed: (bedId: string) => void;
  getHospitalBeds: (hospitalId: string) => BedAllocation[];
  // Kick sessions
  kickSessions: KickSession[];
  addKickSession: (session: Omit<KickSession, "id">) => void;
  // User management
  toggleUserActive: (userId: string) => void;
  resetUserPassword: (userId: string) => string;
  // Settings
  emergencyAccessEnabled: boolean;
  setEmergencyAccessEnabled: (v: boolean) => void;
  consentShareDoctor: boolean;
  setConsentShareDoctor: (v: boolean) => void;
  consentShareEmergency: boolean;
  setConsentShareEmergency: (v: boolean) => void;
  consentShareResearch: boolean;
  setConsentShareResearch: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

import { supabase } from "@/lib/supabase";
import * as svc from "@/lib/supabaseService";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(DEFAULT_TIMELINE);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [emergencyAccessEnabled, setEmergencyAccessEnabled] = useState(true);
  const [consentShareDoctor, setConsentShareDoctor] = useState(true);
  const [consentShareEmergency, setConsentShareEmergency] = useState(true);
  const [consentShareResearch, setConsentShareResearch] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalProfile[]>(SEED_HOSPITALS);
  const [doctors, setDoctors] = useState<DoctorAccount[]>(SEED_DOCTORS);
  const [patients, setPatients] = useState<DoctorPatient[]>(SEED_PATIENTS);
  const [vitals, setVitals] = useState<Vital[]>(SEED_VITALS);
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(SEED_PRESCRIPTIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SEED_CHAT_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [beds, setBeds] = useState<BedAllocation[]>(SEED_BEDS);
  const [kickSessions, setKickSessions] = useState<KickSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // ── Persistence (Local-first + Supabase background sync) ─────────────

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("yumicare_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          const allUsers = [...SEED_USERS];
          const match = allUsers.find((u) => u.id === parsed.id);
          if (match) setCurrentUser(match);
        }
        const keys = ["timeline", "patients", "doctors", "hospitals", "vitals", "appointments", "prescriptions", "chatMessages", "auditLogs", "beds", "kickSessions", "users"];
        const setters: Record<string, Function> = { timeline: setTimeline, patients: setPatients, doctors: setDoctors, hospitals: setHospitals, vitals: setVitals, appointments: setAppointments, prescriptions: setPrescriptions, chatMessages: setChatMessages, auditLogs: setAuditLogs, beds: setBeds, kickSessions: setKickSessions, users: setUsers };
        for (const key of keys) {
          const val = await AsyncStorage.getItem(`yumicare_${key}`);
          if (val && setters[key]) setters[key]!(JSON.parse(val));
        }
      } catch {}
      setLoaded(true);

      // Supabase background sync — try to connect, don't block the UI
      try {
        const { data, error } = await supabase.from("audit_logs").select("id").limit(1);
        if (!error) {
          setSupabaseReady(true);
          console.log("✅ Supabase connected — data will sync in background");
        } else {
          console.log("⚠️ Supabase not available — using local storage only");
        }
      } catch {
        console.log("⚠️ Supabase offline — using local storage only");
      }
    };
    load();
  }, []);

  const persist = useCallback(async (key: string, data: any) => {
    try { await AsyncStorage.setItem(`yumicare_${key}`, JSON.stringify(data)); } catch {}
  }, []);

  // Background sync helper — writes to Supabase without blocking UI
  const syncToSupabase = useCallback(async (table: string, data: Record<string, any>) => {
    if (!supabaseReady) return;
    try {
      await supabase.from(table).upsert(data, { onConflict: "id" });
    } catch (e) {
      console.log(`Supabase sync (${table}):`, e);
    }
  }, [supabaseReady]);

  const syncInsertToSupabase = useCallback(async (table: string, data: Record<string, any>) => {
    if (!supabaseReady) return;
    try {
      await supabase.from(table).insert(data);
    } catch (e) {
      console.log(`Supabase insert (${table}):`, e);
    }
  }, [supabaseReady]);

  // ── Auth ─────────────────────────────────────────────────────────────────

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const allUsers = [...SEED_USERS, ...users.filter(u => !SEED_USERS.find(s => s.id === u.id))];
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: "No account found with this email." };
    if (!user.isActive) return { success: false, error: "This account has been deactivated. Contact your administrator." };
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return { success: false, error: "Account temporarily locked due to too many failed attempts. Try again later." };
    }
    if (user.password !== password) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updatedUsers = allUsers.map(u => u.id === user.id ? { ...u, loginAttempts: newAttempts, lockedUntil: newAttempts >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : undefined } : u);
      setUsers(updatedUsers);
      persist("users", updatedUsers);
      if (newAttempts >= 5) return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
      return { success: false, error: `Invalid password. ${5 - newAttempts} attempts remaining.` };
    }
    const updatedUser = { ...user, loginAttempts: 0, lockedUntil: undefined, lastLogin: new Date().toISOString() };
    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    persist("users", updatedUsers);
    AsyncStorage.setItem("yumicare_session", JSON.stringify({ id: user.id, role: user.role }));
    return { success: true };
  }, [users, persist]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("yumicare_session");
  }, []);

  // ── Timeline ─────────────────────────────────────────────────────────────

  const addTimelineEntry = useCallback((entry: Omit<TimelineEntry, "id">) => {
    const newEntry: TimelineEntry = { ...entry, id: Date.now().toString() };
    setTimeline(prev => {
      const updated = [newEntry, ...prev];
      persist("timeline", updated);
      return updated;
    });
  }, [persist]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  // ── Create Operations ────────────────────────────────────────────────────

  const addHospital = useCallback((data: { name: string; city: string; address: string; phone: string; email: string; type: string; beds: number }) => {
    const existing = hospitals.find(h => h.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A hospital with this email already exists." };
    const id = `hosp-${Date.now()}`;
    const password = `${data.name.split(" ")[0]}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newHosp: HospitalProfile = { ...data, id, doctors: 0, patients: 0, accreditation: "Pending" };
    const newUser: UserAccount = { id, email: data.email, password, role: "hospital", name: data.name, createdBy: currentUser?.id, createdAt: new Date().toISOString(), isActive: true, loginAttempts: 0 };
    setHospitals(prev => { const u = [...prev, newHosp]; persist("hospitals", u); return u; });
    setUsers(prev => { const u = [...prev, newUser]; persist("users", u); return u; });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "admin", action: "Created Hospital", entity: "Hospital", entityId: id, details: data.name });
    return { success: true, credentials: { email: data.email, password } };
  }, [hospitals, currentUser, persist]);

  const addDoctor = useCallback((data: { name: string; specialization: string; licenseNo: string; phone: string; email: string }) => {
    const existing = doctors.find(d => d.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A doctor with this email already exists." };
    const hospitalId = currentUser ? currentUser.id : "hosp-001";
    const id = `doc-${Date.now()}`;
    const password = `Dr${data.name.split(" ").pop()}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: DoctorAccount = { ...data, id, patientsCount: 0, hospitalId, status: "active", joinDate: new Date().toISOString().split("T")[0]! };
    const newUser: UserAccount = { id, email: data.email, password, role: "doctor", name: data.name, createdBy: currentUser?.id, createdAt: new Date().toISOString(), isActive: true, loginAttempts: 0 };
    setDoctors(prev => { const u = [...prev, newDoc]; persist("doctors", u); return u; });
    setUsers(prev => { const u = [...prev, newUser]; persist("users", u); return u; });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "hospital", action: "Added Doctor", entity: "Doctor", entityId: id, details: `${data.name} — ${data.specialization}` });
    return { success: true, credentials: { email: data.email, password } };
  }, [doctors, currentUser, persist]);

  const addPatient = useCallback((data: { name: string; age: number; bloodGroup: string; pregnancyWeek: number; dueDate: string; email: string; allergies: string[]; medications: string[] }) => {
    const existing = patients.find(p => p.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A patient with this email already exists." };
    const doctorId = currentUser ? currentUser.id : "doc-001";
    const hospitalId = doctors.find(d => d.id === doctorId)?.hospitalId ?? "hosp-001";
    const id = `pat-${Date.now()}`;
    const password = `${data.name.split(" ")[0]}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newPat: DoctorPatient = { ...data, id, lastVisit: new Date().toISOString().split("T")[0]!, status: "stable", doctorId, hospitalId };
    const newUser: UserAccount = { id, email: data.email, password, role: "patient", name: data.name, createdBy: currentUser?.id, createdAt: new Date().toISOString(), isActive: true, loginAttempts: 0 };
    setPatients(prev => { const u = [...prev, newPat]; persist("patients", u); return u; });
    setUsers(prev => { const u = [...prev, newUser]; persist("users", u); return u; });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "doctor", action: "Added Patient", entity: "Patient", entityId: id, details: data.name });
    return { success: true, credentials: { email: data.email, password } };
  }, [patients, doctors, currentUser, persist]);

  // ── Vitals ───────────────────────────────────────────────────────────────

  const addVital = useCallback((vital: Omit<Vital, "id">) => {
    const newVital: Vital = { ...vital, id: `v-${Date.now()}` };
    setVitals(prev => { const u = [newVital, ...prev]; persist("vitals", u); return u; });
    // Supabase sync
    syncInsertToSupabase("vitals", {
      patient_id: vital.patientId, date: vital.date,
      bp_systolic: vital.systolic, bp_diastolic: vital.diastolic,
      weight_kg: vital.weight, glucose_mg_dl: vital.glucose,
      hemoglobin_g_dl: vital.hemoglobin, notes: vital.notes,
    });
  }, [persist, syncInsertToSupabase]);

  const getPatientVitals = useCallback((patientId: string) => {
    return vitals.filter(v => v.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [vitals]);

  const getLatestVitals = useCallback((patientId: string) => {
    const pv = vitals.filter(v => v.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
    return pv[0] ?? null;
  }, [vitals]);

  // ── Appointments ─────────────────────────────────────────────────────────

  const addAppointment = useCallback((apt: Omit<Appointment, "id" | "createdAt">) => {
    const newApt: Appointment = { ...apt, id: `apt-${Date.now()}`, createdAt: new Date().toISOString() };
    setAppointments(prev => { const u = [...prev, newApt]; persist("appointments", u); return u; });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "patient", action: "Booked Appointment", entity: "Appointment", entityId: newApt.id, details: `${apt.type} with ${apt.doctorName} on ${apt.date}` });
    // Supabase sync
    syncInsertToSupabase("appointments", {
      patient_id: apt.patientId, patient_name: apt.patientName,
      doctor_id: apt.doctorId, doctor_name: apt.doctorName,
      hospital_id: apt.hospitalId, date: apt.date, time: apt.time,
      type: apt.type, status: apt.status,
    });
  }, [currentUser, persist, syncInsertToSupabase]);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => { const u = prev.map(a => a.id === id ? { ...a, ...updates } : a); persist("appointments", u); return u; });
  }, [persist]);

  const getPatientAppointments = useCallback((patientId: string) => {
    return appointments.filter(a => a.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments]);

  const getDoctorAppointments = useCallback((doctorId: string) => {
    return appointments.filter(a => a.doctorId === doctorId).sort((a, b) => a.date.localeCompare(b.date));
  }, [appointments]);

  // ── Prescriptions ────────────────────────────────────────────────────────

  const addPrescription = useCallback((rx: Omit<Prescription, "id">) => {
    const newRx: Prescription = { ...rx, id: `rx-${Date.now()}` };
    setPrescriptions(prev => { const u = [...prev, newRx]; persist("prescriptions", u); return u; });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "doctor", action: "Wrote Prescription", entity: "Prescription", entityId: newRx.id, details: `For ${rx.patientName}` });
    // Supabase sync
    syncInsertToSupabase("prescriptions", {
      patient_id: rx.patientId, patient_name: rx.patientName,
      doctor_id: rx.doctorId, doctor_name: rx.doctorName,
      date: rx.date, status: rx.status, clinical_notes: rx.clinicalNotes,
      medications: JSON.stringify(rx.medications),
    });
  }, [currentUser, persist, syncInsertToSupabase]);

  const getPatientPrescriptions = useCallback((patientId: string) => {
    return prescriptions.filter(p => p.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  }, [prescriptions]);

  // ── Chat ─────────────────────────────────────────────────────────────────

  const sendChatMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = { ...msg, id: `cm-${Date.now()}`, timestamp: Date.now() };
    setChatMessages(prev => { const u = [...prev, newMsg]; persist("chatMessages", u); return u; });
    // Supabase sync (realtime)
    syncInsertToSupabase("chat_messages", {
      conversation_key: msg.conversationKey,
      sender_id: msg.fromId, sender_role: msg.from,
      message_type: msg.type, content: msg.text,
      duration: msg.duration, media_url: msg.mediaLabel,
    });
  }, [persist, syncInsertToSupabase]);

  const getConversation = useCallback((doctorId: string, patientId: string) => {
    const key = `${doctorId}_${patientId}`;
    return chatMessages.filter(m => m.conversationKey === key).sort((a, b) => a.timestamp - b.timestamp);
  }, [chatMessages]);

  // ── Audit ────────────────────────────────────────────────────────────────

  const logAuditInternal = useCallback((log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = { ...log, id: `al-${Date.now()}`, timestamp: new Date().toISOString() };
    setAuditLogs(prev => { const u = [newLog, ...prev]; persist("auditLogs", u); return u; });
    // Supabase sync
    syncInsertToSupabase("audit_logs", {
      user_id: log.userId, user_name: log.userName,
      user_role: log.userRole, action: log.action,
      entity: log.entity, details: log.details,
    });
  }, [persist, syncInsertToSupabase]);

  const logAudit = logAuditInternal;

  // ── Beds ─────────────────────────────────────────────────────────────────

  const allocateBed = useCallback((bedId: string, patientId: string, patientName: string, doctorId: string, doctorName: string, notes?: string) => {
    setBeds(prev => {
      const u = prev.map(b => b.id === bedId ? { ...b, patientId, patientName, doctorId, doctorName, admissionDate: new Date().toISOString().split("T")[0], status: "occupied" as const, notes } : b);
      persist("beds", u);
      return u;
    });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "hospital", action: "Admitted Patient", entity: "Bed", entityId: bedId, details: `${patientName} to bed ${beds.find(b => b.id === bedId)?.bedNumber}` });
  }, [currentUser, beds, persist]);

  const dischargeBed = useCallback((bedId: string) => {
    const bed = beds.find(b => b.id === bedId);
    setBeds(prev => {
      const u = prev.map(b => b.id === bedId ? { ...b, patientId: undefined, patientName: undefined, doctorId: undefined, doctorName: undefined, admissionDate: undefined, dischargeDate: new Date().toISOString().split("T")[0], status: "available" as const, notes: undefined } : b);
      persist("beds", u);
      return u;
    });
    if (bed?.patientName) {
      logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "hospital", action: "Discharged Patient", entity: "Bed", entityId: bedId, details: `${bed.patientName} from bed ${bed.bedNumber}` });
    }
  }, [currentUser, beds, persist]);

  const getHospitalBeds = useCallback((hospitalId: string) => {
    return beds.filter(b => b.hospitalId === hospitalId);
  }, [beds]);

  // ── Kick Sessions ────────────────────────────────────────────────────────

  const addKickSession = useCallback((session: Omit<KickSession, "id">) => {
    const newSession: KickSession = { ...session, id: `ks-${Date.now()}` };
    setKickSessions(prev => { const u = [newSession, ...prev]; persist("kickSessions", u); return u; });
    // Supabase sync
    syncInsertToSupabase("kick_sessions", {
      patient_id: session.patientId, date: session.date,
      start_time: session.startTime, kicks: session.kicks,
      duration_minutes: session.durationMinutes, completed: session.completed,
    });
  }, [persist, syncInsertToSupabase]);

  // ── User Management ──────────────────────────────────────────────────────

  const toggleUserActive = useCallback((userId: string) => {
    setUsers(prev => {
      const u = prev.map(user => user.id === userId ? { ...user, isActive: !user.isActive } : user);
      persist("users", u);
      return u;
    });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "admin", action: "Toggled User Status", entity: "User", entityId: userId, details: `${users.find(u => u.id === userId)?.name}` });
  }, [currentUser, users, persist]);

  const resetUserPassword = useCallback((userId: string): string => {
    const newPass = `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
    setUsers(prev => {
      const u = prev.map(user => user.id === userId ? { ...user, password: newPass, loginAttempts: 0, lockedUntil: undefined } : user);
      persist("users", u);
      return u;
    });
    logAuditInternal({ userId: currentUser?.id ?? "", userName: currentUser?.name ?? "", userRole: currentUser?.role ?? "admin", action: "Reset Password", entity: "User", entityId: userId, details: `${users.find(u => u.id === userId)?.name}` });
    return newPass;
  }, [currentUser, users, persist]);

  // ── Derived Data ─────────────────────────────────────────────────────────

  const role = currentUser?.role ?? null;

  const patient: PatientProfile | null = role === "patient" ? (() => {
    const p = patients.find(p => p.id === currentUser?.id);
    if (!p) return null;
    return { id: p.id, name: p.name, age: p.age, bloodGroup: p.bloodGroup, pregnancyWeek: p.pregnancyWeek, dueDate: p.dueDate, allergies: p.allergies, medications: p.medications, primaryDoctor: doctors.find(d => d.id === p.doctorId)?.name ?? "Doctor", qrCode: `YMC-${p.id}`, email: p.email };
  })() : null;

  const doctorProfile: DoctorProfile | null = role === "doctor" ? (() => {
    const d = doctors.find(d => d.id === currentUser?.id);
    if (!d) return null;
    const hosp = hospitals.find(h => h.id === d.hospitalId);
    return { id: d.id, name: d.name, specialization: d.specialization, hospital: hosp?.name ?? "Hospital", hospitalId: d.hospitalId, licenseNo: d.licenseNo, yearsExp: Math.max(1, new Date().getFullYear() - new Date(d.joinDate).getFullYear()), patientsCount: patients.filter(p => p.doctorId === d.id).length, phone: d.phone, email: d.email };
  })() : null;

  const doctorPatients = role === "doctor" ? patients.filter(p => p.doctorId === currentUser?.id) : [];
  const hospitalDoctors = role === "hospital" ? doctors.filter(d => d.hospitalId === currentUser?.id) : [];
  const hospitalPatients = role === "hospital" ? patients.filter(p => p.hospitalId === currentUser?.id) : [];
  const adminProfile: AdminProfile = { id: "admin-001", name: "Super Admin", email: "admin@yumicare.com" };

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      currentUser, role, isLoggedIn: !!currentUser, login, logout,
      patient, doctorProfile, doctorPatients,
      hospitals, hospitalDoctors, allPatients: hospitalPatients,
      adminProfile, allHospitals: hospitals, allDoctors: doctors, allUsers: users,
      timeline, addTimelineEntry, notifications, markNotificationRead,
      addHospital, addDoctor, addPatient,
      vitals, addVital, getPatientVitals, getLatestVitals,
      appointments, addAppointment, updateAppointment, getPatientAppointments, getDoctorAppointments,
      prescriptions, addPrescription, getPatientPrescriptions,
      chatMessages, sendChatMessage, getConversation,
      auditLogs, logAudit,
      beds, allocateBed, dischargeBed, getHospitalBeds,
      kickSessions, addKickSession,
      toggleUserActive, resetUserPassword,
      emergencyAccessEnabled, setEmergencyAccessEnabled,
      consentShareDoctor, setConsentShareDoctor,
      consentShareEmergency, setConsentShareEmergency,
      consentShareResearch, setConsentShareResearch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
