"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface ThemePreviewProps {
  customization: any
}

export function ThemePreview({ customization }: ThemePreviewProps) {
  // Calcular sombra baseada na intensidade
  const getShadowStyle = () => {
    if (customization.shadowIntensity === 0) return 'none'
    const intensity = customization.shadowIntensity / 10
    return `0 ${intensity * 4}px ${intensity * 6}px rgba(0, 0, 0, ${intensity * 0.1})`
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Preview em Tempo Real</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Banner do Restaurante */}
          <div 
            className="p-4 rounded-lg text-center font-bold text-lg flex items-center justify-center space-x-3"
            style={{ 
              backgroundColor: customization.accentColor,
              color: customization.primaryColor,
              borderRadius: `${customization.borderRadius}px`,
              boxShadow: getShadowStyle()
            }}
          >
            {customization.restaurantLogo && (
              <img 
                src={customization.restaurantLogo} 
                alt="Logo" 
                className="h-8 w-8 rounded object-cover"
              />
            )}
            <span>{customization.restaurantName}</span>
          </div>

          {/* Card de Produto Exemplo */}
          <Card 
            className="overflow-hidden"
            style={{ 
              borderRadius: `${customization.borderRadius}px`,
              fontFamily: customization.primaryFont,
              fontSize: `${customization.fontSize}px`,
              fontWeight: customization.fontWeight,
              boxShadow: getShadowStyle()
            }}
          >
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Imagem do Produto */}
                <div 
                  className="w-20 h-20 rounded-lg flex-shrink-0"
                  style={{ 
                    backgroundColor: customization.accentColor,
                    borderRadius: `${customization.borderRadius}px`
                  }}
                />
                
                {/* Detalhes do Produto */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Produto Exemplo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Descrição do produto
                  </p>
                  <p 
                    className="font-bold text-lg"
                    style={{ color: customization.primaryColor }}
                  >
                    R$ 25,90
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Ação */}
          <Button 
            className="w-full"
            style={{ 
              backgroundColor: customization.primaryColor,
              borderColor: customization.primaryColor,
              borderRadius: `${customization.borderRadius}px`,
              boxShadow: getShadowStyle()
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>

          {/* Informações de Fonte */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Fonte: {customization.primaryFont}</p>
            <p>Tamanho: {customization.fontSize}px</p>
            <p>Bordas: {customization.borderRadius}px</p>
            <p>Sombras: {customization.shadowIntensity}/10</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 