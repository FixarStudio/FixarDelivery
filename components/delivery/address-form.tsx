"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddressFormProps {
  onAddressSubmit: (address: any) => void
}

export function AddressForm({ onAddressSubmit }: AddressFormProps) {
  const [formData, setFormData] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    setFormData((prev) => ({ ...prev, cep: cleanCep }))

    if (cleanCep.length === 8) {
      setIsLoadingCep(true)
      try {
        // Simulação de API de CEP
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - em produção usar API real como ViaCEP
        const mockAddress = {
          street: "Rua das Flores",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
        }

        setFormData((prev) => ({
          ...prev,
          ...mockAddress,
        }))
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.cep || formData.cep.length !== 8) {
      newErrors.cep = "CEP deve ter 8 dígitos"
    }
    if (!formData.street.trim()) {
      newErrors.street = "Rua é obrigatória"
    }
    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório"
    }
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = "Bairro é obrigatório"
    }
    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onAddressSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="cep">CEP *</Label>
          <div className="relative">
            <Input
              id="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              maxLength={8}
              className={errors.cep ? "border-red-500" : ""}
            />
            {isLoadingCep && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          {errors.cep && <p className="text-sm text-red-500 mt-1">{errors.cep}</p>}
        </div>

        <div className="md:col-span-1">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            placeholder="123"
            value={formData.number}
            onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
            className={errors.number ? "border-red-500" : ""}
          />
          {errors.number && <p className="text-sm text-red-500 mt-1">{errors.number}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="street">Rua/Avenida *</Label>
        <Input
          id="street"
          placeholder="Rua das Flores"
          value={formData.street}
          onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
          className={errors.street ? "border-red-500" : ""}
        />
        {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
      </div>

      <div>
        <Label htmlFor="complement">Complemento</Label>
        <Input
          id="complement"
          placeholder="Apartamento, bloco, etc."
          value={formData.complement}
          onChange={(e) => setFormData((prev) => ({ ...prev, complement: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            placeholder="Centro"
            value={formData.neighborhood}
            onChange={(e) => setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))}
            className={errors.neighborhood ? "border-red-500" : ""}
          />
          {errors.neighborhood && <p className="text-sm text-red-500 mt-1">{errors.neighborhood}</p>}
        </div>

        <div>
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            placeholder="São Paulo"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl"
        disabled={isLoadingCep}
      >
        <MapPin className="h-5 w-5 mr-2" />
        Confirmar Endereço
      </Button>
    </form>
  )
}
