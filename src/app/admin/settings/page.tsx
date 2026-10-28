'use client';

import { useActionState, useEffect, useRef } from 'react';
import { changePasswordAction } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-8">
      <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Change Password</CardTitle>
          <CardDescription className="text-zinc-100/50">Update your admin credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-100/70">Current Password</Label>
              <Input 
                type="password" 
                name="currentPassword" 
                className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-100/70">New Password</Label>
              <Input 
                type="password" 
                name="newPassword" 
                className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-100/70">Confirm New Password</Label>
              <Input 
                type="password" 
                name="confirmPassword" 
                className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500"
                required
                minLength={6}
              />
            </div>

            {state?.error && (
              <Alert variant="destructive" className="bg-red-950/30 border-red-500/20 text-red-200/80">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            {state?.success && (
              <Alert className="bg-green-950/30 border-green-500/20 text-green-400">
                <CheckCircle2 className="h-4 w-4 stroke-green-400" />
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-pink-500 hover:bg-pink-400 text-black font-bold mt-4"
            >
              {isPending ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
