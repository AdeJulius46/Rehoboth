"use client";

import { StaffForm } from "@/features/staffs/components/staff-form";
import { createStaff } from "@/features/staffs/actions";

export default function AddStaffPage() {
  return <StaffForm mode="create" onSubmit={createStaff} />;
}
