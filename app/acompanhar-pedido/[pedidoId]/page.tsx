"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Flame, MapPin, User, Share2, Bell, Utensils } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  customizations?: string[]
}

interface QueueItem {
  id: string
  reference: string
  status: "aguardando" | "preparando" | "finalizado"
  estimatedTime: string
}

interface OrderData {
  id: string
  status: "aguardando" | "preparando" | "finalizado" | "entregue"
  estimatedTime: string
  deliveryTime: string
  customer: {
    name: string
    table?: string
    address?: string
  }
  items: OrderItem[]
  total: number
  createdAt: string
  queuePosition: number
}

export default function AcompanharPedido({ params }: { params: { pedidoId: string } }) {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  // Simulated data - replace with real API calls
  useEffect(() => {
    const mockOrderData: OrderData = {
      id: params.pedidoId,
      status: "preparando",
      estimatedTime: "25-35 minutos",
      deliveryTime: "20:10",
      customer: {
        name: "João Silva",
        table: "05",
        address: "R. das Flores, 123",
      },
      items: [
        {
          id: "1",
          name: "Hambúrguer Clássico",
          quantity: 2,
          price: 16.0,
          customizations: ["Bacon extra", "Sem cebola"],
        },
        {
          id: "2",
          name: "Batata Frita G",
          quantity: 1,
          price: 15.0,
        },
        {
          id: "3",
          name: "Coca-Cola 350ml",
          quantity: 2,
          price: 5.0,
        },
      ],
      total: 57.0,
      createdAt: "19:35",
      queuePosition: 2,
    }

    const mockQueue: QueueItem[] = [
      {
        id: "1022",
        reference: "Mesa 3",
        status: "finalizado",
        estimatedTime: "0min",
      },
      {
        id: "1023",
        reference: "João S.",
        status: "preparando",
        estimatedTime: "15min",
      },
      {
        id: params.pedidoId,
        reference: "Maria L.",
        status: "aguardando",
        estimatedTime: "25min",
      },
      {
        id: "1025",
        reference: "Mesa 7",
        status: "aguardando",
        estimatedTime: "35min",
      },
    ]

    setTimeout(() => {
      setOrderData(mockOrderData)
      setQueue(mockQueue)
      setLoading(false)
    }, 1000)
  }, [params.pedidoId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aguardando":
        return <Clock className="h-4 w-4" />
      case "preparando":
        return <Flame className="h-4 w-4" />
      case "finalizado":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aguardando":
        return "bg-gray-100 text-gray-700"
      case "preparando":
        return "bg-orange-100 text-orange-700"
      case "finalizado":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const shareOrder = () => {
    const url = window.location.href
    const text = `Acompanhe meu pedido #${orderData?.id}: ${url}`

    if (navigator.share) {
      navigator.share({
        title: "Acompanhar Pedido",
        text: text,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(text)
      // Show toast notification
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2>
            <p className="text-muted-foreground">Verifique o número do pedido e tente novamente.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header de Confirmação */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">🎉 Pedido Confirmado!</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                #{orderData.id}
              </Badge>
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(orderData.status)}`}>
                {getStatusIcon(orderData.status)}
                <span className="ml-1 capitalize">{orderData.status}</span>
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{orderData.customer.name}</span>
              </div>
              {orderData.customer.table && (
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <span>Mesa {orderData.customer.table}</span>
                </div>
              )}
              {orderData.customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{orderData.customer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Enviado às {orderData.createdAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimativa de Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estimativa de Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{orderData.estimatedTime}</div>
              <p className="text-muted-foreground">📊 Baseado em: fila atual + complexidade do pedido</p>
              <p className="text-lg font-medium">🕐 Previsão de entrega: {orderData.deliveryTime}</p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>📦 Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderData.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">{item.customizations.join(", ")}</p>
                  )}
                </div>
                <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>💰 Total:</span>
              <span>R$ {orderData.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Fila de Produção */}
        <Card>
          <CardHeader>
            <CardTitle>🔥 FILA DE PRODUÇÃO AO VIVO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                  item.id === params.pedidoId ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>{getStatusIcon(item.status)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{item.id}</span>
                      <span className="text-muted-foreground">|</span>
                      <span>{item.reference}</span>
                      {item.id === params.pedidoId && (
                        <Badge variant="default" className="ml-2">
                          ← SEU PEDIDO
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.status} {item.estimatedTime && `• ${item.estimatedTime}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={shareOrder} className="flex-1 bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>
    </div>
  )
}
