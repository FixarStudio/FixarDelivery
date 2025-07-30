import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mesaId = searchParams.get('mesaId');
    const month = searchParams.get('month'); // formato: YYYY-MM
    
    if (!mesaId) {
      return NextResponse.json({ 
        error: "ID da mesa é obrigatório" 
      }, { status: 400 });
    }

    // Construir filtro de data se month for fornecido
    let dateFilter = {};
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
      
      dateFilter = {
        reservedFor: {
          gte: startDate,
          lte: endDate
        }
      };
    }

                    // Buscar reservas da mesa
                const reservations = await prisma.reservation.findMany({
                  where: {
                    tableId: mesaId,
                    ...dateFilter
                  },
                  include: {
                    table: true
                  },
                  orderBy: {
                    reservedFor: 'asc'
                  }
                });

    // Agrupar reservas por data
    const reservationsByDate = reservations.reduce((acc, reservation) => {
      const dateKey = reservation.reservedFor.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(reservation);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      reservations: reservationsByDate
    });

  } catch (error: any) {
    console.error("Erro ao buscar reservas:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar reservas",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 