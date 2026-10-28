'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { adminLoginAction } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);

  return (
    <div className="relative flex-grow flex items-center justify-center p-6 md:p-12 bg-[#09090b] overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Vibrant ambient glows */}
      <div className="absolute top-1/4 -left-24 w-[420px] h-[420px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none transform-gpu" />
      <div className="absolute bottom-1/4 -right-24 w-[420px] h-[420px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none transform-gpu" />

      <div className="w-full max-w-sm mx-auto text-zinc-100 relative z-10 flex flex-col items-center">
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden drop-shadow-[0_10px_28px_rgba(0,0,0,0.9)] border-2 border-white/20 bg-black/60 backdrop-blur-md mb-3">
            <Image
              src="/images/logo.png"
              alt="the_Cinemoy"
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-contain rounded-full p-2"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            the_Cinemoy
          </h1>
          <p className="text-pink-400 font-bold tracking-[0.2em] uppercase text-[11px] mt-1">
            Admin Access
          </p>
        </div>

        <Card className="w-full bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl relative overflow-hidden animate-fade-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
          <CardHeader className="relative z-10 pt-6 pb-2">
            <CardTitle className="text-xl font-bold text-zinc-100 text-center tracking-tight">
              Sign In to Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-500/20 text-red-200/80">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-pink-500 uppercase tracking-[0.2em] text-[10px] font-bold">Username</Label>
                <Input 
                  name="username" 
                  type="text" 
                  required 
                  className="bg-white/5 border-white/10 text-white focus-visible:border-pink-500 focus-visible:ring-pink-500/20 py-5 rounded-xl transition-all duration-300 font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-pink-500 uppercase tracking-[0.2em] text-[10px] font-bold">Password</Label>
                <Input 
                  name="password" 
                  type="password" 
                  required 
                  className="bg-white/5 border-white/10 text-white focus-visible:border-pink-500 focus-visible:ring-pink-500/20 py-5 rounded-xl transition-all duration-300 font-medium"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-extrabold tracking-[0.15em] uppercase transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)] mt-6 py-6 rounded-xl border-0"
              >
                {isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
