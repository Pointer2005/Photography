'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { normalizePhoneNumber, getPhoneLookupVariations } from '@/lib/phone';

export async function addOverride(campaignId: string, formData: FormData) {
  const rawPhone = formData.get('phone') as string;
  const offerId = formData.get('offerId') as string;

  const { valid, normalized, error } = normalizePhoneNumber(rawPhone);
  if (!valid || !normalized) {
    return { success: false, error: error || "Invalid phone number format" };
  }

  try {
    const variations = getPhoneLookupVariations(normalized);

    // Look for any existing override for this number under any variation
    const existing = await prisma.offerOverride.findFirst({
      where: {
        campaignId,
        phone: { in: variations }
      }
    });

    if (existing) {
      await prisma.offerOverride.update({
        where: { id: existing.id },
        data: {
          phone: normalized,
          offerId,
          isUsed: false
        }
      });
    } else {
      await prisma.offerOverride.create({
        data: {
          phone: normalized,
          offerId,
          campaignId,
          isUsed: false
        }
      });
    }

    try {
      revalidatePath('/admin/overrides');
    } catch {
      // Ignore if outside HTTP request context (e.g. CLI/tests)
    }
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
    try {
      revalidatePath('/admin/overrides');
    } catch {
      // Ignore if outside HTTP request context (e.g. CLI/tests)
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting override:", error);
    return { success: false, error: "Failed to delete override" };
  }
}
