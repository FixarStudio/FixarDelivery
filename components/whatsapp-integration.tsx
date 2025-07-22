"use client"

import { useState } from "react"
import { MessageCircle, Phone, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

const quickActions = [
  { id: "waiter", icon: User, label: "Chamar Garçom", message: "Olá! Poderiam nos atender na Mesa 12? Obrigado!" },
  {
    id: "bill",
    icon: Clock,
    label: "Pedir Conta",
    message: "Olá! Gostaríamos de pedir a conta da Mesa 12, por favor.",
  },
  { id: "info", icon: Phone, label: "Informações", message: "Olá! Gostaria de algumas informações sobre o cardápio." },
]

export function WhatsAppIntegration() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const sendWhatsAppMessage = (message: string) => {
    const phoneNumber = "5511999999999" // Número do restaurante
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    setIsExpanded(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 space-y-2"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => sendWhatsAppMessage(action.message)}
                    >
                      <action.icon className="h-4 w-4 mr-3 text-green-600" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.div>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
        </Button>
      </motion.div>
    </div>
  )
}
