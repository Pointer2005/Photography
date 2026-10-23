import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.INITIAL_ADMIN_USERNAME || 'admin'
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'securepassword123'

  const hashedPassword = await bcrypt.hash(password, 10)

  // Upsert admin user
  const admin = await prisma.admin.upsert({
    where: { username },
    update: {},
    create: {
      username,
      password_hash: hashedPassword,
    },
  })

  console.log(`Admin user '${admin.username}' created or already exists.`)

  // Create a default campaign if it doesn't exist
  const existingCampaigns = await prisma.campaign.count()
  if (existingCampaigns === 0) {
    const campaign = await prisma.campaign.create({
      data: {
        name: 'Grand Opening Special',
        status: 'ACTIVE',
        selectionMode: 'WEIGHTED',
        offers: {
          create: [
            {
              name: 'Free pre wedding shoot.',
              description: 'Complimentary pre-wedding photography shoot session',
              offerType: 'FREE_SERVICE',
              offerValue: 'Pre-wedding Shoot',
              weight: 10,
              sequencePosition: 1
            },
            {
              name: '25% Discount on all Packages.',
              description: 'Flat 25% discount applicable across all photography packages',
              offerType: 'DISCOUNT_PERCENT',
              offerValue: '25',
              weight: 20,
              sequencePosition: 2
            },
            {
              name: 'Free mini book album.',
              description: 'Complimentary custom mini book photo album',
              offerType: 'FREE_SERVICE',
              offerValue: 'Mini Book Album',
              weight: 20,
              sequencePosition: 3
            },
            {
              name: 'Couples Darjeeling tour (on both side Package)',
              description: 'Exclusive couples Darjeeling tour included on both side package',
              offerType: 'FREE_SERVICE',
              offerValue: 'Darjeeling Tour',
              weight: 10,
              sequencePosition: 4
            },
            {
              name: 'Free wedding content creation.',
              description: 'Complimentary wedding day content creation & reels',
              offerType: 'FREE_SERVICE',
              offerValue: 'Content Creation',
              weight: 20,
              sequencePosition: 5
            },
            {
              name: '10pcs photo frame.',
              description: 'Complimentary set of 10 premium photo frames',
              offerType: 'FREE_SERVICE',
              offerValue: '10pcs Photo Frame',
              weight: 20,
              sequencePosition: 6
            },
          ]
        }
      }
    })
    console.log(`Created default campaign '${campaign.name}'.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
