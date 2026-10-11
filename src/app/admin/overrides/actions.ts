'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addOverride(campaignId: string, formData: FormData) {
  const phone = formData.get('phone') as string;
  const offerId = formData.get('offerId') as string;

  try {
    await prisma.offerOverride.upsert({
      where: {
        phone_campaignId: {
          phone,
          campaignId
        }
      },
      update: {
        offerId,
        isUsed: false
      },
      create: {
        phone,
        offerId,
        campaignId
      }
    });

    revalidatePath('/admin/overrides');
    return { success: true };
  } catch (error) {
    console.error("Error adding override:", error);
    return { success: false, error: "Failed to add override" };
  }
}

export async function deleteOverride(overrideId: string) {
  try {
    await prisma.offerOverride.delete({
      where: { id: overrideId }
    });
    revalidatePath('/admin/overrides');
    return { success: true };
  } catch (error) {
    console.error("Error deleting override:", error);
    return { success: false, error: "Failed to delete override" };
  }
}
