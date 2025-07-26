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
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    
    console.log('Todas as mesas:', mesas);
    
    return NextResponse.json(mesas);
  } catch (error: any) {
    console.error("Erro ao buscar mesas:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar mesas",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 