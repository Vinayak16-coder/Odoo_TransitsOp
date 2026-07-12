import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
    const vehicles = await prisma.vehicle.findMany();
    console.log(`Found ${vehicles.length} vehicles`);

    const drivers = await prisma.driver.findMany();
    console.log(`Found ${drivers.length} drivers`);

    const trips = await prisma.trip.findMany();
    console.log(`Found ${trips.length} trips`);
  } catch (e) {
    console.error('Failed to fetch:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
