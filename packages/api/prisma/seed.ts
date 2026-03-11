import { PrismaClient, OrgRole } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Simple hash for seed data only - real auth uses bcrypt
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@flipflow.io' },
    update: {},
    create: {
      email: 'demo@flipflow.io',
      name: 'Demo User',
      passwordHash: hashPassword('password123'),
    },
  });

  // Create demo org
  const org = await prisma.org.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  // Create membership
  await prisma.orgMembership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
    update: {},
    create: {
      userId: user.id,
      orgId: org.id,
      role: OrgRole.owner,
    },
  });

  // Create a sample form
  await prisma.form.create({
    data: {
      orgId: org.id,
      title: 'Contact Form',
      description: 'A simple contact form',
      definition: {
        steps: [
          {
            id: 'step-1',
            title: 'Contact Info',
            order: 0,
            questions: [
              {
                id: 'q-name',
                type: 'short_text',
                label: 'Your Name',
                placeholder: 'John Doe',
                validations: { required: true },
              },
              {
                id: 'q-email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'john@example.com',
                validations: { required: true },
              },
            ],
          },
          {
            id: 'step-2',
            title: 'Message',
            order: 1,
            questions: [
              {
                id: 'q-message',
                type: 'long_text',
                label: 'Your Message',
                placeholder: 'Tell us what you need...',
                validations: { required: true, minLength: 10 },
              },
            ],
          },
        ],
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'filled',
        },
        settings: {
          showProgressBar: true,
          allowBackNavigation: true,
          submitButtonText: 'Send Message',
        },
      },
      published: true,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
