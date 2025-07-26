                    import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ImageKit from "imagekit";

export const config = {
  api: {
    bodyParser: false,
  },
};

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: "https://ik.imagekit.io/fixarmenu",
});

// Debug: verificar se as credenciais estão carregadas
console.log("ImageKit config:", {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ? "Configurada" : "Não configurada",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? "Configurada" : "Não configurada",
  urlEndpoint: "https://ik.imagekit.io/fixarmenu"
});

export async function GET() {
  try {
    console.log("Buscando produtos...");
    const products = await prisma.product.findMany({
      include: { extras: true }
    });
    
    console.log(`Produtos encontrados: ${products.length}`);
    
    // Log detalhado dos produtos
    if (products.length > 0) {
      console.log("Primeiro produto:", {
        id: products[0].id,
        name: products[0].name,
        category: products[0].category,
        available: products[0].available,
        price: products[0].price
      });
    }
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar produtos",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Iniciando POST /api/admin/products");
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const available = formData.get("available") as string;
    const category = formData.get("category") as string;
    const preparationTime = formData.get("preparationTime") as string;
    const file = formData.get("image");
    console.log("Dados recebidos:", { name, description, price, available, category, preparationTime });
    console.log("Tipo do preparationTime:", typeof preparationTime);
    console.log("file", file);
    let imagePath = "";
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      try {
        // Verificar se as credenciais do ImageKit estão configuradas
        if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
          console.log("Credenciais do ImageKit não configuradas, salvando apenas o nome do arquivo");
          imagePath = (file as any).name || "placeholder.jpg";
        } else {
          // Fazer upload real para o ImageKit
          console.log("Iniciando upload para ImageKit...");
          const arrayBuffer = await (file as Blob).arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          console.log("Buffer criado, tamanho:", buffer.length);
          
          const uploadResult = await imagekit.upload({
            file: buffer,
            fileName: (file as any).name || "upload.jpg",
            folder: "products", // Organizar em uma pasta
          });
          imagePath = uploadResult.filePath;
          console.log("Upload realizado com sucesso:", imagePath);
          console.log("Resultado completo:", uploadResult);
        }
      } catch (uploadError: any) {
        console.error("Erro no upload da imagem:", uploadError);
        // Se houver erro no upload, salva apenas o nome do arquivo
        imagePath = (file as any).name || "placeholder.jpg";
      }
    }

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        image: imagePath,
        available: available === "true",
        category,
        preparationTime: preparationTime || "15-20 min",
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json({ 
      error: error?.message || "Erro ao criar produto.",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, price, image, available, category, preparationTime, extras } = await req.json();
    console.log("Dados recebidos na API PUT:", { id, name, description, price, image, available, category, preparationTime });
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        available,
        category,
        preparationTime: preparationTime || "15-20 min",
        extras: {
          deleteMany: {},
          create: extras
            ? extras.map((extra: any) => ({
                name: extra.name,
                price: extra.price,
              }))
            : [],
        },
      },
      include: { extras: true }
    });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erro ao editar produto:", error);
    return NextResponse.json({ 
      error: error?.message || "Erro ao editar produto.",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 