import { notFound } from "next/navigation";

import { StaffForm } from "@/features/staffs/components/staff-form";
import { updateStaff } from "@/features/staffs/actions";
import { getStaffById } from "@/features/staffs/queries";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff) {
    notFound();
  }

  return (
    <StaffForm
      mode="edit"
      defaultValues={{
        name: staff.name,
        position: staff.position,
        phone: staff.phone,
        department: staff.department,
        email: staff.email,
        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.toISOString().slice(0, 10) : undefined,
        systemRole: staff.systemRole ?? undefined,
        address: staff.address ?? undefined,
        emergencyContactName: staff.emergencyContactName ?? undefined,
        emergencyContactPhone: staff.emergencyContactPhone ?? undefined,
        salary: Number(staff.salary),
        imageUrl: staff.imageUrl ?? undefined,
      }}
      onSubmit={updateStaff.bind(null, id)}
    />
  );
}
