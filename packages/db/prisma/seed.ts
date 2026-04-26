import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const director = await prisma.user.upsert({
    where: { email: 'director@fleet.com' },
    update: {},
    create: {
      email: 'director@fleet.com',
      password: hashedPassword,
      name: 'James Okello',
      role: Role.DIRECTOR,
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@fleet.com' },
    update: {},
    create: {
      email: 'driver@fleet.com',
      password: hashedPassword,
      name: 'Peter Mukasa',
      role: Role.DRIVER,
    },
  });

  const stockManager = await prisma.user.upsert({
    where: { email: 'stock@fleet.com' },
    update: {},
    create: {
      email: 'stock@fleet.com',
      password: hashedPassword,
      name: 'Sarah Nambi',
      role: Role.STOCK_MANAGER,
    },
  });

  const salesManager = await prisma.user.upsert({
    where: { email: 'sales@fleet.com' },
    update: {},
    create: {
      email: 'sales@fleet.com',
      password: hashedPassword,
      name: 'Grace Achieng',
      role: Role.SALES_MANAGER,
    },
  });

  console.log('✅ Users created:', { director: director.email, driver: driver.email, stockManager: stockManager.email, salesManager: salesManager.email });

  // Create vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: 'UAA 123B' },
    update: {},
    create: {
      plateNumber: 'UAA 123B',
      make: 'Toyota',
      model: 'Land Cruiser',
      tankCapacity: 90,
      currentMileage: 45230,
      nextServiceMileage: 50000,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: 'UBB 456C' },
    update: {},
    create: {
      plateNumber: 'UBB 456C',
      make: 'Isuzu',
      model: 'FRR',
      tankCapacity: 120,
      currentMileage: 112450,
      nextServiceMileage: 120000,
    },
  });

  console.log('✅ Vehicles created:', { vehicle1: vehicle1.plateNumber, vehicle2: vehicle2.plateNumber });

  // Create stock types
  const tilapia = await prisma.stockType.upsert({
    where: { name: 'Tilapia' },
    update: {},
    create: {
      name: 'Tilapia',
      unit: 'kg',
      pricePerUnit: 8500,
    },
  });

  const nilePerch = await prisma.stockType.upsert({
    where: { name: 'Nile Perch' },
    update: {},
    create: {
      name: 'Nile Perch',
      unit: 'kg',
      pricePerUnit: 12000,
    },
  });

  const catfish = await prisma.stockType.upsert({
    where: { name: 'Catfish' },
    update: {},
    create: {
      name: 'Catfish',
      unit: 'kg',
      pricePerUnit: 7000,
    },
  });

  console.log('✅ Stock types created:', { tilapia: tilapia.name, nilePerch: nilePerch.name, catfish: catfish.name });

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
