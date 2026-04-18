import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
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
