import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "patient" | "doctor" | null;

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
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  licenseNo: string;
  yearsExp: number;
  patientsCount: number;
  phone: string;
  email: string;
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

export interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  patient: PatientProfile | null;
  setPatient: (p: PatientProfile | null) => void;
  doctorProfile: DoctorProfile;
  doctorPatients: DoctorPatient[];
  timeline: TimelineEntry[];
  addTimelineEntry: (entry: Omit<TimelineEntry, "id">) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  emergencyAccessEnabled: boolean;
  setEmergencyAccessEnabled: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

const DEFAULT_PATIENT: PatientProfile = {
  id: "PAT-2024-001",
  name: "Aisha Rahman",
  age: 28,
  bloodGroup: "B+",
  pregnancyWeek: 24,
  dueDate: "2026-07-15",
  allergies: ["Penicillin", "Sulfa drugs"],
  medications: ["Folic Acid 5mg", "Iron Supplement 325mg", "Vitamin D3 2000IU"],
  primaryDoctor: "Dr. Priya Sharma",
  qrCode: "YMC-PAT-2024-001-SECURE",
};

const DEFAULT_DOCTOR: DoctorProfile = {
  id: "DOC-2024-001",
  name: "Dr. Priya Sharma",
  specialization: "Obstetrics & Gynecology",
  hospital: "City Women's Medical Center",
  licenseNo: "MCI-OBG-2018-4472",
  yearsExp: 12,
  patientsCount: 47,
  phone: "+91 98765 43210",
  email: "priya.sharma@citywmc.in",
};

const DOCTOR_PATIENTS: DoctorPatient[] = [
  {
    id: "PAT-2024-001",
    name: "Aisha Rahman",
    age: 28,
    pregnancyWeek: 24,
    bloodGroup: "B+",
    dueDate: "2026-07-15",
    lastVisit: "2026-03-25",
    status: "stable",
    allergies: ["Penicillin", "Sulfa drugs"],
    medications: ["Folic Acid 5mg", "Iron Supplement", "Vitamin D3"],
  },
  {
    id: "PAT-2024-002",
    name: "Sara Khan",
    age: 31,
    pregnancyWeek: 32,
    bloodGroup: "O+",
    dueDate: "2026-05-02",
    lastVisit: "2026-03-27",
    status: "attention",
    allergies: ["Aspirin"],
    medications: ["Metformin 500mg", "Folic Acid", "Iron"],
  },
  {
    id: "PAT-2024-003",
    name: "Mia Johnson",
    age: 25,
    pregnancyWeek: 14,
    bloodGroup: "A-",
    dueDate: "2026-09-10",
    lastVisit: "2026-03-20",
    status: "stable",
    allergies: [],
    medications: ["Folic Acid 5mg", "Vitamin B12"],
  },
  {
    id: "PAT-2024-004",
    name: "Nadia Malik",
    age: 34,
    pregnancyWeek: 38,
    bloodGroup: "AB+",
    dueDate: "2026-04-10",
    lastVisit: "2026-03-28",
    status: "critical",
    allergies: ["Latex", "Codeine"],
    medications: ["Labetalol 100mg", "Aspirin 75mg", "Calcium"],
  },
];

const DEFAULT_TIMELINE: TimelineEntry[] = [
  {
    id: "1",
    date: "2026-03-25",
    type: "ultrasound",
    title: "Anomaly Scan",
    details: "Second trimester anatomy scan completed",
    values: { BPD: 61, FL: 44, HC: 220, EFW: 680 },
    doctor: "Dr. Priya Sharma",
  },
  {
    id: "2",
    date: "2026-03-18",
    type: "lab",
    title: "Blood Work Panel",
    details: "Routine blood tests completed",
    values: { Hemoglobin: 11.2, BloodSugar: 95, BP_Systolic: 118, BP_Diastolic: 76 },
    doctor: "Dr. Priya Sharma",
  },
  {
    id: "3",
    date: "2026-03-10",
    type: "medication",
    title: "Prescription Updated",
    details: "Added Iron supplement to daily regimen",
    doctor: "Dr. Priya Sharma",
  },
  {
    id: "4",
    date: "2026-02-28",
    type: "visit",
    title: "Prenatal Checkup",
    details: "Routine 22-week checkup. Baby's heartbeat strong at 148 bpm",
    doctor: "Dr. Priya Sharma",
  },
  {
    id: "5",
    date: "2026-02-10",
    type: "lab",
    title: "Glucose Challenge Test",
    details: "1-hour glucose screening",
    values: { GlucoseLevel: 128 },
    doctor: "Dr. Priya Sharma",
  },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Lab results ready",
    body: "Your blood work panel from Mar 18 is now available.",
    time: "2 hours ago",
    type: "success",
    read: false,
  },
  {
    id: "n2",
    title: "Upcoming appointment",
    body: "Reminder: Prenatal checkup with Dr. Priya Sharma tomorrow at 10:00 AM.",
    time: "5 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "n3",
    title: "Access request",
    body: "Dr. Raj Mehta is requesting secondary access to your medical records.",
    time: "1 day ago",
    type: "request",
    read: false,
  },
  {
    id: "n4",
    title: "Medication reminder",
    body: "Time to take your Iron Supplement 325mg.",
    time: "2 days ago",
    type: "alert",
    read: true,
  },
  {
    id: "n5",
    title: "Emergency access logged",
    body: "Dr. Rao (Emergency Dept.) accessed your emergency card 2 weeks ago.",
    time: "2 weeks ago",
    type: "alert",
    read: true,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [patient, setPatientState] = useState<PatientProfile | null>(DEFAULT_PATIENT);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(DEFAULT_TIMELINE);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [emergencyAccessEnabled, setEmergencyAccessEnabledState] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    const load = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("yumicare_role");
        const storedOnboarded = await AsyncStorage.getItem("yumicare_onboarded");
        const storedTimeline = await AsyncStorage.getItem("yumicare_timeline");
        if (storedRole) setRoleState(storedRole as UserRole);
        if (storedOnboarded === "true") setIsOnboardedState(true);
        if (storedTimeline) setTimeline(JSON.parse(storedTimeline));
      } catch {}
    };
    load();
  }, []);

  const setRole = useCallback(async (r: UserRole) => {
    setRoleState(r);
    if (r) await AsyncStorage.setItem("yumicare_role", r);
  }, []);

  const setPatient = useCallback((p: PatientProfile | null) => {
    setPatientState(p);
  }, []);

  const addTimelineEntry = useCallback(
    async (entry: Omit<TimelineEntry, "id">) => {
      const newEntry: TimelineEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      };
      const updated = [newEntry, ...timeline];
      setTimeline(updated);
      await AsyncStorage.setItem("yumicare_timeline", JSON.stringify(updated));
    },
    [timeline]
  );

  const setIsOnboarded = useCallback(async (v: boolean) => {
    setIsOnboardedState(v);
    await AsyncStorage.setItem("yumicare_onboarded", v ? "true" : "false");
  }, []);

  const setEmergencyAccessEnabled = useCallback((v: boolean) => {
    setEmergencyAccessEnabledState(v);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        patient,
        setPatient,
        doctorProfile: DEFAULT_DOCTOR,
        doctorPatients: DOCTOR_PATIENTS,
        timeline,
        addTimelineEntry,
        notifications,
        markNotificationRead,
        isOnboarded,
        setIsOnboarded,
        emergencyAccessEnabled,
        setEmergencyAccessEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
