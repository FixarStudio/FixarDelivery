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
  Calculator,
  X,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemePreview } from "@/components/theme-preview"

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

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productsState, setProductsState] = useState<any[]>([])
  const [deletingProduct, setDeletingProduct] = useState<any>(null)
  const [successModal, setSuccessModal] = useState<{
    show: boolean
    type: string
    message: string
    product: any | null
  }>({ show: false, type: "", message: "", product: null })
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Estados para gerenciamento de mesas
  const [mesas, setMesas] = useState<any[]>([])
  const [loadingMesas, setLoadingMesas] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [hasChanges, setHasChanges] = useState(false)

  // Estados para gerenciamento de pedidos
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        // A API retorna { success: true, orders: [...] }
        const ordersArray = data.success && Array.isArray(data.orders) ? data.orders : []
        setOrders(ordersArray)
        console.log('Pedidos carregados:', ordersArray)
      } else {
        console.error('Erro ao carregar pedidos')
        setOrders([])
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        // Atualizar o pedido na lista
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        console.log('Status do pedido atualizado')
      } else {
        console.error('Erro ao atualizar status do pedido')
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
    }
  }

  const fetchMesas = async () => {
    setLoadingMesas(true)
    try {
      const res = await fetch("/api/admin/mesas")
      console.log('Status da resposta:', res.status)
      const data = await res.json()
      console.log('Mesas carregadas da API:', data)
      console.log('Tipo de data:', typeof data, 'É array?', Array.isArray(data))
      
      // Verificar se há mudanças comparando com o estado anterior
      const hasStatusChanges = mesas.some((oldMesa, index) => {
        const newMesa = data[index]
        return newMesa && (
          oldMesa.status !== newMesa.status ||
          oldMesa.currentSession?.id !== newMesa.currentSession?.id ||
          oldMesa.reservations?.length !== newMesa.reservations?.length
        )
      })
      
      if (hasStatusChanges) {
        setHasChanges(true)
        // Mostrar notificação de mudança
        console.log('🔄 Mudanças detectadas nas mesas - Atualizando...')
        // Resetar o indicador de mudanças após 6 segundos
        setTimeout(() => setHasChanges(false), 6000)
      }
      
      // Verificar se data é um array antes de usar forEach
      if (Array.isArray(data)) {
        // Verificar se cada mesa tem os dados necessários
        data.forEach((mesa: any, index: number) => {
          console.log(`Mesa ${index + 1}:`, {
            id: mesa.id,
            number: mesa.number,
            status: mesa.status,
            currentSession: mesa.currentSession,
            reservations: mesa.reservations,
            lastOrder: mesa.lastOrder
          })
        })
        
        setMesas(data)
        setLastUpdate(new Date())
      } else {
        console.error('Erro: API retornou dados inválidos:', data)
        setMesas([])
      }
    } catch (error) {
      console.error('Erro ao carregar mesas:', error)
    }
    setLoadingMesas(false)
  }

  useEffect(() => {
    // Buscar mesas inicialmente
    fetchMesas()

    // Configurar polling para atualização em tempo real
    const interval = setInterval(() => {
      fetchMesas()
    }, 20000) // Atualizar a cada 20 segundos

    // Cleanup do intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProductsState(data)
    setLoadingProducts(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Carregar pedidos quando a aba de fila de produção for selecionada
  useEffect(() => {
    if (activeTab === "production") {
      fetchOrders()
    }
  }, [activeTab])



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
    baseCep: "01000-000",
    address: "Rua Principal, 123 - Centro, São Paulo - SP",
    workingHours: {
      start: "11:00",
      end: "23:00",
      days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
    },

    // Configurações de frete
    shippingType: "zones", // "fixed", "distance", "zones", "free"
    fixedShippingCost: 8.0,
    pricePerKm: 2.5,
    baseShippingCost: 5.0,
    freeShippingMinimum: 50.0,
    maxDeliveryDistance: 15,

    // Configurações de tempo
    baseDeliveryTime: 30,
    timePerKm: 5,
    preparationTime: 20,

    // Zonas de entrega
    deliveryZones: [
      { 
        id: "zona-centro",
        name: "Centro", 
        centerCep: "01000-000", 
        radius: 2, 
        basePrice: 5.0, 
        pricePerKm: 1.5, 
        color: "#ff6b6b",
        isActive: true 
      },
      { 
        id: "zona-norte",
        name: "Zona Norte", 
        centerCep: "02000-000", 
        radius: 5, 
        basePrice: 8.0, 
        pricePerKm: 2.0, 
        color: "#4ecdc4",
        isActive: true 
      },
      { 
        id: "zona-sul",
        name: "Zona Sul", 
        centerCep: "04000-000", 
        radius: 8, 
        basePrice: 12.0, 
        pricePerKm: 2.5, 
        color: "#45b7d1",
        isActive: true 
      }
    ],

    // Áreas de atendimento (legado)
    deliveryAreas: [
      { name: "Centro", cep: "01000-000", price: 8.0, active: true, distance: null as number | null },
      { name: "Vila Madalena", cep: "05433-000", price: 12.0, active: true, distance: null as number | null },
      { name: "Pinheiros", cep: "05422-000", price: 10.0, active: true, distance: null as number | null },
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

  const [newDeliveryZone, setNewDeliveryZone] = useState({
    name: "",
    centerCep: "",
    radius: 2,
    basePrice: 5.0,
    pricePerKm: 1.5,
    color: "#ff6b6b",
  })

  const [showAddDeliveryZone, setShowAddDeliveryZone] = useState(false)

  // Estados para simulador de preços
  const [simulatorCep, setSimulatorCep] = useState("")
  const [simulatorResult, setSimulatorResult] = useState<any>(null)

  const [customization, setCustomization] = useState({
    restaurantName: "Restaurante Premium",
    restaurantLogo: null,
    tagline: "",
    primaryColor: "#ea580c",
    secondaryColor: "#fb923c",
    accentColor: "#fed7aa",
    primaryFont: "Inter",
    fontSize: 16,
    fontWeight: "400",
    borderRadius: 12,
    shadowIntensity: 3,
    whatsappNumber: "5511999999999",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Carregar customização salva ao inicializar
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const response = await fetch("/api/admin/customization")
        if (response.ok) {
          const settings = await response.json()
          setCustomization(settings)
          applyThemeToDocument(settings)
          
          // Atualizar deliveryConfig com o número do WhatsApp das configurações
          if (settings.whatsappNumber) {
            setDeliveryConfig(prev => ({
              ...prev,
              whatsappNumber: settings.whatsappNumber
            }))
          }
        }
      } catch (error) {
        console.error("Erro ao carregar customização:", error)
      }
    }
    
    loadCustomization()
  }, [])

  // Aplicar mudanças em tempo real
  useEffect(() => {
    console.log('Aplicando tema em tempo real:', customization)
    applyThemeToDocument(customization)
  }, [customization])

  const applyThemeToDocument = (theme: typeof customization) => {
    const root = document.documentElement

    // Aplicar variáveis CSS customizadas
    root.style.setProperty("--primary-color", theme.primaryColor)
    root.style.setProperty("--secondary-color", theme.secondaryColor)
    root.style.setProperty("--accent-color", theme.accentColor)
    root.style.setProperty("--primary-font", theme.primaryFont)
    root.style.setProperty("--border-radius", `${theme.borderRadius}px`)
    root.style.setProperty("--font-size", `${theme.fontSize}px`)
    root.style.setProperty("--font-weight", theme.fontWeight)
    root.style.setProperty("--shadow-intensity", theme.shadowIntensity.toString())
    
    // Aplicar borderRadius em elementos específicos que podem ter bordas
    console.log('Aplicando borderRadius global:', theme.borderRadius)
    const elementsWithBorders = document.querySelectorAll('button, input, textarea, select, .card, .Card, div[class*="rounded"], img, .bg-white, .bg-gray-50, .bg-gray-100, .bg-gray-200, .bg-gray-300, .bg-gray-400, .bg-gray-500, .bg-gray-600, .bg-gray-700, .bg-gray-800, .bg-gray-900, .bg-red-50, .bg-red-100, .bg-red-200, .bg-red-300, .bg-red-400, .bg-red-500, .bg-red-600, .bg-red-700, .bg-red-800, .bg-red-900, .bg-orange-50, .bg-orange-100, .bg-orange-200, .bg-orange-300, .bg-orange-400, .bg-orange-500, .bg-orange-600, .bg-orange-700, .bg-orange-800, .bg-orange-900, .bg-yellow-50, .bg-yellow-100, .bg-yellow-200, .bg-yellow-300, .bg-yellow-400, .bg-yellow-500, .bg-yellow-600, .bg-yellow-700, .bg-yellow-800, .bg-yellow-900, .bg-green-50, .bg-green-100, .bg-green-200, .bg-green-300, .bg-green-400, .bg-green-500, .bg-green-600, .bg-green-700, .bg-green-800, .bg-green-900, .bg-blue-50, .bg-blue-100, .bg-blue-200, .bg-blue-300, .bg-blue-400, .bg-blue-500, .bg-blue-600, .bg-blue-700, .bg-blue-800, .bg-blue-900, .bg-indigo-50, .bg-indigo-100, .bg-indigo-200, .bg-indigo-300, .bg-indigo-400, .bg-indigo-500, .bg-indigo-600, .bg-indigo-700, .bg-indigo-800, .bg-indigo-900, .bg-purple-50, .bg-purple-100, .bg-purple-200, .bg-purple-300, .bg-purple-400, .bg-purple-500, .bg-purple-600, .bg-purple-700, .bg-purple-800, .bg-purple-900, .bg-pink-50, .bg-pink-100, .bg-pink-200, .bg-pink-300, .bg-pink-400, .bg-pink-500, .bg-pink-600, .bg-pink-700, .bg-pink-800, .bg-pink-900')
    
    elementsWithBorders.forEach(element => {
      ;(element as HTMLElement).style.borderRadius = `${theme.borderRadius}px`
    })

    // Aplicar classes CSS dinâmicas
    const body = document.body

    // Remover classes de intensidade de sombra
    for (let i = 0; i <= 10; i++) {
      body.classList.remove(`shadow-intensity-${i}`)
    }

    // Adicionar nova classe
    console.log('Aplicando classe:', `shadow-intensity-${theme.shadowIntensity}`)
    body.classList.add(`shadow-intensity-${theme.shadowIntensity}`)

    // Aplicar fonte principal
    console.log('Aplicando fonte:', theme.primaryFont)
    body.style.fontFamily = `"${theme.primaryFont}", sans-serif`
    
    // Aplicar tamanho da fonte
    console.log('Aplicando tamanho da fonte:', theme.fontSize)
    root.style.fontSize = `${theme.fontSize}px`
    body.style.fontWeight = theme.fontWeight


  }

  const applyCustomization = async () => {
    try {
      console.log('Iniciando applyCustomization...')
      console.log('customization atual:', customization)
      
      // Salvar no banco de dados
      const response = await fetch("/api/admin/customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customization),
      })

      if (response.ok) {
        console.log('Configurações salvas no banco, aplicando tema...')
        // Aplicar tema ao documento
        applyThemeToDocument(customization)

        setSuccessModal({
          show: true,
          type: "customization",
          message: "Personalização aplicada com sucesso!",
          product: null,
        })
      } else {
        throw new Error("Erro ao salvar customização")
      }
    } catch (error) {
      console.error("Erro ao aplicar customização:", error)
      setSuccessModal({
        show: true,
        type: "error",
        message: "Erro ao aplicar personalização",
        product: null,
      })
    }
  }

  const resetCustomization = async () => {
    const defaultTheme = {
      restaurantName: "Restaurante Premium",
      restaurantLogo: null,
      tagline: "",
      primaryColor: "#ea580c",
      secondaryColor: "#fb923c",
      accentColor: "#fed7aa",
      primaryFont: "Inter",
      fontSize: 16,
      fontWeight: "400",
      borderRadius: 12,
      shadowIntensity: 3,
      whatsappNumber: "5511999999999",
    }

    try {
      // Salvar tema padrão no banco
      const response = await fetch("/api/admin/customization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultTheme),
      })

      if (response.ok) {
        setCustomization(defaultTheme)
        applyThemeToDocument(defaultTheme)
        
        setSuccessModal({
          show: true,
          type: "customization",
          message: "Personalização resetada com sucesso!",
          product: null,
        })
      } else {
        throw new Error("Erro ao resetar customização")
      }
    } catch (error) {
      console.error("Erro ao resetar customização:", error)
      setSuccessModal({
        show: true,
        type: "error",
        message: "Erro ao resetar personalização",
        product: null,
      })
    }
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

  const handleLogoUpload = async () => {
    if (!logoFile) {
      alert("Selecione um arquivo primeiro")
      return
    }

    try {
      setUploadingLogo(true)
      const formData = new FormData()
      formData.append("logo", logoFile)

      const response = await fetch("/api/admin/logo", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setCustomization(prev => ({
          ...prev,
          restaurantLogo: result.logoUrl
        }))
        
        setSuccessModal({
          show: true,
          type: "logo",
          message: "Logo do restaurante atualizada com sucesso!",
          product: null,
        })
        
        setLogoFile(null)
      } else {
        const error = await response.json()
        alert(`Erro ao fazer upload: ${error.error}`)
      }
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error)
      alert("Erro ao fazer upload da logo")
    } finally {
      setUploadingLogo(false)
    }
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

  const handleAddProduct = async (formData: any) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao adicionar produto")
      }
      
      const product = await response.json()
      setShowAddModal(false)
      setSuccessModal({
        show: true,
        type: "add",
        message: "Produto adicionado com sucesso!",
        product: product,
      })
      fetchProducts()
    } catch (error: any) {
      console.error("Erro ao adicionar produto:", error)
      alert(error.message || "Erro ao adicionar produto")
    }
  }

  const handleEditProduct = async (formData: any) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingProduct.id }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao editar produto")
      }
      
      const product = await response.json()
      setEditingProduct(null)
      setSuccessModal({
        show: true,
        type: "edit",
        message: "Produto editado com sucesso!",
        product: product,
      })
      fetchProducts()
    } catch (error: any) {
      console.error("Erro ao editar produto:", error)
      alert(error.message || "Erro ao editar produto")
    }
  }

  const handleDeleteProduct = async (product: any) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao excluir produto")
      }
      
      setDeletingProduct(null)
      setSuccessModal({
        show: true,
        type: "delete",
        message: "Produto excluído com sucesso!",
        product: product,
      })
      fetchProducts()
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error)
      alert(error.message || "Erro ao excluir produto")
    }
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

  // Função para formatar nome (apenas primeiro e segundo nome)
  const formatCustomerName = (fullName: string) => {
    return fullName.split(' ').slice(0, 2).join(' ')
  }

  // Função para formatar telefone brasileiro
  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Se tem 11 dígitos (com DDD), formata como (XX) XXXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    
    // Se tem 10 dígitos (com DDD), formata como (XX) XXXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    // Se tem 9 dígitos (sem DDD), formata como XXXXX-XXXX
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    }
    
    // Se tem 8 dígitos (sem DDD), formata como XXXX-XXXX
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
    }
    
    // Se não conseguir formatar, retorna o original
    return phone
  }

  // Debug: log quando editingProduct mudar
  useEffect(() => {
    if (editingProduct) {
      console.log("Editando produto:", editingProduct)
      console.log("Descrição do produto:", editingProduct.description)
      console.log("Tempo de preparo do produto:", editingProduct.preparationTime)
    }
  }, [editingProduct])

  const handleAddMesa = async () => {
    try {
      const response = await fetch("/api/admin/mesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: mesaFormData.number,
          capacity: mesaFormData.capacity,
          location: mesaFormData.location,
          notes: mesaFormData.notes,
        }),
      })

      if (response.ok) {
        const newMesa = await response.json()
        console.log('Mesa criada com sucesso:', newMesa)
        setMesas([...mesas, newMesa])
        setShowAddMesaModal(false)
        resetMesaForm()
      } else {
        const error = await response.json()
        console.error('Erro ao criar mesa:', error)
        alert('Erro ao criar mesa: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao criar mesa:', error)
      alert('Erro ao criar mesa')
    }
  }

  const handleEditMesa = async () => {
    try {
      const response = await fetch("/api/admin/mesas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingMesa.id,
          number: mesaFormData.number,
          capacity: mesaFormData.capacity,
          location: mesaFormData.location,
          notes: mesaFormData.notes,
          status: editingMesa.status,
        }),
      })

      if (response.ok) {
        const updatedMesa = await response.json()
        setMesas(mesas.map((mesa) => (mesa.id === editingMesa.id ? updatedMesa : mesa)))
        setEditingMesa(null)
        resetMesaForm()
      } else {
        const error = await response.json()
        console.error('Erro ao editar mesa:', error)
        alert('Erro ao editar mesa: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao editar mesa:', error)
      alert('Erro ao editar mesa')
    }
  }

  const handleDeleteMesa = async () => {
    try {
      const response = await fetch("/api/admin/mesas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deletingMesa.id }),
      })

      if (response.ok) {
        setMesas(mesas.filter((mesa) => mesa.id !== deletingMesa.id))
        setDeletingMesa(null)
      } else {
        const error = await response.json()
        console.error('Erro ao deletar mesa:', error)
        alert('Erro ao deletar mesa: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao deletar mesa:', error)
      alert('Erro ao deletar mesa')
    }
  }

  const toggleMesaStatus = async (mesaId: string) => {
    try {
      const mesa = mesas.find(m => m.id === mesaId)
      if (!mesa) return

      if (mesa.status === "free") {
        // Ocupar mesa
        const response = await fetch('/api/mesas/occupy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesaId: mesaId,
            people: mesa.capacity,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Mesa ocupada:', result)
          
          // Recarregar todas as mesas para ter dados completos
          await fetchMesas()
        } else {
          const error = await response.json()
          console.error('Erro ao ocupar mesa:', error)
          alert('Erro ao ocupar mesa: ' + error.error)
        }
      } else {
        // Liberar mesa
        const response = await fetch('/api/mesas/release', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesaId: mesaId,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Mesa liberada:', result)
          
          // Recarregar todas as mesas para ter dados completos
          await fetchMesas()
        } else {
          const error = await response.json()
          console.error('Erro ao liberar mesa:', error)
          alert('Erro ao liberar mesa: ' + error.error)
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status da mesa:', error)
      alert('Erro ao alterar status da mesa')
    }
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
    occupancyRate: mesas.length > 0 ? Math.round((mesas.filter((m) => m.status === "occupied").length / mesas.length) * 100) : 0,
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
        baseCep: "01000-000",
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
        deliveryZones: [
          { 
            id: "zona-centro",
            name: "Centro", 
            centerCep: "01000-000", 
            radius: 2, 
            basePrice: 5.0, 
            pricePerKm: 1.5, 
            color: "#ff6b6b",
            isActive: true 
          },
          { 
            id: "zona-norte",
            name: "Zona Norte", 
            centerCep: "02000-000", 
            radius: 5, 
            basePrice: 8.0, 
            pricePerKm: 2.0, 
            color: "#4ecdc4",
            isActive: true 
          },
          { 
            id: "zona-sul",
            name: "Zona Sul", 
            centerCep: "04000-000", 
            radius: 8, 
            basePrice: 12.0, 
            pricePerKm: 2.5, 
            color: "#45b7d1",
            isActive: true 
          }
        ],
        deliveryAreas: [
          { name: "Centro", cep: "01000-000", price: 8.0, active: true, distance: null as number | null },
          { name: "Vila Madalena", cep: "05433-000", price: 12.0, active: true, distance: null as number | null },
          { name: "Pinheiros", cep: "05422-000", price: 10.0, active: true, distance: null as number | null },
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

  // Função para calcular distância entre dois CEPs
  const calculateDistanceBetweenCEPs = async (cep1: string, cep2: string) => {
    try {
      // Usar API do ViaCEP para obter coordenadas
      const response1 = await fetch(`https://viacep.com.br/ws/${cep1.replace(/\D/g, '')}/json/`)
      const response2 = await fetch(`https://viacep.com.br/ws/${cep2.replace(/\D/g, '')}/json/`)
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      if (data1.erro || data2.erro) {
        console.error('CEP não encontrado')
        return null
      }
      
      // Calcular distância usando fórmula de Haversine
      const lat1 = parseFloat(data1.lat || '0')
      const lon1 = parseFloat(data1.lng || '0')
      const lat2 = parseFloat(data2.lat || '0')
      const lon2 = parseFloat(data2.lng || '0')
      
      if (lat1 === 0 || lat2 === 0) {
        console.error('Coordenadas não disponíveis')
        return null
      }
      
      const R = 6371 // Raio da Terra em km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      return distance
    } catch (error) {
      console.error('Erro ao calcular distância:', error)
      return null
    }
  }

  const addDeliveryArea = async () => {
    if (newDeliveryArea.name && newDeliveryArea.cep) {
      let calculatedPrice = newDeliveryArea.price
      
      // Se o CEP base estiver configurado, calcular preço automaticamente
      if (deliveryConfig.baseCep && deliveryConfig.shippingType === "distance") {
        const distance = await calculateDistanceBetweenCEPs(deliveryConfig.baseCep, newDeliveryArea.cep)
        if (distance !== null) {
          calculatedPrice = deliveryConfig.baseShippingCost + (distance * deliveryConfig.pricePerKm)
        }
      }
      
              const distance = calculatedPrice !== newDeliveryArea.price ? await calculateDistanceBetweenCEPs(deliveryConfig.baseCep, newDeliveryArea.cep) : null
        
        setDeliveryConfig((prev) => ({
          ...prev,
          deliveryAreas: [...prev.deliveryAreas, { 
            ...newDeliveryArea, 
            price: calculatedPrice,
            distance: distance,
            active: true 
          }],
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

  // Funções para gerenciar zonas
  const addDeliveryZone = () => {
    if (newDeliveryZone.name && newDeliveryZone.centerCep) {
      const newZone = {
        ...newDeliveryZone,
        id: `zona-${Date.now()}`,
        isActive: true
      }
      setDeliveryConfig((prev) => ({
        ...prev,
        deliveryZones: [...prev.deliveryZones, newZone],
      }))
      setNewDeliveryZone({ name: "", centerCep: "", radius: 2, basePrice: 5.0, pricePerKm: 1.5, color: "#ff6b6b" })
      setShowAddDeliveryZone(false)
    }
  }

  const removeDeliveryZone = (index: number) => {
    setDeliveryConfig((prev) => ({
      ...prev,
      deliveryZones: prev.deliveryZones.filter((_, i) => i !== index),
    }))
  }

  const toggleDeliveryZoneStatus = (index: number) => {
    setDeliveryConfig((prev) => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map((zone, i) => (i === index ? { ...zone, isActive: !zone.isActive } : zone)),
    }))
  }

  const updateDeliveryZone = (index: number, field: string, value: any) => {
    setDeliveryConfig((prev) => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map((zone, i) => 
        i === index ? { ...zone, [field]: value } : zone
      ),
    }))
  }

  // Função para calcular preço baseado nas zonas
  const calculateZonePrice = async (customerCep: string) => {
    if (deliveryConfig.shippingType !== "zones") return null
    
    let bestPrice = Infinity
    let bestZone = null
    let bestDistance = null
    
    for (const zone of deliveryConfig.deliveryZones) {
      if (!zone.isActive) continue
      
      const distance = await calculateDistanceBetweenCEPs(zone.centerCep, customerCep)
      if (distance === null) continue
      
      let price = zone.basePrice
      
      // Se está fora do raio, cobrar adicional
      if (distance > zone.radius) {
        const extraKm = distance - zone.radius
        price += extraKm * zone.pricePerKm
      }
      
      if (price < bestPrice) {
        bestPrice = price
        bestZone = zone
        bestDistance = distance
      }
    }
    
    return {
      price: bestPrice,
      zone: bestZone,
      distance: bestDistance
    }
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
          <TabsList className="grid w-full grid-cols-8 mb-8">
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
              <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-orange-500 animate-bounce' : 'bg-green-500 animate-pulse'}`}></div>
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
            <TabsTrigger value="production" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Fila</span>
            </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
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
                          src={product.image ? `https://ik.imagekit.io/fixarmenu/${product.image}` : `/placeholder.svg?height=60&width=60&query=${product.name}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = `/placeholder.svg?height=60&width=60&query=${product.name}`;
                          }}
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
                          <Badge variant={product.available ? "default" : "secondary"} className="text-xs">
                            {product.available ? "Ativo" : "Inativo"}
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
                <p className="text-gray-600 dark:text-gray-400">
                  Controle o status e ocupação das mesas em tempo real
                  <span className="ml-2 text-xs text-gray-500">
                    Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <div className="flex items-center space-x-1 text-orange-600 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <span>Mudanças detectadas</span>
                  </div>
                )}
                <Button 
                  onClick={fetchMesas} 
                  variant="outline"
                  disabled={loadingMesas}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className={`h-4 w-4 ${loadingMesas ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
                <Button
                  onClick={() => setShowAddMesaModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Mesa
                </Button>
              </div>
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
            {loadingMesas ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando mesas...</p>
              </div>
            ) : mesas.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma mesa cadastrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Comece adicionando sua primeira mesa para gerenciar o estabelecimento.
                </p>
                <Button
                  onClick={() => setShowAddMesaModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Mesa
                </Button>
              </div>
            ) : (
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
                          {hasChanges && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
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
                            <DropdownMenuItem
                              onClick={() => window.open(`/api/mesas/${mesa.number}/orders`, "_blank")}
                              className="text-green-600"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Ver Pedidos
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
                            <span className="font-medium">
                              {new Date(mesa.currentSession.startTime).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pessoas:</span>
                            <span className="font-medium">{mesa.currentSession.people}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total:</span>
                            <span className="font-bold text-red-600">R$ {mesa.currentSession.total?.toFixed(2) || '0.00'}</span>
                          </div>
                          {mesa.lastOrder && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Último Pedido:</span>
                                <span className="font-medium">
                                  {new Date(mesa.lastOrder.createdAt).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              {mesa.lastOrder.items && mesa.lastOrder.items.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                  <div className="text-xs font-medium mb-1">Produtos Pedidos:</div>
                                  {mesa.lastOrder.items.slice(0, 3).map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between text-xs">
                                      <span>{item.product?.name || 'Produto'}</span>
                                      <span className="font-medium">R$ {item.price?.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  {mesa.lastOrder.items.length > 3 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      +{mesa.lastOrder.items.length - 3} mais...
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}



                      {mesa.status === "reserved" && mesa.reservations && mesa.reservations.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Reserva:</span>
                            <span className="font-medium">
                              {new Date(mesa.reservations[0].reservedFor).toLocaleString('pt-BR', { 
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cliente:</span>
                            <span className="font-medium">
                              {formatCustomerName(mesa.reservations[0].customerName)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Telefone:</span>
                            <span className="font-medium">{formatPhoneNumber(mesa.reservations[0].phone || 'N/A')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pessoas:</span>
                            <span className="font-medium">{mesa.reservations[0].people}</span>
                          </div>
                          {mesa.reservations[0].notes && (
                            <div className="flex justify-between text-sm">
                              <span>Observações:</span>
                              <span className="font-medium">{mesa.reservations[0].notes}</span>
                            </div>
                          )}
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
            )}
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
                      <div>
                        <Label htmlFor="delivery-base-cep">CEP Base do Restaurante</Label>
                        <Input
                          id="delivery-base-cep"
                          placeholder="00000-000"
                          value={deliveryConfig.baseCep}
                          onChange={(e) => setDeliveryConfig((prev) => ({ ...prev, baseCep: e.target.value }))}
                        />
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

              {/* Zonas de Entrega */}
              <TabsContent value="areas" className="space-y-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Zonas de Entrega</span>
                      </CardTitle>
                      <Button
                        onClick={() => setShowAddDeliveryZone(true)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Zona
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Visualização das Zonas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deliveryConfig.deliveryZones.map((zone, index) => (
                        <div
                          key={zone.id}
                          className="relative p-4 rounded-lg border-2"
                          style={{ 
                            borderColor: zone.color,
                            backgroundColor: `${zone.color}10`
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: zone.color }}
                              />
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {zone.name}
                              </h3>
                            </div>
                            <Switch 
                              checked={zone.isActive} 
                              onCheckedChange={() => toggleDeliveryZoneStatus(index)} 
                            />
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">CEP Central:</span>
                              <span className="font-medium">{zone.centerCep}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Raio:</span>
                              <span className="font-medium">{zone.radius} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Preço Base:</span>
                              <span className="font-medium text-green-600">R$ {zone.basePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Preço/km extra:</span>
                              <span className="font-medium">R$ {zone.pricePerKm.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDeliveryZone(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Adicionar Nova Zona */}
                    {showAddDeliveryZone && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Adicionar Nova Zona</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="zone-name">Nome da Zona</Label>
                            <Input
                              id="zone-name"
                              placeholder="Ex: Centro"
                              value={newDeliveryZone.name}
                              onChange={(e) => setNewDeliveryZone((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-center-cep">CEP Central</Label>
                            <Input
                              id="zone-center-cep"
                              placeholder="00000-000"
                              value={newDeliveryZone.centerCep}
                              onChange={(e) => setNewDeliveryZone((prev) => ({ ...prev, centerCep: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-radius">Raio (km)</Label>
                            <Input
                              id="zone-radius"
                              type="number"
                              min="1"
                              max="50"
                              value={newDeliveryZone.radius}
                              onChange={(e) => setNewDeliveryZone((prev) => ({ ...prev, radius: Number.parseInt(e.target.value) || 2 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-base-price">Preço Base (R$)</Label>
                            <Input
                              id="zone-base-price"
                              type="number"
                              step="0.01"
                              value={newDeliveryZone.basePrice}
                              onChange={(e) => setNewDeliveryZone((prev) => ({ ...prev, basePrice: Number.parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-price-per-km">Preço/km extra (R$)</Label>
                            <Input
                              id="zone-price-per-km"
                              type="number"
                              step="0.01"
                              value={newDeliveryZone.pricePerKm}
                              onChange={(e) => setNewDeliveryZone((prev) => ({ ...prev, pricePerKm: Number.parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-color">Cor da Zona</Label>
                            <div className="flex space-x-2">
                              {["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"].map((color) => (
                                <button
                                  key={color}
                                  className={`w-8 h-8 rounded-full border-2 ${
                                    newDeliveryZone.color === color ? 'border-gray-800' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setNewDeliveryZone((prev) => ({ ...prev, color }))}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddDeliveryZone(false)
                              setNewDeliveryZone({ name: "", centerCep: "", radius: 2, basePrice: 5.0, pricePerKm: 1.5, color: "#ff6b6b" })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={addDeliveryZone}
                            disabled={!newDeliveryZone.name || !newDeliveryZone.centerCep}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            Adicionar Zona
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Simulador de Preços */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5" />
                      <span>Simulador de Preços</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="simulator-cep">CEP do Cliente</Label>
                        <Input
                          id="simulator-cep"
                          placeholder="00000-000"
                          value={simulatorCep}
                          onChange={(e) => setSimulatorCep(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={async () => {
                            if (simulatorCep) {
                              const result = await calculateZonePrice(simulatorCep)
                              setSimulatorResult(result)
                            }
                          }}
                          disabled={!simulatorCep}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          Calcular
                        </Button>
                      </div>
                    </div>
                    
                    {simulatorResult && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                          Resultado do Cálculo
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Zona:</span>
                            <span className="font-medium">{simulatorResult.zone.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Distância:</span>
                            <span className="font-medium">{simulatorResult.distance?.toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Preço do Frete:</span>
                            <span className="font-medium text-green-600">R$ {simulatorResult.price.toFixed(2)}</span>
                          </div>
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
                          <div className="space-y-2">
                            {customization.restaurantLogo && (
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={customization.restaurantLogo} 
                                  alt="Logo atual" 
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                                <span className="text-sm text-gray-600">Logo atual</span>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Input 
                                id="logo-upload" 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                              />
                              <Button 
                                onClick={handleLogoUpload}
                                disabled={!logoFile || uploadingLogo}
                                size="sm"
                              >
                                {uploadingLogo ? "Enviando..." : "Enviar"}
                              </Button>
                            </div>
                          </div>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>


              </div>

              {/* Right Column - Live Preview + Ações rápidas */}
              <div className="space-y-6">
                {/* Preview em Tempo Real */}
                <ThemePreview customization={customization} />
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

          <TabsContent value="production" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Fila de Produção</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando pedidos...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-gray-600 dark:text-gray-400">Os pedidos aparecerão aqui quando forem criados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(orders) && orders
                      .filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="text-xs">
                                #{order.id.slice(-6).toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <Badge 
                              className={`text-xs ${
                                order.status === 'pending' ? 'bg-yellow-500' :
                                order.status === 'preparing' ? 'bg-orange-500' :
                                order.status === 'ready' ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                            >
                              {getStatusText(order.status)}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Cliente:</span>
                              <span>{order.customerName}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Telefone:</span>
                                <span>{formatPhoneNumber(order.customerPhone)}</span>
                              </div>
                            )}
                            {order.deliveryType === 'delivery' && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Tipo:</span>
                                <span className="text-blue-600">Delivery</span>
                              </div>
                            )}
                            {order.deliveryType === 'local' && order.tableId && (
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Mesa:</span>
                                <span>Mesa {order.tableId}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Total:</span>
                              <span className="font-bold">R$ {order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {order.observations && (
                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                              <span className="font-medium">Observações:</span> {order.observations}
                            </div>
                          )}

                          <div className="mt-4 flex space-x-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Iniciar Preparo
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Marcar Pronto
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Entregar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Configurações WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                      <Phone className="h-4 w-4" />
                    </span>
                    <Input 
                      id="whatsapp-number" 
                      placeholder="5511999999999" 
                      value={customization.whatsappNumber || "5511999999999"}
                      onChange={(e) => setCustomization((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomization((prev) => ({ ...prev, whatsappNumber: "5511999999999" }))
                    }}
                  >
                    Resetar
                  </Button>
                  <Button
                    onClick={applyCustomization}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
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

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detalhes do Pedido #{selectedOrder.id.slice(-6).toUpperCase()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge 
                        className={`${
                          selectedOrder.status === 'pending' ? 'bg-yellow-500' :
                          selectedOrder.status === 'preparing' ? 'bg-orange-500' :
                          selectedOrder.status === 'ready' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Cliente:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="flex justify-between">
                        <span className="font-medium">Telefone:</span>
                        <span>{formatPhoneNumber(selectedOrder.customerPhone)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo:</span>
                      <span className={selectedOrder.deliveryType === 'delivery' ? 'text-blue-600' : 'text-green-600'}>
                        {selectedOrder.deliveryType === 'delivery' ? 'Delivery' : 'Local'}
                      </span>
                    </div>
                    {selectedOrder.deliveryType === 'local' && selectedOrder.tableId && (
                      <div className="flex justify-between">
                        <span className="font-medium">Mesa:</span>
                        <span>Mesa {selectedOrder.tableId}</span>
                      </div>
                    )}
                    {selectedOrder.deliveryAddress && (
                      <div className="flex justify-between">
                        <span className="font-medium">Endereço:</span>
                        <span className="text-sm text-right">{selectedOrder.deliveryAddress}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">R$ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Data:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {selectedOrder.observations && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <span className="font-medium">Observações:</span>
                      <p className="mt-1 text-sm">{selectedOrder.observations}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Itens do Pedido:</h4>
                    <div className="space-y-2">
                      {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">Detalhes dos itens não disponíveis</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1"
                    >
                      Fechar
                    </Button>
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'preparing')
                          setSelectedOrder(null)
                        }}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        Iniciar Preparo
                      </Button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'ready')
                          setSelectedOrder(null)
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        Marcar Pronto
                      </Button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'delivered')
                          setSelectedOrder(null)
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        Entregar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
                        key="add-description"
                      />
                    </div>

                    <Input 
                      name="preparationTime" 
                      placeholder="Tempo de preparo (ex: 15-20 min)" 
                      defaultValue="15-20 min"
                      key="add-prep-time"
                    />

                    {/* Status */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        name="available"
                        defaultValue="true"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="true">✅ Ativo</option>
                        <option value="false">❌ Inativo</option>
                      </select>
                    </div>
                  </form>

                  <div className="flex space-x-2">
                    <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const form = document.querySelector("#add-product-form") as HTMLFormElement | null
                        if (!form) return
                        
                        // Pegar o arquivo de imagem
                        const imageInput = form.parentElement?.querySelector('input[type="file"]') as HTMLInputElement
                        const imageFile = imageInput?.files?.[0]
                        
                        const formData = new FormData(form)
                        
                        // Adicionar a imagem ao FormData se existir
                        if (imageFile) {
                          formData.append("image", imageFile)
                        }
                        
                        const name = formData.get("name")
                        const price = formData.get("price")
                        const category = formData.get("category")
                        const description = formData.get("description")
                        const preparationTime = formData.get("preparationTime")
                        
                        console.log("Dados do formulário de criação:", { name, price, category, description, preparationTime })
                        
                        if (name && price && category) {
                          handleAddProduct(formData)
                        } else {
                          alert("Por favor, preencha todos os campos obrigatórios")
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
                        src={editingProduct.image ? `https://ik.imagekit.io/fixarmenu/${editingProduct.image}` : `/placeholder.svg?height=60&width=60&query=${editingProduct.name}`}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=60&width=60&query=${editingProduct.name}`;
                        }}
                      />
                    </div>
                  </div>

                  <form id="edit-product-form" className="space-y-4">
                    <Input name="name" defaultValue={editingProduct.name} placeholder="Nome do produto" required />
                    <Input
                      name="price"
                      defaultValue={typeof editingProduct.price === 'string' ? editingProduct.price.replace("R$ ", "") : editingProduct.price}
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
                        defaultValue={editingProduct.description || ""}
                        key={`desc-${editingProduct.id}`} // Força re-render quando o produto muda
                      />
                    </div>

                    <Input
                      name="preparationTime"
                      placeholder="Tempo de preparo (ex: 15-20 min)"
                      defaultValue={editingProduct.preparationTime || "15-20 min"}
                      key={`prep-${editingProduct.id}`} // Força re-render quando o produto muda
                    />

                    {/* Status */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        name="available"
                        defaultValue={editingProduct.available ? "true" : "false"}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="true">✅ Ativo</option>
                        <option value="false">❌ Inativo</option>
                      </select>
                    </div>
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
                          available: formData.get("available") === "true",
                        }
                        console.log("Dados do formulário de edição:", data)
                        console.log("Produto sendo editado:", editingProduct)
                        console.log("Descrição no formulário:", formData.get("description"))
                        console.log("Tempo de preparo no formulário:", formData.get("preparationTime"))
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
                      src={deletingProduct.image ? `https://ik.imagekit.io/fixarmenu/${deletingProduct.image}` : `/placeholder.svg?height=80&width=80&query=${deletingProduct.name}`}
                      alt={deletingProduct.name}
                      className="w-20 h-20 object-cover rounded-lg mx-auto mb-4 border"
                      onError={(e) => {
                        e.currentTarget.src = `/placeholder.svg?height=80&width=80&query=${deletingProduct.name}`;
                      }}
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
                      onClick={() => handleDeleteProduct(deletingProduct)}
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

          {/* Calendário de Reservas */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendário Principal */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Calendário de Reservas</span>
                    </CardTitle>
                    <CardDescription>
                      Visualize todas as reservas de mesas em um calendário interativo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Calendário de Reservas</h3>
                      <p className="text-muted-foreground mb-4">
                        Visualize e gerencie todas as reservas de mesas em um calendário interativo
                      </p>
                      <Button 
                        onClick={() => window.open('/admin/calendario-reservas', '_blank')}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Abrir Calendário Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Painel Lateral */}
              <div className="space-y-6">
                {/* Estatísticas Rápidas */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-primary">Estatísticas de Reservas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-sm text-muted-foreground">Reservas Hoje</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-muted-foreground">Reservas Semana</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-primary">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Nova Reserva
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Gerenciar Mesas
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Relatórios
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
