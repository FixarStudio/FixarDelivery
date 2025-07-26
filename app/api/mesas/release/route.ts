import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { mesaId } = await req.json();
    
    console.log('Liberando mesa:', { mesaId });

    if (!mesaId) {
      return NextResponse.json({ 
        error: "ID da mesa é obrigatório" 
      }, { status: 400 });
    }

    // Verificar se a mesa existe
    const mesa = await prisma.table.findUnique({
      where: { id: mesaId },
      include: {
        currentSession: true,
        reservations: {
          where: {
            reservedFor: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!mesa) {
      return NextResponse.json({ 
        error: "Mesa não encontrada" 
      }, { status: 404 });
    }

    // Se a mesa tem uma sessão ativa, fechar ela
    if (mesa.currentSession) {
      await prisma.tableSession.update({
        where: { id: mesa.currentSession.id },
        data: {
          closed: true
        }
      });
    }

    // Atualizar o status da mesa para livre
    const mesaAtualizada = await prisma.table.update({
      where: { id: mesaId },
      data: {
        status: "free",
        currentSessionId: null
      },
      include: {
        currentSession: true,
        reservations: {
          where: {
            reservedFor: {
              gte: new Date()
            }
          }
        }
      }
    });

    console.log('Mesa liberada com sucesso:', mesaAtualizada);

    return NextResponse.json({
      success: true,
      mesa: mesaAtualizada,
      message: "Mesa liberada com sucesso!"
    });

  } catch (error: any) {
    console.error("Erro ao liberar mesa:", error);
    return NextResponse.json({ 
      error: "Erro ao processar liberação",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 