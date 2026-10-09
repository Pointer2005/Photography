import { PrismaClient } from '@prisma/client';
import { addOverride, deleteOverride } from './actions';

const prisma = new PrismaClient();

export default async function OverridesAdmin() {
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      offers: { where: { isActive: true } },
      overrides: {
        include: { offer: true },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!campaign) {
    return (
      <div>
        <h1 className="text-3xl font-serif text-gold-400 mb-6">Fixed Winners</h1>
        <p className="text-cream/70">No active campaign found. Please create one on the Offers page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-gold-400">Fixed Winners (Overrides)</h1>
      </div>
      
      <p className="text-cream/70 mb-8 max-w-3xl">
        Assign specific winning offers to predetermined mobile numbers. When a customer registers with a matching number, they will bypass the random wheel probabilities and be guaranteed to win their assigned offer.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-white">Add New Override</h2>
          <form action={addOverride.bind(null, campaign.id)} className="bg-black/40 border border-white/10 p-6 rounded-xl space-y-4">
            <div>
              <label className="block text-sm text-cream/70 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                required
                className="w-full px-4 py-2 bg-charcoal border border-white/10 rounded focus:border-gold-500 focus:outline-none text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-cream/70 mb-1">Assign Offer</label>
              <select
                name="offerId"
                required
                className="w-full px-4 py-2 bg-charcoal border border-white/10 rounded focus:border-gold-500 focus:outline-none text-white"
              >
                {campaign.offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-charcoal font-bold rounded mt-4"
            >
              Save Override
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-white">Configured Overrides</h2>
          
          {campaign.overrides.length === 0 ? (
            <div className="bg-black/20 border border-white/5 p-8 rounded-xl text-center text-cream/50">
              No overrides configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.overrides.map((override) => (
                <div key={override.id} className={`bg-black/40 border ${override.isUsed ? 'border-red-500/20' : 'border-gold-500/30'} p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4`}>
                  <div>
                    <h3 className="font-bold text-lg text-white font-mono tracking-wider">{override.phone}</h3>
                    <p className="text-sm text-gold-400 font-medium">Assigned: {override.offer.name}</p>
                    <p className="text-xs text-cream/50 mt-1">
                      Status: {override.isUsed ? (
                        <span className="text-red-400 font-bold">Already Claimed</span>
                      ) : (
                        <span className="text-green-400 font-bold">Waiting for Spin</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <form action={deleteOverride.bind(null, override.id)}>
                      <button type="submit" className="text-sm px-4 py-2 bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded transition-colors">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
