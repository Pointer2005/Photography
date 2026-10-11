'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function adminLoginAction(prevState: unknown, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    return { error: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);

  if (!isValid) {
    return { error: 'Invalid credentials' };
  }

  await login(admin.id);

  redirect('/admin');
}

export async function changePasswordAction(prevState: unknown, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }

  const { getSession } = await import('@/lib/auth');
  const session = await getSession();
  if (!session || !session.adminId) {
    return { error: 'Unauthorized' };
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) {
    return { error: 'Admin not found' };
  }

  const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!isValid) {
    return { error: 'Incorrect current password' };
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password_hash }
  });

  return { success: 'Password updated successfully' };
}

export async function adminLogoutAction() {
  const { logout } = await import('@/lib/auth');
  await logout();
  redirect('/admin/login');
}

export async function markClaimRedeemed(claimId: string) {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { offer: true }
    });

    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }

    if (claim.offer.expiresAt && new Date(claim.offer.expiresAt) < new Date()) {
      return { success: false, error: 'Cannot redeem: This offer has already expired.' };
    }

    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: {
        redemptionStatus: 'REDEEMED',
        redeemedAt: new Date(),
      },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin');

    return { success: true, claim: updated };
  } catch (error) {
    console.error('Error marking claim redeemed:', error);
    return { success: false, error: 'Failed to update redemption status' };
  }
}

export async function undoClaimRedemption(claimId: string) {
  try {
    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: {
        redemptionStatus: 'UNREDEEMED',
        redeemedAt: null,
      },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin');

    return { success: true, claim: updated };
  } catch (error) {
    console.error('Error undoing redemption:', error);
    return { success: false, error: 'Failed to revert redemption status' };
  }
}

export async function verifyClaimLookup(rawQuery: string) {
  const query = rawQuery.trim();
  if (!query) {
    return { success: false, error: 'Please enter a claim code or phone number.' };
  }

  try {
    const claim = await prisma.claim.findFirst({
      where: {
        OR: [
          { claimCode: { equals: query, mode: 'insensitive' } },
          { customer: { phone: { contains: query } } },
        ],
      },
      include: {
        customer: true,
        offer: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!claim) {
      return { success: false, error: `No claim found for "${query}".` };
    }

    const isExpired = !!(claim.offer.expiresAt && new Date(claim.offer.expiresAt) < new Date());

    return {
      success: true,
      claim: {
        id: claim.id,
        claimCode: claim.claimCode,
        customerName: claim.customer.name,
        customerPhone: claim.customer.phone,
        offerName: claim.offer.name,
        offerDescription: claim.offer.description,
        offerExpiresAt: claim.offer.expiresAt ? claim.offer.expiresAt.toISOString() : null,
        isExpired,
        redemptionStatus: claim.redemptionStatus,
        redeemedAt: claim.redeemedAt ? claim.redeemedAt.toISOString() : null,
        whatsappInitiatedAt: claim.whatsappInitiatedAt ? claim.whatsappInitiatedAt.toISOString() : null,
        createdAt: claim.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error looking up claim:', error);
    return { success: false, error: 'Lookup failed. Please try again.' };
  }
}


