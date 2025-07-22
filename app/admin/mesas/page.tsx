"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data para demonstração
const initialMesas = [
  {
    id: 1,
    number: "1",
    capacity: 4,
    status: "free",
    location: "Salão Principal",
    qrCode: "mesa-1-qr",
    currentSession: null,
    lastOrder: null,
  },
  {
    id: 2,
    number: "2",
    capacity: 2,
    status: "occupied",
    location: "Salão Principal",
    qrCode: "mesa-2-qr",
    currentSession: {
      startTime: "14:30",
      people: 2,
      orders: 1,
      total: 45.8,
    },
    lastOrder: "14:45",
  },
  {
    id: 3,
    number: "3",
    capacity: 6,
    status: "reserved",
    location: "Área Externa",
    qrCode: "mesa-3-qr",
    currentSession: {
      reservedFor: "15:30",
      customerName: "João Silva",
      people: 4,
    },
    lastOrder: null,
  },
  {
    id: 4,
    number: "12",
    capacity: 4,
    status: "occupied",
    location: "Salão Principal",
    qrCode: "mesa-12-qr",
    currentSession: {
      startTime: "13:15",
      people: 2,
      orders: 3,
      total: 89.5,
    },
    lastOrder: "14:20",
  },
]

export default function MesasManagement() {
  const [mesas, setMesas] = useState(initialMesas)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMesa, setEditingMesa] = useState<any>(null)
  const [deletingMesa, setDeletingMesa] = useState<any>(null)
  const [viewingMesa, setViewingMesa] = useState<any>(null)

  const [formData, setFormData] = useState({
    number: "",
    capacity: 4,
    location: "Salão Principal",
    notes: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "free":
        return "Livre"
      case "occupied":
        return "Ocupada"
      case "reserved":
        return "Reservada"
      case "maintenance":
        return "Manutenção"
      default:
        return "Desconhecido"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <CheckCircle className="h-4 w-4" />
      case "occupied":
        return <Users className="h-4 w-4" />
      case "reserved":
        return <Clock className="h-4 w-4" />
      case "maintenance":
        return <Settings className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleAddMesa = () => {
    const newMesa = {
      id: Date.now(),
      number: formData.number,
      capacity: formData.capacity,
      status: "free",
      location: formData.location,
      qrCode: `mesa-${formData.number}-qr`,
      currentSession: null,
      lastOrder: null,
    }

    setMesas([...mesas, newMesa])
    setShowAddModal(false)
    resetForm()
  }

  const handleEditMesa = () => {
    setMesas(mesas.map((mesa) => (mesa.id === editingMesa.id ? { ...mesa, ...formData } : mesa)))
    setEditingMesa(null)
    resetForm()
  }

  const handleDeleteMesa = () => {
    setMesas(mesas.filter((mesa) => mesa.id !== deletingMesa.id))
    setDeletingMesa(null)
  }

  const toggleMesaStatus = (mesaId: number) => {
    setMesas(
      mesas.map((mesa) => {
        if (mesa.id === mesaId) {
          const newStatus = mesa.status === "free" ? "occupied" : "free"
          return {
            ...mesa,
            status: newStatus,
            currentSession:
              newStatus === "occupied"
                ? {
                    startTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    people: mesa.capacity,
                    orders: 0,
                    total: 0,
                  }
                : null,
          }
        }
        return mesa
      }),
    )
  }

  const resetForm = () => {
    setFormData({
      number: "",
      capacity: 4,
      location: "Salão Principal",
      notes: "",
    })
  }

  const openEditModal = (mesa: any) => {
    setFormData({
      number: mesa.number,
      capacity: mesa.capacity,
      location: mesa.location,
      notes: mesa.notes || "",
    })
    setEditingMesa(mesa)
  }

  // Estatísticas
  const stats = {
    total: mesas.length,
    free: mesas.filter((m) => m.status === "free").length,
    occupied: mesas.filter((m) => m.status === "occupied").length,
    reserved: mesas.filter((m) => m.status === "reserved").length,
    occupancyRate: Math.round((mesas.filter((m) => m.status === "occupied").length / mesas.length) * 100),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Mesas</h1>
          <p className="text-gray-600 dark:text-gray-400">Controle o status e ocupação das mesas em tempo real</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Livres</p>
                <p className="text-2xl font-bold text-green-600">{stats.free}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reservadas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupação</p>
                <p className="text-2xl font-bold text-purple-600">{stats.occupancyRate}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mesas.map((mesa, index) => (
          <motion.div
            key={mesa.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(mesa.status)}`}></div>
                    <CardTitle className="text-lg">Mesa {mesa.number}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingMesa(mesa)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(mesa)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleMesaStatus(mesa.id)}
                        className={mesa.status === "free" ? "text-red-600" : "text-green-600"}
                      >
                        {mesa.status === "free" ? (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Ocupar Mesa
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Liberar Mesa
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`/qr/${mesa.number}`, "_blank")}
                        className="text-blue-600"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Ver QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingMesa(mesa)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    {getStatusIcon(mesa.status)}
                    <span>{getStatusText(mesa.status)}</span>
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{mesa.capacity} lugares</span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>📍 {mesa.location}</p>
                </div>

                {mesa.currentSession && mesa.status === "occupied" && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Início:</span>
                      <span className="font-medium">{mesa.currentSession.startTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pessoas:</span>
                      <span className="font-medium">{mesa.currentSession.people}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pedidos:</span>
                      <span className="font-medium">{mesa.currentSession.orders}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total:</span>
                      <span className="text-red-600">R$ {mesa.currentSession.total?.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {mesa.currentSession && mesa.status === "reserved" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Reserva:</span>
                      <span className="font-medium">{mesa.currentSession.reservedFor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cliente:</span>
                      <span className="font-medium">{mesa.currentSession.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pessoas:</span>
                      <span className="font-medium">{mesa.currentSession.people}</span>
                    </div>
                  </div>
                )}

                {mesa.status === "free" && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Mesa disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Mesa Modal */}
      <Dialog
        open={showAddModal || !!editingMesa}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false)
            setEditingMesa(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMesa ? "Editar Mesa" : "Adicionar Nova Mesa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="number">Número da Mesa *</Label>
              <Input
                id="number"
                placeholder="Ex: 1, 2, A1..."
                value={formData.number}
                onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacidade *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div>
              <Label htmlFor="location">Localização *</Label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Salão Principal">Salão Principal</option>
                <option value="Área Externa">Área Externa</option>
                <option value="Mezanino">Mezanino</option>
                <option value="Varanda">Varanda</option>
                <option value="Área VIP">Área VIP</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a mesa..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMesa(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={editingMesa ? handleEditMesa : handleAddMesa}
                disabled={!formData.number.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {editingMesa ? "Salvar Alterações" : "Adicionar Mesa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deletingMesa && (
        <Dialog open={!!deletingMesa} onOpenChange={() => setDeletingMesa(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Confirmar Exclusão</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir a <strong>Mesa {deletingMesa.number}</strong>?
              </p>
              <p className="text-sm text-red-600">
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </p>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setDeletingMesa(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteMesa}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Mesa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Mesa Details Modal */}
      {viewingMesa && (
        <Dialog open={!!viewingMesa} onOpenChange={() => setViewingMesa(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(viewingMesa.status)}`}></div>
                <span>Mesa {viewingMesa.number}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Status</Label>
                  <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                    {getStatusIcon(viewingMesa.status)}
                    <span>{getStatusText(viewingMesa.status)}</span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Capacidade</Label>
                  <p className="font-medium">{viewingMesa.capacity} pessoas</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Localização</Label>
                <p className="font-medium">{viewingMesa.location}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">QR Code</Label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1">
                    {viewingMesa.qrCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/qr/${viewingMesa.number}`, "_blank")}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewingMesa.currentSession && (
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">Sessão Atual</Label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                    {viewingMesa.status === "occupied" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Início:</span>
                          <span className="font-medium">{viewingMesa.currentSession.startTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pessoas:</span>
                          <span className="font-medium">{viewingMesa.currentSession.people}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pedidos:</span>
                          <span className="font-medium">{viewingMesa.currentSession.orders}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">R$ {viewingMesa.currentSession.total?.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {viewingMesa.status === "reserved" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Reserva para:</span>
                          <span className="font-medium">{viewingMesa.currentSession.reservedFor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cliente:</span>
                          <span className="font-medium">{viewingMesa.currentSession.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pessoas:</span>
                          <span className="font-medium">{viewingMesa.currentSession.people}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setViewingMesa(null)} className="flex-1">
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setViewingMesa(null)
                    openEditModal(viewingMesa)
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
