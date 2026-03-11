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

  // Seed templates
  const templates = [
    {
      title: 'Solar Quote Request',
      description: 'Multi-step solar installation quote form for lead gen',
      vertical: 'solar',
      definition: {
        steps: [
          {
            id: 'solar-1',
            title: 'Property Info',
            order: 0,
            questions: [
              {
                id: 'sq-zip',
                type: 'short_text',
                label: 'ZIP Code',
                validations: { required: true, pattern: '^\\d{5}$' },
              },
              {
                id: 'sq-own',
                type: 'yes_no',
                label: 'Do you own your home?',
                validations: { required: true },
              },
              {
                id: 'sq-roof',
                type: 'single_choice',
                label: 'Roof type',
                validations: { required: true },
                options: [
                  { id: 'r1', label: 'Shingle', value: 'shingle' },
                  { id: 'r2', label: 'Tile', value: 'tile' },
                  { id: 'r3', label: 'Metal', value: 'metal' },
                  { id: 'r4', label: 'Flat', value: 'flat' },
                ],
              },
            ],
          },
          {
            id: 'solar-2',
            title: 'Energy Usage',
            order: 1,
            questions: [
              {
                id: 'sq-bill',
                type: 'single_choice',
                label: 'Monthly electric bill',
                validations: { required: true },
                options: [
                  { id: 'b1', label: '$0-$100', value: '0-100' },
                  { id: 'b2', label: '$100-$200', value: '100-200' },
                  { id: 'b3', label: '$200-$300', value: '200-300' },
                  { id: 'b4', label: '$300+', value: '300+' },
                ],
              },
            ],
          },
          {
            id: 'solar-3',
            title: 'Contact',
            order: 2,
            questions: [
              {
                id: 'sq-name',
                type: 'short_text',
                label: 'Full Name',
                validations: { required: true },
              },
              { id: 'sq-email', type: 'email', label: 'Email', validations: { required: true } },
              { id: 'sq-phone', type: 'phone', label: 'Phone', validations: { required: true } },
            ],
          },
        ],
        theme: {
          primaryColor: '#f59e0b',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'filled',
        },
        settings: {
          showProgressBar: true,
          allowBackNavigation: true,
          submitButtonText: 'Get My Quote',
        },
      },
    },
    {
      title: 'Insurance Quote',
      description: 'Auto/home insurance lead capture form',
      vertical: 'insurance',
      definition: {
        steps: [
          {
            id: 'ins-1',
            title: 'Coverage Type',
            order: 0,
            questions: [
              {
                id: 'iq-type',
                type: 'single_choice',
                label: 'What type of insurance?',
                validations: { required: true },
                options: [
                  { id: 'it1', label: 'Auto', value: 'auto' },
                  { id: 'it2', label: 'Home', value: 'home' },
                  { id: 'it3', label: 'Bundle', value: 'bundle' },
                ],
              },
            ],
          },
          {
            id: 'ins-2',
            title: 'Your Info',
            order: 1,
            questions: [
              {
                id: 'iq-name',
                type: 'short_text',
                label: 'Full Name',
                validations: { required: true },
              },
              {
                id: 'iq-zip',
                type: 'short_text',
                label: 'ZIP Code',
                validations: { required: true },
              },
              { id: 'iq-email', type: 'email', label: 'Email', validations: { required: true } },
              { id: 'iq-phone', type: 'phone', label: 'Phone', validations: { required: true } },
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
          submitButtonText: 'Get Quote',
        },
      },
    },
    {
      title: 'Mortgage Pre-Qualification',
      description: 'Mortgage lead form with property and financial details',
      vertical: 'mortgage',
      definition: {
        steps: [
          {
            id: 'mort-1',
            title: 'Property',
            order: 0,
            questions: [
              {
                id: 'mq-purpose',
                type: 'single_choice',
                label: 'Purpose',
                validations: { required: true },
                options: [
                  { id: 'mp1', label: 'Purchase', value: 'purchase' },
                  { id: 'mp2', label: 'Refinance', value: 'refinance' },
                ],
              },
              {
                id: 'mq-value',
                type: 'single_choice',
                label: 'Estimated property value',
                validations: { required: true },
                options: [
                  { id: 'mv1', label: '$100k-$250k', value: '100-250' },
                  { id: 'mv2', label: '$250k-$500k', value: '250-500' },
                  { id: 'mv3', label: '$500k+', value: '500+' },
                ],
              },
            ],
          },
          {
            id: 'mort-2',
            title: 'Financial Info',
            order: 1,
            questions: [
              {
                id: 'mq-credit',
                type: 'single_choice',
                label: 'Credit score range',
                validations: { required: true },
                options: [
                  { id: 'mc1', label: 'Excellent (740+)', value: '740+' },
                  { id: 'mc2', label: 'Good (670-739)', value: '670-739' },
                  { id: 'mc3', label: 'Fair (580-669)', value: '580-669' },
                  { id: 'mc4', label: 'Poor (<580)', value: '<580' },
                ],
              },
            ],
          },
          {
            id: 'mort-3',
            title: 'Contact',
            order: 2,
            questions: [
              {
                id: 'mq-name',
                type: 'short_text',
                label: 'Full Name',
                validations: { required: true },
              },
              { id: 'mq-email', type: 'email', label: 'Email', validations: { required: true } },
              { id: 'mq-phone', type: 'phone', label: 'Phone', validations: { required: true } },
            ],
          },
        ],
        theme: {
          primaryColor: '#059669',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'filled',
        },
        settings: {
          showProgressBar: true,
          allowBackNavigation: true,
          submitButtonText: 'Check Rates',
        },
      },
    },
    {
      title: 'Home Services Request',
      description: 'General home services lead capture (HVAC, plumbing, etc)',
      vertical: 'home_services',
      definition: {
        steps: [
          {
            id: 'hs-1',
            title: 'Service Needed',
            order: 0,
            questions: [
              {
                id: 'hq-service',
                type: 'single_choice',
                label: 'What service do you need?',
                validations: { required: true },
                options: [
                  { id: 'hs1', label: 'HVAC', value: 'hvac' },
                  { id: 'hs2', label: 'Plumbing', value: 'plumbing' },
                  { id: 'hs3', label: 'Electrical', value: 'electrical' },
                  { id: 'hs4', label: 'Roofing', value: 'roofing' },
                ],
              },
              {
                id: 'hq-urgency',
                type: 'single_choice',
                label: 'How urgent?',
                validations: { required: true },
                options: [
                  { id: 'hu1', label: 'Emergency', value: 'emergency' },
                  { id: 'hu2', label: 'This week', value: 'this_week' },
                  { id: 'hu3', label: 'Flexible', value: 'flexible' },
                ],
              },
            ],
          },
          {
            id: 'hs-2',
            title: 'Contact Info',
            order: 1,
            questions: [
              { id: 'hq-name', type: 'short_text', label: 'Name', validations: { required: true } },
              {
                id: 'hq-zip',
                type: 'short_text',
                label: 'ZIP Code',
                validations: { required: true },
              },
              { id: 'hq-phone', type: 'phone', label: 'Phone', validations: { required: true } },
              { id: 'hq-email', type: 'email', label: 'Email', validations: { required: true } },
            ],
          },
        ],
        theme: {
          primaryColor: '#dc2626',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'filled',
        },
        settings: {
          showProgressBar: true,
          allowBackNavigation: true,
          submitButtonText: 'Request Service',
        },
      },
    },
    {
      title: 'Real Estate Inquiry',
      description: 'Buyer/seller lead capture for real estate agents',
      vertical: 'real_estate',
      definition: {
        steps: [
          {
            id: 're-1',
            title: 'Interest',
            order: 0,
            questions: [
              {
                id: 'rq-intent',
                type: 'single_choice',
                label: 'Are you looking to...',
                validations: { required: true },
                options: [
                  { id: 'ri1', label: 'Buy', value: 'buy' },
                  { id: 'ri2', label: 'Sell', value: 'sell' },
                  { id: 'ri3', label: 'Both', value: 'both' },
                ],
              },
              {
                id: 'rq-timeline',
                type: 'single_choice',
                label: 'Timeline',
                validations: { required: true },
                options: [
                  { id: 'rt1', label: 'ASAP', value: 'asap' },
                  { id: 'rt2', label: '1-3 months', value: '1-3m' },
                  { id: 'rt3', label: '3-6 months', value: '3-6m' },
                  { id: 'rt4', label: 'Just browsing', value: 'browsing' },
                ],
              },
            ],
          },
          {
            id: 're-2',
            title: 'Contact Details',
            order: 1,
            questions: [
              {
                id: 'rq-name',
                type: 'short_text',
                label: 'Full Name',
                validations: { required: true },
              },
              { id: 'rq-email', type: 'email', label: 'Email', validations: { required: true } },
              { id: 'rq-phone', type: 'phone', label: 'Phone', validations: { required: true } },
              {
                id: 'rq-zip',
                type: 'short_text',
                label: 'ZIP Code',
                validations: { required: true },
              },
            ],
          },
        ],
        theme: {
          primaryColor: '#7c3aed',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'filled',
        },
        settings: {
          showProgressBar: true,
          allowBackNavigation: true,
          submitButtonText: 'Connect Me',
        },
      },
    },
  ];

  for (const tmpl of templates) {
    await prisma.template.create({
      data: tmpl as Parameters<typeof prisma.template.create>[0]['data'],
    });
  }

  console.log(`Seeded ${templates.length} templates.`);
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
