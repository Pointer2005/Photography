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
              name: '10% OFF',
              description: 'Get 10% off your next session',
              offerType: 'DISCOUNT_PERCENT',
              offerValue: '10',
              weight: 50,
              sequencePosition: 1
            },
            {
              name: '₹500 OFF',
              description: 'Flat ₹500 off on couples portrait',
              offerType: 'DISCOUNT_AMOUNT',
              offerValue: '500',
              weight: 30,
              sequencePosition: 2
            },
            {
              name: 'Free Consultation',
              description: '30-minute free photography consultation',
              offerType: 'FREE_SERVICE',
              offerValue: 'Consultation',
              weight: 20,
              sequencePosition: 3
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
