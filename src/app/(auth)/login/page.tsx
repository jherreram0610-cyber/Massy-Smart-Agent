"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <Card
        className="w-full max-w-sm p-8 space-y-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}
          >
            Massy Motors
          </div>
          <div style={{ color: "var(--muted)", fontSize: "13px" }}>
            Panel de Ventas IA — Smart Cali
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asesor@massymotors.co"
              required
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--hot)" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-semibold"
            style={{
              background: "var(--primary)",
              color: "var(--bg)",
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
          Acceso solo para equipo Massy Motors
        </p>
      </Card>
    </div>
  );
}
