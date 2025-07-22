"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  Flame,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Filter,
  BarChart3,
  Timer,
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// Mock data para demonstração
const mockPedidos = [
  {
    id: "1024",
    numero: "1024",
    cliente: "João Silva",
    mesa: "05",
    status: "aguardando",
    itens: ["2x Hambúrguer Clássico", "1x Batata Frita G", "2x Coca-Cola"],
    total: 57.0,
    horario: "19:35",
    tempoEstimado: 25,
    observacoes: "Bacon extra, sem cebola",
  },
  {
    id: "1023",
    numero: "1023",
    cliente: "Maria Santos",
    mesa: "Delivery",
    status: "preparando",
    itens: ["1x Pizza Margherita", "1x Suco Natural"],
    total: 42.5,
    horario: "19:30",
    tempoEstimado: 15,
    observacoes: "",
  },
  {
    id: "1022",
    numero: "1022",
    cliente: "Pedro Costa",
    mesa: "03",
    status: "finalizado",
    itens: ["1x Salada Caesar", "1x Água"],
    total: 28.0,
    horario: "19:25",
    tempoEstimado: 0,
    observacoes: "",
  },
  {
    id: "1025",
    numero: "1025",
    cliente: "Ana Lima",
    mesa: "07",
    status: "aguardando",
    itens: ["3x Hambúrguer Especial", "2x Batata", "3x Refrigerante"],
    total: 89.5,
    horario: "19:40",
    tempoEstimado: 35,
    observacoes: "Sem picles, ponto da carne bem passado",
  },
]

const statusConfig = {
  aguardando: {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: Clock,
    text: "Aguardando",
  },
  preparando: {
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    icon: Flame,
    text: "Preparando",
  },
  finalizado: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    icon: CheckCircle,
    text: "Finalizado",
  },
}

export default function FilaProducao() {
  const [pedidos, setPedidos] = useState(mockPedidos)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [somAtivado, setSomAtivado] = useState(true)
  const [editandoTempo, setEditandoTempo] = useState<string | null>(null)
  const [novoTempo, setNovoTempo] = useState("")

  // Métricas calculadas
  const metricas = {
    total: pedidos.length,
    aguardando: pedidos.filter((p) => p.status === "aguardando").length,
    preparando: pedidos.filter((p) => p.status === "preparando").length,
    finalizado: pedidos.filter((p) => p.status === "finalizado").length,
    tempoMedio: Math.round(
      pedidos.filter((p) => p.status !== "finalizado").reduce((acc, p) => acc + p.tempoEstimado, 0) /
        pedidos.filter((p) => p.status !== "finalizado").length || 0,
    ),
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtroStatus === "todos") return true
    return pedido.status === filtroStatus
  })

  const alterarStatus = (pedidoId: string, novoStatus: string) => {
    setPedidos((prev) =>
      prev.map((pedido) => {
        if (pedido.id === pedidoId) {
          return {
            ...pedido,
            status: novoStatus,
            tempoEstimado: novoStatus === "finalizado" ? 0 : pedido.tempoEstimado,
          }
        }
        return pedido
      }),
    )

    if (somAtivado) {
      // Simular som de notificação
      console.log("🔔 Som de notificação para mudança de status")
    }
  }

  const editarTempo = (pedidoId: string, tempo: number) => {
    setPedidos((prev) => prev.map((pedido) => (pedido.id === pedidoId ? { ...pedido, tempoEstimado: tempo } : pedido)))
    setEditandoTempo(null)
    setNovoTempo("")
  }

  const iniciarEdicaoTempo = (pedidoId: string, tempoAtual: number) => {
    setEditandoTempo(pedidoId)
    setNovoTempo(tempoAtual.toString())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fila de Produção</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie pedidos em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="som-toggle">Som</Label>
              <Switch
                id="som-toggle"
                checked={somAtivado}
                onCheckedChange={setSomAtivado}
                className="data-[state=checked]:bg-orange-500"
              />
              {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metricas.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aguardando</p>
                  <p className="text-2xl font-bold text-blue-600">{metricas.aguardando}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Preparando</p>
                  <p className="text-2xl font-bold text-orange-600">{metricas.preparando}</p>
                </div>
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Finalizados</p>
                  <p className="text-2xl font-bold text-green-600">{metricas.finalizado}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tempo Médio</p>
                  <p className="text-2xl font-bold text-purple-600">{metricas.tempoMedio} min</p>
                </div>
                <Timer className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <Label>Filtrar por status:</Label>
              <div className="flex space-x-2">
                {["todos", "aguardando", "preparando", "finalizado"].map((status) => (
                  <Button
                    key={status}
                    variant={filtroStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus(status)}
                    className="capitalize"
                  >
                    {status === "todos" ? "Todos" : statusConfig[status as keyof typeof statusConfig]?.text}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pedidosFiltrados.map((pedido, index) => {
            const config = statusConfig[pedido.status as keyof typeof statusConfig]
            const IconComponent = config.icon

            return (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`${config.bgColor} border-l-4 ${config.color} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-5 w-5 ${config.textColor}`} />
                        <CardTitle className="text-lg">Pedido #{pedido.numero}</CardTitle>
                      </div>
                      <Badge className={`${config.color} text-white`}>{config.text}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                        <p className="font-semibold">{pedido.cliente}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mesa/Local</p>
                        <p className="font-semibold">{pedido.mesa}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Itens</p>
                      <div className="space-y-1">
                        {pedido.itens.map((item, idx) => (
                          <p key={idx} className="text-sm">
                            • {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    {pedido.observacoes && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Observações</p>
                        <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">{pedido.observacoes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                        <p className="font-bold text-lg">R$ {pedido.total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Estimado</p>
                        {editandoTempo === pedido.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={novoTempo}
                              onChange={(e) => setNovoTempo(e.target.value)}
                              className="w-16 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => editarTempo(pedido.id, Number.parseInt(novoTempo) || 0)}
                              className="h-8 px-2"
                            >
                              ✓
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-lg">{pedido.tempoEstimado} min</p>
                            {pedido.status !== "finalizado" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => iniciarEdicaoTempo(pedido.id, pedido.tempoEstimado)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-2 pt-4">
                      {pedido.status === "aguardando" && (
                        <Button
                          onClick={() => alterarStatus(pedido.id, "preparando")}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      {pedido.status === "preparando" && (
                        <>
                          <Button
                            onClick={() => alterarStatus(pedido.id, "aguardando")}
                            variant="outline"
                            className="flex-1"
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </Button>
                          <Button
                            onClick={() => alterarStatus(pedido.id, "finalizado")}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                        </>
                      )}
                      {pedido.status === "finalizado" && (
                        <Button
                          onClick={() => alterarStatus(pedido.id, "preparando")}
                          variant="outline"
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {pedidosFiltrados.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhum pedido encontrado para o filtro selecionado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
