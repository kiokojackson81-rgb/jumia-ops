-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "lastBuyingPrice" INTEGER
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Attendant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AttendantShop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attendantId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    CONSTRAINT "AttendantShop_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "Attendant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendantShop_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AttendantShop_attendantId_shopId_key" ON "AttendantShop"("attendantId", "shopId");
