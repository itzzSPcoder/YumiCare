import React from "react";
import { useApp } from "@/context/AppContext";
import PatientProfile from "@/components/PatientProfile";
import DoctorProfile from "@/components/DoctorProfile";

export default function ProfileScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorProfile />;
  return <PatientProfile />;
}
