import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const tableNumber = decodeURIComponent(table);
    
    console.log('Buscando pedidos da mesa:', tableNumber);
    
    // Primeiro, encontrar a mesa
    const mesa = await prisma.table.findFirst({
      where: { 
        OR: [
          { number: tableNumber },
          { number: tableNumber.replace('Mesa ', '') },
          { number: tableNumber.replace('Mesa%20', '') },
          { number: tableNumber.replace('Mesa%202', '2') },
          { number: '2' } // Fallback para mesa 2
        ]
      }
    });

    if (!mesa) {
      return NextResponse.json({ 
        error: "Mesa não encontrada",
        tableNumber 
      }, { status: 404 });
    }

    // Buscar pedidos da mesa
    const orders = await prisma.order.findMany({
      where: { 
        tableId: mesa.id 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Pedidos encontrados:', orders.length);

    return NextResponse.json({
      mesa: mesa,
      orders: orders,
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.total, 0)
    });

  } catch (error: any) {
    console.error("Erro ao buscar pedidos da mesa:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar pedidos",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 