// scripts/seed.ts
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

async function main() {
  console.log("🧹 Clearing existing data (safe order)...");
  await prisma.attendantShop.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attendant.deleteMany();
  await prisma.shop.deleteMany();

  console.log("🏪 Creating shops...");
  const shopA = await prisma.shop.create({
    data: {
      name: "Baraka Electronics",
      apiKey: "BARAKA_API_KEY",
      apiSecret: "BARAKA_API_SECRET",
    },
  });
  const shopB = await prisma.shop.create({
    data: {
      name: "Bright Solar",
      apiKey: "BRIGHT_API_KEY",
      apiSecret: "BRIGHT_API_SECRET",
    },
  });

  console.log("👤 Creating attendants...");
  const attAlice = await prisma.attendant.create({
    data: { name: "Alice Kenya", code: "ALC001", active: true },
  });
  const attBrian = await prisma.attendant.create({
    data: { name: "Brian M", code: "BRN777", active: true },
  });
  const attCarol = await prisma.attendant.create({
    data: { name: "Carol O", code: "CRL555", active: true },
  });

  console.log("🔗 Assigning attendants to shops...");
  await prisma.attendantShop.createMany({
    data: [
      { attendantId: attAlice.id, shopId: shopA.id }, // Alice → Baraka
      { attendantId: attBrian.id, shopId: shopB.id }, // Brian → Bright
      { attendantId: attCarol.id, shopId: shopA.id }, // Carol → both shops
      { attendantId: attCarol.id, shopId: shopB.id },
    ],
  });

  console.log("📦 Seeding products (some with known lastBuyingPrice)...");
  const p1Slug = normalizeName("Premier 3.2kW Inverter");
  const p2Slug = normalizeName("Monocrystalline 200W Panel");
  const p3Slug = normalizeName("12V 200Ah Deep Cycle Battery");
  const p4Slug = normalizeName("Charge Controller MPPT 60A");

  const prod1 = await prisma.product.create({
    data: { name: "Premier 3.2kW Inverter", slug: p1Slug, lastBuyingPrice: 14500 },
  });
  const prod2 = await prisma.product.create({
    data: { name: "Monocrystalline 200W Panel", slug: p2Slug, lastBuyingPrice: 8200 },
  });
  const prod3 = await prisma.product.create({
    data: { name: "12V 200Ah Deep Cycle Battery", slug: p3Slug, lastBuyingPrice: null }, // unknown → pending
  });
  const prod4 = await prisma.product.create({
    data: { name: "Charge Controller MPPT 60A", slug: p4Slug, lastBuyingPrice: null }, // unknown → pending
  });

  // helpers for dates
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  console.log("🧾 Creating orders with mixed statuses (some pending prices)...");
  // Known-price products → orders auto-filled with buyingPricePerUnit
  await prisma.order.createMany({
    data: [
      {
        externalOrderId: "ORD-10001",
        shopId: shopA.id,
        shopName: shopA.name,
        productName: prod1.name,
        productSlug: prod1.slug,
        quantity: 1,
        sellingPricePerUnit: 24999,
        buyingPricePerUnit: prod1.lastBuyingPrice!, // auto-known
        orderedAt: daysAgo(6),
        status: OrderStatus.DELIVERED,
        jumiaProductUrl: "https://www.jumia.co.ke/inverter-3200",
        attendantCode: null,
      },
      {
        externalOrderId: "ORD-10002",
        shopId: shopA.id,
        shopName: shopA.name,
        productName: prod2.name,
        productSlug: prod2.slug,
        quantity: 2,
        sellingPricePerUnit: 13500,
        buyingPricePerUnit: prod2.lastBuyingPrice!, // auto-known
        orderedAt: daysAgo(4),
        status: OrderStatus.OUT_FOR_DELIVERY,
        jumiaProductUrl: "https://www.jumia.co.ke/panel-200w",
        attendantCode: null,
      },
      {
        externalOrderId: "ORD-20001",
        shopId: shopB.id,
        shopName: shopB.name,
        productName: prod1.name,
        productSlug: prod1.slug,
        quantity: 1,
        sellingPricePerUnit: 25999,
        buyingPricePerUnit: prod1.lastBuyingPrice!,
        orderedAt: daysAgo(2),
        status: OrderStatus.DELIVERED,
        jumiaProductUrl: "https://www.jumia.co.ke/inverter-3200",
        attendantCode: null,
      },
      {
        externalOrderId: "ORD-20002",
        shopId: shopB.id,
        shopName: shopB.name,
        productName: prod2.name,
        productSlug: prod2.slug,
        quantity: 1,
        sellingPricePerUnit: 13200,
        buyingPricePerUnit: prod2.lastBuyingPrice!,
        orderedAt: daysAgo(1),
        status: OrderStatus.RETURNED,
        refundAmount: 13200, // if your flow uses it later
        jumiaProductUrl: "https://www.jumia.co.ke/panel-200w",
        attendantCode: null,
      },
    ],
  });

  // Unknown-price products → pending pricing (assigned attendants will see them)
  // Create one pending for shopA (Alice, Carol) and one for shopB (Brian, Carol)
  await prisma.order.createMany({
    data: [
      {
        externalOrderId: "ORD-30001",
        shopId: shopA.id,
        shopName: shopA.name,
        productName: prod3.name,
        productSlug: prod3.slug,
        quantity: 1,
        sellingPricePerUnit: 23500,
        buyingPricePerUnit: null, // PENDING
        orderedAt: daysAgo(0),
        status: OrderStatus.PLACED,
        jumiaProductUrl: "https://www.jumia.co.ke/deep-200ah",
        attendantCode: "ALC001", // optional metadata
      },
      {
        externalOrderId: "ORD-30002",
        shopId: shopB.id,
        shopName: shopB.name,
        productName: prod4.name,
        productSlug: prod4.slug,
        quantity: 1,
        sellingPricePerUnit: 15400,
        buyingPricePerUnit: null, // PENDING
        orderedAt: daysAgo(0),
        status: OrderStatus.CONFIRMED,
        jumiaProductUrl: "https://www.jumia.co.ke/mppt-60a",
        attendantCode: "BRN777",
      },
    ],
  });

  // Summary
  const counts = await Promise.all([
    prisma.shop.count(),
    prisma.attendant.count(),
    prisma.attendantShop.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { buyingPricePerUnit: null } }),
  ]);

  console.log("✅ Seed complete!");
  console.log(`Shops:           ${counts[0]}`);
  console.log(`Attendants:      ${counts[1]}`);
  console.log(`Assignments:     ${counts[2]}`);
  console.log(`Products:        ${counts[3]}`);
  console.log(`Orders:          ${counts[4]}`);
  console.log(`Pending Pricing: ${counts[5]} (visible on attendants' dashboards)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
