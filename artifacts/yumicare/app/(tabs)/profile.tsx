import React from "react";
import { useApp } from "@/context/AppContext";
import PatientProfile from "@/components/PatientProfile";
import DoctorProfile from "@/components/DoctorProfile";
import HospitalProfile from "@/components/HospitalProfile";
import AdminProfile from "@/components/AdminProfile";

export default function ProfileScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorProfile />;
  if (role === "hospital") return <HospitalProfile />;
  if (role === "admin") return <AdminProfile />;
  return <PatientProfile />;
}
