"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, User, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Credenciais de demonstração (em produção, isso seria validado no backend)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpar erro quando usuário começar a digitar
    if (error) setError("")
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Validar credenciais
    if (formData.username === ADMIN_CREDENTIALS.username && formData.password === ADMIN_CREDENTIALS.password) {
      // Criar token de sessão (24 horas)
      const token = {
        value: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expires: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 horas
      }

      const user = {
        username: formData.username,
        role: "admin",
        loginTime: new Date().toISOString(),
      }

      // Salvar no localStorage
      localStorage.setItem("admin_token", JSON.stringify(token))
      localStorage.setItem("admin_user", JSON.stringify(user))

      // Redirecionar para admin
      router.push("/admin")
    } else {
      setError("Usuário ou senha incorretos")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 dark:from-gray-800 dark:to-gray-700"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Acesso Administrativo</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Entre com suas credenciais para acessar o painel</p>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Demo Credentials Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Demo:</strong> usuário: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code>{" "}
                | senha: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin123</code>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Digite seu usuário"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Digite sua senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.username || !formData.password}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">Entrar no Painel</span>
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">🔒 Acesso seguro e criptografado</p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Menu Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Voltar ao Cardápio
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
