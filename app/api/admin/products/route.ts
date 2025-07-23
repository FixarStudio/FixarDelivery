import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, extras: true }
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { name, description, price, image, available, categoryId, extras } = await req.json();
  if (!name || !price || !categoryId) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      image,
      available,
      categoryId,
      extras: extras
        ? {
            create: extras.map((extra: any) => ({
              name: extra.name,
              price: extra.price,
            })),
          }
        : undefined,
    },
    include: { category: true, extras: true }
  });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  const { id, name, description, price, image, available, categoryId, extras } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      image,
      available,
      categoryId,
      extras: {
        deleteMany: {},
        create: extras
          ? extras.map((extra: any) => ({
              name: extra.name,
              price: extra.price,
            }))
          : [],
      },
    },
    include: { category: true, extras: true }
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 