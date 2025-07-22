"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, Moon, Sun, MapPin, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DeliveryCartModal } from "@/components/delivery/delivery-cart-modal"
import { AddressForm } from "@/components/delivery/address-form"
import { ProductCard } from "@/components/product-card"

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
    extras: [
      { id: 1, name: "Bacon Extra", price: 3.5 },
      { id: 2, name: "Queijo Extra", price: 2.5 },
      { id: 3, name: "Cebola Caramelizada", price: 2.0 },
    ],
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
    extras: [
      { id: 4, name: "Borda Recheada", price: 8.0 },
      { id: 5, name: "Azeitona Extra", price: 3.0 },
      { id: 6, name: "Rúcula", price: 4.0 },
    ],
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
    extras: [],
  },
]

const deliveryConfig = {
  freeShippingMinimum: 50.0,
  baseShippingCost: 8.0,
  pricePerKm: 2.5,
  baseDeliveryTime: 30,
  timePerKm: 5,
}

export default function DeliveryPage() {
  const [isDark, setIsDark] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [address, setAddress] = useState<any>(null)
  const [shippingCost, setShippingCost] = useState(0)
  const [deliveryTime, setDeliveryTime] = useState(30)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedExtras, setSelectedExtras] = useState<number[]>([])

  const [restaurantInfo] = useState({
    name: "Restaurante Premium",
    logo: "/placeholder.svg?height=60&width=120",
    phone: "5511999999999",
    address: "Rua Principal, 123 - Centro",
  })

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calcular frete baseado no endereço
  const calculateShipping = (userAddress: any) => {
    if (!userAddress) return 0

    // Simulação de cálculo por distância
    const distance = Math.random() * 10 + 2 // 2-12km simulado
    const cost = deliveryConfig.baseShippingCost + distance * deliveryConfig.pricePerKm
    const time = deliveryConfig.baseDeliveryTime + distance * deliveryConfig.timePerKm

    setShippingCost(cost)
    setDeliveryTime(Math.round(time))

    return cost
  }

  // Adicionar produto ao carrinho com extras
  const addToCart = (product: any, quantity = 1, extras: any[] = []) => {
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0)
    const finalPrice = product.price + extrasTotal

    const cartItem = {
      ...product,
      quantity,
      extras,
      finalPrice,
      cartId: Date.now() + Math.random(), // ID único para o carrinho
    }

    setCart((prevCart) => [...prevCart, cartItem])
    setSelectedProduct(null)
    setSelectedExtras([])
  }

  // Abrir modal de produto com extras
  const openProductModal = (product: any) => {
    setSelectedProduct(product)
    setSelectedExtras([])
  }

  // Calcular totais
  const subtotal = cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0)
  const finalShippingCost = subtotal >= deliveryConfig.freeShippingMinimum ? 0 : shippingCost
  const total = subtotal + finalShippingCost
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
                  <Truck className="h-4 w-4" />
                  <span>Delivery</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/estabelecimento")}
                className="hidden sm:flex items-center space-x-2"
              >
                <span>🏪</span>
                <span>Acessar Estabelecimento</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Address Section */}
      {!address && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span>Onde você está?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm
                onAddressSubmit={(addr) => {
                  setAddress(addr)
                  calculateShipping(addr)
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {address && (
        <>
          {/* Address Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-4"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {address.street}, {address.number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.neighborhood} - {address.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Entrega</p>
                    <p className="font-bold text-green-600">
                      {finalShippingCost === 0 ? "GRÁTIS" : `R$ ${finalShippingCost.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <ProductCard product={product} onAddToCart={() => openProductModal(product)} isDelivery={true} />
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
        {cartItemsCount > 0 && address && (
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
                <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="font-bold">
                  R$ {total.toFixed(2)}
                </motion.span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal with Extras */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="rounded-full">
                  ×
                </Button>
              </div>

              <img
                src={selectedProduct.image || "/placeholder.svg"}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedProduct.description}</p>

              {selectedProduct.extras && selectedProduct.extras.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Extras</h3>
                  <div className="space-y-3">
                    {selectedProduct.extras.map((extra: any) => (
                      <div key={extra.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`extra-${extra.id}`}
                            checked={selectedExtras.includes(extra.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedExtras([...selectedExtras, extra.id])
                              } else {
                                setSelectedExtras(selectedExtras.filter((id) => id !== extra.id))
                              }
                            }}
                          />
                          <Label htmlFor={`extra-${extra.id}`} className="text-sm">
                            {extra.name}
                          </Label>
                        </div>
                        <span className="text-sm font-medium text-green-600">+ R$ {extra.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                <span className="text-lg font-bold text-orange-600">
                  R${" "}
                  {(
                    selectedProduct.price +
                    selectedExtras.reduce((sum, extraId) => {
                      const extra = selectedProduct.extras?.find((e: any) => e.id === extraId)
                      return sum + (extra?.price || 0)
                    }, 0)
                  ).toFixed(2)}
                </span>
              </div>

              <Button
                onClick={() => {
                  const selectedExtrasData =
                    selectedProduct.extras?.filter((extra: any) => selectedExtras.includes(extra.id)) || []
                  addToCart(selectedProduct, 1, selectedExtrasData)
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delivery Cart Modal */}
      <DeliveryCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        address={address}
        shippingCost={finalShippingCost}
        deliveryTime={deliveryTime}
        restaurantInfo={restaurantInfo}
        subtotal={subtotal}
        total={total}
      />
    </div>
  )
}
