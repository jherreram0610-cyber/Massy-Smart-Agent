"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  userName: string;
  userRole: string;
  unreadCount?: number;
}

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  advisor: "Asesor",
};

export function Topbar({ userName, userRole, unreadCount = 0 }: TopbarProps) {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b shrink-0"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div />

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          style={{ color: "var(--muted)" }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: "var(--hot)", color: "white" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors"
              style={{ color: "var(--text)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--surface-2)", color: "var(--primary)" }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium leading-none">{userName}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {roleLabel[userRole] ?? userRole}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <DropdownMenuItem
              className="gap-2"
              style={{ color: "var(--muted)" }}
            >
              <User size={14} />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "var(--border)" }} />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              style={{ color: "var(--hot)" }}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut size={14} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
