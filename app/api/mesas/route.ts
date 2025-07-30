import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Iniciando busca de mesas...');
    
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
    
    console.log('Todas as mesas:', mesas);
    console.log('Número de mesas encontradas:', mesas.length);
    
    return NextResponse.json(mesas);
  } catch (error: any) {
    console.error("Erro ao buscar mesas:", error);
    console.error("Stack trace:", error?.stack);
    return NextResponse.json({ 
      error: "Erro ao buscar mesas",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
} 