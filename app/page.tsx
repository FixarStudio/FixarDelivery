"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence, easeOut } from "framer-motion"
import { Search, ShoppingCart, Moon, Sun, QrCode, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartModal } from "@/components/cart-modal"
import { ProductCard } from "@/components/product-card"
import { WhatsAppIntegration } from "@/components/whatsapp-integration"
import { MesaStatusBar } from "@/components/estabelecimento/mesa-status-bar"
import { MesaSelector } from "@/components/estabelecimento/mesa-selector"
import { CategoryTabs } from "@/components/category-tabs"

// Categorias base para inicialização

export default function EstabelecimentoPage() {
  const [isDark, setIsDark] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [currentTable, setCurrentTable] = useState<string | null>(null)
  const [showMesaSelector, setShowMesaSelector] = useState(false)
  
  // Estados para produtos dinâmicos
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [categories, setCategories] = useState([
    { id: "all", name: "🍽️ Todos", count: 0 },
    { id: "burgers", name: "🍔 Burgers", count: 0 },
    { id: "pizzas", name: "🍕 Pizzas", count: 0 },
    { id: "drinks", name: "🥤 Bebidas", count: 0 },
    { id: "desserts", name: "🍰 Sobremesas", count: 0 },
    { id: "salads", name: "🥗 Saladas", count: 0 },
  ])

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Restaurante Premium",
    logo: "/placeholder.svg?height=60&width=120",
    table: "Mesa 12",
    area: "Salão Principal",
  })

  const [customization, setCustomization] = useState({
    primaryColor: "#ea580c",
    secondaryColor: "#fb923c",
    accentColor: "#fed7aa",
    restaurantLogo: null,
  })

  // Buscar configurações do restaurante
  useEffect(() => {
    const loadRestaurantConfig = async () => {
      try {
        console.log("Carregando configurações do restaurante...")
        const response = await fetch("/api/customization", {
          cache: 'no-store' // Forçar sempre buscar dados frescos
        })
        console.log("Status da resposta:", response.status)
        
        if (response.ok) {
          const config = await response.json()
          console.log("Configurações carregadas:", config)
          
          const newName = config.restaurantName || "Restaurante Premium"
          console.log("Definindo nome do restaurante como:", newName)
          setRestaurantInfo(prev => ({
            ...prev,
            name: newName
          }))
          setCustomization({
            primaryColor: config.primaryColor || "#ea580c",
            secondaryColor: config.secondaryColor || "#fb923c",
            accentColor: config.accentColor || "#fed7aa",
            restaurantLogo: config.restaurantLogo || null,
          })
          
          console.log("Nome do restaurante definido como:", config.restaurantName)
        } else {
          console.error("Erro na resposta da API:", response.status)
        }
      } catch (error) {
        console.error("Erro ao carregar configurações do restaurante:", error)
      }
    }
    
    loadRestaurantConfig()
  }, [])

  // Detectar mesa pela URL e localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    console.log("Detectando mesa...")
    const urlParams = new URLSearchParams(window.location.search)
    const mesa = urlParams.get("mesa")
    const savedMesa = localStorage.getItem("currentTable")
    
    console.log("Mesa da URL:", mesa)
    console.log("Mesa salva:", savedMesa)
    
    if (mesa) {
      console.log("Usando mesa da URL:", mesa)
      setCurrentTable(mesa)
      localStorage.setItem("currentTable", mesa)
      setShowMesaSelector(false)
    } else if (savedMesa) {
      console.log("Usando mesa salva:", savedMesa)
      setCurrentTable(savedMesa)
      setShowMesaSelector(false)
      // Atualizar URL sem recarregar a página
      const newUrl = `${window.location.pathname}?mesa=${savedMesa}`
      window.history.pushState({}, "", newUrl)
    } else {
      console.log("Nenhuma mesa encontrada, mostrando seletor")
      setShowMesaSelector(true)
    }
  }, [])

  const handleMesaSelect = (mesa: any) => {
    setCurrentTable(mesa.number)
    setShowMesaSelector(false)
    
    // Persistir mesa no localStorage
    localStorage.setItem("currentTable", mesa.number)
    
    // Atualizar URL sem recarregar a página
    const newUrl = `${window.location.pathname}?mesa=${mesa.number}`
    window.history.pushState({}, "", newUrl)
  }

  // Animação de entrada dos produtos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  }

  // Memoizar fetchProducts para evitar re-criação
  const fetchProductsMemo = useCallback(async () => {
    try {
      console.log("=== INICIANDO BUSCA DE PRODUTOS ===")
      console.log("Mesa atual na função:", currentTable)
      setLoadingProducts(true)
      
      const response = await fetch('/api/admin/products')
      console.log("Status da resposta de produtos:", response.status)
      
      if (response.ok) {
        const productsData = await response.json()
        console.log("Produtos recebidos:", productsData.length)
        console.log("Primeiro produto:", productsData[0])
        
        // Adicionar dados mockados para campos que não existem no banco
        const enhancedProducts = productsData.map((product: any) => ({
          ...product,
          rating: 4.5 + Math.random() * 0.5, // Rating entre 4.5 e 5.0
          reviews: Math.floor(Math.random() * 200) + 50, // Reviews entre 50 e 250
          badges: product.available ? ["Disponível"] : ["Indisponível"],
          preparationTime: product.preparationTime || (product.category === "drinks" ? "Imediato" : "15-20 min"),
        }))
        
        console.log("Produtos processados:", enhancedProducts.length)
        setProducts(enhancedProducts)
        
        // Salvar produtos no localStorage para esta mesa
        if (currentTable) {
          // Adicionar timestamp aos produtos
          const productsWithTimestamp = enhancedProducts.map((product: any) => ({
            ...product,
            _timestamp: Date.now()
          }))
          localStorage.setItem(`products_${currentTable}`, JSON.stringify(productsWithTimestamp))
          console.log("Produtos salvos no localStorage para mesa:", currentTable)
          console.log("Quantidade de produtos salvos:", productsWithTimestamp.length)
        } else {
          console.log("ERRO: currentTable é null, não salvando produtos")
        }
        
        // Atualizar contadores das categorias
        const categoryCounts = enhancedProducts.reduce((acc: any, product: any) => {
          acc[product.category] = (acc[product.category] || 0) + 1
          return acc
        }, {})
        
        setCategories(prev => prev.map(cat => ({
          ...cat,
          count: cat.id === "all" ? enhancedProducts.length : (categoryCounts[cat.id] || 0)
        })))
        
        console.log("Estado de produtos atualizado")
      } else {
        console.error('Erro ao buscar produtos:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoadingProducts(false)
      console.log("Busca de produtos finalizada")
    }
  }, [])

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    console.log("Filtrando produtos...")
    console.log("Total de produtos:", products.length)
    console.log("Categoria selecionada:", selectedCategory)
    console.log("Busca:", searchQuery)
    
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    
    console.log("Produtos filtrados:", filtered.length)
    return filtered
  }, [products, searchQuery, selectedCategory])
  




  // Adicionar ao carrinho
  const addToCart = (product: any, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prevCart, { ...product, quantity }]
    })
  }



  // Buscar produtos quando uma mesa estiver selecionada
  useEffect(() => {
    console.log("=== useEffect PRODUTOS ===")
    console.log("Mesa atual:", currentTable)
    console.log("Loading products:", loadingProducts)
    
    if (currentTable) {
      console.log("Mesa selecionada, verificando localStorage...")
      
      // Verificar se já temos produtos salvos para esta mesa
      const savedProducts = typeof window !== 'undefined' ? localStorage.getItem(`products_${currentTable}`) : null
      console.log("Produtos salvos encontrados:", !!savedProducts)
      
      if (savedProducts) {
        try {
          console.log("Carregando produtos salvos do localStorage")
          const parsedProducts = JSON.parse(savedProducts)
          console.log("Produtos carregados:", parsedProducts.length)
          setProducts(parsedProducts)
          
          // Atualizar contadores das categorias
          const categoryCounts = parsedProducts.reduce((acc: any, product: any) => {
            acc[product.category] = (acc[product.category] || 0) + 1
            return acc
          }, {})
          
          setCategories(prev => prev.map(cat => ({
            ...cat,
            count: cat.id === "all" ? parsedProducts.length : (categoryCounts[cat.id] || 0)
          })))
          
          console.log("Produtos carregados com sucesso do localStorage")
        } catch (error) {
          console.error("Erro ao carregar produtos do localStorage:", error)
          console.log("Buscando produtos do servidor...")
          fetchProductsMemo()
        }
      } else {
        console.log("Nenhum produto salvo, buscando do servidor...")
        fetchProductsMemo()
      }
    } else {
      console.log("Nenhuma mesa selecionada, limpando produtos")
      setProducts([])
    }
  }, [currentTable])

  // Função para liberar mesa ao sair da página (desabilitada temporariamente)
  const liberarMesaAoSair = async () => {
    // Desabilitado para evitar liberação automática
  }

  // Adicionar listener para liberar mesa ao sair da página
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleBeforeUnload = () => {
      // Só liberar se não estiver na página de admin
      if (!window.location.pathname.includes('/admin')) {
        liberarMesaAoSair()
      }
    }

    const handleVisibilityChange = () => {
      // Só liberar se não estiver na página de admin
      if (document.visibilityState === 'hidden' && !window.location.pathname.includes('/admin')) {
        liberarMesaAoSair()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentTable])

  // Função para verificar se a mesa ainda está ocupada
  const verificarStatusMesa = async () => {
    if (currentTable) {
      try {
        const response = await fetch('/api/mesas')
        if (response.ok) {
          const mesas = await response.json()
          const mesaAtual = mesas.find((mesa: any) => mesa.number === currentTable)
          
          if (mesaAtual && mesaAtual.status === "free") {
            setCurrentTable(null)
            localStorage.removeItem("currentTable")
            window.history.pushState({}, "", window.location.pathname)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status da mesa:', error)
      }
    }
  }

  // Verificar status da mesa periodicamente
  useEffect(() => {
    if (currentTable) {
      const interval = setInterval(verificarStatusMesa, 10000) // Verificar a cada 10 segundos
      return () => clearInterval(interval)
    }
  }, [currentTable])

  // Calcular total do carrinho
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  // Aplicar tema sem causar re-renderizações desnecessárias
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDark])

  // Limpar produtos antigos do localStorage (manter apenas 24h)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000 // 24 horas em millisegundos
    
    // Limpar produtos salvos há mais de 24h
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('products_')) {
        try {
          const products = JSON.parse(localStorage.getItem(key) || '[]')
          if (products.length > 0 && products[0]._timestamp) {
            if (now - products[0]._timestamp > oneDay) {
              localStorage.removeItem(key)
              console.log('Produtos antigos removidos:', key)
            }
          }
        } catch (error) {
          // Se não conseguir parsear, remover a chave
          localStorage.removeItem(key)
        }
      }
    })
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-gray-900" : "bg-gradient-to-br from-orange-50 to-red-50"}`}>
      {/* Header Premium */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={customization.restaurantLogo || restaurantInfo.logo || "/placeholder.svg"}
                alt="Logo"
                className="h-10 w-auto rounded-lg shadow-sm"
              />
              <div>
                <h1 
                  className="text-xl font-bold text-gray-900 dark:text-white"
                  style={{ color: customization.primaryColor }}
                >
                  {restaurantInfo.name}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  {currentTable ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span>Mesa {currentTable}</span>
                      <span>•</span>
                      <span>{restaurantInfo.area}</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      <span>Estabelecimento</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {currentTable && (
                <Button
                  variant="outline"
                  size="sm"
                  style={{ 
                    borderColor: customization.primaryColor,
                    color: customization.primaryColor
                  }}
                  onClick={async () => {
                    // Liberar mesa atual se existir
                    if (currentTable) {
                      try {
                        // Encontrar a mesa atual no banco
                        const response = await fetch('/api/mesas')
                        if (response.ok) {
                          const mesas = await response.json()
                          const mesaAtual = mesas.find((mesa: any) => mesa.number === currentTable)
                          
                          if (mesaAtual && mesaAtual.status === "occupied") {
                            // Liberar a mesa
                            const releaseResponse = await fetch('/api/mesas/release', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                mesaId: mesaAtual.id
                              }),
                            })
                            
                            if (releaseResponse.ok) {
                              console.log('Mesa liberada com sucesso')
                              // Mostrar notificação visual
                              alert('Mesa liberada com sucesso!')
                            } else {
                              console.error('Erro ao liberar mesa')
                              alert('Erro ao liberar mesa')
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Erro ao liberar mesa:', error)
                      }
                    }
                    
                    setShowMesaSelector(true)
                    // Limpar mesa atual
                    setCurrentTable(null)
                    localStorage.removeItem("currentTable")
                    // Limpar produtos da mesa anterior
                    if (currentTable) {
                      localStorage.removeItem(`products_${currentTable}`)
                    }
                    // Limpar URL
                    window.history.pushState({}, "", window.location.pathname)
                  }}
                  className="flex items-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Trocar Mesa</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mesa Selector */}
      {showMesaSelector && (
        <div className="container mx-auto px-4 py-8">
          <MesaSelector onMesaSelect={handleMesaSelect} currentTable={currentTable} />
        </div>
      )}

      {/* Main Content - só mostra quando uma mesa está selecionada */}
      {!showMesaSelector && (
        <>
          {/* Mesa Status Bar */}
          <MesaStatusBar currentTable={currentTable} />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="container mx-auto px-4 py-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar pratos, bebidas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
                style={{
                  '--ring-color': customization.primaryColor
                } as React.CSSProperties}
                className={`pl-10 transition-all duration-300 ${
                  isSearchExpanded ? "ring-2 shadow-lg" : ""
                } bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm`}
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="container mx-auto px-4 pb-4"
          >
            <CategoryTabs 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              customization={customization}
            />
          </motion.div>

          {/* Products Grid */}
          <div className="container mx-auto px-4 pb-24">
            <div className="text-center py-2 text-xs text-gray-500 bg-yellow-100 p-2 rounded mb-4">
              Debug: Mesa {currentTable} | Loading: {loadingProducts.toString()} | Produtos: {products.length} | Filtrados: {filteredProducts.length}
              <br />
              localStorage: {typeof window !== 'undefined' && localStorage.getItem(`products_${currentTable}`) ? 'Sim' : 'Não'}
            </div>
            {!currentTable ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="text-6xl mb-4">🪑</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Selecione uma mesa</h3>
                <p className="text-gray-400">Escolha uma mesa para ver o cardápio</p>
              </motion.div>
            ) : loadingProducts ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Carregando produtos...</h3>
                <p className="text-gray-600 dark:text-gray-400">Aguarde enquanto buscamos os produtos disponíveis</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.8 }}>
                        <ProductCard 
                          product={product} 
                          onAddToCart={addToCart} 
                          customization={customization}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredProducts.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
                    <p className="text-gray-400">Tente buscar por outro termo ou categoria</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartItemsCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
                          <Button
                onClick={() => setIsCartOpen(true)}
                style={{
                  background: `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`,
                  borderColor: customization.primaryColor
                }}
                className="w-full h-14 text-white font-semibold text-lg shadow-2xl rounded-2xl relative overflow-hidden group hover:opacity-90 transition-opacity"
              >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    <motion.div
                      key={cartItemsCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xs h-4 w-4"
                    >
                      {cartItemsCount}
                    </motion.div>
                  </div>
                  <span>Ver Carrinho</span>
                </div>
                <motion.span key={cartTotal} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-bold">
                  R$ {cartTotal.toFixed(2)}
                </motion.span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={(id, quantity) => {
          setCart((prevCart) =>
            prevCart
              .map((item) => (item.id === id ? { ...item, quantity } : item))
              .filter((item) => item.quantity > 0)
          )
        }}
        onRemoveItem={(id) => {
          setCart((prevCart) => prevCart.filter((item) => item.id !== id))
        }}
        onCheckout={() => {
          setCart([])
          setIsCartOpen(false)
        }}
      />

      {/* WhatsApp Integration */}
      <WhatsAppIntegration />
    </div>
  )
}
