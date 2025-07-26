import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: "https://ik.imagekit.io/fixarmenu",
});

// Debug: verificar se as credenciais estão carregadas
console.log("ImageKit config para logo:", {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ? "Configurada" : "Não configurada",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? "Configurada" : "Não configurada",
  urlEndpoint: "https://ik.imagekit.io/fixarmenu"
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File;
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB" }, { status: 400 });
    }

    // Converter arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `restaurant-logo-${Date.now()}-${file.name}`;

    // Verificar se as credenciais do ImageKit estão configuradas
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.log("Credenciais do ImageKit não configuradas, salvando apenas o nome do arquivo");
      const mockUrl = `https://ik.imagekit.io/fixarmenu/restaurant-logos/${fileName}`;
      
      // Salvar URL mock no banco de dados
      const customization = await prisma.customization.upsert({
        where: { id: 1 },
        update: {
          settings: {
            restaurantLogo: mockUrl,
          },
          updatedAt: new Date(),
        },
        create: {
          id: 1,
          settings: {
            restaurantLogo: mockUrl,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        logoUrl: mockUrl,
        message: "Logo do restaurante atualizada com sucesso! (Modo de desenvolvimento)",
      });
    }

    // Upload para ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: "/restaurant-logos",
      tags: ["restaurant-logo"],
    });

    if (!uploadResponse.url) {
      throw new Error("Falha no upload para ImageKit");
    }

    // Salvar URL da logo no banco de dados
    const customization = await prisma.customization.upsert({
      where: { id: 1 },
      update: {
        settings: {
          restaurantLogo: uploadResponse.url,
        },
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        settings: {
          restaurantLogo: uploadResponse.url,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      logoUrl: uploadResponse.url,
      message: "Logo do restaurante atualizada com sucesso!",
    });

  } catch (error: any) {
    console.error("Erro ao fazer upload da logo:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da logo", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Buscar logo atual do restaurante
    const customization = await prisma.customization.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (customization && customization.settings) {
      const settings = customization.settings as any;
      return NextResponse.json({
        logoUrl: settings.restaurantLogo || null,
      });
    }

    return NextResponse.json({ logoUrl: null });
  } catch (error: any) {
    console.error("Erro ao buscar logo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logo" },
      { status: 500 }
    );
  }
} 