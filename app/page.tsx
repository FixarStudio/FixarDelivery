"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, easeOut } from "framer-motion"
import { Search, ShoppingCart, Moon, Sun, QrCode, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartModal } from "@/components/cart-modal"
import { ProductCard } from "@/components/product-card"
import { WhatsAppIntegration } from "@/components/whatsapp-integration"
import { MesaStatusBar } from "@/components/estabelecimento/mesa-status-bar"
import { MesaSelector } from "@/components/estabelecimento/mesa-selector"

// Mock data para demonstração
const categories = [
  { id: "burgers", name: "🍔 Burgers", count: 12 },
  { id: "pizzas", name: "🍕 Pizzas", count: 8 },
  { id: "drinks", name: "🥤 Bebidas", count: 15 },
  { id: "desserts", name: "🍰 Sobremesas", count: 6 },
  { id: "salads", name: "🥗 Saladas", count: 5 },
]

const products = [
  {
    id: 1,
    name: "X-Burger Especial",
    description: "Hambúrguer artesanal 180g, queijo cheddar, bacon, alface, tomate e molho especial",
    price: 28.9,
    image: "/placeholder.svg?height=200&width=300",
    category: "burgers",
    rating: 4.8,
    reviews: 124,
    badges: ["Mais Pedido", "Premium"],
    preparationTime: "15-20 min",
    available: true,
  },
  {
    id: 2,
    name: "Pizza Margherita",
    description: "Molho de tomate, mussarela de búfala, manjericão fresco e azeite extravirgem",
    price: 45.9,
    image: "/placeholder.svg?height=200&width=300",
    category: "pizzas",
    rating: 4.9,
    reviews: 89,
    badges: ["Vegetariano", "Novo"],
    preparationTime: "25-30 min",
    available: true,
  },
  {
    id: 3,
    name: "Coca-Cola 350ml",
    description: "Refrigerante gelado servido na garrafa",
    price: 6.5,
    image: "/placeholder.svg?height=200&width=300",
    category: "drinks",
    rating: 4.5,
    reviews: 256,
    badges: [],
    preparationTime: "Imediato",
    available: true,
  },
  {
    id: 4,
    name: "Petit Gateau",
    description: "Bolinho de chocolate quente com sorvete de baunilha e calda de chocolate",
    price: 18.9,
    image: "/placeholder.svg?height=200&width=300",
    category: "desserts",
    rating: 4.7,
    reviews: 67,
    badges: ["Sobremesa do Chef"],
    preparationTime: "10-15 min",
    available: true,
  },
]

export default function EstabelecimentoPage() {
  const [isDark, setIsDark] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [currentTable, setCurrentTable] = useState<string | null>(null)
  const [showMesaSelector, setShowMesaSelector] = useState(false)

  const [restaurantInfo] = useState({
    name: "Restaurante Premium",
    logo: "/placeholder.svg?height=60&width=120",
    table: "Mesa 12",
    area: "Salão Principal",
  })

  // Detectar mesa pela URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mesa = urlParams.get("mesa")
    if (mesa) {
      setCurrentTable(mesa)
      setShowMesaSelector(false)
    } else {
      setShowMesaSelector(true)
    }
  }, [])

  const handleMesaSelect = (mesa: any) => {
    setCurrentTable(mesa.number)
    setShowMesaSelector(false)
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

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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

  // Calcular total do carrinho
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-gray-900" : "bg-gradient-to-br from-orange-50 to-red-50"}`}
    >
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
                src={restaurantInfo.logo || "/placeholder.svg"}
                alt="Logo"
                className="h-10 w-auto rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{restaurantInfo.name}</h1>
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
                  onClick={() => setShowMesaSelector(true)}
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
                className={`pl-10 transition-all duration-300 ${
                  isSearchExpanded ? "ring-2 ring-orange-500 shadow-lg" : ""
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
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <TabsTrigger value="all" className="whitespace-nowrap">
                  🍽️ Todos ({products.length})
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                    {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Products Grid */}
          <div className="container mx-auto px-4 pb-24">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.8 }}>
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 dark:text-gray-400">Tente buscar por outro termo ou categoria</p>
              </motion.div>
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
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg shadow-2xl rounded-2xl relative overflow-hidden group"
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
