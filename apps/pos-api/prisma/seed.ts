import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@pos.local' },
    update: {},
    create: {
      email: 'admin@pos.local',
      name: 'Administrador',
      passwordHash,
      role: 'admin',
    },
  });
  console.log('Usuario semilla creado: admin@pos.local / Admin123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
