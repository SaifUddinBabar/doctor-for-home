import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardRootPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (user.role === "Admin") {
    redirect("/dashboard/admin");
  } else if (user.role === "Doctor") {
    redirect("/dashboard/doctor");
  } else {
    redirect("/dashboard/patient");
  }
}
