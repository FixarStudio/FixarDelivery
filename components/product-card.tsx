"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Clock, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: any
  onAddToCart: (product: any, quantity?: number) => void
  isDelivery?: boolean
}

export function ProductCard({ product, onAddToCart, isDelivery = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div whileHover={{ y: -5 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        <div className="relative">
          <img
            src={product.image ? `https://ik.imagekit.io/fixarmenu/${product.image}` : "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />

          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {product.badges.map((badge: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-orange-500 text-white text-xs px-2 py-1">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Availability indicator */}
          {!product.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Indisponível
              </Badge>
            </div>
          )}

          {/* Extras indicator for delivery */}
          {isDelivery && product.extras && product.extras.length > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                + Extras
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
          </div>



                      {/* Preparation time */}
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{product.preparationTime || "15-20 min"}</span>
            </div>

          {/* Price and add button */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">R$ {product.price.toFixed(2)}</p>
              {isDelivery && product.extras && product.extras.length > 0 && (
                <p className="text-xs text-gray-500">+ extras disponíveis</p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onAddToCart(product)}
                disabled={!product.available}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDelivery && product.extras && product.extras.length > 0 ? (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Personalizar
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Adicionar
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
