import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-pink-500/30 selection:text-pink-200">
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 text-xl font-black tracking-tighter w-full text-center md:text-left md:w-auto">The Cinemoy Admin</div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 items-center">
          <a href="/" className="text-sm text-zinc-400 hover:text-pink-400 transition-colors font-medium" target="_blank">View Site</a>
          {session && (
            <>
              <Link href="/admin" className="text-sm text-zinc-400 hover:text-pink-400 transition-colors font-medium">Dashboard</Link>
              <Link href="/admin/offers" className="text-sm text-zinc-400 hover:text-pink-400 transition-colors font-medium">Offers</Link>
              <Link href="/admin/overrides" className="text-sm text-zinc-400 hover:text-pink-400 transition-colors font-medium">Overrides</Link>
              <Link href="/admin/settings" className="text-sm text-zinc-400 hover:text-pink-400 transition-colors font-medium">Settings</Link>
              <form action={async () => {
                'use server';
                const { logout } = await import('@/lib/auth');
                await logout();
                const { redirect } = await import('next/navigation');
                redirect('/admin/login');
              }}>
                <Button variant="ghost" type="submit" className="text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors h-auto py-2">Logout</Button>
              </form>
            </>
          )}
        </div>
      </nav>
      <main className={!session ? "max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col justify-center px-4" : "p-6 md:p-10 max-w-7xl mx-auto"}>
        {children}
      </main>
    </div>
  );
}
