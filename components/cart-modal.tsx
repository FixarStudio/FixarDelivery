"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingCart, Trash2, User, Phone, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  observations?: string
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items?: CartItem[]
  onUpdateQuantity?: (id: number, quantity: number) => void
  onRemoveItem?: (id: number) => void
  onCheckout?: (orderData: any) => void
  currentTable?: string | null
  restaurantInfo?: any
}

export function CartModal({ isOpen, onClose, items = [], onUpdateQuantity, onRemoveItem, onCheckout, currentTable, restaurantInfo }: CartModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderData, setOrderData] = useState({
    customerName: "",
    customerPhone: "",
    observations: "",
    deliveryAddress: "",
    deliveryType: "local"
  })

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem?.(id)
    } else {
      onUpdateQuantity?.(id, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    setShowOrderForm(true)
  }

  const handleSubmitOrder = async () => {
    setIsLoading(true)
    try {
      const orderPayload = {
        tableId: currentTable,
        items: items,
        total: total,
        customerName: orderData.customerName || "Cliente",
        customerPhone: orderData.customerPhone || "",
        observations: orderData.observations || "",
        deliveryAddress: orderData.deliveryAddress || "",
        deliveryType: orderData.deliveryType
      }
      
      await onCheckout?.(orderPayload)
      setShowOrderForm(false)
      setOrderData({
        customerName: "",
        customerPhone: "",
        observations: "",
        deliveryAddress: "",
        deliveryType: "local"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-hidden"
          >
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Carrinho</span>
                  {itemCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {itemCount} {itemCount === 1 ? "item" : "itens"}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Seu carrinho está vazio</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Adicione alguns itens para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        {item.image && (
                          <img
                            src={item.image.startsWith('http') ? item.image : `https://ik.imagekit.io/fixarmenu/${item.image}`}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">R$ {item.price.toFixed(2)}</p>
                          {item.observations && (
                            <p className="text-xs text-gray-500 mt-1 truncate">{item.observations}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-8 text-center font-medium">{item.quantity}</span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => onRemoveItem?.(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>

              {items.length > 0 && !showOrderForm && (
                <div className="p-6 pt-4 border-t">
                  <div className="space-y-4">
                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Processando...</span>
                        </div>
                      ) : (
                        `Finalizar Pedido - R$ ${total.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Formulário de Pedido */}
              {showOrderForm && (
                <div className="p-6 pt-4 border-t">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informações do Pedido</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nome do Cliente
                        </label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={orderData.customerName}
                            onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Seu nome"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Telefone
                        </label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            value={orderData.customerPhone}
                            onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Observações
                        </label>
                        <div className="relative mt-1">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <textarea
                            value={orderData.observations}
                            onChange={(e) => setOrderData(prev => ({ ...prev, observations: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Observações especiais..."
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowOrderForm(false)}
                          className="flex-1"
                        >
                          Voltar
                        </Button>
                        <Button
                          onClick={handleSubmitOrder}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              <span>Enviando...</span>
                            </div>
                          ) : (
                            `Confirmar Pedido - R$ ${total.toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
