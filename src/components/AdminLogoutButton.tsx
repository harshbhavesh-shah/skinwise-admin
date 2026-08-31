"use client";

import { useRouter } from "next/navigation";
import { clientAuth } from "@/lib/firebase-client";

export default function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        await clientAuth.signOut().catch(() => {});
        router.push("/login");
        router.refresh();
      }}
      className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium hover:bg-bg-2"
    >
      Log out
    </button>
  );
}
