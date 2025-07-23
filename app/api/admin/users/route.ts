import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Dados obrigatórios faltando." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "admin" }
  });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function PUT(req: NextRequest) {
  const { id, name, email, password, role } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  const data: any = { name, email, role };
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 