"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: "Lucas Silva",
    numero_cliente: "558396881746",
    status: "Entregue",
    pedido_id: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("http://localhost:5678/webhook-test/pedido-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        status: 0,
        data: { message: "Erro de conexão" }
      })
    } finally {
      setLoading(false)
    }
  }

  const testEndpoint = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("http://localhost:5678/webhook-test/pedido-status")
      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        status: 0,
        data: { message: "Erro de conexão" }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Teste do Webhook - Atualização de Status
          </h1>

          <div className="grid gap-6">
            {/* Teste do Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Teste do Endpoint</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Teste se o endpoint do webhook está funcionando corretamente.
                </p>
                <Button onClick={testEndpoint} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    "Testar Endpoint"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Formulário de Teste */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Simular Webhook do n8n</span>
                </CardTitle>
              </CardHeader>
                             <CardContent>
                 <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                   <p className="text-sm text-blue-700 dark:text-blue-300">
                     <strong>Nota:</strong> O webhook atualiza os <strong>dados reais do cliente</strong> e o <strong>status do pedido</strong>. 
                     O status deve ser enviado em português (como aparece na interface) e será convertido internamente.
                   </p>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                       <Label htmlFor="nome">Nome do Cliente</Label>
                       <Input
                         id="nome"
                         value={formData.nome}
                         onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                         placeholder="Lucas Silva"
                         required
                       />
                       <p className="text-xs text-gray-500 mt-1">Nome real do cliente</p>
                     </div>
                     <div>
                       <Label htmlFor="numero_cliente">Número do Cliente</Label>
                       <Input
                         id="numero_cliente"
                         value={formData.numero_cliente}
                         onChange={(e) => setFormData({ ...formData, numero_cliente: e.target.value })}
                         placeholder="558396881746"
                         required
                       />
                       <p className="text-xs text-gray-500 mt-1">Número real do cliente</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                                                 <SelectContent>
                           <SelectItem value="Aguardando Preparo">Aguardando Preparo</SelectItem>
                           <SelectItem value="Em Preparação">Em Preparação</SelectItem>
                           <SelectItem value="Pronto para Entrega">Pronto para Entrega</SelectItem>
                           <SelectItem value="Entregue">Entregue</SelectItem>
                           <SelectItem value="Cancelado">Cancelado</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pedido_id">ID do Pedido</Label>
                      <Input
                        id="pedido_id"
                        value={formData.pedido_id}
                        onChange={(e) => setFormData({ ...formData, pedido_id: e.target.value })}
                        placeholder="UUID do pedido"
                        required
                      />
                    </div>
                  </div>

                                     <Button type="submit" disabled={loading || !formData.pedido_id || !formData.nome || !formData.numero_cliente}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Webhook"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Resultado */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Resultado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className={result.success ? "border-green-500" : "border-red-500"}>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>Status HTTP:</strong> {result.status}</p>
                        <p><strong>Sucesso:</strong> {result.success ? "Sim" : "Não"}</p>
                        <p><strong>Mensagem:</strong> {result.data.message}</p>
                        {result.data.pedido && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <p><strong>Pedido Atualizado:</strong></p>
                            <pre className="text-sm mt-2">
                              {JSON.stringify(result.data.pedido, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Instruções */}
            <Card>
              <CardHeader>
                <CardTitle>Como usar no n8n</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">URL do Webhook:</h4>
                                         <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                       http://localhost:5678/webhook-test/pedido-status
                     </code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Exemplo de JSON:</h4>
                                         <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
 {`{
   "nome": "Lucas Silva",
   "numero_cliente": "558396881746",
   "status": "Entregue",
   "pedido_id": "123456"
 }`}
                     </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Status Permitidos:</h4>
                                         <ul className="list-disc list-inside space-y-1 text-sm">
                       <li><code>Aguardando Preparo</code> - Pedido recebido e aguardando preparação</li>
                       <li><code>Em Preparação</code> - Pedido sendo preparado na cozinha</li>
                       <li><code>Pronto para Entrega</code> - Pedido pronto e aguardando entrega</li>
                       <li><code>Entregue</code> - Pedido entregue com sucesso</li>
                       <li><code>Cancelado</code> - Pedido cancelado</li>
                     </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 