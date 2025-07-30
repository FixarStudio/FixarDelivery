"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  status: string
  total: number
  customerName: string
  customerPhone?: string
  observations?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  pending: {
    label: "Aguardando Preparo",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Seu pedido foi recebido e está aguardando para ser preparado"
  },
  preparing: {
    label: "Em Preparação",
    color: "bg-blue-500",
    icon: Loader2,
    description: "Seu pedido está sendo preparado na cozinha"
  },
  ready: {
    label: "Pronto para Entrega",
    color: "bg-green-500",
    icon: CheckCircle,
    description: "Seu pedido está pronto e será entregue em breve"
  },
  delivered: {
    label: "Entregue",
    color: "bg-green-600",
    icon: CheckCircle,
    description: "Seu pedido foi entregue com sucesso!"
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-500",
    icon: AlertCircle,
    description: "Seu pedido foi cancelado"
  }
}

export default function AcompanharPedidoPage() {
  const params = useParams()
  const pedidoId = params?.pedidoId as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${pedidoId}`)
        
        if (!response.ok) {
          throw new Error("Pedido não encontrado")
        }
        
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedido")
      } finally {
        setLoading(false)
      }
    }

    if (pedidoId) {
      fetchOrder()
      
      // Atualizar status a cada 30 segundos
      const interval = setInterval(fetchOrder, 30000)
      return () => clearInterval(interval)
    }
  }, [pedidoId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "O pedido solicitado não foi encontrado"}
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = currentStatus?.icon || Clock

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Acompanhar Pedido
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ID: {order.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status do Pedido */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${currentStatus?.color.replace('bg-', 'text-')}`} />
                <span>Status do Pedido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${currentStatus?.color}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {currentStatus?.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStatus?.description}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  {order.customerPhone && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Telefone:</span>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data:</span>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Hora:</span>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {item.image && (
                    <img
                      src={item.image.startsWith('http') ? item.image : `https://ik.imagekit.io/fixarmenu/${item.image}`}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.observations && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Observações:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    {order.observations}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progresso do Pedido */}
        <Card className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Progresso do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                {Object.entries(statusConfig)
                  .filter(([status]) => status !== 'cancelled')
                  .map(([status, config], index) => {
                  const isCompleted = ['pending', 'preparing', 'ready', 'delivered'].indexOf(order.status) >= 
                    ['pending', 'preparing', 'ready', 'delivered'].indexOf(status)
                  const isCurrent = order.status === status
                  
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? config.color : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {isCompleted && <config.icon className="h-4 w-4 text-white" />}
                      </div>
                      <p className={`text-xs mt-2 text-center ${
                        isCurrent ? 'font-semibold' : 'text-gray-500'
                      }`}>
                        {config.label}
                      </p>
                    </div>
                  )
                })}
              </div>
              
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{
                    width: `${(['pending', 'preparing', 'ready', 'delivered'].indexOf(order.status) + 1) * 25}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
