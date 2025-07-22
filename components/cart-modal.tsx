"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, Trash2, ShoppingCart, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  category: string
  notes?: string
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemoveItem: (id: number) => void
  onClearCart: () => void
  tableNumber?: string
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  tableNumber,
}: CartModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceCharge = subtotal * 0.1 // 10% taxa de serviço
  const total = subtotal + serviceCharge

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(id)
    } else {
      onUpdateQuantity(id, newQuantity)
    }
  }

  const handleWhatsAppOrder = () => {
    setIsProcessing(true)

    // Simular processamento
    setTimeout(() => {
      const itemsList = items
        .map((item) => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
        .join("\n")

      const message = `🍽️ *NOVO PEDIDO*
${tableNumber ? `📍 Mesa: ${tableNumber}` : "🚚 Delivery"}

*ITENS:*
${itemsList}

*RESUMO:*
Subtotal: R$ ${subtotal.toFixed(2)}
Taxa de serviço: R$ ${serviceCharge.toFixed(2)}
*Total: R$ ${total.toFixed(2)}*

Obrigado pela preferência! 🙏`

      const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      setIsProcessing(false)
      onClearCart()
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-4 h-[90vh] flex flex-col p-0 gap-0">
        {/* Header Fixo */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Carrinho</span>
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? "item" : "itens"}
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {tableNumber && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Mesa {tableNumber}</p>}
        </DialogHeader>

        {/* Área de Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Carrinho vazio</h3>
              <p className="text-gray-600 dark:text-gray-400">Adicione alguns itens deliciosos ao seu pedido!</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                      <p className="text-sm font-bold text-orange-600">R$ {item.price.toFixed(2)}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{item.notes}"</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Fixo */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Taxa de serviço (10%)</span>
                  <span className="font-medium">R$ {serviceCharge.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleWhatsAppOrder}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Finalizar Pedido</span>
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClearCart}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
