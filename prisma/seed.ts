import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_OFFERS_LIST as defaultOffers } from '../src/lib/defaultOffers'

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

  // Ensure a campaign exists and has offers
  let campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: { offers: true },
  })

  if (!campaign) {
    campaign = await prisma.campaign.findFirst({
      include: { offers: true },
    })
  }

  if (!campaign) {
    const created = await prisma.campaign.create({
      data: {
        name: 'Grand Opening Special',
        status: 'ACTIVE',
        selectionMode: 'WEIGHTED',
        offers: {
          create: defaultOffers,
        },
      },
      include: { offers: true },
    })
    console.log(`Created default campaign '${created.name}' with ${created.offers.length} offers.`)
  } else if (campaign.offers.length === 0) {
    const campaignId = campaign.id
    // Campaign exists but has 0 offers - seed them now!
    await prisma.offer.createMany({
      data: defaultOffers.map((offer) => ({
        ...offer,
        campaignId,
      })),
    })
    console.log(`Added ${defaultOffers.length} default offers to existing campaign '${campaign.name}'.`)
  } else {
    console.log(`Campaign '${campaign.name}' already has ${campaign.offers.length} offers.`)
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
