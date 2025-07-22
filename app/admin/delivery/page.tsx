"use client"

import { useState } from "react"
import { Truck, MapPin, Clock, Settings, Plus, Trash2, Save, RotateCcw, MessageSquare, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function DeliveryConfig() {
  const [config, setConfig] = useState({
    // Configurações básicas
    restaurantName: "Restaurante Premium",
    whatsappNumber: "5511999999999",
    address: "Rua Principal, 123 - Centro, São Paulo - SP",
    workingHours: {
      start: "11:00",
      end: "23:00",
      days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
    },

    // Configurações de frete
    shippingType: "distance", // "fixed", "distance", "cep", "free"
    fixedShippingCost: 8.0,
    pricePerKm: 2.5,
    baseShippingCost: 5.0,
    freeShippingMinimum: 50.0,
    maxDeliveryDistance: 15,

    // Configurações de tempo
    baseDeliveryTime: 30,
    timePerKm: 5,
    preparationTime: 20,

    // Áreas de atendimento
    deliveryAreas: [
      { name: "Centro", cep: "01000-000", price: 8.0, active: true },
      { name: "Vila Madalena", cep: "05433-000", price: 12.0, active: true },
      { name: "Pinheiros", cep: "05422-000", price: 10.0, active: true },
    ],

    // Template de mensagem
    messageTemplate: `🛵 *PEDIDO DELIVERY*
📅 {data} - {hora}

👤 *CLIENTE:*
Nome: {nomeCliente}

📍 *ENDEREÇO:*
{enderecoCompleto}

🍽️ *PEDIDO:*
{itens}

💰 *VALORES:*
Subtotal: R$ {subtotal}
Frete: {frete}
*Total: R$ {total}*

⏱️ Entrega estimada: {tempoEntrega}
💳 Pagamento: A combinar`,

    // Configurações avançadas
    enableGPS: true,
    enableNotifications: true,
    autoAcceptOrders: false,
    requireCustomerPhone: true,
  })

  const [newArea, setNewArea] = useState({
    name: "",
    cep: "",
    price: 0,
  })

  const [showAddArea, setShowAddArea] = useState(false)

  const handleSaveConfig = () => {
    // Salvar configurações
    localStorage.setItem("delivery_config", JSON.stringify(config))
    alert("Configurações salvas com sucesso!")
  }

  const handleResetConfig = () => {
    if (confirm("Tem certeza que deseja resetar todas as configurações?")) {
      // Reset para valores padrão
      window.location.reload()
    }
  }

  const addDeliveryArea = () => {
    if (newArea.name && newArea.cep && newArea.price > 0) {
      setConfig((prev) => ({
        ...prev,
        deliveryAreas: [...prev.deliveryAreas, { ...newArea, active: true }],
      }))
      setNewArea({ name: "", cep: "", price: 0 })
      setShowAddArea(false)
    }
  }

  const removeDeliveryArea = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter((_, i) => i !== index),
    }))
  }

  const toggleAreaStatus = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.map((area, i) => (i === index ? { ...area, active: !area.active } : area)),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações do Delivery</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure as opções de entrega, frete e áreas de atendimento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetConfig} className="flex items-center space-x-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            <span>Resetar</span>
          </Button>
          <Button
            onClick={handleSaveConfig}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="shipping">Frete</TabsTrigger>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Configurações Básicas */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Informações do Restaurante</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
                  <Input
                    id="restaurant-name"
                    value={config.restaurantName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, restaurantName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp para Delivery</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input
                      id="whatsapp"
                      placeholder="5511999999999"
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço do Restaurante</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => setConfig((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Horário de Início</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={config.workingHours.start}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, start: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">Horário de Término</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={config.workingHours.end}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Frete */}
        <TabsContent value="shipping" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Modalidades de Frete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tipo de Cálculo de Frete</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    { value: "fixed", label: "Valor Fixo" },
                    { value: "distance", label: "Por Distância" },
                    { value: "cep", label: "Por CEP" },
                    { value: "free", label: "Frete Grátis" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={config.shippingType === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig((prev) => ({ ...prev, shippingType: option.value }))}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {config.shippingType === "fixed" && (
                <div>
                  <Label htmlFor="fixed-cost">Valor Fixo do Frete (R$)</Label>
                  <Input
                    id="fixed-cost"
                    type="number"
                    step="0.01"
                    value={config.fixedShippingCost}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, fixedShippingCost: Number.parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              )}

              {config.shippingType === "distance" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base-cost">Valor Base (R$)</Label>
                    <Input
                      id="base-cost"
                      type="number"
                      step="0.01"
                      value={config.baseShippingCost}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, baseShippingCost: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-per-km">Preço por KM (R$)</Label>
                    <Input
                      id="price-per-km"
                      type="number"
                      step="0.01"
                      value={config.pricePerKm}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, pricePerKm: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="free-minimum">Frete Grátis Acima de (R$)</Label>
                <Input
                  id="free-minimum"
                  type="number"
                  step="0.01"
                  value={config.freeShippingMinimum}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, freeShippingMinimum: Number.parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="max-distance">Distância Máxima de Entrega (KM)</Label>
                <Input
                  id="max-distance"
                  type="number"
                  value={config.maxDeliveryDistance}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, maxDeliveryDistance: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Configurações de Tempo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="base-time">Tempo Base (min)</Label>
                  <Input
                    id="base-time"
                    type="number"
                    value={config.baseDeliveryTime}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, baseDeliveryTime: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="time-per-km">Tempo por KM (min)</Label>
                  <Input
                    id="time-per-km"
                    type="number"
                    value={config.timePerKm}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, timePerKm: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prep-time">Tempo de Preparo (min)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    value={config.preparationTime}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, preparationTime: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Áreas de Entrega */}
        <TabsContent value="areas" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Áreas de Atendimento</span>
                </CardTitle>
                <Button
                  onClick={() => setShowAddArea(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Área
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.deliveryAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Switch checked={area.active} onCheckedChange={() => toggleAreaStatus(index)} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{area.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CEP: {area.cep}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={area.active ? "default" : "secondary"}>R$ {area.price.toFixed(2)}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeliveryArea(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {showAddArea && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Adicionar Nova Área</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="area-name">Nome da Área</Label>
                      <Input
                        id="area-name"
                        placeholder="Ex: Centro"
                        value={newArea.name}
                        onChange={(e) => setNewArea((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area-cep">CEP Base</Label>
                      <Input
                        id="area-cep"
                        placeholder="00000-000"
                        value={newArea.cep}
                        onChange={(e) => setNewArea((prev) => ({ ...prev, cep: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area-price">Preço (R$)</Label>
                      <Input
                        id="area-price"
                        type="number"
                        step="0.01"
                        value={newArea.price}
                        onChange={(e) =>
                          setNewArea((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddArea(false)
                        setNewArea({ name: "", cep: "", price: 0 })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={addDeliveryArea}
                      disabled={!newArea.name || !newArea.cep || newArea.price <= 0}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates de Mensagem */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Template de Mensagem WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message-template">Template da Mensagem</Label>
                <Textarea
                  id="message-template"
                  rows={15}
                  value={config.messageTemplate}
                  onChange={(e) => setConfig((prev) => ({ ...prev, messageTemplate: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Variáveis Disponíveis:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{data}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{hora}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{nomeCliente}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{enderecoCompleto}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{itens}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{subtotal}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{frete}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{total}"}</code>
                  <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{"{tempoEntrega}"}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações Avançadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Integração com GPS</Label>
                      <p className="text-xs text-gray-500">Calcular rotas em tempo real</p>
                    </div>
                    <Switch
                      checked={config.enableGPS}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableGPS: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-xs text-gray-500">Alertas de novos pedidos</p>
                    </div>
                    <Switch
                      checked={config.enableNotifications}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableNotifications: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Aceitar Pedidos Automaticamente</Label>
                      <p className="text-xs text-gray-500">Sem confirmação manual</p>
                    </div>
                    <Switch
                      checked={config.autoAcceptOrders}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoAcceptOrders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Telefone Obrigatório</Label>
                      <p className="text-xs text-gray-500">Exigir telefone do cliente</p>
                    </div>
                    <Switch
                      checked={config.requireCustomerPhone}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, requireCustomerPhone: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
