'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

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

