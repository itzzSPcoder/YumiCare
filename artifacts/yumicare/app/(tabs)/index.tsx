import React from "react";
import { useApp } from "@/context/AppContext";
import PatientHome from "@/components/PatientHome";
import DoctorHome from "@/components/DoctorHome";

export default function HomeScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorHome />;
  return <PatientHome />;
}
