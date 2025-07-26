import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: "https://ik.imagekit.io/fixarmenu",
});

export async function GET() {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  return NextResponse.json(authenticationParameters);
} 