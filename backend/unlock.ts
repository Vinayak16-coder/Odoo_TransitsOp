import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    data: {
      failedLogins: 0,
      lockedUntil: null,
    },
  });
  console.log('All accounts unlocked.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
