"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { QrCode, Smartphone, Wifi, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function QRCodePage() {
  const params = useParams()
  const [tableInfo, setTableInfo] = useState({
    number: params.table as string,
    area: "Salão Principal",
    capacity: 4,
    status: "available",
  })

  const qrCodeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/cardapio?mesa=${params.table}&area=salao-principal`

  const generateQRCode = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=20`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <QrCode className="h-8 w-8 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Mesa</h1>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Mesa {tableInfo.number}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-inner">
              <img
                src={generateQRCode(qrCodeUrl) || "/placeholder.svg"}
                alt={`QR Code Mesa ${tableInfo.number}`}
                className="w-full max-w-[250px] mx-auto"
              />
            </div>

            {/* Table Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{tableInfo.area}</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span>Capacidade:</span>
                  <Badge variant="outline">{tableInfo.capacity} pessoas</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Status:</span>
                  <Badge
                    variant={tableInfo.status === "available" ? "default" : "secondary"}
                    className={tableInfo.status === "available" ? "bg-green-500" : ""}
                  >
                    {tableInfo.status === "available" ? "Disponível" : "Ocupada"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center justify-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Como usar</span>
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                <li>1. Aponte a câmera do celular para o QR Code</li>
                <li>2. Toque na notificação que aparecer</li>
                <li>3. Navegue pelo cardápio digital</li>
                <li>4. Faça seu pedido direto pelo WhatsApp</li>
              </ol>
            </div>

            {/* Direct Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ou acesse diretamente:</p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => window.open(qrCodeUrl, "_blank")}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Abrir Cardápio Digital
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
