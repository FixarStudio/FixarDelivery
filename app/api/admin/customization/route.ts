import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar customização salva no banco
    const customization = await prisma.customization.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (customization) {
      return NextResponse.json(customization.settings);
    } else {
      // Retornar configuração padrão se não houver customização salva
      const defaultSettings = {
        restaurantName: "Restaurante Premium",
        tagline: "",
        primaryColor: "#ea580c",
        secondaryColor: "#fb923c",
        accentColor: "#fed7aa",
        primaryFont: "Inter",
        secondaryFont: "Inter",
        fontSize: 16,
        fontWeight: "400",
        borderRadius: 12,
        shadowIntensity: 3,
      };
      
      return NextResponse.json(defaultSettings);
    }
  } catch (error: any) {
    console.error("Erro ao buscar customização:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar customização",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();
    
    // Salvar ou atualizar customização
    const customization = await prisma.customization.upsert({
      where: { id: 1 }, // Usar ID fixo para sempre atualizar o mesmo registro
      update: { 
        settings: settings,
        updatedAt: new Date()
      },
      create: {
        id: 1,
        settings: settings,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(customization.settings);
  } catch (error: any) {
    console.error("Erro ao salvar customização:", error);
    return NextResponse.json({ 
      error: "Erro ao salvar customização",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
} 