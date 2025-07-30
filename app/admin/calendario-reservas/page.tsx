"use client"

import { useState } from "react"
import { ReservationCalendar } from "@/components/estabelecimento/reservation-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, Clock, Phone } from "lucide-react"

interface Reservation {
  id: string
  customerName: string
  phone: string
  people: number
  reservedFor: string
  notes?: string
  table: {
    id: string
    number: string
    location: string
    capacity: number
  }
}

export default function CalendarioReservasPage() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showAllReservations, setShowAllReservations] = useState(true)

  const handleDateSelect = (date: Date) => {
    console.log("Data selecionada:", date)
  }

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Calendário de Reservas
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as reservas de mesas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendário Principal */}
          <div className="lg:col-span-2">
            <ReservationCalendar
              onDateSelect={handleDateSelect}
              onReservationSelect={handleReservationSelect}
            />
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Filtros</CardTitle>
                <CardDescription>
                  Personalize a visualização das reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showAllReservations ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllReservations(true)}
                  >
                    Todas as Mesas
                  </Button>
                  <Button
                    variant={!showAllReservations ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllReservations(false)}
                  >
                    Mesa Específica
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Reserva Selecionada */}
            {selectedReservation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Detalhes da Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedReservation.customerName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReservation.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Mesa {selectedReservation.table.number} - {selectedReservation.table.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(selectedReservation.reservedFor).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(selectedReservation.reservedFor).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedReservation.people} pessoas</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedReservation.table.capacity} lugares
                      </Badge>
                    </div>
                    
                    {selectedReservation.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {selectedReservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" className="flex-1">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Nova Reserva
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Mesas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 