import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/admin-auth";
import AdminNav from "@/components/AdminNav";

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
    <div>
      <AdminNav email={user.email} />
      {children}
    </div>
  );
}
