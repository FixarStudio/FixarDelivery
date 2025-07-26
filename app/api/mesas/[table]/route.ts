import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const tableNumber = decodeURIComponent(table);
    console.log('Buscando mesa:', tableNumber);
    
    // Primeiro, vamos listar todas as mesas para debug
    const allMesas = await prisma.table.findMany()
    console.log('Todas as mesas no banco:', allMesas)
    
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

    console.log('Mesa encontrada:', mesa);

    if (!mesa) {
      return NextResponse.json({ 
        error: "Mesa não encontrada",
        tableNumber,
        searchedFor: [tableNumber, tableNumber.replace('Mesa ', ''), tableNumber.replace('Mesa%20', '')]
      }, { status: 404 });
    }

    return NextResponse.json(mesa);
  } catch (error: any) {
    console.error("Erro ao buscar mesa:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar mesa",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 