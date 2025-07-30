/*
  Warnings:

  - Added the required column `items` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT 'Cliente',
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryType" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "observations" TEXT;

-- CreateTable
CREATE TABLE "Customization" (
    "id" SERIAL NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
);
