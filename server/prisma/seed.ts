import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const seedPassword = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  const testAccounts = [
    {
      email: 'owner1@pollipop.local',
      name: 'Instructor A (Owner 1)',
      role: 'OWNER',
      department: 'CPE',
    },
    {
      email: 'owner2@pollipop.local',
      name: 'Instructor B (Owner 2)',
      role: 'OWNER',
      department: 'ENV',
    },
    {
      email: 'student1@pollipop.local',
      name: 'Student 1 (Respondent A)',
      role: 'RESPONDENT',
      department: 'CPE',
    },
    {
      email: 'student2@pollipop.local',
      name: 'Student 2 (Respondent B)',
      role: 'RESPONDENT',
      department: 'ENV',
    },
  ];

  console.log('Starting idempotent database seeding...');

  for (const account of testAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
      create: {
        email: account.email,
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  console.log('Seeding completed successfully.');
}

if (process.env.NODE_ENV !== 'test') {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
