"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

const LINKS = [
  { href: "/orders", label: "Orders" },
  // { href: "/analytics", label: "Analytics" }, // arrives in a later step
];

export default function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <span className="font-serif text-lg">
            SkinWise<span className="ml-1 text-[12px] font-sans text-ink-soft">Admin</span>
          </span>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                    active ? "bg-ink text-white" : "text-ink-soft hover:bg-bg-2"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email && <span className="text-[12.5px] text-ink-soft">{email}</span>}
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
