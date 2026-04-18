import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const agencies = [
    'Alpha Home Health Services',
    'Avalon Home Health Services',
    'TruCare Home Health Services',
    'TruChoice Home Health Services',
    'TruMed Home Health Services',
    'TruLife Home Health Services',
  ];

  for (const name of agencies) {
    await prisma.agency.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeded agencies successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
