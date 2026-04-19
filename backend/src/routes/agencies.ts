import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const defaultAgencyNames = [
  'Alpha Home Health Services',
  'Avalon Home Health Services',
  'TruCare Home Health Services',
  'TruChoice Home Health Services',
  'TruMed Home Health Services',
  'TruLife Home Health Services',
];

const ensureDefaultAgencies = async () => {
  const existingAgencies = await prisma.agency.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingAgencies.map((agency) => agency.name));
  const missingAgencies = defaultAgencyNames.filter((name) => !existingNames.has(name));

  if (missingAgencies.length === 0) {
    return;
  }

  await prisma.agency.createMany({
    data: missingAgencies.map((name) => ({ name })),
  });
};

router.get('/', async (_req, res) => {
  await ensureDefaultAgencies();

  const agencies = await prisma.agency.findMany({
    include: { providers: true },
    orderBy: { name: 'asc' },
  });

  const result = agencies.map((agency: { id: number; name: string; providers: { id: number }[] }) => ({
    id: agency.id,
    name: agency.name,
    providerCount: agency.providers.length,
  }));

  res.json(result);
});

export default router;
