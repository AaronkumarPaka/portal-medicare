// backend/index.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// ====================== ROUTES ======================

// GET /agencies
app.get("/agencies", async (req, res) => {
  try {
    const agencies = await prisma.agency.findMany({
      include: { _count: { select: { providers: true } } },
    });

    const result = agencies.map((a) => ({
      id: a.id,
      name: a.name,
      providerCount: a._count.providers,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch agencies" });
  }
});

// GET /providers (with filters)
app.get("/providers", async (req, res) => {
  const { search, agencyId, skill, city, zip } = req.query;

  try {
    const where = {};
    if (agencyId) where.agencyId = Number(agencyId);
    if (city) where.areaCity = { contains: String(city), mode: "insensitive" };

    if (search) {
      where.OR = [
        { fullName: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
        { phone: { contains: String(search), mode: "insensitive" } },
      ];
    }

    let providers = await prisma.provider.findMany({
      where,
      include: {
        agency: true,
        skills: true,
        zipCodes: true,
        licenses: true,
        documents: true,
      },
    });

    // Additional client-side filters (skills & zip are relation arrays)
    if (skill) {
      providers = providers.filter((p) =>
        p.skills.some((s) => s.skill === skill)
      );
    }
    if (zip) {
      providers = providers.filter((p) =>
        p.zipCodes.some((z) => z.zipCode === zip)
      );
    }

    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// POST /providers
app.post("/providers", async (req, res) => {
  try {
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
      skills,
      zipCodes,
      license,
    } = req.body;

    const provider = await prisma.provider.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        profileImage: profileImage || null,
        street,
        areaCity,
        notes: notes || null,
        status,
        agencyId: Number(agencyId),
        skills: { create: skills.map((s) => ({ skill: s })) },
        zipCodes: { create: zipCodes.map((z) => ({ zipCode: z })) },
        licenses: { create: [license] },
      },
      include: {
        agency: true,
        skills: true,
        zipCodes: true,
        licenses: true,
        documents: true,
      },
    });

    res.status(201).json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create provider" });
  }
});

// PUT /providers/:id
app.put("/providers/:id", async (req, res) => {
  const { id } = req.params;
  try {
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
      skills,
      zipCodes,
      license,
    } = req.body;

    // Clear old relations
    await prisma.providerSkill.deleteMany({ where: { providerId: Number(id) } });
    await prisma.providerZipCode.deleteMany({ where: { providerId: Number(id) } });
    await prisma.license.deleteMany({ where: { providerId: Number(id) } });

    const provider = await prisma.provider.update({
      where: { id: Number(id) },
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        profileImage: profileImage || null,
        street,
        areaCity,
        notes: notes || null,
        status,
        agencyId: Number(agencyId),
        skills: { create: skills.map((s) => ({ skill: s })) },
        zipCodes: { create: zipCodes.map((z) => ({ zipCode: z })) },
        licenses: { create: [license] },
      },
      include: {
        agency: true,
        skills: true,
        zipCodes: true,
        licenses: true,
        documents: true,
      },
    });

    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update provider" });
  }
});

// DELETE /providers/:id
app.delete("/providers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.providerSkill.deleteMany({ where: { providerId: Number(id) } });
    await prisma.providerZipCode.deleteMany({ where: { providerId: Number(id) } });
    await prisma.license.deleteMany({ where: { providerId: Number(id) } });
    await prisma.document.deleteMany({ where: { providerId: Number(id) } });

    await prisma.provider.delete({ where: { id: Number(id) } });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete provider" });
  }
});

// POST /providers/:id/documents
app.post("/providers/:id/documents", upload.array("documents", 10), async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  try {
    const files = req.files;
    const documents = await Promise.all(
      files.map((file) =>
        prisma.document.create({
          data: {
            providerId: Number(id),
            label,
            fileName: file.originalname,
            filePath: `/uploads/${file.filename}`,
          },
        })
      )
    );
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload documents" });
  }
});

// DELETE /providers/documents/:id
app.delete("/providers/documents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await prisma.document.findUnique({ where: { id: Number(id) } });
    if (doc?.filePath) {
      const fullPath = path.join(__dirname, doc.filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await prisma.document.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Wonese Healthcare Backend is running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
