import { PrismaClient, Role, AccessLevel } from '@prisma/client';

const prisma = new PrismaClient();

const matrix: Record<string, Record<string, string>> = {
  FLEET_MANAGER: {
    Dashboard: 'VIEW',
    Fleet: 'FULL',
    Drivers: 'FULL',
    Trips: 'FULL',
    Maintenance: 'FULL',
    FuelAndExpenses: 'FULL',
    Analytics: 'VIEW',
    Settings: 'FULL'
  },
  DRIVER: {
    Dashboard: 'VIEW',
    Fleet: 'VIEW',
    Drivers: 'VIEW',
    Trips: 'FULL',
    Maintenance: 'NONE',
    FuelAndExpenses: 'NONE',
    Analytics: 'NONE',
    Settings: 'NONE'
  },
  SAFETY_OFFICER: {
    Dashboard: 'NONE',
    Fleet: 'NONE',
    Drivers: 'FULL',
    Trips: 'NONE',
    Maintenance: 'FULL',
    FuelAndExpenses: 'NONE',
    Analytics: 'VIEW',
    Settings: 'NONE'
  },
  FINANCIAL_ANALYST: {
    Dashboard: 'NONE',
    Fleet: 'NONE',
    Drivers: 'NONE',
    Trips: 'NONE',
    Maintenance: 'NONE',
    FuelAndExpenses: 'FULL',
    Analytics: 'FULL',
    Settings: 'NONE'
  }
};

async function main() {
  console.log('Seeding role permissions...');
  
  const entries: any[] = [];
  
  for (const [role, modules] of Object.entries(matrix)) {
    for (const [moduleName, access] of Object.entries(modules)) {
      entries.push({
        role: role as Role,
        module: moduleName,
        access: access as AccessLevel
      });
    }
  }

  // Create many (will skip duplicates due to logic or we can just use upsert)
  for (const entry of entries) {
    await prisma.rolePermission.upsert({
      where: {
        role_module: {
          role: entry.role,
          module: entry.module
        }
      },
      update: {},
      create: entry
    });
  }

  console.log('Role permissions seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
