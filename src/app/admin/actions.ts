'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function adminLoginAction(prevState: any, formData: FormData) {
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
