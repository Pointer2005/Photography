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
      <Card className="bg-[#161412]/55 border-[#C8A24E]/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-[#C8A24E]">Change Password</CardTitle>
          <CardDescription className="text-[#F5F0E8]/50">Update your admin credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#F5F0E8]/70">Current Password</Label>
              <Input 
                type="password" 
                name="currentPassword" 
                className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#F5F0E8]/70">New Password</Label>
              <Input 
                type="password" 
                name="newPassword" 
                className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E]"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#F5F0E8]/70">Confirm New Password</Label>
              <Input 
                type="password" 
                name="confirmPassword" 
                className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E]"
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
              className="w-full bg-[#C8A24E] hover:bg-[#DFC07A] text-[#0C0B09] font-bold mt-4"
            >
              {isPending ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
