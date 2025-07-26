import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { mesaId, customerName, phone, people, date, time, notes } = await req.json();
    
    console.log('Dados da reserva:', { mesaId, customerName, phone, people, date, time, notes });

    if (!mesaId || !customerName || !phone || !date || !time) {
      return NextResponse.json({ 
        error: "Campos obrigatórios faltando" 
      }, { status: 400 });
    }

    // Verificar se a mesa existe e está disponível
    const mesa = await prisma.table.findUnique({
      where: { id: mesaId }
    });

    if (!mesa) {
      return NextResponse.json({ 
        error: "Mesa não encontrada" 
      }, { status: 404 });
    }

    if (mesa.status !== "free") {
      return NextResponse.json({ 
        error: "Mesa não está disponível para reserva" 
      }, { status: 400 });
    }

    // Criar a reserva no banco de dados
    const reservation = await prisma.reservation.create({
      data: {
        tableId: mesaId,
        reservedFor: new Date(`${date}T${time}`),
        customerName,
        people,
        phone,
        notes
      }
    });

    // Atualizar o status da mesa para reservada
    const mesaAtualizada = await prisma.table.update({
      where: { id: mesaId },
      data: {
        status: "reserved"
      }
    });

    console.log('Mesa reservada com sucesso:', mesaAtualizada);

    return NextResponse.json({
      success: true,
      mesa: mesaAtualizada,
      message: "Reserva confirmada com sucesso!"
    });

  } catch (error: any) {
    console.error("Erro ao reservar mesa:", error);
    return NextResponse.json({ 
      error: "Erro ao processar reserva",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 