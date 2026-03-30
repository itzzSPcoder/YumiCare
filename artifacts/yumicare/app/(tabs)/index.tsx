import React from "react";
import { useApp } from "@/context/AppContext";
import PatientHome from "@/components/PatientHome";
import DoctorHome from "@/components/DoctorHome";
import HospitalHome from "@/components/HospitalHome";
import AdminHome from "@/components/AdminHome";

export default function HomeScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorHome />;
  if (role === "hospital") return <HospitalHome />;
  if (role === "admin") return <AdminHome />;
  return <PatientHome />;
}
