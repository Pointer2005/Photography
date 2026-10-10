'use client';

import { useActionState } from 'react';
import { adminLoginAction } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import BackgroundCarousel from '@/components/BackgroundCarousel';

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);

  return (
    <div className="relative flex-grow flex flex-col lg:flex-row bg-[#09090b] overflow-x-hidden min-h-[calc(100vh-80px)]">
      {/* ── Left Half: Photography Carousel ─────────────────────── */}
      <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-auto lg:min-h-full flex-grow shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col">
        <BackgroundCarousel />
        
        {/* Branding text overlay on the images */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16 z-20">
          <h1 className="animate-fade-up text-5xl md:text-6xl lg:text-[84px] font-black text-white tracking-tighter leading-[0.9] mb-3 md:mb-4 drop-shadow-2xl">
            Admin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Access.</span>
          </h1>
          <p className="animate-fade-up delay-200 text-white/80 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
            Secure Dashboard Login
          </p>
        </div>
      </div>

      {/* ── Right Half: Login Form ───────────────────────────────── */}
      <div className="relative w-full lg:w-1/2 min-h-[55vh] flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-[#09090b] z-10 flex-grow">
        
        {/* Vibrant ambient glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm mx-auto text-zinc-100 relative z-10">
          <Card className="w-full bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl relative overflow-hidden animate-fade-up delay-400">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent z-0" />
            <CardHeader className="relative z-10 pt-8 pb-4">
              <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 text-center tracking-tight">Admin Login</CardTitle>
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
    </div>
  );
}
