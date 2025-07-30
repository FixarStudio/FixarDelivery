import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tableId, 
      items, 
      total, 
      customerName, 
      customerPhone, 
      observations,
      deliveryAddress,
      deliveryType 
    } = body

    // Criar o pedido
    const order = await prisma.order.create({
      data: {
        tableId: tableId || null,
        items: items,
        total: total,
        customerName: customerName || "Cliente",
        customerPhone: customerPhone || "",
        observations: observations || "",
        deliveryAddress: deliveryAddress || "",
        deliveryType: deliveryType || "local", // "local" ou "delivery"
        status: "pending", // pending, preparing, ready, delivered, cancelled
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      order: order,
      message: "Pedido criado com sucesso!" 
    })
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao criar pedido" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const tableId = searchParams.get("tableId")

    let where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (tableId) {
      where.tableId = tableId
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ 
      success: true, 
      orders: orders 
    })
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao buscar pedidos" },
      { status: 500 }
    )
  }
} 