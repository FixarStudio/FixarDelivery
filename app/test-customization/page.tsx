"use client"

import { useState, useEffect } from "react"

export default function TestCustomization() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/customization")
        console.log("Status da resposta:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Dados recebidos:", data)
          setConfig(data)
        } else {
          setError(`Erro ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        console.error("Erro ao testar API:", err)
        setError("Erro ao conectar com a API")
      } finally {
        setLoading(false)
      }
    }

    testAPI()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Teste da API de Customização</h1>
      
      {loading && <p>Carregando...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {config && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Sucesso!</strong> Configurações carregadas
        </div>
      )}
      
      {config && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Configurações:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 