import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const instant = false;

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams?.query === 'string' ? searchParams.query : '';
  const offerId = typeof searchParams?.offerId === 'string' ? searchParams.offerId : '';

  const totalRegistrations = await prisma.customer.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const registrationsToday = await prisma.customer.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });

  const totalOffersAwarded = await prisma.claim.count();
  const redeemedOffers = await prisma.claim.count({
    where: { redemptionStatus: 'REDEEMED' }
  });

  const allOffers = await prisma.offer.findMany({
    orderBy: { name: 'asc' }
  });

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { phone: { contains: query } },
      { claims: { some: { claimCode: { contains: query } } } }
    ];
  }
  if (offerId) {
    whereClause.claims = { some: { offerId } };
  }

  const registrations = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { claims: { include: { offer: true } } }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-serif text-gold-400">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
          <div className="text-sm text-cream/50 mb-2">Total Registrations</div>
          <div className="text-3xl font-bold">{totalRegistrations}</div>
        </div>
        <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
          <div className="text-sm text-cream/50 mb-2">Registrations Today</div>
          <div className="text-3xl font-bold text-gold-400">{registrationsToday}</div>
        </div>
        <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
          <div className="text-sm text-cream/50 mb-2">Offers Awarded</div>
          <div className="text-3xl font-bold">{totalOffersAwarded}</div>
        </div>
        <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
          <div className="text-sm text-cream/50 mb-2">Redeemed Offers</div>
          <div className="text-3xl font-bold text-[#25D366]">{redeemedOffers}</div>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-serif text-gold-400">Registrations & Claims</h2>
          
          <form method="GET" action="/admin" className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              name="query" 
              defaultValue={query}
              placeholder="Search name, phone, code..."
              className="px-4 py-2 bg-black/50 border border-white/10 rounded focus:border-gold-500 focus:outline-none text-white text-sm"
            />
            <select
              name="offerId"
              defaultValue={offerId}
              className="px-4 py-2 bg-black/50 border border-white/10 rounded focus:border-gold-500 focus:outline-none text-white text-sm"
            >
              <option value="">All Offers</option>
              {allOffers.map(offer => (
                <option key={offer.id} value={offer.id}>{offer.name}</option>
              ))}
            </select>
            <button 
              type="submit" 
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-charcoal font-bold rounded text-sm transition-colors"
            >
              Search
            </button>
            {(query || offerId) && (
              <a 
                href="/admin" 
                className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded text-sm transition-colors border border-red-500/20 flex items-center"
              >
                Clear
              </a>
            )}
          </form>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-cream/70">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Winning Offer</th>
                <th className="px-4 py-3 font-medium">Claim Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {registrations.map(customer => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3 text-cream/50">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gold-400">
                    {customer.claims[0]?.offer?.name || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {customer.claims[0]?.claimCode || '-'}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-cream/50">
                    No matching registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
