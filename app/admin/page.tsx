"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  Package,
  Palette,
  MessageSquare,
  Settings,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Type,
  Layout,
  Save,
  RotateCcw,
  Users,
  CheckCircle,
  AlertCircle,
  QrCode,
  MoreHorizontal,
  Truck,
  MapPin,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const statsData = [
  { title: "Pedidos Hoje", value: "47", change: "+12%", icon: Package, color: "text-blue-600" },
  { title: "Faturamento", value: "R$ 1.230", change: "+8%", icon: DollarSign, color: "text-green-600" },
  { title: "Tempo Médio", value: "18 min", change: "-5%", icon: Clock, color: "text-orange-600" },
  { title: "Visualizações", value: "156", change: "+23%", icon: Eye, color: "text-purple-600" },
]

const recentOrders = [
  { id: 1, table: "Mesa 5", items: "X-Burger, Coca-Cola", total: "R$ 35,40", time: "14:30", status: "preparing" },
  { id: 2, table: "Mesa 12", items: "Pizza Margherita", total: "R$ 45,90", time: "14:25", status: "ready" },
  { id: 3, table: "Mesa 8", items: "Salada Caesar, Suco", total: "R$ 28,50", time: "14:20", status: "delivered" },
]

const products = [
  { id: 1, name: "X-Burger Especial", category: "Burgers", price: "R$ 28,90", status: "active", orders: 24 },
  { id: 2, name: "Pizza Margherita", category: "Pizzas", price: "R$ 45,90", status: "active", orders: 18 },
  { id: 3, name: "Coca-Cola 350ml", category: "Bebidas", price: "R$ 6,50", status: "active", orders: 32 },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productsState, setProductsState] = useState<any[]>(products)
  const [deletingProduct, setDeletingProduct] = useState<any>(null)
  const [successModal, setSuccessModal] = useState<{
    show: boolean
    type: string
    message: string
    product: any | null
  }>({ show: false, type: "", message: "", product: null })

  // Estados para gerenciamento de mesas
  const [mesas, setMesas] = useState([
    {
      id: 1,
      number: "1",
      capacity: 4,
      status: "free",
      location: "Salão Principal",
      qrCode: "mesa-1-qr",
      currentSession: null,
      lastOrder: null,
    },
    {
      id: 2,
      number: "2",
      capacity: 2,
      status: "occupied",
      location: "Salão Principal",
      qrCode: "mesa-2-qr",
      currentSession: {
        startTime: "14:30",
        people: 2,
        orders: 1,
        total: 45.8,
      },
      lastOrder: "14:45",
    },
    {
      id: 3,
      number: "3",
      capacity: 6,
      status: "reserved",
      location: "Área Externa",
      qrCode: "mesa-3-qr",
      currentSession: {
        reservedFor: "15:30",
        customerName: "João Silva",
        people: 4,
      },
      lastOrder: null,
    },
    {
      id: 4,
      number: "12",
      capacity: 4,
      status: "occupied",
      location: "Salão Principal",
      qrCode: "mesa-12-qr",
      currentSession: {
        startTime: "13:15",
        people: 2,
        orders: 3,
        total: 89.5,
      },
      lastOrder: "14:20",
    },
  ])

  const [showAddMesaModal, setShowAddMesaModal] = useState(false)
  const [editingMesa, setEditingMesa] = useState<any>(null)
  const [deletingMesa, setDeletingMesa] = useState<any>(null)
  const [viewingMesa, setViewingMesa] = useState<any>(null)

  const [mesaFormData, setMesaFormData] = useState({
    number: "",
    capacity: 4,
    location: "Salão Principal",
    notes: "",
  })

  // Estados para configurações de delivery
  const [deliveryConfig, setDeliveryConfig] = useState({
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

  const [newDeliveryArea, setNewDeliveryArea] = useState({
    name: "",
    cep: "",
    price: 0,
  })

  const [showAddDeliveryArea, setShowAddDeliveryArea] = useState(false)

  const [customization, setCustomization] = useState({
    restaurantName: "Restaurante Premium",
    tagline: "",
    primaryColor: "#ea580c",
    secondaryColor: "#fb923c",
    accentColor: "#fed7aa",
    primaryFont: "Inter",
    secondaryFont: "Inter",
    fontSize: 16,
    fontWeight: "400",
    cardStyle: "elevated",
    borderRadius: 12,
    density: "comfortable",
    backgroundType: "gradient",
    shadowIntensity: 3,
    animations: "subtle",
    autoDarkMode: false,
    parallaxEffect: false,
    backdropBlur: true,
    particles: false,
    smoothTransitions: true,
    customCursor: false,
  })

  // Carregar customização salva ao inicializar
  useEffect(() => {
    const savedCustomization = localStorage.getItem("restaurant_customization")
    if (savedCustomization) {
      const parsed = JSON.parse(savedCustomization)
      setCustomization(parsed)
      applyThemeToDocument(parsed)
    }
  }, [])

  const applyThemeToDocument = (theme: typeof customization) => {
    const root = document.documentElement

    // Aplicar variáveis CSS customizadas
    root.style.setProperty("--primary-color", theme.primaryColor)
    root.style.setProperty("--secondary-color", theme.secondaryColor)
    root.style.setProperty("--accent-color", theme.accentColor)
    root.style.setProperty("--primary-font", theme.primaryFont)
    root.style.setProperty("--secondary-font", theme.secondaryFont)
    root.style.setProperty("--border-radius", `${theme.borderRadius}px`)
    root.style.setProperty("--font-size", `${theme.fontSize}px`)
    root.style.setProperty("--font-weight", theme.fontWeight)
    root.style.setProperty("--shadow-intensity", theme.shadowIntensity.toString())

    // Aplicar classes CSS dinâmicas
    const body = document.body

    // Remover classes anteriores
    body.classList.remove(
      "theme-gradient",
      "theme-solid",
      "theme-pattern",
      "theme-image",
      "density-compact",
      "density-comfortable",
      "density-spacious",
      "card-flat",
      "card-elevated",
      "card-outlined",
      "card-glass",
      "animations-none",
      "animations-subtle",
      "animations-dynamic",
    )

    // Adicionar novas classes
    body.classList.add(`theme-${theme.backgroundType}`)
    body.classList.add(`density-${theme.density}`)
    body.classList.add(`card-${theme.cardStyle}`)
    body.classList.add(`animations-${theme.animations}`)

    // Aplicar fonte principal
    body.style.fontFamily = theme.primaryFont
    body.style.fontSize = `${theme.fontSize}px`
    body.style.fontWeight = theme.fontWeight

    // Aplicar backdrop blur se ativado
    if (theme.backdropBlur) {
      body.classList.add("backdrop-blur-enabled")
    } else {
      body.classList.remove("backdrop-blur-enabled")
    }

    // Aplicar efeitos especiais
    if (theme.parallaxEffect) {
      body.classList.add("parallax-enabled")
    } else {
      body.classList.remove("parallax-enabled")
    }

    if (theme.particles) {
      body.classList.add("particles-enabled")
    } else {
      body.classList.remove("particles-enabled")
    }

    if (theme.smoothTransitions) {
      body.classList.add("smooth-transitions")
    } else {
      body.classList.remove("smooth-transitions")
    }

    if (theme.customCursor) {
      body.classList.add("custom-cursor")
    } else {
      body.classList.remove("custom-cursor")
    }
  }

  const applyCustomization = () => {
    // Aplicar tema ao documento
    applyThemeToDocument(customization)

    // Salvar no localStorage
    localStorage.setItem("restaurant_customization", JSON.stringify(customization))

    setSuccessModal({
      show: true,
      type: "customization",
      message: "Personalização aplicada com sucesso!",
      product: null,
    })
  }

  const resetCustomization = () => {
    const defaultTheme = {
      restaurantName: "Restaurante Premium",
      tagline: "",
      primaryColor: "#ea580c",
      secondaryColor: "#fb923c",
      accentColor: "#fed7aa",
      primaryFont: "Inter",
      secondaryFont: "Inter",
      fontSize: 16,
      fontWeight: "400",
      cardStyle: "elevated",
      borderRadius: 12,
      density: "comfortable",
      backgroundType: "gradient",
      shadowIntensity: 3,
      animations: "subtle",
      autoDarkMode: false,
      parallaxEffect: false,
      backdropBlur: true,
      particles: false,
      smoothTransitions: true,
      customCursor: false,
    }

    setCustomization(defaultTheme)
    applyThemeToDocument(defaultTheme)
    localStorage.removeItem("restaurant_customization")
  }

  const exportTheme = () => {
    const themeData = {
      name: `${customization.restaurantName} Theme`,
      version: "1.0.0",
      created: new Date().toISOString(),
      customization: customization,
    }

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${customization.restaurantName.toLowerCase().replace(/\s+/g, "-")}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = () => {
      // Removido AdminGuard temporariamente
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    router.push("/admin/login")
  }

  const handleAddProduct = (formData: any) => {
    const newProduct = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      price: `R$ ${Number.parseFloat(formData.price).toFixed(2)}`,
      status: "active",
      orders: 0,
    }
    setProductsState((prev) => [...prev, newProduct])
    setShowAddModal(false)
    setSuccessModal({
      show: true,
      type: "add",
      message: "Produto adicionado com sucesso!",
      product: newProduct,
    })
  }

  const handleEditProduct = (formData: any) => {
    setProductsState((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price: `R$ ${Number.parseFloat(formData.price).toFixed(2)}`,
            }
          : p,
      ),
    )
    setEditingProduct(null)
    setSuccessModal({
      show: true,
      type: "edit",
      message: "Produto editado com sucesso!",
      product: editingProduct,
    })
  }

  // Funções para gerenciamento de mesas
  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
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
      case "maintenance":
        return "Manutenção"
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
      case "maintenance":
        return <Settings className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleAddMesa = () => {
    const newMesa = {
      id: Date.now(),
      number: mesaFormData.number,
      capacity: mesaFormData.capacity,
      status: "free",
      location: mesaFormData.location,
      qrCode: `mesa-${mesaFormData.number}-qr`,
      currentSession: null,
      lastOrder: null,
    }

    setMesas([...mesas, newMesa])
    setShowAddMesaModal(false)
    resetMesaForm()
  }

  const handleEditMesa = () => {
    setMesas(mesas.map((mesa) => (mesa.id === editingMesa.id ? { ...mesa, ...mesaFormData } : mesa)))
    setEditingMesa(null)
    resetMesaForm()
  }

  const handleDeleteMesa = () => {
    setMesas(mesas.filter((mesa) => mesa.id !== deletingMesa.id))
    setDeletingMesa(null)
  }

  const toggleMesaStatus = (mesaId: number) => {
    setMesas(
      mesas.map((mesa) => {
        if (mesa.id === mesaId) {
          const newStatus = mesa.status === "free" ? "occupied" : "free"
          return {
            ...mesa,
            status: newStatus,
            currentSession:
              newStatus === "occupied"
                ? {
                    startTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    people: mesa.capacity,
                    orders: 0,
                    total: 0,
                  }
                : null,
          }
        }
        return mesa
      }),
    )
  }

  const resetMesaForm = () => {
    setMesaFormData({
      number: "",
      capacity: 4,
      location: "Salão Principal",
      notes: "",
    })
  }

  const openEditMesaModal = (mesa: any) => {
    setMesaFormData({
      number: mesa.number,
      capacity: mesa.capacity,
      location: mesa.location,
      notes: mesa.notes || "",
    })
    setEditingMesa(mesa)
  }

  // Estatísticas das mesas
  const mesasStats = {
    total: mesas.length,
    free: mesas.filter((m) => m.status === "free").length,
    occupied: mesas.filter((m) => m.status === "occupied").length,
    reserved: mesas.filter((m) => m.status === "reserved").length,
    occupancyRate: Math.round((mesas.filter((m) => m.status === "occupied").length / mesas.length) * 100),
  }

  // Funções para gerenciamento de delivery
  const handleSaveDeliveryConfig = () => {
    localStorage.setItem("delivery_config", JSON.stringify(deliveryConfig))
    setSuccessModal({
      show: true,
      type: "delivery",
      message: "Configurações de delivery salvas com sucesso!",
      product: null,
    })
  }

  const handleResetDeliveryConfig = () => {
    if (confirm("Tem certeza que deseja resetar todas as configurações de delivery?")) {
      setDeliveryConfig({
        restaurantName: "Restaurante Premium",
        whatsappNumber: "5511999999999",
        address: "Rua Principal, 123 - Centro, São Paulo - SP",
        workingHours: {
          start: "11:00",
          end: "23:00",
          days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
        },
        shippingType: "distance",
        fixedShippingCost: 8.0,
        pricePerKm: 2.5,
        baseShippingCost: 5.0,
        freeShippingMinimum: 50.0,
        maxDeliveryDistance: 15,
        baseDeliveryTime: 30,
        timePerKm: 5,
        preparationTime: 20,
        deliveryAreas: [
          { name: "Centro", cep: "01000-000", price: 8.0, active: true },
          { name: "Vila Madalena", cep: "05433-000", price: 12.0, active: true },
          { name: "Pinheiros", cep: "05422-000", price: 10.0, active: true },
        ],
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
        enableGPS: true,
        enableNotifications: true,
        autoAcceptOrders: false,
        requireCustomerPhone: true,
      })
    }
  }

  const addDeliveryArea = () => {
    if (newDeliveryArea.name && newDeliveryArea.cep && newDeliveryArea.price > 0) {
      setDeliveryConfig((prev) => ({
        ...prev,
        deliveryAreas: [...prev.deliveryAreas, { ...newDeliveryArea, active: true }],
      }))
      setNewDeliveryArea({ name: "", cep: "", price: 0 })
      setShowAddDeliveryArea(false)
    }
  }

  const removeDeliveryArea = (index: number) => {
    setDeliveryConfig((prev) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter((_, i) => i !== index),
    }))
  }

  const toggleDeliveryAreaStatus = (index: number) => {
    setDeliveryConfig((prev) => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.map((area, i) => (i === index ? { ...area, active: !area.active } : area)),
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Painel Administrativo</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seu cardápio digital e acompanhe as vendas em tempo real
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="mesas" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Delivery</span>
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                          <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                            {stat.change} vs ontem
                          </p>
                        </div>
                        <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Pedidos Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${getStatusColor(order.status)}`}></div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{order.table}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.items}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{order.total}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.time}</p>
                          <Badge variant="secondary" className="text-xs">
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Produtos</h2>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {productsState.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={`/placeholder.svg?height=60&width=60&query=${product.name}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.category} • {product.orders} pedidos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{product.price}</p>
                          <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-xs">
                            {product.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mesas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento de Mesas</h2>
                <p className="text-gray-600 dark:text-gray-400">Controle o status e ocupação das mesas em tempo real</p>
              </div>
              <Button
                onClick={() => setShowAddMesaModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Mesa
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{mesasStats.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Livres</p>
                      <p className="text-2xl font-bold text-green-600">{mesasStats.free}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupadas</p>
                      <p className="text-2xl font-bold text-red-600">{mesasStats.occupied}</p>
                    </div>
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reservadas</p>
                      <p className="text-2xl font-bold text-yellow-600">{mesasStats.reserved}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupação</p>
                      <p className="text-2xl font-bold text-purple-600">{mesasStats.occupancyRate}%</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mesas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mesas.map((mesa, index) => (
                <motion.div
                  key={mesa.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(mesa.status)}`}></div>
                          <CardTitle className="text-lg">Mesa {mesa.number}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingMesa(mesa)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditMesaModal(mesa)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleMesaStatus(mesa.id)}
                              className={mesa.status === "free" ? "text-red-600" : "text-green-600"}
                            >
                              {mesa.status === "free" ? (
                                <>
                                  <Users className="h-4 w-4 mr-2" />
                                  Ocupar Mesa
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Liberar Mesa
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(`/qr/${mesa.number}`, "_blank")}
                              className="text-blue-600"
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingMesa(mesa)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          {getStatusIcon(mesa.status)}
                          <span>{getStatusText(mesa.status)}</span>
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{mesa.capacity} lugares</span>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>📍 {mesa.location}</p>
                      </div>

                      {mesa.currentSession && mesa.status === "occupied" && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Início:</span>
                            <span className="font-medium">{mesa.currentSession.startTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pessoas:</span>
                            <span className="font-medium">{mesa.currentSession.people}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pedidos:</span>
                            <span className="font-medium">{mesa.currentSession.orders}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                            <span>Total:</span>
                            <span className="text-red-600">R$ {mesa.currentSession.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {mesa.currentSession && mesa.status === "reserved" && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Reserva:</span>
                            <span className="font-medium">{mesa.currentSession.reservedFor}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cliente:</span>
                            <span className="font-medium">{mesa.currentSession.customerName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pessoas:</span>
                            <span className="font-medium">{mesa.currentSession.people}</span>
                          </div>
                        </div>
                      )}

                      {mesa.status === "free" && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                          <p className="text-sm text-green-700 dark:text-green-300 font-medium">Mesa disponível</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Delivery</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure as opções de entrega, frete e áreas de atendimento
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleResetDeliveryConfig}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Resetar</span>
                </Button>
                <Button
                  onClick={handleSaveDeliveryConfig}
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
                        <Label htmlFor="delivery-restaurant-name">Nome do Restaurante</Label>
                        <Input
                          id="delivery-restaurant-name"
                          value={deliveryConfig.restaurantName}
                          onChange={(e) => setDeliveryConfig((prev) => ({ ...prev, restaurantName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-whatsapp">WhatsApp para Delivery</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                            <Phone className="h-4 w-4" />
                          </span>
                          <Input
                            id="delivery-whatsapp"
                            placeholder="5511999999999"
                            value={deliveryConfig.whatsappNumber}
                            onChange={(e) => setDeliveryConfig((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="delivery-address">Endereço do Restaurante</Label>
                      <Input
                        id="delivery-address"
                        value={deliveryConfig.address}
                        onChange={(e) => setDeliveryConfig((prev) => ({ ...prev, address: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delivery-start-time">Horário de Início</Label>
                        <Input
                          id="delivery-start-time"
                          type="time"
                          value={deliveryConfig.workingHours.start}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({
                              ...prev,
                              workingHours: { ...prev.workingHours, start: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-end-time">Horário de Término</Label>
                        <Input
                          id="delivery-end-time"
                          type="time"
                          value={deliveryConfig.workingHours.end}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({
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
                            variant={deliveryConfig.shippingType === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDeliveryConfig((prev) => ({ ...prev, shippingType: option.value }))}
                            className="text-xs"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {deliveryConfig.shippingType === "fixed" && (
                      <div>
                        <Label htmlFor="delivery-fixed-cost">Valor Fixo do Frete (R$)</Label>
                        <Input
                          id="delivery-fixed-cost"
                          type="number"
                          step="0.01"
                          value={deliveryConfig.fixedShippingCost}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({
                              ...prev,
                              fixedShippingCost: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    )}

                    {deliveryConfig.shippingType === "distance" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="delivery-base-cost">Valor Base (R$)</Label>
                          <Input
                            id="delivery-base-cost"
                            type="number"
                            step="0.01"
                            value={deliveryConfig.baseShippingCost}
                            onChange={(e) =>
                              setDeliveryConfig((prev) => ({
                                ...prev,
                                baseShippingCost: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery-price-per-km">Preço por KM (R$)</Label>
                          <Input
                            id="delivery-price-per-km"
                            type="number"
                            step="0.01"
                            value={deliveryConfig.pricePerKm}
                            onChange={(e) =>
                              setDeliveryConfig((prev) => ({
                                ...prev,
                                pricePerKm: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="delivery-free-minimum">Frete Grátis Acima de (R$)</Label>
                      <Input
                        id="delivery-free-minimum"
                        type="number"
                        step="0.01"
                        value={deliveryConfig.freeShippingMinimum}
                        onChange={(e) =>
                          setDeliveryConfig((prev) => ({
                            ...prev,
                            freeShippingMinimum: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="delivery-max-distance">Distância Máxima de Entrega (KM)</Label>
                      <Input
                        id="delivery-max-distance"
                        type="number"
                        value={deliveryConfig.maxDeliveryDistance}
                        onChange={(e) =>
                          setDeliveryConfig((prev) => ({
                            ...prev,
                            maxDeliveryDistance: Number.parseInt(e.target.value) || 0,
                          }))
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
                        <Label htmlFor="delivery-base-time">Tempo Base (min)</Label>
                        <Input
                          id="delivery-base-time"
                          type="number"
                          value={deliveryConfig.baseDeliveryTime}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({
                              ...prev,
                              baseDeliveryTime: Number.parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-time-per-km">Tempo por KM (min)</Label>
                        <Input
                          id="delivery-time-per-km"
                          type="number"
                          value={deliveryConfig.timePerKm}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({ ...prev, timePerKm: Number.parseInt(e.target.value) || 0 }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-prep-time">Tempo de Preparo (min)</Label>
                        <Input
                          id="delivery-prep-time"
                          type="number"
                          value={deliveryConfig.preparationTime}
                          onChange={(e) =>
                            setDeliveryConfig((prev) => ({
                              ...prev,
                              preparationTime: Number.parseInt(e.target.value) || 0,
                            }))
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
                        onClick={() => setShowAddDeliveryArea(true)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Área
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deliveryConfig.deliveryAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Switch checked={area.active} onCheckedChange={() => toggleDeliveryAreaStatus(index)} />
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

                    {showAddDeliveryArea && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Adicionar Nova Área</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="delivery-area-name">Nome da Área</Label>
                            <Input
                              id="delivery-area-name"
                              placeholder="Ex: Centro"
                              value={newDeliveryArea.name}
                              onChange={(e) => setNewDeliveryArea((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="delivery-area-cep">CEP Base</Label>
                            <Input
                              id="delivery-area-cep"
                              placeholder="00000-000"
                              value={newDeliveryArea.cep}
                              onChange={(e) => setNewDeliveryArea((prev) => ({ ...prev, cep: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="delivery-area-price">Preço (R$)</Label>
                            <Input
                              id="delivery-area-price"
                              type="number"
                              step="0.01"
                              value={newDeliveryArea.price}
                              onChange={(e) =>
                                setNewDeliveryArea((prev) => ({
                                  ...prev,
                                  price: Number.parseFloat(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddDeliveryArea(false)
                              setNewDeliveryArea({ name: "", cep: "", price: 0 })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={addDeliveryArea}
                            disabled={!newDeliveryArea.name || !newDeliveryArea.cep || newDeliveryArea.price <= 0}
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
                      <Label htmlFor="delivery-message-template">Template da Mensagem</Label>
                      <Textarea
                        id="delivery-message-template"
                        rows={15}
                        value={deliveryConfig.messageTemplate}
                        onChange={(e) => setDeliveryConfig((prev) => ({ ...prev, messageTemplate: e.target.value }))}
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
                            checked={deliveryConfig.enableGPS}
                            onCheckedChange={(checked) =>
                              setDeliveryConfig((prev) => ({ ...prev, enableGPS: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notificações Push</Label>
                            <p className="text-xs text-gray-500">Alertas de novos pedidos</p>
                          </div>
                          <Switch
                            checked={deliveryConfig.enableNotifications}
                            onCheckedChange={(checked) =>
                              setDeliveryConfig((prev) => ({ ...prev, enableNotifications: checked }))
                            }
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
                            checked={deliveryConfig.autoAcceptOrders}
                            onCheckedChange={(checked) =>
                              setDeliveryConfig((prev) => ({ ...prev, autoAcceptOrders: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Telefone Obrigatório</Label>
                            <p className="text-xs text-gray-500">Exigir telefone do cliente</p>
                          </div>
                          <Switch
                            checked={deliveryConfig.requireCustomerPhone}
                            onCheckedChange={(checked) =>
                              setDeliveryConfig((prev) => ({ ...prev, requireCustomerPhone: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Brand Identity */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Identidade Visual</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
                          <Input
                            id="restaurant-name"
                            placeholder="Restaurante Premium"
                            value={customization.restaurantName}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, restaurantName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="logo-upload">Logo do Restaurante</Label>
                          <Input id="logo-upload" type="file" accept="image/*" />
                        </div>
                        <div>
                          <Label htmlFor="tagline">Slogan/Tagline</Label>
                          <Input
                            id="tagline"
                            placeholder="A melhor experiência gastronômica"
                            value={customization.tagline}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, tagline: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="primary-color">Cor Primária</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="primary-color"
                              type="color"
                              value={customization.primaryColor}
                              className="w-16 h-10 p-1 rounded-lg"
                              onChange={(e) => setCustomization((prev) => ({ ...prev, primaryColor: e.target.value }))}
                            />
                            <Input
                              placeholder="#ea580c"
                              value={customization.primaryColor}
                              className="flex-1"
                              onChange={(e) => setCustomization((prev) => ({ ...prev, primaryColor: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary-color">Cor Secundária</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="secondary-color"
                              type="color"
                              value={customization.secondaryColor}
                              className="w-16 h-10 p-1 rounded-lg"
                              onChange={(e) =>
                                setCustomization((prev) => ({ ...prev, secondaryColor: e.target.value }))
                              }
                            />
                            <Input
                              placeholder="#fb923c"
                              value={customization.secondaryColor}
                              className="flex-1"
                              onChange={(e) =>
                                setCustomization((prev) => ({ ...prev, secondaryColor: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="accent-color">Cor de Destaque</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="accent-color"
                              type="color"
                              value={customization.accentColor}
                              className="w-16 h-10 p-1 rounded-lg"
                              onChange={(e) => setCustomization((prev) => ({ ...prev, accentColor: e.target.value }))}
                            />
                            <Input
                              placeholder="#fed7aa"
                              value={customization.accentColor}
                              className="flex-1"
                              onChange={(e) => setCustomization((prev) => ({ ...prev, accentColor: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Type className="h-5 w-5" />
                      <span>Tipografia</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Fonte Principal</Label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            value={customization.primaryFont}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, primaryFont: e.target.value }))}
                          >
                            <option value="Inter">Inter (Moderna)</option>
                            <option value="Poppins">Poppins (Amigável)</option>
                            <option value="Roboto">Roboto (Clássica)</option>
                            <option value="Montserrat">Montserrat (Elegante)</option>
                            <option value="Open Sans">Open Sans (Legível)</option>
                            <option value="Playfair Display">Playfair Display (Sofisticada)</option>
                            <option value="Lora">Lora (Tradicional)</option>
                          </select>
                        </div>
                        <div>
                          <Label>Fonte Secundária</Label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            value={customization.secondaryFont}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, secondaryFont: e.target.value }))}
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Source Sans Pro">Source Sans Pro</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Tamanho Base da Fonte</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[customization.fontSize]}
                              onValueChange={(value) => setCustomization((prev) => ({ ...prev, fontSize: value[0] }))}
                              max={20}
                              min={12}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-12">{customization.fontSize}px</span>
                          </div>
                        </div>
                        <div>
                          <Label>Peso da Fonte</Label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            value={customization.fontWeight}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, fontWeight: e.target.value }))}
                          >
                            <option value="300">Light (300)</option>
                            <option value="400">Regular (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semi Bold (600)</option>
                            <option value="700">Bold (700)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Layout & Design */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Layout className="h-5 w-5" />
                      <span>Layout & Design</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Estilo dos Cards</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["flat", "elevated", "outlined", "glass"].map((style) => (
                              <Button
                                key={style}
                                variant={customization.cardStyle === style ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCustomization((prev) => ({ ...prev, cardStyle: style }))}
                                className="capitalize"
                              >
                                {style === "glass" ? "Vidro" : style}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Raio das Bordas</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[customization.borderRadius]}
                              onValueChange={(value) =>
                                setCustomization((prev) => ({ ...prev, borderRadius: value[0] }))
                              }
                              max={24}
                              min={0}
                              step={2}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-12">{customization.borderRadius}px</span>
                          </div>
                        </div>
                        <div>
                          <Label>Densidade do Layout</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["compact", "comfortable", "spacious"].map((density) => (
                              <Button
                                key={density}
                                variant={customization.density === density ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCustomization((prev) => ({ ...prev, density: density }))}
                                className="capitalize text-xs"
                              >
                                {density === "compact"
                                  ? "Compacto"
                                  : density === "comfortable"
                                    ? "Confortável"
                                    : "Espaçoso"}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Tema de Fundo</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["gradient", "solid", "pattern", "image"].map((bg) => (
                              <Button
                                key={bg}
                                variant={customization.backgroundType === bg ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCustomization((prev) => ({ ...prev, backgroundType: bg }))}
                                className="capitalize text-xs"
                              >
                                {bg === "gradient"
                                  ? "Gradiente"
                                  : bg === "solid"
                                    ? "Sólido"
                                    : bg === "pattern"
                                      ? "Padrão"
                                      : "Imagem"}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Intensidade das Sombras</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              value={[customization.shadowIntensity]}
                              onValueChange={(value) =>
                                setCustomization((prev) => ({ ...prev, shadowIntensity: value[0] }))
                              }
                              max={10}
                              min={0}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">{customization.shadowIntensity}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Animações</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["none", "subtle", "dynamic"].map((anim) => (
                              <Button
                                key={anim}
                                variant={customization.animations === anim ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCustomization((prev) => ({ ...prev, animations: anim }))}
                                className="capitalize text-xs"
                              >
                                {anim === "none" ? "Nenhuma" : anim === "subtle" ? "Sutil" : "Dinâmica"}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Features */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Recursos Avançados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Modo Escuro Automático</Label>
                            <p className="text-xs text-gray-500">Seguir preferência do sistema</p>
                          </div>
                          <Switch
                            checked={customization.autoDarkMode}
                            onCheckedChange={(checked) =>
                              setCustomization((prev) => ({ ...prev, autoDarkMode: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Efeito Parallax</Label>
                            <p className="text-xs text-gray-500">Movimento suave no scroll</p>
                          </div>
                          <Switch
                            checked={customization.parallaxEffect}
                            onCheckedChange={(checked) =>
                              setCustomization((prev) => ({ ...prev, parallaxEffect: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Blur de Fundo</Label>
                            <p className="text-xs text-gray-500">Efeito vidro fosco</p>
                          </div>
                          <Switch
                            checked={customization.backdropBlur}
                            onCheckedChange={(checked) =>
                              setCustomization((prev) => ({ ...prev, backdropBlur: checked }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Partículas Animadas</Label>
                            <p className="text-xs text-gray-500">Efeitos visuais de fundo</p>
                          </div>
                          <Switch
                            checked={customization.particles}
                            onCheckedChange={(checked) => setCustomization((prev) => ({ ...prev, particles: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Transições Suaves</Label>
                            <p className="text-xs text-gray-500">Animações entre páginas</p>
                          </div>
                          <Switch
                            checked={customization.smoothTransitions}
                            onCheckedChange={(checked) =>
                              setCustomization((prev) => ({ ...prev, smoothTransitions: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Cursor Personalizado</Label>
                            <p className="text-xs text-gray-500">Cursor temático</p>
                          </div>
                          <Switch
                            checked={customization.customCursor}
                            onCheckedChange={(checked) =>
                              setCustomization((prev) => ({ ...prev, customCursor: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Live Preview + Ações rápidas */}
              <div className="space-y-6">
                {/* Preview em Tempo Real */}
                <div>
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span>Preview em Tempo Real</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="p-4 rounded-lg border-2 min-h-[400px] transition-all duration-300"
                        style={{
                          borderRadius: `${customization.borderRadius}px`,
                          fontFamily: customization.primaryFont,
                          fontSize: `${customization.fontSize}px`,
                          fontWeight: customization.fontWeight,
                          background:
                            customization.backgroundType === "gradient"
                              ? `linear-gradient(135deg, ${customization.primaryColor}20, ${customization.secondaryColor}20)`
                              : customization.backgroundType === "solid"
                                ? `${customization.accentColor}40`
                                : "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                          backdropFilter: customization.backdropBlur ? "blur(10px)" : "none",
                        }}
                      >
                        {/* Header Preview */}
                        <div
                          className="mb-4 p-3 rounded-lg shadow-sm"
                          style={{
                            backgroundColor: customization.primaryColor + "10",
                            borderRadius: `${customization.borderRadius * 0.75}px`,
                            boxShadow:
                              customization.shadowIntensity > 0
                                ? `0 ${customization.shadowIntensity}px ${customization.shadowIntensity * 2}px rgba(0,0,0,0.1)`
                                : "none",
                          }}
                        >
                          <h3
                            className="font-bold text-lg mb-1"
                            style={{
                              color: customization.primaryColor,
                              fontFamily: customization.primaryFont,
                            }}
                          >
                            {customization.restaurantName || "Restaurante Premium"}
                          </h3>
                          {customization.tagline && (
                            <p
                              className="text-sm opacity-80"
                              style={{
                                fontFamily: customization.secondaryFont,
                                fontSize: `${customization.fontSize - 2}px`,
                              }}
                            >
                              {customization.tagline}
                            </p>
                          )}
                        </div>

                        {/* Product Card Preview */}
                        <div
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm mb-3 transition-all duration-300 hover:scale-105"
                          style={{
                            borderRadius: `${customization.borderRadius * 0.75}px`,
                            boxShadow:
                              customization.shadowIntensity > 0
                                ? `0 ${customization.shadowIntensity}px ${customization.shadowIntensity * 2}px rgba(0,0,0,0.1)`
                                : "none",
                            transform: customization.animations === "dynamic" ? "translateY(0)" : "none",
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-12 h-12 rounded-lg"
                              style={{
                                backgroundColor: customization.accentColor,
                                borderRadius: `${customization.borderRadius * 0.5}px`,
                              }}
                            />
                            <div className="flex-1">
                              <h4
                                className="font-semibold"
                                style={{
                                  fontFamily: customization.primaryFont,
                                  fontSize: `${customization.fontSize}px`,
                                  fontWeight: customization.fontWeight,
                                }}
                              >
                                Produto Exemplo
                              </h4>
                              <p
                                className="text-sm opacity-70"
                                style={{
                                  fontFamily: customization.secondaryFont,
                                  fontSize: `${customization.fontSize - 2}px`,
                                }}
                              >
                                Descrição do produto
                              </p>
                            </div>
                            <div className="font-bold" style={{ color: customization.primaryColor }}>
                              R$ 25,90
                            </div>
                          </div>
                        </div>

                        {/* Button Preview */}
                        <button
                          className="w-full py-2 px-4 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`,
                            borderRadius: `${customization.borderRadius * 0.5}px`,
                            fontFamily: customization.primaryFont,
                            fontSize: `${customization.fontSize}px`,
                            boxShadow:
                              customization.shadowIntensity > 0
                                ? `0 ${customization.shadowIntensity}px ${customization.shadowIntensity * 2}px rgba(0,0,0,0.2)`
                                : "none",
                          }}
                        >
                          Adicionar ao Carrinho
                        </button>

                        {/* Style Info */}
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <strong>Fonte:</strong> {customization.primaryFont}
                            </div>
                            <div>
                              <strong>Tamanho:</strong> {customization.fontSize}px
                            </div>
                            <div>
                              <strong>Estilo:</strong> {customization.cardStyle}
                            </div>
                            <div>
                              <strong>Bordas:</strong> {customization.borderRadius}px
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Ações rápidas */}
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ações rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <Button
                      onClick={applyCustomization}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Aplicar tema
                    </Button>
                    <Button onClick={resetCustomization} variant="outline" className="w-full bg-transparent">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                    <Button onClick={exportTheme} variant="outline" className="w-full bg-transparent">
                      <Package className="h-4 w-4 mr-2" />
                      Exportar tema
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Configurações WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                  <Input id="whatsapp-number" placeholder="+55 11 99999-9999" defaultValue="+55 11 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                  <Textarea id="welcome-message" placeholder="Olá! Bem-vindo ao nosso restaurante..." rows={3} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-response">Resposta Automática</Label>
                  <Switch id="auto-response" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="service-charge">Taxa de Serviço (%)</Label>
                  <Input id="service-charge" type="number" placeholder="10" defaultValue="10" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="online-orders">Pedidos Online</Label>
                  <Switch id="online-orders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="table-service">Atendimento por Mesa</Label>
                  <Switch id="table-service" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">Analytics</Label>
                  <Switch id="analytics" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Adicionar Novo Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Imagem do Produto</Label>
                    <Input type="file" accept="image/*" className="cursor-pointer" />
                  </div>

                  <form id="add-product-form" className="space-y-4">
                    <Input name="name" placeholder="Nome do produto" required className="mt-4" />
                    <Input name="price" placeholder="Preço (R$)" type="number" step="0.01" required />

                    {/* Category Select */}
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <select
                        name="category"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="burgers">🍔 Burgers</option>
                        <option value="pizzas">🍕 Pizzas</option>
                        <option value="drinks">🥤 Bebidas</option>
                        <option value="desserts">🍰 Sobremesas</option>
                        <option value="salads">🥗 Saladas</option>
                        <option value="appetizers">🍤 Aperitivos</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <textarea
                        name="description"
                        placeholder="Descrição do produto..."
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                      />
                    </div>

                    <Input name="preparationTime" placeholder="Tempo de preparo (ex: 15-20 min)" />
                  </form>

                  <div className="flex space-x-2">
                    <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const form = document.querySelector("#add-product-form") as HTMLFormElement | null
                        if (!form) return
                        const formData = new FormData(form)
                        const data = {
                          name: formData.get("name"),
                          price: formData.get("price"),
                          category: formData.get("category"),
                          description: formData.get("description"),
                          preparationTime: formData.get("preparationTime"),
                        }
                        if (data.name && data.price && data.category) {
                          handleAddProduct(data)
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Adicionar Produto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Editar Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Imagem do Produto</Label>
                    <div className="flex items-center space-x-4">
                      <Input type="file" accept="image/*" className="cursor-pointer flex-1" />
                      <img
                        src={`/placeholder.svg?height=60&width=60&query=${editingProduct.name}`}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border"
                      />
                    </div>
                  </div>

                  <form id="edit-product-form" className="space-y-4">
                    <Input name="name" defaultValue={editingProduct.name} placeholder="Nome do produto" required />
                    <Input
                      name="price"
                      defaultValue={editingProduct.price.replace("R$ ", "")}
                      placeholder="Preço (R$)"
                      type="number"
                      step="0.01"
                      required
                    />

                    {/* Category Select */}
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <select
                        name="category"
                        defaultValue={editingProduct.category.toLowerCase()}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="burgers">🍔 Burgers</option>
                        <option value="pizzas">🍕 Pizzas</option>
                        <option value="drinks">🥤 Bebidas</option>
                        <option value="desserts">🍰 Sobremesas</option>
                        <option value="salads">🥗 Saladas</option>
                        <option value="appetizers">🍤 Aperitivos</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <textarea
                        name="description"
                        placeholder="Descrição do produto..."
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        defaultValue="Descrição detalhada do produto..."
                      />
                    </div>

                    <Input
                      name="preparationTime"
                      placeholder="Tempo de preparo (ex: 15-20 min)"
                      defaultValue="15-20 min"
                    />
                  </form>

                  <div className="flex space-x-2">
                    <Button onClick={() => setEditingProduct(null)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const form = document.querySelector("#edit-product-form") as HTMLFormElement | null
                        if (!form) return
                        const formData = new FormData(form)
                        const data = {
                          name: formData.get("name"),
                          price: formData.get("price"),
                          category: formData.get("category"),
                          description: formData.get("description"),
                          preparationTime: formData.get("preparationTime"),
                        }
                        if (data.name && data.price && data.category) {
                          handleEditProduct(data)
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center space-x-2">
                    <Trash2 className="h-5 w-5" />
                    <span>Confirmar Exclusão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <img
                      src={`/placeholder.svg?height=80&width=80&query=${deletingProduct.name}`}
                      alt={deletingProduct.name}
                      className="w-20 h-20 object-cover rounded-lg mx-auto mb-4 border"
                    />
                    <p className="text-gray-900 dark:text-white font-semibold">Tem certeza que deseja excluir:</p>
                    <p className="text-lg font-bold text-red-600 mt-2">{deletingProduct.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Esta ação não pode ser desfeita.</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={() => setDeletingProduct(null)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        setProductsState((prev) => prev.filter((p) => p.id !== deletingProduct.id))
                        const deletedProduct = deletingProduct
                        setDeletingProduct(null)
                        setSuccessModal({
                          show: true,
                          type: "delete",
                          message: "Produto excluído com sucesso!",
                          product: deletedProduct,
                        })
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Produto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success Modal */}
          {successModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle
                    className={`flex items-center space-x-2 ${
                      successModal.type === "delete" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {successModal.type === "add" && <Plus className="h-5 w-5" />}
                    {successModal.type === "edit" && <Edit className="h-5 w-5" />}
                    {successModal.type === "delete" && <Trash2 className="h-5 w-5" />}
                    {successModal.type === "customization" && <Palette className="h-5 w-5" />}
                    {successModal.type === "delivery" && <Truck className="h-5 w-5" />}
                    <span>
                      {successModal.type === "add" && "Produto Adicionado"}
                      {successModal.type === "edit" && "Produto Editado"}
                      {successModal.type === "delete" && "Produto Excluído"}
                      {successModal.type === "customization" && "Tema Aplicado"}
                      {successModal.type === "delivery" && "Configurações Salvas"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        successModal.type === "delete"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-green-100 dark:bg-green-900/20"
                      }`}
                    >
                      {successModal.type === "add" && <Plus className="h-8 w-8 text-green-600" />}
                      {successModal.type === "edit" && <Edit className="h-8 w-8 text-green-600" />}
                      {successModal.type === "delete" && <Trash2 className="h-8 w-8 text-red-600" />}
                      {successModal.type === "customization" && <Palette className="h-8 w-8 text-green-600" />}
                      {successModal.type === "delivery" && <Truck className="h-8 w-8 text-green-600" />}
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{successModal.message}</p>
                    {successModal.product && (
                      <p className="text-gray-600 dark:text-gray-400">{successModal.product.name}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => setSuccessModal({ show: false, type: "", message: "", product: null })}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add/Edit Mesa Modal */}
          {(showAddMesaModal || editingMesa) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingMesa ? "Editar Mesa" : "Adicionar Nova Mesa"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mesa-number">Número da Mesa *</Label>
                    <Input
                      id="mesa-number"
                      placeholder="Ex: 1, 2, A1..."
                      value={mesaFormData.number}
                      onChange={(e) => setMesaFormData((prev) => ({ ...prev, number: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mesa-capacity">Capacidade *</Label>
                    <Input
                      id="mesa-capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={mesaFormData.capacity}
                      onChange={(e) =>
                        setMesaFormData((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="mesa-location">Localização *</Label>
                    <select
                      id="mesa-location"
                      value={mesaFormData.location}
                      onChange={(e) => setMesaFormData((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Salão Principal">Salão Principal</option>
                      <option value="Área Externa">Área Externa</option>
                      <option value="Mezanino">Mezanino</option>
                      <option value="Varanda">Varanda</option>
                      <option value="Área VIP">Área VIP</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="mesa-notes">Observações</Label>
                    <Textarea
                      id="mesa-notes"
                      placeholder="Observações sobre a mesa..."
                      value={mesaFormData.notes}
                      onChange={(e) => setMesaFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMesaModal(false)
                        setEditingMesa(null)
                        resetMesaForm()
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={editingMesa ? handleEditMesa : handleAddMesa}
                      disabled={!mesaFormData.number.trim()}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {editingMesa ? "Salvar Alterações" : "Adicionar Mesa"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delete Mesa Confirmation Modal */}
          {deletingMesa && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center space-x-2">
                    <Trash2 className="h-5 w-5" />
                    <span>Confirmar Exclusão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tem certeza que deseja excluir a <strong>Mesa {deletingMesa.number}</strong>?
                  </p>
                  <p className="text-sm text-red-600">
                    Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                  </p>
                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setDeletingMesa(null)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleDeleteMesa}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Mesa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* View Mesa Details Modal */}
          {viewingMesa && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(viewingMesa.status)}`}></div>
                    <span>Mesa {viewingMesa.number}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Status</Label>
                      <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                        {getStatusIcon(viewingMesa.status)}
                        <span>{getStatusText(viewingMesa.status)}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Capacidade</Label>
                      <p className="font-medium">{viewingMesa.capacity} pessoas</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Localização</Label>
                    <p className="font-medium">{viewingMesa.location}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">QR Code</Label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1">
                        {viewingMesa.qrCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/qr/${viewingMesa.number}`, "_blank")}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {viewingMesa.currentSession && (
                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Sessão Atual</Label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                        {viewingMesa.status === "occupied" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Início:</span>
                              <span className="font-medium">{viewingMesa.currentSession.startTime}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pessoas:</span>
                              <span className="font-medium">{viewingMesa.currentSession.people}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pedidos:</span>
                              <span className="font-medium">{viewingMesa.currentSession.orders}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                              <span>Total:</span>
                              <span className="text-green-600">R$ {viewingMesa.currentSession.total?.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {viewingMesa.status === "reserved" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Reserva para:</span>
                              <span className="font-medium">{viewingMesa.currentSession.reservedFor}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cliente:</span>
                              <span className="font-medium">{viewingMesa.currentSession.customerName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Pessoas:</span>
                              <span className="font-medium">{viewingMesa.currentSession.people}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setViewingMesa(null)} className="flex-1">
                      Fechar
                    </Button>
                    <Button
                      onClick={() => {
                        setViewingMesa(null)
                        openEditMesaModal(viewingMesa)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}
