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
    <div className="min-h-screen bg-[#0C0B09] text-[#F5F0E8] font-sans selection:bg-[#C8A24E]/25 selection:text-[#DFC07A]">
      <nav className="bg-[#161412]/80 backdrop-blur-md border-b border-[#C8A24E]/20 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0">
        <div className="font-serif text-[#C8A24E] text-xl font-bold tracking-wide italic w-full text-center md:text-left md:w-auto">The Cinemoy Admin</div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 items-center">
          <a href="/" className="text-sm text-[#F5F0E8]/70 hover:text-[#C8A24E] transition-colors" target="_blank">View Site</a>
          {session && (
            <>
              <Link href="/admin" className="text-sm text-[#F5F0E8]/70 hover:text-[#C8A24E] transition-colors">Dashboard</Link>
              <Link href="/admin/offers" className="text-sm text-[#F5F0E8]/70 hover:text-[#C8A24E] transition-colors">Offers</Link>
              <Link href="/admin/overrides" className="text-sm text-[#F5F0E8]/70 hover:text-[#C8A24E] transition-colors">Overrides</Link>
              <Link href="/admin/settings" className="text-sm text-[#F5F0E8]/70 hover:text-[#C8A24E] transition-colors">Settings</Link>
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
