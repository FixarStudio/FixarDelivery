"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Clock, Flame, MapPin, User, Share2, Bell, BellOff, Package, Timer, ChefHat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock data - em produção viria de uma API
const mockOrderData = {
  id: "1024",
  status: "preparando",
  cliente: {
    nome: "João Silva",
    mesa: "05",
    endereco: "R. das Flores, 123",
    telefone: "(11) 99999-9999",
  },
  horario: {
    pedido: "19:35",
    estimativa: "25-35 min",
    previsaoEntrega: "20:10",
  },
  itens: [
    {
      id: 1,
      nome: "Hambúrguer Clássico",
      quantidade: 2,
      preco: 32.0,
      observacoes: "Bacon extra, sem cebola",
    },
    {
      id: 2,
      nome: "Batata Frita G",
      quantidade: 1,
      preco: 15.0,
      observacoes: "",
    },
    {
      id: 3,
      nome: "Coca-Cola 350ml",
      quantidade: 2,
      preco: 10.0,
      observacoes: "",
    },
  ],
  total: 57.0,
  posicaoFila: 2,
}

const mockFilaData = [
  {
    id: "1022",
    referencia: "Mesa 3",
    status: "finalizado",
    tempoRestante: "Finalizado",
  },
  {
    id: "1023",
    referencia: "João S.",
    status: "preparando",
    tempoRestante: "15 min",
  },
  {
    id: "1024",
    referencia: "Maria L.",
    status: "aguardando",
    tempoRestante: "25 min",
  },
  {
    id: "1025",
    referencia: "Mesa 7",
    status: "aguardando",
    tempoRestante: "35 min",
  },
]

const statusConfig = {
  aguardando: {
    color: "bg-blue-500",
    icon: Clock,
    text: "Aguardando",
    emoji: "⏳",
  },
  preparando: {
    color: "bg-orange-500",
    icon: Flame,
    text: "Preparando",
    emoji: "🔥",
  },
  finalizado: {
    color: "bg-green-500",
    icon: CheckCircle,
    text: "Finalizado",
    emoji: "✅",
  },
}

export default function AcompanharPedido() {
  const params = useParams()
  const pedidoId = params.pedidoId as string

  const [orderData, setOrderData] = useState(mockOrderData)
  const [filaData, setFilaData] = useState(mockFilaData)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      // Aqui seria a lógica de WebSocket/SSE para atualizações reais
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        new Notification("Notificações ativadas!", {
          body: "Você será notificado sobre atualizações do seu pedido.",
          icon: "/placeholder-logo.png",
        })
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Pedido #${orderData.id}`,
      text: `Acompanhe meu pedido em tempo real!`,
      url: window.location.href,
    }

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const IconComponent = config?.icon || Clock
    return <IconComponent className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header de Confirmação */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎉 Pedido Confirmado!</h1>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Número: #{orderData.id}
            </Badge>
            <Badge className={`text-lg px-4 py-2 text-white ${getStatusColor(orderData.status)}`}>
              {getStatusIcon(orderData.status)}
              <span className="ml-2">{statusConfig[orderData.status as keyof typeof statusConfig]?.text}</span>
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Cliente */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações do Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                    <p className="font-semibold">{orderData.cliente.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mesa</p>
                    <p className="font-semibold">Mesa {orderData.cliente.mesa}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Endereço</p>
                  <p className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {orderData.cliente.endereco}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enviado às</p>
                  <p className="font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {orderData.horario.pedido}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Itens do Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.itens.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.quantidade}x {item.nome}
                        </p>
                        {item.observacoes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.observacoes}</p>
                        )}
                      </div>
                      <p className="font-bold text-orange-600">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    {index < orderData.itens.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">R$ {orderData.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex space-x-4">
              <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={handleNotificationToggle} variant="outline" className="flex-1 bg-transparent">
                {notificationsEnabled ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Desativar Notificações
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Ativar Notificações
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimativa de Tempo */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5" />
                  <span>Tempo Estimado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-3xl font-bold text-orange-600">{orderData.horario.estimativa}</div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Baseado em:</p>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <ChefHat className="h-4 w-4" />
                    <span>Fila atual + complexidade</span>
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                    🕐 Previsão de entrega: {orderData.horario.previsaoEntrega}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fila de Produção */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="h-5 w-5" />
                  <span>Fila de Produção</span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acompanhe em tempo real</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {filaData.map((pedido, index) => (
                    <motion.div
                      key={pedido.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        pedido.id === orderData.id
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(pedido.status)}`}></div>
                          <div>
                            <p className="font-semibold text-sm">
                              #{pedido.id} | {pedido.referencia}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {statusConfig[pedido.status as keyof typeof statusConfig]?.emoji}{" "}
                              {statusConfig[pedido.status as keyof typeof statusConfig]?.text}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{pedido.tempoRestante}</p>
                        </div>
                      </div>
                      {pedido.id === orderData.id && (
                        <div className="mt-2 text-center">
                          <Badge variant="secondary" className="text-xs">
                            ← SEU PEDIDO
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
