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
        borderRadius: 12,
        shadowIntensity: 3,
        whatsappNumber: "5511999999999", // Número padrão do WhatsApp
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
      borderRadius: 12,
      shadowIntensity: 3,
      whatsappNumber: "5511999999999", // Número padrão do WhatsApp
    };
    
    console.log("Erro no banco, retornando configurações padrão:", defaultSettings)
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Recebendo configurações para salvar:", body);
    
    // Buscar configuração existente ou criar nova
    let customization = await prisma.customization.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    let settings = {};
    if (customization && customization.settings) {
      settings = customization.settings as any;
    } else {
      // Configurações padrão
      settings = {
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
        borderRadius: 12,
        shadowIntensity: 3,
        whatsappNumber: "5511999999999",
      };
    }
    
    // Atualizar configurações com os novos dados
    const updatedSettings = {
      ...settings,
      ...body
    };
    
    console.log("Configurações atualizadas:", updatedSettings);
    
    // Salvar no banco
    const savedCustomization = await prisma.customization.create({
      data: {
        settings: updatedSettings
      }
    });
    
    console.log("Configurações salvas com sucesso:", savedCustomization);
    
    return NextResponse.json({ 
      success: true, 
      message: "Configurações salvas com sucesso!",
      data: updatedSettings
    });
    
  } catch (error: any) {
    console.error("Erro ao salvar customização:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao salvar configurações",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 