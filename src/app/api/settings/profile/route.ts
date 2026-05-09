import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const advisorId = (session.user as { id?: string }).id;
  if (!advisorId) return NextResponse.json({ error: "No advisor id" }, { status: 400 });

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body as {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const advisor = await db.advisor.findUnique({ where: { id: advisorId } });
  if (!advisor) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

  // If changing password, verify current one first
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Se requiere la contraseña actual" }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, advisor.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
  }

  // If changing email, check it's not taken by another advisor
  if (email && email !== advisor.email) {
    const existing = await db.advisor.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 400 });
    }
  }

  const updated = await db.advisor.update({
    where: { id: advisorId },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 12) } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
