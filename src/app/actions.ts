'use server';

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  consentGiven: z.boolean().refine(val => val === true, {
    message: "You must consent to continue",
  }),
  campaignId: z.string(),
});

export async function checkCustomerPhone(phone: string, consentGiven: boolean) {
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    return { success: false, message: "Invalid phone number format" };
  }
  
  if (!consentGiven) {
    return { success: false, message: "You must consent to continue" };
  }

  const customer = await prisma.customer.findUnique({ where: { phone } });
  
  if (customer) {
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await prisma.customer.update({
      where: { id: customer.id },
      data: { otpCode, otpExpiresAt, consentGiven: true, consentAt: new Date() }
    });
    
    console.log(`[MOCK SMS] Your OTP for Photography Spin & Win is: ${otpCode}`);
    return { success: true, isNewUser: false, customerId: customer.id, name: customer.name, mockOtp: otpCode };
  } else {
    return { success: true, isNewUser: true };
  }
}

export async function registerCustomer(prevState: any, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      consentGiven: formData.get('consentGiven') === 'on',
      campaignId: formData.get('campaignId') as string,
    };

    const validated = registerSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { name, phone, consentGiven, campaignId } = validated.data;

    // Generate a simple 4-digit mock OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name, phone, consentGiven, consentAt: new Date(), otpCode, otpExpiresAt },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name, consentGiven, consentAt: new Date(), otpCode, otpExpiresAt },
      });
    }

    // In a real application, you would send the OTP via SMS here (e.g. using Twilio)
    console.log(`[MOCK SMS] Your OTP for Photography Spin & Win is: ${otpCode}`);

    return { success: true, customerId: customer.id, mockOtp: otpCode };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function verifyOtp(customerId: string, otpCode: string, campaignId: string) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    
    if (!customer) {
      return { success: false, message: "Customer not found" };
    }

    if (customer.otpCode !== otpCode) {
      return { success: false, message: "Invalid OTP code" };
    }

    if (customer.otpExpiresAt && new Date() > customer.otpExpiresAt) {
      return { success: false, message: "OTP has expired" };
    }

    // Clear OTP after successful verification
    await prisma.customer.update({
      where: { id: customerId },
      data: { otpCode: null, otpExpiresAt: null },
    });

    // Check if the customer already has a claim for this campaign
    const existingClaim = await prisma.claim.findUnique({
      where: {
        customerId_campaignId: {
          customerId: customer.id,
          campaignId: campaignId,
        }
      },
      include: { offer: true }
    });

    if (existingClaim) {
      return { success: true, claim: existingClaim };
    }

    return { success: true };
  } catch (error) {
    console.error("OTP Verification error:", error);
    return { success: false, message: "An unexpected error occurred during verification" };
  }
}

export async function executeSpin(customerId: string, campaignId: string) {
  // Execute spin on the server
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { offers: { where: { isActive: true } } },
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
    const override = await prisma.offerOverride.findFirst({
      where: { phone: customer.phone, campaignId, isUsed: false },
      include: { offer: true }
    });

    if (override && override.offer.isActive) {
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
