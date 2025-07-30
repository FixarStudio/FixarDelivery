"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin } from "lucide-react"

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

interface ReservationCalendarProps {
  mesaId?: string // Se fornecido, mostra apenas reservas desta mesa
  onDateSelect?: (date: Date) => void
  onReservationSelect?: (reservation: Reservation) => void
}

export function ReservationCalendar({ mesaId, onDateSelect, onReservationSelect }: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  // Buscar reservas
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (mesaId) {
          params.append('mesaId', mesaId)
        }
        
        // Buscar reservas do mês atual
        const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM
        params.append('month', currentMonth)
        
        const response = await fetch(`/api/mesas/reservations?${params}`)
        if (response.ok) {
          const data = await response.json()
          // Converter o formato agrupado para array de reservas
          const reservationsArray: Reservation[] = []
          Object.entries(data.reservations || {}).forEach(([date, dayReservations]) => {
            dayReservations.forEach((reservation: any) => {
              reservationsArray.push({
                id: reservation.id,
                customerName: reservation.customerName,
                phone: reservation.phone,
                people: reservation.people,
                reservedFor: reservation.reservedFor,
                notes: reservation.notes,
                table: {
                  id: reservation.tableId,
                  number: reservation.table?.number || "N/A",
                  location: reservation.table?.location || "N/A",
                  capacity: reservation.table?.capacity || 0
                }
              })
            })
          })
          setReservations(reservationsArray)
        } else {
          console.error('Erro ao buscar reservas')
          setReservations([])
        }
      } catch (error) {
        console.error('Erro ao buscar reservas:', error)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [currentDate, mesaId])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Adicionar dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  const getReservationsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return reservations.filter((r) => {
      const rDate = r.reservedFor.split("T")[0]
      return rDate === dateString
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth("prev")}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentDate(new Date())}
                disabled={loading}
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth("next")}
                disabled={loading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              <span className="ml-3 text-muted-foreground">Carregando reservas...</span>
            </div>
          )}
          
          {!loading && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayReservations = getReservationsForDate(day.date)
                  const hasReservations = dayReservations.length > 0
                  const isPast = isPastDate(day.date)
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                        day.isCurrentMonth
                          ? isToday(day.date)
                            ? "bg-primary/10 border-primary"
                            : hasReservations
                              ? "bg-yellow-100 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                              : isPast
                                ? "bg-muted/50 border-border text-muted-foreground"
                                : "bg-card border-border hover:bg-accent cursor-pointer"
                          : "bg-muted/30 border-border text-muted-foreground"
                      }`}
                      onClick={() => {
                        if (day.isCurrentMonth && !isPast) {
                          setSelectedDate(day.date)
                          onDateSelect?.(day.date)
                        }
                      }}
                    >
                      <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                      <div className="space-y-1">
                        {dayReservations.slice(0, 3).map((reservation) => (
                          <div
                            key={reservation.id}
                            className="text-xs p-1 rounded truncate bg-yellow-200 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200 cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-700/40"
                            onClick={(e) => {
                              e.stopPropagation()
                              onReservationSelect?.(reservation)
                            }}
                            title={`${reservation.customerName} - ${reservation.table.number} - ${new Date(reservation.reservedFor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                          >
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="truncate">{reservation.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75">
                              <MapPin className="w-2 h-2" />
                              <span>Mesa {reservation.table.number}</span>
                            </div>
                          </div>
                        ))}
                        {dayReservations.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayReservations.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detalhes da data selecionada */}
      {selectedDate && (
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-primary">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <CardDescription>
              {getReservationsForDate(selectedDate).length} reserva(s) neste dia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto">
            {getReservationsForDate(selectedDate).map((reservation) => (
              <div 
                key={reservation.id} 
                className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                onClick={() => onReservationSelect?.(reservation)}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-200 dark:bg-yellow-800/30">
                  <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-200" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{reservation.customerName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Mesa {reservation.table.number} - {reservation.table.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{reservation.people} pessoas</span>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(reservation.reservedFor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {reservation.table.capacity} lugares
                </Badge>
              </div>
            ))}
            {getReservationsForDate(selectedDate).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma reserva para este dia
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-primary">Estatísticas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {reservations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de Reservas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(reservations.map(r => r.table.id)).size}
              </div>
              <div className="text-sm text-muted-foreground">
                Mesas Reservadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 