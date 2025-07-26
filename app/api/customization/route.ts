import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("API /api/customization chamada")
    
    // Buscar customização salva no banco
    console.log("Buscando customização no banco...")
    const customization = await prisma.customization.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log("Resultado da busca:", customization)
    
    if (customization && customization.settings) {
      console.log("Configurações encontradas no banco:", customization.settings)
      const settings = customization.settings as any
      console.log("Nome do restaurante no banco:", settings.restaurantName)
      return NextResponse.json(customization.settings);
    } else {
      console.log("Nenhuma configuração encontrada no banco, usando padrão")
      // Retornar configuração padrão se não houver customização salva
      const defaultSettings = {
        restaurantName: "Restaurante Premium",
        restaurantLogo: null,
        tagline: "A melhor experiência gastronômica",
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
      };
      
      console.log("Retornando configurações padrão:", defaultSettings)
      return NextResponse.json(defaultSettings);
    }
  } catch (error: any) {
    console.error("Erro ao buscar customização:", error);
    // Em caso de erro, retornar configurações padrão
    const defaultSettings = {
      restaurantName: "Restaurante Premium",
      tagline: "A melhor experiência gastronômica",
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
    };
    
    console.log("Erro no banco, retornando configurações padrão:", defaultSettings)
    return NextResponse.json(defaultSettings);
  }
} 