export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal text-cream font-sans">
      <nav className="bg-black border-b border-gold-500/20 px-6 py-4 flex justify-between items-center">
        <div className="font-serif text-gold-400 text-xl font-bold italic">Photography Admin</div>
        <div className="flex gap-4">
          <a href="/admin" className="text-sm text-cream/70 hover:text-gold-400 transition-colors">Dashboard</a>
          <a href="/admin/offers" className="text-sm text-cream/70 hover:text-gold-400 transition-colors">Offers</a>
          <a href="/admin/overrides" className="text-sm text-cream/70 hover:text-gold-400 transition-colors">Overrides</a>
          <a href="/" className="text-sm text-cream/70 hover:text-gold-400 transition-colors" target="_blank">View Site</a>
          <form action={async () => {
            'use server';
            const { logout } = await import('@/lib/auth');
            await logout();
            const { redirect } = await import('next/navigation');
            redirect('/admin/login');
          }}>
            <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition-colors">Logout</button>
          </form>
        </div>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
