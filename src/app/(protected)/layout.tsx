import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/admin-auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={user.email} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
