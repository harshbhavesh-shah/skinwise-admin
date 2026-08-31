"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";
import {
  ActiveOrdersIcon,
  AnalyticsIcon,
  CommunicationIcon,
  HistoryIcon,
  InventoryIcon,
  SettingsIcon,
} from "./icons";

const LINKS = [
  { href: "/active", label: "Active Orders", icon: ActiveOrdersIcon },
  { href: "/orders", label: "Order History", icon: HistoryIcon },
  { href: "/communication", label: "Communication", icon: CommunicationIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/inventory", label: "Inventory", icon: InventoryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-ink px-5 py-7 text-[#dfe3dc]">
      <div>
        <div className="mb-9 px-2">
          <div className="font-serif text-[19px] leading-tight text-white">SkinWise</div>
          <div className="text-[11.5px] uppercase tracking-[1.5px] text-[#9aa398]">Admin</div>
        </div>

        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/orders"
                ? pathname === "/orders" || pathname.startsWith("/orders/")
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-[#b9c0b3] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
        <div className="px-2">
          <div className="truncate text-[12.5px] text-[#dfe3dc]">{email}</div>
          <div className="text-[11px] uppercase tracking-[1px] text-[#9aa398]">Owner</div>
        </div>
        <AdminLogoutButton className="cursor-pointer rounded-full border border-white/15 px-3.5 py-2 text-left text-[13px] font-medium text-[#dfe3dc] hover:bg-white/5" />
      </div>
    </aside>
  );
}
