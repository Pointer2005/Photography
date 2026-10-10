'use client';

import { useActionState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#0C0B09] text-[#F5F0E8]">
      <Card className="w-full max-w-sm bg-[#161412]/55 backdrop-blur-md border-[#C8A24E]/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-[#C8A24E] text-center tracking-wide">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-500/20 text-red-200/80">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#C8A24E]/80 uppercase tracking-widest text-[10px]">Username</Label>
              <Input 
                name="username" 
                type="text" 
                required 
                className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E] focus-visible:ring-[#C8A24E]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#C8A24E]/80 uppercase tracking-widest text-[10px]">Password</Label>
              <Input 
                name="password" 
                type="password" 
                required 
                className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E] focus-visible:ring-[#C8A24E]/20"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#C8A24E] hover:bg-[#DFC07A] text-[#0C0B09] font-bold tracking-[0.1em] uppercase transition-all duration-300 mt-6"
            >
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
