import { Router } from 'express';
import pkg from '@prisma/client';
import { upload } from '../middleware/upload';

type DocumentLabel = 'LICENSE' | 'DRIVER_LICENSE' | 'SSN_CARD' | 'CERTIFICATES' | 'MEDICAL_CARD' | 'RESUME';

const router = Router();
const prisma = new (pkg as any).PrismaClient();

const parseStrings = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
};

const resolveAgencyRelation = async (agencyId: any, agencyName: any) => {
  const normalizedAgencyName = typeof agencyName === 'string' ? agencyName.trim() : '';

  if (normalizedAgencyName) {
    const existingAgency = await prisma.agency.findFirst({
      where: { name: normalizedAgencyName },
      select: { id: true },
    });

    if (existingAgency) {
      return { connect: { id: existingAgency.id } };
    }

    return { create: { name: normalizedAgencyName } };
  }

  return { connect: { id: Number(agencyId) } };
};

router.get('/', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    res.json([]);
    return;
  }

  const { search, agency, skill, city, zip } = req.query;

  const filters: any = {
    where: {
      AND: [
        search
          ? {
              OR: [
                { fullName: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
                { phone: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : undefined,
        agency
          ? {
              agency: {
                is: {
                  name: { equals: String(agency), mode: 'insensitive' },
                },
              },
            }
          : undefined,
        city
          ? { areaCity: { contains: String(city), mode: 'insensitive' } }
          : undefined,
        zip
          ? {
              zipCodes: {
                some: { zipCode: { contains: String(zip), mode: 'insensitive' } },
              },
            }
          : undefined,
        skill
          ? {
              skills: {
                some: { skill: { contains: String(skill), mode: 'insensitive' } },
              },
            }
          : undefined,
      ].filter(Boolean),
    },
    include: {
      agency: true,
      skills: true,
      zipCodes: true,
      licenses: true,
      documents: true,
    },
    orderBy: { fullName: 'asc' },
  };

  try {
    const providers = await prisma.provider.findMany(filters as any);
    res.json(providers);
  } catch (error) {
    console.error('Unable to load providers from database, returning an empty list instead.', error);
    res.json([]);
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      agency: true,
      skills: true,
      zipCodes: true,
      licenses: true,
      documents: true,
    },
  });
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  res.json(provider);
});

router.post('/', async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    gender,
    phone,
    email,
    profileImage,
    street,
    areaCity,
    notes,
    status,
    agencyId,
    agencyName,
    skills,
    zipCodes,
    license,
  } = req.body;

  const agencyRelation = await resolveAgencyRelation(agencyId, agencyName);

  const provider = await prisma.provider.create({
    data: {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone,
      email,
      profileImage,
      street,
      areaCity,
      notes,
      status: status || 'ACTIVE',
      agency: agencyRelation,
      skills: {
        create: parseStrings(skills).map((skill: string) => ({ skill })),
      },
      zipCodes: {
        create: parseStrings(zipCodes).map((zipCode: string) => ({ zipCode })),
      },
      licenses: {
        create: {
          licenseType: license?.licenseType || '',
          licenseNumber: license?.licenseNumber || '',
          stateIssued: license?.stateIssued || '',
          expirationDate: new Date(license?.expirationDate || new Date()),
        },
      },
    },
  });

  res.status(201).json(provider);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const {
    fullName,
    dateOfBirth,
    gender,
    phone,
    email,
    profileImage,
    street,
    areaCity,
    notes,
    status,
    agencyId,
    agencyName,
    skills,
    zipCodes,
    license,
  } = req.body;

  const agencyRelation = await resolveAgencyRelation(agencyId, agencyName);

  const provider = await prisma.provider.update({
    where: { id },
    data: {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone,
      email,
      profileImage,
      street,
      areaCity,
      notes,
      status,
      agency: agencyRelation,
      skills: {
        deleteMany: {},
        create: parseStrings(skills).map((skill: string) => ({ skill })),
      },
      zipCodes: {
        deleteMany: {},
        create: parseStrings(zipCodes).map((zipCode: string) => ({ zipCode })),
      },
      licenses: {
        deleteMany: {},
        create: {
          licenseType: license?.licenseType || '',
          licenseNumber: license?.licenseNumber || '',
          stateIssued: license?.stateIssued || '',
          expirationDate: new Date(license?.expirationDate || new Date()),
        },
      },
    },
    include: { agency: true },
  });

  res.json(provider);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.provider.delete({ where: { id } });
  res.status(204).send();
});

router.post('/:id/documents', upload.array('documents', 10), async (req, res) => {
  const id = Number(req.params.id);
  const files = (req.files as Express.Multer.File[]) || [];
  const label = String(req.body.label || 'RESUME').toUpperCase() as DocumentLabel;

  const created = await Promise.all(
    files.map((file) =>
      prisma.document.create({
        data: {
          label,
          fileName: file.originalname,
          filePath: `/uploads/${file.filename}`,
          provider: { connect: { id } },
        },
      })
    )
  );

  res.status(201).json(created);
});

router.delete('/documents/:documentId', async (req, res) => {
  const documentId = Number(req.params.documentId);
  await prisma.document.delete({ where: { id: documentId } });
  res.status(204).send();
});

export default router;
