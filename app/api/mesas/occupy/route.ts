import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { mesaId, people } = await req.json();
    
    console.log('Ocupando mesa:', { mesaId, people });

    if (!mesaId || !people) {
      return NextResponse.json({ 
        error: "ID da mesa e número de pessoas são obrigatórios" 
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
        error: "Mesa não está disponível para ocupação" 
      }, { status: 400 });
    }

    // Criar uma sessão para a mesa
    const session = await prisma.tableSession.create({
      data: {
        tableId: mesaId,
        startTime: new Date(),
        people: people,
        total: 0,
        closed: false
      }
    });

    // Atualizar o status da mesa para ocupada
    const mesaAtualizada = await prisma.table.update({
      where: { id: mesaId },
      data: {
        status: "occupied",
        currentSessionId: session.id
      },
      include: {
        currentSession: true
      }
    });

    console.log('Mesa ocupada com sucesso:', mesaAtualizada);

    return NextResponse.json({
      success: true,
      mesa: mesaAtualizada,
      session: session,
      message: "Mesa ocupada com sucesso!"
    });

  } catch (error: any) {
    console.error("Erro ao ocupar mesa:", error);
    return NextResponse.json({ 
      error: "Erro ao processar ocupação",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 