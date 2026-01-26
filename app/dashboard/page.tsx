import { redirect } from "next/navigation";
import { getUser } from "../lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardClient userEmail={user.email ?? null} />;
}
