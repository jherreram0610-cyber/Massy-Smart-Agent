"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Check, AlertCircle } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FeedbackState {
  type: "success" | "error" | null;
  message: string;
}

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const [form, setForm] = useState<FormState>({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>({ type: null, message: "" });
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>({ type: null, message: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback({ type: null, message: "" });

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setProfileFeedback({ type: "error", message: json.error ?? "Error al guardar" });
      } else {
        await updateSession({ name: form.name, email: form.email });
        setProfileFeedback({ type: "success", message: "Perfil actualizado correctamente" });
      }
    } catch {
      setProfileFeedback({ type: "error", message: "Error de red. Intenta de nuevo." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordFeedback({ type: null, message: "" });

    if (form.newPassword !== form.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (form.newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setPasswordFeedback({ type: "error", message: json.error ?? "Error al cambiar contraseña" });
      } else {
        setPasswordFeedback({ type: "success", message: "Contraseña actualizada correctamente" });
        setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      }
    } catch {
      setPasswordFeedback({ type: "error", message: "Error de red. Intenta de nuevo." });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}
        >
          Configuración de perfil
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Actualiza tu nombre, correo y contraseña de acceso
        </p>
      </div>

      {/* Profile section */}
      <form onSubmit={saveProfile}>
        <div
          className="rounded-xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <User size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--white)" }}>
              Datos personales
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Nombre completo
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                }}
              />
            </div>
          </div>

          {profileFeedback.type && (
            <Feedback type={profileFeedback.type} message={profileFeedback.message} />
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: "var(--primary)",
              color: "#050B20",
              opacity: savingProfile ? 0.6 : 1,
              cursor: savingProfile ? "not-allowed" : "pointer",
            }}
          >
            {savingProfile ? "Guardando..." : "Guardar datos"}
          </button>
        </div>
      </form>

      {/* Password section */}
      <form onSubmit={savePassword}>
        <div
          className="rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--white)" }}>
              Cambiar contraseña
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Contraseña actual
              </label>
              <input
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Nueva contraseña
              </label>
              <input
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                Confirmar nueva contraseña
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la nueva contraseña"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--white)",
                }}
              />
            </div>
          </div>

          {passwordFeedback.type && (
            <Feedback type={passwordFeedback.type} message={passwordFeedback.message} />
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: "var(--hot)",
              color: "white",
              opacity: savingPassword ? 0.6 : 1,
              cursor: savingPassword ? "not-allowed" : "pointer",
            }}
          >
            {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  const isSuccess = type === "success";
  return (
    <div
      className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm"
      style={{
        background: isSuccess ? "rgba(0,212,255,0.10)" : "rgba(255,59,92,0.10)",
        color: isSuccess ? "var(--primary)" : "var(--hot)",
        border: `1px solid ${isSuccess ? "rgba(0,212,255,0.2)" : "rgba(255,59,92,0.2)"}`,
      }}
    >
      {isSuccess ? <Check size={14} /> : <AlertCircle size={14} />}
      {message}
    </div>
  );
}
