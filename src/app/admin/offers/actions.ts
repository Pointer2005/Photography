'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

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

  await prisma.offer.create({
    data: {
      campaignId,
      name,
      offerType,
      weight,
      isActive: true,
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

  await prisma.offer.update({
    where: { id: offerId },
    data: {
      name,
      offerType,
      weight,
      isActive,
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
