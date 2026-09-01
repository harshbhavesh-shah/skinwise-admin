import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { removeAdmin } from "@/lib/admins";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (user.role !== "superadmin") {
    return NextResponse.json({ error: "Only the super admin can remove admins." }, { status: 403 });
  }

  const { email } = await params;
  const target = decodeURIComponent(email);

  if (target.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json({ error: "You can't remove your own access." }, { status: 400 });
  }

  try {
    await removeAdmin(target);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't remove admin.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
