import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "patient" | "doctor" | "hospital" | "admin";

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

export interface TimelineEntry {
  id: string;
  date: string;
  type: "ultrasound" | "lab" | "medication" | "symptom" | "visit";
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

const SEED_USERS: UserAccount[] = [
  { id: "admin-001", email: "admin@yumicare.com", password: "YumiAdmin@2024", role: "admin", name: "Super Admin" },
  { id: "hosp-001", email: "citywmc@yumicare.com", password: "CityWMC@123", role: "hospital", name: "City Women's Medical Center", createdBy: "admin-001" },
  { id: "hosp-002", email: "apollo@yumicare.com", password: "Apollo@123", role: "hospital", name: "Apollo Maternity Hospital", createdBy: "admin-001" },
  { id: "doc-001", email: "dr.priya@yumicare.com", password: "DrPriya@123", role: "doctor", name: "Dr. Priya Sharma", createdBy: "hosp-001" },
  { id: "doc-002", email: "dr.mehta@yumicare.com", password: "DrMehta@123", role: "doctor", name: "Dr. Raj Mehta", createdBy: "hosp-001" },
  { id: "pat-001", email: "aisha@yumicare.com", password: "Aisha@123", role: "patient", name: "Aisha Rahman", createdBy: "doc-001" },
  { id: "pat-002", email: "sara@yumicare.com", password: "Sara@123", role: "patient", name: "Sara Khan", createdBy: "doc-001" },
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

const DEFAULT_TIMELINE: TimelineEntry[] = [
  { id: "1", date: "2026-03-25", type: "ultrasound", title: "Anomaly Scan", details: "Second trimester anatomy scan completed", values: { BPD: 61, FL: 44, HC: 220, EFW: 680 }, doctor: "Dr. Priya Sharma" },
  { id: "2", date: "2026-03-18", type: "lab", title: "Blood Work Panel", details: "Routine blood tests completed", values: { Hemoglobin: 11.2, BloodSugar: 95, BP_Systolic: 118, BP_Diastolic: 76 }, doctor: "Dr. Priya Sharma" },
  { id: "3", date: "2026-03-10", type: "medication", title: "Prescription Updated", details: "Added Iron supplement to daily regimen", doctor: "Dr. Priya Sharma" },
  { id: "4", date: "2026-02-28", type: "visit", title: "Prenatal Checkup", details: "Routine 22-week checkup. Baby's heartbeat strong at 148 bpm", doctor: "Dr. Priya Sharma" },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Lab results ready", body: "Your blood work panel from Mar 18 is now available.", time: "2 hours ago", type: "success", read: false },
  { id: "n2", title: "Upcoming appointment", body: "Reminder: Prenatal checkup tomorrow at 10:00 AM.", time: "5 hours ago", type: "info", read: false },
  { id: "n3", title: "Access request", body: "Dr. Raj Mehta is requesting secondary access to your medical records.", time: "1 day ago", type: "request", read: false },
  { id: "n4", title: "Medication reminder", body: "Time to take your Iron Supplement 325mg.", time: "2 days ago", type: "alert", read: true },
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
  // Settings
  emergencyAccessEnabled: boolean;
  setEmergencyAccessEnabled: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(DEFAULT_TIMELINE);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [emergencyAccessEnabled, setEmergencyAccessEnabled] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalProfile[]>(SEED_HOSPITALS);
  const [doctors, setDoctors] = useState<DoctorAccount[]>(SEED_DOCTORS);
  const [patients, setPatients] = useState<DoctorPatient[]>(SEED_PATIENTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("yumicare_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          const match = SEED_USERS.find((u) => u.id === parsed.id);
          if (match) setCurrentUser(match);
        }
        const storedTimeline = await AsyncStorage.getItem("yumicare_timeline");
        if (storedTimeline) setTimeline(JSON.parse(storedTimeline));
        const storedPatients = await AsyncStorage.getItem("yumicare_patients");
        if (storedPatients) setPatients(JSON.parse(storedPatients));
        const storedDoctors = await AsyncStorage.getItem("yumicare_doctors");
        if (storedDoctors) setDoctors(JSON.parse(storedDoctors));
        const storedHospitals = await AsyncStorage.getItem("yumicare_hospitals");
        if (storedHospitals) setHospitals(JSON.parse(storedHospitals));
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const user = [...SEED_USERS, ...users.filter(u => !SEED_USERS.find(s => s.id === u.id))].find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: "Invalid email or password." };
    setCurrentUser(user);
    AsyncStorage.setItem("yumicare_session", JSON.stringify({ id: user.id, role: user.role }));
    return { success: true };
  }, [users]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem("yumicare_session");
  }, []);

  const addTimelineEntry = useCallback(async (entry: Omit<TimelineEntry, "id">) => {
    const newEntry: TimelineEntry = { ...entry, id: Date.now().toString() };
    const updated = [newEntry, ...timeline];
    setTimeline(updated);
    await AsyncStorage.setItem("yumicare_timeline", JSON.stringify(updated));
  }, [timeline]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const addHospital = useCallback((data: { name: string; city: string; address: string; phone: string; email: string; type: string; beds: number }) => {
    const existing = hospitals.find(h => h.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A hospital with this email already exists." };
    const id = `hosp-${Date.now()}`;
    const password = `${data.name.split(" ")[0]}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newHosp: HospitalProfile = { ...data, id, doctors: 0, patients: 0, accreditation: "Pending" };
    const newUser: UserAccount = { id, email: data.email, password, role: "hospital", name: data.name, createdBy: currentUser?.id };
    const updatedH = [...hospitals, newHosp];
    const updatedU = [...users, newUser];
    setHospitals(updatedH);
    setUsers(updatedU);
    AsyncStorage.setItem("yumicare_hospitals", JSON.stringify(updatedH));
    return { success: true, credentials: { email: data.email, password } };
  }, [hospitals, users, currentUser]);

  const addDoctor = useCallback((data: { name: string; specialization: string; licenseNo: string; phone: string; email: string }) => {
    const existing = doctors.find(d => d.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A doctor with this email already exists." };
    const hospitalId = currentUser ? currentUser.id : "hosp-001";
    const id = `doc-${Date.now()}`;
    const password = `Dr${data.name.split(" ")[data.name.split(" ").length - 1]}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: DoctorAccount = { ...data, id, patientsCount: 0, hospitalId, status: "active", joinDate: new Date().toISOString().split("T")[0]! };
    const newUser: UserAccount = { id, email: data.email, password, role: "doctor", name: data.name, createdBy: currentUser?.id };
    const updatedD = [...doctors, newDoc];
    const updatedU = [...users, newUser];
    setDoctors(updatedD);
    setUsers(updatedU);
    AsyncStorage.setItem("yumicare_doctors", JSON.stringify(updatedD));
    return { success: true, credentials: { email: data.email, password } };
  }, [doctors, users, currentUser]);

  const addPatient = useCallback((data: { name: string; age: number; bloodGroup: string; pregnancyWeek: number; dueDate: string; email: string; allergies: string[]; medications: string[] }) => {
    const existing = patients.find(p => p.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { success: false, error: "A patient with this email already exists." };
    const doctorId = currentUser ? currentUser.id : "doc-001";
    const hospitalId = doctors.find(d => d.id === doctorId)?.hospitalId ?? "hosp-001";
    const id = `pat-${Date.now()}`;
    const password = `${data.name.split(" ")[0]}@${Math.floor(1000 + Math.random() * 9000)}`;
    const newPat: DoctorPatient = { ...data, id, lastVisit: new Date().toISOString().split("T")[0]!, status: "stable", doctorId, hospitalId };
    const newUser: UserAccount = { id, email: data.email, password, role: "patient", name: data.name, createdBy: currentUser?.id };
    const updatedP = [...patients, newPat];
    const updatedU = [...users, newUser];
    setPatients(updatedP);
    setUsers(updatedU);
    AsyncStorage.setItem("yumicare_patients", JSON.stringify(updatedP));
    return { success: true, credentials: { email: data.email, password } };
  }, [patients, users, doctors, currentUser]);

  // Derived data based on current user
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
    return { id: d.id, name: d.name, specialization: d.specialization, hospital: hosp?.name ?? "Hospital", hospitalId: d.hospitalId, licenseNo: d.licenseNo, yearsExp: 5, patientsCount: patients.filter(p => p.doctorId === d.id).length, phone: d.phone, email: d.email };
  })() : null;

  const doctorPatients = role === "doctor" ? patients.filter(p => p.doctorId === currentUser?.id) : [];

  const hospitalProfile = role === "hospital" ? hospitals.find(h => h.id === currentUser?.id) : null;
  const hospitalDoctors = role === "hospital" ? doctors.filter(d => d.hospitalId === currentUser?.id) : [];
  const hospitalPatients = role === "hospital" ? patients.filter(p => p.hospitalId === currentUser?.id) : [];

  const adminProfile: AdminProfile = { id: "admin-001", name: "Super Admin", email: "admin@yumicare.com" };

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      currentUser,
      role,
      isLoggedIn: !!currentUser,
      login,
      logout,
      patient,
      doctorProfile,
      doctorPatients,
      hospitals,
      hospitalDoctors,
      allPatients: hospitalPatients,
      adminProfile,
      allHospitals: hospitals,
      allDoctors: doctors,
      allUsers: users,
      timeline,
      addTimelineEntry,
      notifications,
      markNotificationRead,
      addHospital,
      addDoctor,
      addPatient,
      emergencyAccessEnabled,
      setEmergencyAccessEnabled,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
