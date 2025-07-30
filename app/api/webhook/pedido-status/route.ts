import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nome, 
      numero_cliente, 
      status, 
      pedido_id 
    } = body

    // Validar campos obrigatórios
    if (!pedido_id || !status || !nome || !numero_cliente) {
      return NextResponse.json(
        { 
          success: false, 
          message: "pedido_id, status, nome e numero_cliente são obrigatórios" 
        },
        { status: 400 }
      )
    }

    // Mapear status em português para inglês
    const statusMapping: { [key: string]: string } = {
      "Aguardando Preparo": "pending",
      "Em Preparação": "preparing", 
      "Pronto para Entrega": "ready",
      "Entregue": "delivered",
      "Cancelado": "cancelled"
    }

    // Converter status em português para inglês
    const statusEmIngles = statusMapping[status]
    if (!statusEmIngles) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Status inválido. Status permitidos: ${Object.keys(statusMapping).join(", ")}` 
        },
        { status: 400 }
      )
    }

    // Buscar o pedido no banco de dados
    const pedidoExistente = await prisma.order.findUnique({
      where: {
        id: pedido_id
      }
    })

    if (!pedidoExistente) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Pedido não encontrado" 
        },
        { status: 404 }
      )
    }

    // Atualizar o pedido com os dados reais do cliente e status
    const pedidoAtualizado = await prisma.order.update({
      where: {
        id: pedido_id
      },
      data: {
        status: statusEmIngles,
        customerName: nome,
        customerPhone: numero_cliente,
        updatedAt: new Date()
      }
    })

    console.log(`Webhook recebido - Pedido ${pedido_id} atualizado para status: ${status} (${statusEmIngles})`)

    return NextResponse.json({ 
      success: true, 
      message: "Status do pedido atualizado com sucesso via webhook",
      pedido: {
        id: pedidoAtualizado.id,
        status: pedidoAtualizado.status,
        customerName: pedidoAtualizado.customerName,
        customerPhone: pedidoAtualizado.customerPhone,
        updatedAt: pedidoAtualizado.updatedAt
      }
    })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erro interno do servidor ao processar webhook" 
      },
      { status: 500 }
    )
  }
}

// Método GET para testar se a rota está funcionando
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Webhook endpoint está funcionando",
    endpoint: "/api/webhook/pedido-status",
    method: "POST",
    expectedBody: {
      nome: "string (obrigatório) - Nome real do cliente",
      numero_cliente: "string (obrigatório) - Número real do cliente", 
      status: "Aguardando Preparo|Em Preparação|Pronto para Entrega|Entregue|Cancelado",
      pedido_id: "string (obrigatório) - ID do pedido"
    }
  })
} 