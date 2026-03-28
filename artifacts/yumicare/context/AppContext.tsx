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

export interface TimelineEntry {
  id: string;
  date: string;
  type: "ultrasound" | "lab" | "medication" | "symptom" | "visit";
  title: string;
  details: string;
  values?: Record<string, string | number>;
  doctor?: string;
}

export interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  patient: PatientProfile | null;
  setPatient: (p: PatientProfile | null) => void;
  timeline: TimelineEntry[];
  addTimelineEntry: (entry: Omit<TimelineEntry, "id">) => void;
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
  medications: ["Folic Acid 5mg", "Iron Supplement", "Vitamin D3"],
  primaryDoctor: "Dr. Priya Sharma",
  qrCode: "YMC-PAT-2024-001-SECURE",
};

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [patient, setPatientState] = useState<PatientProfile | null>(DEFAULT_PATIENT);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(DEFAULT_TIMELINE);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [emergencyAccessEnabled, setEmergencyAccessEnabledState] = useState(true);

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

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        patient,
        setPatient,
        timeline,
        addTimelineEntry,
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
