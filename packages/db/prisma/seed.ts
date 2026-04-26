import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const director = await prisma.user.upsert({
    where: { email: 'director@fleet.com' },
    update: {},
    create: { email: 'director@fleet.com', password: hash('Director@123'), name: 'Director General', role: Role.DIRECTOR },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@fleet.com' },
    update: {},
    create: { email: 'driver@fleet.com', password: hash('Driver@123'), name: 'John Driver', role: Role.DRIVER },
  });

  const stockMgr = await prisma.user.upsert({
    where: { email: 'stock@fleet.com' },
    update: {},
    create: { email: 'stock@fleet.com', password: hash('Stock@123'), name: 'Stock Manager', role: Role.STOCK_MANAGER },
  });

  const salesMgr = await prisma.user.upsert({
    where: { email: 'sales@fleet.com' },
    update: {},
    create: { email: 'sales@fleet.com', password: hash('Sales@123'), name: 'Sales Manager', role: Role.SALES_MANAGER },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: 'UAX 001A' },
    update: {},
    create: { plate: 'UAX 001A', name: 'Van Alpha', tankCapacity: 120, currentMileage: 45000 },
  });

  await prisma.stockType.createMany({
    data: [
      { name: 'Tilapia' },
      { name: 'Nile Perch' },
      { name: 'Catfish' },
      { name: 'Mukene' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete:', { director: director.email, driver: driver.email, stockMgr: stockMgr.email, salesMgr: salesMgr.email, vehicle: vehicle.plate });
}

main().catch(console.error).finally(() => prisma.$disconnect());
