"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const agencies = [
        'Alpha Home Health Services',
        'Avalon Home Health Services',
        'TruCare Home Health Services',
        'TruChoice Home Health Services',
        'TruMed Home Health Services',
        'TruLife Home Health Services',
    ];
    const existingAgencies = await prisma.agency.findMany({
        select: { name: true },
    });
    const existingNames = new Set(existingAgencies.map((agency) => agency.name));
    const missingAgencies = agencies.filter((name) => !existingNames.has(name));
    if (missingAgencies.length > 0) {
        await prisma.agency.createMany({
            data: missingAgencies.map((name) => ({ name })),
        });
    }
    console.log(missingAgencies.length > 0
        ? `Seeded ${missingAgencies.length} agencies successfully.`
        : 'Agencies already exist.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
