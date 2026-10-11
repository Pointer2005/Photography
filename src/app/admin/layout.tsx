import { getSession } from '@/lib/auth';
import AdminNavbar from './AdminNavbar';

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 font-sans selection:bg-pink-500/30 selection:text-pink-200">
      <AdminNavbar hasSession={!!session} />
      <main className={!session ? "w-full flex-grow flex flex-col" : "p-6 md:p-10 max-w-7xl mx-auto w-full"}>
        {children}
      </main>
    </div>
  );
}
