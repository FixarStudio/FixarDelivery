import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mesas = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        currentSession: true,
        reservations: {
          where: {
            reservedFor: {
              gte: new Date()
            }
          },
          orderBy: {
            reservedFor: 'asc'
          }
        },
        lastOrder: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    
    console.log('Mesas carregadas com dados completos:', mesas);
    
    return NextResponse.json(mesas);
  } catch (error: any) {
    console.error("Erro ao buscar mesas:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar mesas",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { number, capacity, location, notes } = await req.json();
    
    if (!number || !capacity || !location) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const mesa = await prisma.table.create({
      data: {
        number,
        capacity: parseInt(capacity),
        location,
        status: "free",
        qrCode: `mesa-${number}-qr`,
      },
      include: {
        currentSession: true,
        reservations: {
          where: {
            reservedFor: {
              gte: new Date()
            }
          },
          orderBy: {
            reservedFor: 'asc'
          }
        },
        lastOrder: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(mesa);
  } catch (error: any) {
    console.error("Erro ao criar mesa:", error);
    return NextResponse.json({ 
      error: error?.message || "Erro ao criar mesa.",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, number, capacity, location, notes, status } = await req.json();
    
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    const mesa = await prisma.table.update({
      where: { id },
      data: {
        number,
        capacity: parseInt(capacity),
        location,
        status,
      },
      include: {
        currentSession: true,
        reservations: {
          where: {
            reservedFor: {
              gte: new Date()
            }
          },
          orderBy: {
            reservedFor: 'asc'
          }
        },
        lastOrder: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(mesa);
  } catch (error: any) {
    console.error("Erro ao editar mesa:", error);
    return NextResponse.json({ 
      error: error?.message || "Erro ao editar mesa.",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    
    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar mesa:", error);
    return NextResponse.json({ 
      error: error?.message || "Erro ao deletar mesa.",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
} 