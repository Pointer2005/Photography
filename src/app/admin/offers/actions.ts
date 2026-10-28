'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateCampaignName(campaignId: string, formData: FormData) {
  const name = formData.get('name') as string;
  if (name) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { name }
    });
    revalidatePath('/admin/offers');
    revalidatePath('/');
  }
}

export async function updateCampaignStatus(campaignId: string, status: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status }
  });
  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function addOffer(campaignId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const offerType = formData.get('offerType') as string;
  const weight = parseInt(formData.get('weight') as string, 10);
  const expiresAtRaw = formData.get('expiresAt') as string;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  await prisma.offer.create({
    data: {
      campaignId,
      name,
      offerType,
      weight,
      isActive: true,
      expiresAt,
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string || null,
    }
  });

  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function updateOffer(offerId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const offerType = formData.get('offerType') as string;
  const weight = parseInt(formData.get('weight') as string, 10);
  const isActive = formData.get('isActive') === 'on';
  const expiresAtRaw = formData.get('expiresAt') as string;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  await prisma.offer.update({
    where: { id: offerId },
    data: {
      name,
      offerType,
      weight,
      isActive,
      expiresAt,
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string || null,
    }
  });

  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function deleteOffer(offerId: string) {
  await prisma.offer.delete({
    where: { id: offerId }
  });

  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function seedDefaultOffers(campaignId: string) {
  const { DEFAULT_OFFERS_LIST } = await import('@/lib/defaultOffers');
  
  const existingOffers = await prisma.offer.findMany({
    where: { campaignId },
    select: { name: true },
  });
  const existingNames = new Set(existingOffers.map((o) => o.name.trim().toLowerCase()));

  const toCreate = DEFAULT_OFFERS_LIST.filter(
    (offer) => !existingNames.has(offer.name.trim().toLowerCase())
  );

  if (toCreate.length > 0) {
    await prisma.offer.createMany({
      data: toCreate.map((offer) => ({
        ...offer,
        campaignId,
        isActive: true,
      })),
    });
  }

  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function deduplicateOffers(campaignId: string) {
  const offers = await prisma.offer.findMany({
    where: { campaignId },
    include: {
      _count: {
        select: { claims: true, overrides: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const offer of offers) {
    const key = offer.name.trim().toLowerCase();
    if (seen.has(key)) {
      if (offer._count.claims === 0 && offer._count.overrides === 0) {
        idsToDelete.push(offer.id);
      }
    } else {
      seen.add(key);
    }
  }

  if (idsToDelete.length > 0) {
    await prisma.offer.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function resetToDefaultOffers(campaignId: string) {
  const { DEFAULT_OFFERS_LIST } = await import('@/lib/defaultOffers');

  // Delete unlinked offers
  await prisma.offer.deleteMany({
    where: {
      campaignId,
      claims: { none: {} },
      overrides: { none: {} },
    },
  });

  // Re-insert 6 default offers
  await prisma.offer.createMany({
    data: DEFAULT_OFFERS_LIST.map((offer) => ({
      ...offer,
      campaignId,
      isActive: true,
    })),
  });

  revalidatePath('/admin/offers');
  revalidatePath('/');
}
