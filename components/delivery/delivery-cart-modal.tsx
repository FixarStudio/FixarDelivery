"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Truck, MapPin, Plus, Minus, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface DeliveryCartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: any[]
  setCart: (cart: any[]) => void
  deliveryAddress: any
  deliveryFee: number
  estimatedTime: string
}

export function DeliveryCartModal({
  isOpen,
  onClose,
  cart,
  setCart,
  deliveryAddress,
  deliveryFee,
  estimatedTime,
}: DeliveryCartModalProps) {
  const [observations, setObservations] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("5511999999999")

  // Carregar configurações do WhatsApp
  useEffect(() => {
    const loadWhatsAppConfig = async () => {
      try {
        const response = await fetch("/api/customization")
        if (response.ok) {
          const config = await response.json()
          if (config.whatsappNumber) {
            setWhatsappNumber(config.whatsappNumber)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do WhatsApp:", error)
      }
    }

    loadWhatsAppConfig()
  }, [])

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId))
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeItem = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.price + (item.selectedExtras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0)
    return total + itemPrice * item.quantity
  }, 0)

  const total = subtotal + deliveryFee

  const handleWhatsAppOrder = () => {
    const orderItems = cart
      .map((item) => {
        const extrasText = item.selectedExtras?.length
          ? ` (${item.selectedExtras.map((extra: any) => `+${extra.name}`).join(", ")})`
          : ""
        const itemPrice =
          item.price + (item.selectedExtras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0)
        return `${item.quantity}x ${item.name}${extrasText} - R$ ${(itemPrice * item.quantity).toFixed(2)}`
      })
      .join("\n")

    const message = `🛵 *PEDIDO DELIVERY*

📅 ${new Date().toLocaleDateString("pt-BR")} - ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}

📍 *ENDEREÇO DE ENTREGA:*
${deliveryAddress.street}, ${deliveryAddress.number}
${deliveryAddress.complement ? `${deliveryAddress.complement}\n` : ""}${deliveryAddress.neighborhood} - ${deliveryAddress.city}/${deliveryAddress.state}
CEP: ${deliveryAddress.zipCode}

🍽️ *PEDIDO:*
${orderItems}

💰 *VALORES:*
Subtotal: R$ ${subtotal.toFixed(2)}
Taxa de entrega: R$ ${deliveryFee.toFixed(2)}
*Total: R$ ${total.toFixed(2)}*

⏱️ Tempo estimado: ${estimatedTime}
💳 Pagamento: Na entrega

${observations ? `📝 Observações: ${observations}` : ""}

_Pedido realizado pelo cardápio digital_`

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seu Pedido</h2>
              <Badge variant="secondary">
                {cart.length} {cart.length === 1 ? "item" : "itens"}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
            {/* Delivery Address */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {deliveryAddress.street}, {deliveryAddress.number}
                    </p>
                    {deliveryAddress.complement && (
                      <p className="text-sm text-green-700 dark:text-green-300">{deliveryAddress.complement}</p>
                    )}
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {deliveryAddress.neighborhood} - {deliveryAddress.city}/{deliveryAddress.state}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">CEP: {deliveryAddress.zipCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const itemExtrasPrice =
                  item.selectedExtras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0
                const itemTotalPrice = (item.price + itemExtrasPrice) * item.quantity

                return (
                  <motion.div key={item.id} layout className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.image ? `https://ik.imagekit.io/fixarmenu/${item.image}` : `/placeholder.svg?height=60&width=60&query=${item.name}`}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=60&width=60&query=${item.name}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">R$ {item.price.toFixed(2)} base</p>
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Extras:</p>
                            {item.selectedExtras.map((extra: any, index: number) => (
                              <p key={index} className="text-xs text-green-600 dark:text-green-400">
                                + {extra.name} (R$ {extra.price.toFixed(2)})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-lg min-w-[2rem] text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-orange-600">R$ {itemTotalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations" className="text-sm font-medium">
                Observações para o pedido
              </Label>
              <Textarea
                id="observations"
                placeholder="Alguma observação especial para seu pedido..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 flex-shrink-0">
            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxa de entrega:</span>
                <span className="font-medium">R$ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                <span>Total:</span>
                <span className="text-orange-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>Delivery</span>
              </div>
            </div>

            {/* Order Button */}
            <Button
              onClick={handleWhatsAppOrder}
              disabled={cart.length === 0}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-lg shadow-lg rounded-xl mb-2"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Finalizar Pedido via WhatsApp
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
