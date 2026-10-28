'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { normalizePhoneNumber, getPhoneLookupVariations } from '@/lib/phone';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Invalid phone number"),
  campaignId: z.string(),
});

export async function startCustomerFlow(name: string, phone: string, campaignId: string) {
  const trimmedName = (name || '').trim();
  if (trimmedName.length < 2) {
    return { success: false, message: "Please enter your full name (at least 2 letters)." };
  }

  const { valid, normalized, error } = normalizePhoneNumber(phone);
  if (!valid || !normalized) {
    return { success: false, message: error || "Please enter a valid mobile number." };
  }

  try {
    const variations = getPhoneLookupVariations(normalized);
    let customer = await prisma.customer.findFirst({
      where: { phone: { in: variations } }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: trimmedName, phone: normalized },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: trimmedName, phone: normalized },
      });
    }

    const claim = await prisma.claim.findUnique({
      where: { customerId_campaignId: { customerId: customer.id, campaignId } },
      include: { offer: true }
    });

    return {
      success: true,
      customerId: customer.id,
      name: customer.name,
      normalizedPhone: normalized,
      claim: claim || null,
    };
  } catch (err) {
    console.error("Error starting customer flow:", err);
    return { success: false, message: "Could not process request. Please try again." };
  }
}

export async function checkCustomerPhone(phone: string, campaignId: string) {
  const { valid, normalized, error } = normalizePhoneNumber(phone);
  if (!valid || !normalized) {
    return { success: false, message: error || "Invalid phone number format" };
  }

  const variations = getPhoneLookupVariations(normalized);
  const customer = await prisma.customer.findFirst({
    where: { phone: { in: variations } }
  });

  if (customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        phone: normalized,
      }
    });

    const claim = await prisma.claim.findUnique({
      where: { customerId_campaignId: { customerId: customer.id, campaignId } },
      include: { offer: true }
    });

    return {
      success: true,
      isNewUser: false,
      customerId: customer.id,
      name: customer.name,
      normalizedPhone: normalized,
      claim: claim || null
    };
  } else {
    return { success: true, isNewUser: true, normalizedPhone: normalized };
  }
}

export async function registerCustomer(prevState: unknown, formData: FormData) {
  try {
    const rawPhone = formData.get('phone') as string;
    const { valid, normalized, error } = normalizePhoneNumber(rawPhone);
    if (!valid || !normalized) {
      return { success: false, errors: { phone: [error || "Invalid phone number"] } };
    }

    const rawData = {
      name: formData.get('name') as string,
      phone: normalized,
      campaignId: formData.get('campaignId') as string,
    };

    const validated = registerSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { name, phone } = validated.data;
    const variations = getPhoneLookupVariations(phone);

    let customer = await prisma.customer.findFirst({
      where: { phone: { in: variations } }
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name, phone },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name, phone },
      });
    }

    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}



export async function executeSpin(customerId: string, campaignId: string) {
  const now = new Date();

  // Execute spin on the server
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      offers: {
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }
    },
  });

  if (!campaign || campaign.status !== 'ACTIVE') {
    return { success: false, message: "Campaign is not active" };
  }

  // Double check no claim exists
  let claim = await prisma.claim.findUnique({
    where: { customerId_campaignId: { customerId, campaignId } },
    include: { offer: true }
  });

  if (claim) {
    return { success: true, claim };
  }

  // Determine winning offer
  let winningOffer;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });

  // 1. Check for specific mobile number overrides
  if (customer) {
    const variations = getPhoneLookupVariations(customer.phone);
    const override = await prisma.offerOverride.findFirst({
      where: {
        phone: { in: variations },
        campaignId,
        isUsed: false
      },
      include: { offer: true }
    });

    if (override && override.offer.isActive && (!override.offer.expiresAt || override.offer.expiresAt > now)) {
      winningOffer = override.offer;

      // Mark override as used
      await prisma.offerOverride.update({
        where: { id: override.id },
        data: { isUsed: true }
      });
    }
  }

  // 2. Standard selection if no override exists
  if (!winningOffer) {
    if (campaign.selectionMode === 'FIXED' && campaign.fixedOfferId) {
      winningOffer = campaign.offers.find(o => o.id === campaign.fixedOfferId);
    } else if (campaign.selectionMode === 'WEIGHTED') {
      const totalWeight = campaign.offers.reduce((sum, offer) => sum + offer.weight, 0);
      let random = Math.random() * totalWeight;
      for (const offer of campaign.offers) {
        random -= offer.weight;
        if (random <= 0) {
          winningOffer = offer;
          break;
        }
      }
    } else {
      winningOffer = campaign.offers[0];
    }
  }

  if (!winningOffer) {
    return { success: false, message: "No eligible offers available" };
  }

  const claimCode = `PHOTO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  claim = await prisma.claim.create({
    data: {
      claimCode,
      customerId,
      campaignId,
      offerId: winningOffer.id,
      snapshot: JSON.stringify({
        name: winningOffer.name,
        description: winningOffer.description,
        offerValue: winningOffer.offerValue,
        terms: winningOffer.terms
      })
    },
    include: { offer: true }
  });

  return { success: true, claim };
}

export async function markWhatsAppClaimInitiated(claimCode: string) {
  try {
    await prisma.claim.update({
      where: { claimCode },
      data: {
        whatsappInitiatedAt: new Date(),
        claimStatus: 'INITIATED',
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to record WhatsApp initiation:', error);
    return { success: false };
  }
}

