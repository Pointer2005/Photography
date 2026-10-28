import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.offer.findMany({
    include: {
      _count: {
        select: { claims: true, overrides: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${offers.length} total offers in database.`);

  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const offer of offers) {
    const key = `${offer.campaignId}:${offer.name.trim().toLowerCase()}`;
    if (seen.has(key)) {
      if (offer._count.claims === 0 && offer._count.overrides === 0) {
        idsToDelete.push(offer.id);
      }
    } else {
      seen.add(key);
    }
  }

  console.log(`Identified ${idsToDelete.length} duplicate offers to delete.`);

  if (idsToDelete.length > 0) {
    const res = await prisma.offer.deleteMany({
      where: { id: { in: idsToDelete } },
    });
    console.log(`Successfully deleted ${res.count} duplicate offers.`);
  }

  const remaining = await prisma.offer.count();
  console.log(`Remaining unique offers: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
