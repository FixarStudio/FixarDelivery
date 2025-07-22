"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Palette, Type, Layout, ImageIcon, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const colorThemes = [
  { name: "Laranja Clássico", primary: "#ea580c", secondary: "#fb923c", accent: "#fed7aa" },
  { name: "Vermelho Elegante", primary: "#dc2626", secondary: "#ef4444", accent: "#fecaca" },
  { name: "Verde Natural", primary: "#16a34a", secondary: "#22c55e", accent: "#bbf7d0" },
  { name: "Azul Profissional", primary: "#2563eb", secondary: "#3b82f6", accent: "#bfdbfe" },
  { name: "Roxo Premium", primary: "#9333ea", secondary: "#a855f7", accent: "#ddd6fe" },
  { name: "Rosa Moderno", primary: "#e11d48", secondary: "#f43f5e", accent: "#fecdd3" },
]

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
]

export function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0])
  const [borderRadius, setBorderRadius] = useState([12])
  const [cardStyle, setCardStyle] = useState("elevated")
  const [density, setDensity] = useState("comfortable")
  const [selectedFont, setSelectedFont] = useState(fontOptions[0])
  const [showAnimations, setShowAnimations] = useState(true)
  const [showShadows, setShowShadows] = useState(true)

  const applyTheme = () => {
    // Aqui seria aplicado o tema real
    console.log("Aplicando tema:", {
      theme: selectedTheme,
      borderRadius: borderRadius[0],
      cardStyle,
      density,
      font: selectedFont,
      animations: showAnimations,
      shadows: showShadows,
    })

    // Feedback visual
    alert("Tema aplicado com sucesso! 🎨")
  }

  const resetTheme = () => {
    setSelectedTheme(colorThemes[0])
    setBorderRadius([12])
    setCardStyle("elevated")
    setDensity("comfortable")
    setSelectedFont(fontOptions[0])
    setShowAnimations(true)
    setShowShadows(true)
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="h-4 w-4 mr-1" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="typography" className="text-xs">
            <Type className="h-4 w-4 mr-1" />
            Fonte
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="h-4 w-4 mr-1" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">
            <ImageIcon className="h-4 w-4 mr-1" />
            Efeitos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paletas de Cores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {colorThemes.map((theme, index) => (
                <motion.div
                  key={theme.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTheme.name === theme.name
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{theme.name}</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.primary }} />
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.secondary }} />
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.accent }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fonte Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fontOptions.map((font) => (
                <motion.div
                  key={font.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFont.name === font.name
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedFont(font)}
                >
                  <div style={{ fontFamily: font.value }}>
                    <div className="font-bold text-lg">{font.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configurações de Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Raio das Bordas</Label>
                <div className="mt-2">
                  <Slider
                    value={borderRadius}
                    onValueChange={setBorderRadius}
                    max={24}
                    min={0}
                    step={2}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px</span>
                    <span>{borderRadius[0]}px</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Estilo dos Cards</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["flat", "elevated", "outlined", "minimal"].map((style) => (
                    <Button
                      key={style}
                      variant={cardStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCardStyle(style)}
                      className="capitalize"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Densidade</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["compact", "comfortable", "spacious"].map((d) => (
                    <Button
                      key={d}
                      variant={density === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDensity(d)}
                      className="capitalize text-xs"
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Efeitos Visuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Animações</Label>
                  <p className="text-xs text-gray-500">Micro-interações e transições</p>
                </div>
                <Switch checked={showAnimations} onCheckedChange={setShowAnimations} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sombras</Label>
                  <p className="text-xs text-gray-500">Profundidade visual dos elementos</p>
                </div>
                <Switch checked={showShadows} onCheckedChange={setShowShadows} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-4 rounded-lg border-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            style={{
              borderRadius: `${borderRadius[0]}px`,
              fontFamily: selectedFont.value,
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
              style={{
                borderRadius: `${borderRadius[0] * 0.75}px`,
                backgroundColor: selectedTheme.accent + "20",
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTheme.primary }} />
                <span className="font-semibold text-sm">Produto Exemplo</span>
                <Badge style={{ backgroundColor: selectedTheme.secondary }}>Novo</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Descrição do produto com fonte {selectedFont.name}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: selectedTheme.primary }}>
                  R$ 25,90
                </span>
                <Button
                  size="sm"
                  style={{
                    backgroundColor: selectedTheme.primary,
                    borderRadius: `${borderRadius[0] * 0.5}px`,
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button onClick={applyTheme} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Aplicar Tema
        </Button>
        <Button variant="outline" onClick={resetTheme}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetar
        </Button>
      </div>
    </div>
  )
}
