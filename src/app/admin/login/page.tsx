'use client';

import { useActionState } from 'react';
import { adminLoginAction } from '../actions';

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal text-cream">
      <div className="bg-black/50 p-8 rounded-xl border border-gold-500/20 max-w-sm w-full">
        <h1 className="text-2xl font-serif text-gold-400 mb-6 text-center">Admin Login</h1>
        
        {state?.error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-sm rounded">
            {state.error}
          </div>
        )}
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm text-cream/70 mb-1">Username</label>
            <input 
              name="username" 
              type="text" 
              required 
              className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:border-gold-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-cream/70 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:border-gold-500 outline-none"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-2 bg-gold-500 text-charcoal font-bold rounded mt-4 hover:bg-gold-400 disabled:opacity-50"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
