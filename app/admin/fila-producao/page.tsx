"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Flame, CheckCircle, Play, RotateCcw, TrendingUp, Users, Timer } from "lucide-react"

interface QueueOrder {
  id: string
  customerName: string
  table?: string
  address?: string
  status: "aguardando" | "preparando" | "finalizado"
  items: Array<{
    name: string
    quantity: number
    customizations?: string[]
  }>
  total: number
  estimatedTime: number
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export default function FilaProducao() {
  const [orders, setOrders] = useState<QueueOrder[]>([])
  const [metrics, setMetrics] = useState({
    averageTime: 28,
    ordersToday: 45,
    currentQueue: 8,
    efficiency: 92,
  })

  // Mock data
  useEffect(() => {
    const mockOrders: QueueOrder[] = [
      {
        id: "1022",
        customerName: "Ana Costa",
        table: "3",
        status: "finalizado",
        items: [
          { name: "Pizza Margherita", quantity: 1 },
          { name: "Refrigerante", quantity: 2 },
        ],
        total: 45.0,
        estimatedTime: 25,
        createdAt: "19:15",
        startedAt: "19:20",
        completedAt: "19:40",
      },
      {
        id: "1023",
        customerName: "João Silva",
        status: "preparando",
        items: [
          { name: "Hambúrguer Clássico", quantity: 2, customizations: ["Bacon extra"] },
          { name: "Batata Frita", quantity: 1 },
        ],
        total: 57.0,
        estimatedTime: 30,
        createdAt: "19:25",
        startedAt: "19:35",
      },
      {
        id: "1024",
        customerName: "Maria Lima",
        table: "7",
        status: "aguardando",
        items: [
          { name: "Salada Caesar", quantity: 1 },
          { name: "Suco Natural", quantity: 1 },
        ],
        total: 32.0,
        estimatedTime: 20,
        createdAt: "19:30",
      },
      {
        id: "1025",
        customerName: "Pedro Santos",
        address: "R. das Palmeiras, 456",
        status: "aguardando",
        items: [
          { name: "Pizza Portuguesa", quantity: 1 },
          { name: "Guaraná", quantity: 1 },
        ],
        total: 52.0,
        estimatedTime: 35,
        createdAt: "19:32",
      },
    ]

    setOrders(mockOrders)
  }, [])

  const updateOrderStatus = (orderId: string, newStatus: QueueOrder["status"]) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const now = new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })

          return {
            ...order,
            status: newStatus,
            startedAt: newStatus === "preparando" && !order.startedAt ? now : order.startedAt,
            completedAt: newStatus === "finalizado" ? now : order.completedAt,
          }
        }
        return order
      }),
    )
  }

  const updateEstimatedTime = (orderId: string, time: number) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, estimatedTime: time } : order)))
  }

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
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "preparando":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "finalizado":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const ordersByStatus = {
    aguardando: orders.filter((o) => o.status === "aguardando"),
    preparando: orders.filter((o) => o.status === "preparando"),
    finalizado: orders.filter((o) => o.status === "finalizado"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fila de Produção</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Timer className="h-4 w-4 mr-1" />
            Tempo médio: {metrics.averageTime}min
          </Badge>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                <p className="text-2xl font-bold">{metrics.ordersToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Na Fila</p>
                <p className="text-2xl font-bold">{metrics.currentQueue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">{metrics.averageTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{metrics.efficiency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila de Pedidos */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos ({orders.length})</TabsTrigger>
          <TabsTrigger value="aguardando">Aguardando ({ordersByStatus.aguardando.length})</TabsTrigger>
          <TabsTrigger value="preparando">Preparando ({ordersByStatus.preparando.length})</TabsTrigger>
          <TabsTrigger value="finalizado">Finalizados ({ordersByStatus.finalizado.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onTimeChange={updateEstimatedTime}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="aguardando" className="space-y-4">
          {ordersByStatus.aguardando.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onTimeChange={updateEstimatedTime}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="preparando" className="space-y-4">
          {ordersByStatus.preparando.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onTimeChange={updateEstimatedTime}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="finalizado" className="space-y-4">
          {ordersByStatus.finalizado.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onTimeChange={updateEstimatedTime}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface OrderCardProps {
  order: QueueOrder
  onStatusChange: (id: string, status: QueueOrder["status"]) => void
  onTimeChange: (id: string, time: number) => void
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
}

function OrderCard({ order, onStatusChange, onTimeChange, getStatusIcon, getStatusColor }: OrderCardProps) {
  const [editingTime, setEditingTime] = useState(false)
  const [tempTime, setTempTime] = useState(order.estimatedTime)

  const handleTimeSubmit = () => {
    onTimeChange(order.id, tempTime)
    setEditingTime(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-1">
              #{order.id}
            </Badge>
            <Badge className={`border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">{order.createdAt}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do Cliente */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.table ? `Mesa ${order.table}` : order.address}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">R$ {order.total.toFixed(2)}</p>
            <div className="flex items-center gap-2">
              {editingTime ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={tempTime}
                    onChange={(e) => setTempTime(Number(e.target.value))}
                    className="w-16 h-6 text-xs"
                  />
                  <Button size="sm" variant="ghost" onClick={handleTimeSubmit}>
                    ✓
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setEditingTime(true)} className="text-xs">
                  {order.estimatedTime}min
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="space-y-1">
          {order.items.map((item, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">
                {item.quantity}x {item.name}
              </span>
              {item.customizations && item.customizations.length > 0 && (
                <span className="text-muted-foreground ml-2">({item.customizations.join(", ")})</span>
              )}
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {order.status === "aguardando" && (
            <Button size="sm" onClick={() => onStatusChange(order.id, "preparando")} className="flex-1">
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          )}

          {order.status === "preparando" && (
            <>
              <Button size="sm" variant="outline" onClick={() => onStatusChange(order.id, "aguardando")}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Pausar
              </Button>
              <Button size="sm" onClick={() => onStatusChange(order.id, "finalizado")} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                Finalizar
              </Button>
            </>
          )}

          {order.status === "finalizado" && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange(order.id, "preparando")}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reabrir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
