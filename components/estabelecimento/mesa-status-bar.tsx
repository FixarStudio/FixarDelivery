"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Clock, QrCode, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MesaStatusBarProps {
  currentTable: string | null
}

// Mock data para demonstração
const mesasStatus = {
  "1": { status: "occupied", people: 2, time: "45 min", orders: 3 },
  "2": { status: "free", people: 0, time: "0 min", orders: 0 },
  "3": { status: "occupied", people: 4, time: "20 min", orders: 1 },
  "4": { status: "reserved", people: 3, time: "15:30", orders: 0 },
  "5": { status: "free", people: 0, time: "0 min", orders: 0 },
  "12": { status: "occupied", people: 2, time: "30 min", orders: 2 },
}

export function MesaStatusBar({ currentTable }: MesaStatusBarProps) {
  const [currentMesaStatus, setCurrentMesaStatus] = useState<any>(null)

  useEffect(() => {
    if (currentTable && mesasStatus[currentTable as keyof typeof mesasStatus]) {
      setCurrentMesaStatus(mesasStatus[currentTable as keyof typeof mesasStatus])
    }
  }, [currentTable])

  if (!currentTable || !currentMesaStatus) {
    return null
  }

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
      default:
        return <QrCode className="h-4 w-4" />
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-4">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(currentMesaStatus.status)}`}></div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">Mesa {currentTable}</span>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getStatusIcon(currentMesaStatus.status)}
                  <span>{getStatusText(currentMesaStatus.status)}</span>
                </Badge>
              </div>

              {currentMesaStatus.status === "occupied" && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{currentMesaStatus.people} pessoas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentMesaStatus.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{currentMesaStatus.orders} pedidos</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const qrUrl = `/qr/${currentTable}`
                  window.open(qrUrl, "_blank")
                }}
                className="flex items-center space-x-1"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
