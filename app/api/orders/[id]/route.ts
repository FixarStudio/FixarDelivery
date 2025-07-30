import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    const order = await prisma.order.update({
      where: {
        id: params.id
      },
      data: {
        status: status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      order: order,
      message: "Status do pedido atualizado com sucesso!" 
    })
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar pedido" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pedido não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      order: order 
    })
  } catch (error) {
    console.error("Erro ao buscar pedido:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao buscar pedido" },
      { status: 500 }
    )
  }
} 