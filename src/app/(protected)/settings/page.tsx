import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/admin-auth";
import { listAdmins, type AdminRecord } from "@/lib/admins";
import ManageAdmins from "@/components/ManageAdmins";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let admins: AdminRecord[];
  let loadError: string | null = null;
  try {
    admins = await listAdmins();
  } catch (err) {
    admins = [];
    loadError = err instanceof Error ? err.message : "Couldn't load admins.";
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-14">
      <h1 className="mb-8 text-[28px] font-medium">Settings</h1>

      {loadError ? (
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </p>
      ) : (
        <ManageAdmins admins={admins} currentEmail={user.email} canManage={user.role === "superadmin"} />
      )}
    </div>
  );
}
