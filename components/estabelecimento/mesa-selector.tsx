"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Clock, CheckCircle, Calendar, MapPin, QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data das mesas (em produção viria de uma API)
const mesasDisponiveis = [
  {
    id: 1,
    number: "1",
    capacity: 4,
    status: "free",
    location: "Salão Principal",
    qrCode: "mesa-1-qr",
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
    },
  },
  {
    id: 3,
    number: "3",
    capacity: 6,
    status: "free",
    location: "Área Externa",
    qrCode: "mesa-3-qr",
  },
  {
    id: 4,
    number: "5",
    capacity: 4,
    status: "free",
    location: "Salão Principal",
    qrCode: "mesa-5-qr",
  },
  {
    id: 5,
    number: "8",
    capacity: 8,
    status: "reserved",
    location: "Área VIP",
    qrCode: "mesa-8-qr",
    currentSession: {
      reservedFor: "19:00",
      customerName: "Maria Silva",
    },
  },
  {
    id: 6,
    number: "12",
    capacity: 4,
    status: "occupied",
    location: "Salão Principal",
    qrCode: "mesa-12-qr",
    currentSession: {
      startTime: "13:15",
      people: 2,
    },
  },
]

interface MesaSelectorProps {
  onMesaSelect: (mesa: any) => void
  currentTable?: string | null
}

export function MesaSelector({ onMesaSelect, currentTable }: MesaSelectorProps) {
  const [mesas, setMesas] = useState(mesasDisponiveis)
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [selectedMesa, setSelectedMesa] = useState<any>(null)
  const [reserveForm, setReserveForm] = useState({
    customerName: "",
    phone: "",
    people: 2,
    time: "",
    date: "",
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
      default:
        return "bg-gray-500"
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
      default:
        return "Indisponível"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <CheckCircle className="h-4 w-4" />
      case "occupied":
        return <Users className="h-4 w-4" />
      case "reserved":
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleMesaClick = (mesa: any) => {
    if (mesa.status === "free") {
      onMesaSelect(mesa)
    }
  }

  const handleReserveClick = (mesa: any) => {
    setSelectedMesa(mesa)
    setReserveForm({
      customerName: "",
      phone: "",
      people: mesa.capacity,
      time: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setShowReserveModal(true)
  }

  const handleReserveSubmit = () => {
    if (!reserveForm.customerName || !reserveForm.phone || !reserveForm.time) {
      return
    }

    // Atualizar o status da mesa para reservada
    setMesas(
      mesas.map((mesa) =>
        mesa.id === selectedMesa.id
          ? {
              ...mesa,
              status: "reserved",
              currentSession: {
                reservedFor: reserveForm.time,
                customerName: reserveForm.customerName,
                phone: reserveForm.phone,
                people: reserveForm.people,
                date: reserveForm.date,
                notes: reserveForm.notes,
              },
            }
          : mesa,
      ),
    )

    setShowReserveModal(false)
    setSelectedMesa(null)

    // Aqui você enviaria os dados da reserva via WhatsApp ou API
    const reserveMessage = `🏪 *NOVA RESERVA*

📅 Data: ${new Date(reserveForm.date).toLocaleDateString("pt-BR")}
⏰ Horário: ${reserveForm.time}
🪑 Mesa: ${selectedMesa.number}
👤 Cliente: ${reserveForm.customerName}
📱 Telefone: ${reserveForm.phone}
👥 Pessoas: ${reserveForm.people}
📍 Local: ${selectedMesa.location}

${reserveForm.notes ? `📝 Observações: ${reserveForm.notes}` : ""}

*Reserva confirmada!*`

    console.log("Mensagem de reserva:", reserveMessage)
  }

  // Agrupar mesas por localização
  const mesasPorLocal = mesas.reduce((acc: any, mesa) => {
    if (!acc[mesa.location]) {
      acc[mesa.location] = []
    }
    acc[mesa.location].push(mesa)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Escolha sua Mesa</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione uma mesa disponível ou faça uma reserva para mais tarde
        </p>
      </div>

      {Object.entries(mesasPorLocal).map(([location, locationMesas]: [string, any]) => (
        <div key={location} className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{location}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationMesas.map((mesa: any, index: number) => (
              <motion.div
                key={mesa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    mesa.status === "free"
                      ? "hover:scale-105 bg-white/80 dark:bg-gray-800/80"
                      : "opacity-75 bg-gray-100/80 dark:bg-gray-700/80"
                  } ${
                    currentTable === mesa.number ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20" : ""
                  } backdrop-blur-sm border-0 shadow-lg`}
                  onClick={() => handleMesaClick(mesa)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(mesa.status)}`}></div>
                        <CardTitle className="text-lg">Mesa {mesa.number}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        {getStatusIcon(mesa.status)}
                        <span>{getStatusText(mesa.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Até {mesa.capacity} pessoas</span>
                      </div>
                      {mesa.status === "free" && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Disponível</span>
                        </div>
                      )}
                    </div>

                    {mesa.currentSession && mesa.status === "occupied" && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                        <div className="flex justify-between text-xs">
                          <span>Ocupada desde:</span>
                          <span className="font-medium">{mesa.currentSession.startTime}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Pessoas:</span>
                          <span className="font-medium">{mesa.currentSession.people}</span>
                        </div>
                      </div>
                    )}

                    {mesa.currentSession && mesa.status === "reserved" && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                        <div className="flex justify-between text-xs">
                          <span>Reservada para:</span>
                          <span className="font-medium">{mesa.currentSession.reservedFor}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Cliente:</span>
                          <span className="font-medium">{mesa.currentSession.customerName}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {mesa.status === "free" && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMesaClick(mesa)
                            }}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Ocupar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReserveClick(mesa)
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Reservar
                          </Button>
                        </>
                      )}

                      {mesa.status === "occupied" && (
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent" disabled>
                          <Clock className="h-4 w-4 mr-1" />
                          Ocupada
                        </Button>
                      )}

                      {mesa.status === "reserved" && (
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent" disabled>
                          <Calendar className="h-4 w-4 mr-1" />
                          Reservada
                        </Button>
                      )}
                    </div>

                    <div className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/qr/${mesa.number}`, "_blank")
                        }}
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        Ver QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Reserve Modal */}
      <Dialog open={showReserveModal} onOpenChange={setShowReserveModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Reservar Mesa {selectedMesa?.number}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Mesa:</span>
                <span className="font-medium">{selectedMesa?.number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Localização:</span>
                <span className="font-medium">{selectedMesa?.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Capacidade:</span>
                <span className="font-medium">Até {selectedMesa?.capacity} pessoas</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reserve-date">Data *</Label>
                <Input
                  id="reserve-date"
                  type="date"
                  value={reserveForm.date}
                  onChange={(e) => setReserveForm((prev) => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="reserve-time">Horário *</Label>
                <Input
                  id="reserve-time"
                  type="time"
                  value={reserveForm.time}
                  onChange={(e) => setReserveForm((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-name">Nome do Cliente *</Label>
              <Input
                id="customer-name"
                placeholder="Nome completo"
                value={reserveForm.customerName}
                onChange={(e) => setReserveForm((prev) => ({ ...prev, customerName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="customer-phone">Telefone *</Label>
              <Input
                id="customer-phone"
                placeholder="(11) 99999-9999"
                value={reserveForm.phone}
                onChange={(e) => setReserveForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="people-count">Número de Pessoas</Label>
              <Input
                id="people-count"
                type="number"
                min="1"
                max={selectedMesa?.capacity}
                value={reserveForm.people}
                onChange={(e) => setReserveForm((prev) => ({ ...prev, people: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div>
              <Label htmlFor="reserve-notes">Observações</Label>
              <Input
                id="reserve-notes"
                placeholder="Alguma observação especial..."
                value={reserveForm.notes}
                onChange={(e) => setReserveForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowReserveModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleReserveSubmit}
                disabled={!reserveForm.customerName || !reserveForm.phone || !reserveForm.time}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
