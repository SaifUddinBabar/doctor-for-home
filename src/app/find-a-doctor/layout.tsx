import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Doctor | Doctors for Home",
  description:
    "Browse certified doctors available for home visits. Filter by specialty, location, and availability.",
};

export default function FindADoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
