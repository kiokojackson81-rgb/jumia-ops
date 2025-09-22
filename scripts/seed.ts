import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { slug: 'widget' },
    update: {},
    create: { name: 'Widget', price: 1000, slug: 'widget', lastBuyingPrice: 900 }
  });

  await prisma.order.create({
    data: { status: OrderStatus.PENDING }
  });

  const att = await prisma.attendant.create({ data: { name: 'Alex' } });
  const shop = await prisma.shop.create({ data: { name: 'Main Shop' } });
  await prisma.attendantShop.create({
    data: { attendantId: att.id, shopId: shop.id }
  });
}

main()
  .then(() => console.log('Seeded.'))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
