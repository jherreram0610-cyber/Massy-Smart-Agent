"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/appointments", label: "Citas", icon: CalendarCheck },
  { href: "/knowledge-base/vehicles", label: "Catálogo", icon: BookOpen },
  { href: "/settings/profile", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen border-r shrink-0"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2 px-6 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--primary)" }}
        >
          <Zap size={14} color="#050B20" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="text-sm font-bold leading-none"
            style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}
          >
            Massy Motors
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Smart Cali
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={
                active
                  ? {
                      background: "rgba(0, 212, 255, 0.10)",
                      color: "var(--primary)",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                    }
                  : { color: "var(--muted)" }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t text-xs"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        Agente IA v1.0
      </div>
    </aside>
  );
}
