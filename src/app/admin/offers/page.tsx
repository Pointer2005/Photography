import { PrismaClient } from '@prisma/client';
import { addOffer, updateOffer, deleteOffer } from './actions';

const prisma = new PrismaClient();

export const instant = false;

export default async function OffersAdmin() {
  let campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: { offers: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' }
  });

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: "Main Campaign",
        status: "ACTIVE",
        selectionMode: "WEIGHTED",
      },
      include: { offers: true }
    });
  }

  const totalWeight = campaign.offers.filter(o => o.isActive).reduce((sum, o) => sum + o.weight, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-serif text-gold-400">Manage Offers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-serif text-gold-400 mb-4">Add New Offer</h2>
          <form action={addOffer.bind(null, campaign.id)} className="bg-black/40 border border-white/10 p-6 rounded-xl space-y-4">
            <div>
              <label className="block text-sm text-cream/70 mb-1">Offer Name</label>
              <input name="name" type="text" required className="w-full px-4 py-2 bg-black/50 border border-gold-500/30 rounded-lg text-cream" placeholder="e.g. 50% Off Pre-wedding Shoot" />
            </div>
            <div>
              <label className="block text-sm text-cream/70 mb-1">Description (Optional)</label>
              <input name="description" type="text" className="w-full px-4 py-2 bg-black/50 border border-gold-500/30 rounded-lg text-cream" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-cream/70 mb-1">Type</label>
                <select name="offerType" className="w-full px-4 py-2 bg-black/50 border border-gold-500/30 rounded-lg text-cream">
                  <option value="DISCOUNT_PERCENT">Discount (%)</option>
                  <option value="DISCOUNT_AMOUNT">Discount (Amount)</option>
                  <option value="FREE_SERVICE">Free Service</option>
                  <option value="NO_WIN">No Win</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-1">Probability Weight</label>
                <input name="weight" type="number" required min="1" defaultValue="1" className="w-full px-4 py-2 bg-black/50 border border-gold-500/30 rounded-lg text-cream" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-charcoal font-bold rounded-lg transition-colors">
              Add Offer
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-serif text-gold-400 mb-4">Current Offers</h2>
          <div className="space-y-4">
            {campaign.offers.length === 0 && (
              <div className="text-cream/50 bg-black/40 border border-white/10 p-6 rounded-xl text-center">
                No offers added yet.
              </div>
            )}
            {campaign.offers.map(offer => {
              const prob = totalWeight > 0 && offer.isActive ? Math.round((offer.weight / totalWeight) * 100) : 0;
              return (
                <div key={offer.id} className="bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col gap-2 relative">
                  <form className="flex flex-col gap-2">
                    <input type="hidden" name="offerId" value={offer.id} />
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <input 
                          name="name" 
                          defaultValue={offer.name} 
                          className="w-full bg-transparent font-bold text-lg text-white border-b border-transparent focus:border-gold-500 outline-none" 
                        />
                        <input 
                          name="description" 
                          defaultValue={offer.description || ''} 
                          className="w-full bg-transparent text-sm text-cream/70 border-b border-transparent focus:border-gold-500 outline-none mt-1" 
                          placeholder="Description"
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-cream/50">Win Chance</div>
                        <div className="text-xl font-bold text-gold-400">{prob}%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-cream/70">Weight:</label>
                        <input 
                          name="weight" 
                          type="number" 
                          defaultValue={offer.weight} 
                          className="w-16 px-2 py-1 text-sm bg-black/50 border border-gold-500/30 rounded text-cream" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-cream/70">Active:</label>
                        <input 
                          name="isActive" 
                          type="checkbox" 
                          defaultChecked={offer.isActive} 
                          className="w-4 h-4 rounded border-gold-500/50 bg-black/50 checked:bg-gold-500" 
                        />
                      </div>
                      <div className="flex-1"></div>
                      <button formAction={updateOffer.bind(null, offer.id)} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">
                        Save
                      </button>
                      <button formAction={deleteOffer.bind(null, offer.id)} className="text-xs px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors">
                        Delete
                      </button>
                    </div>
                    <input type="hidden" name="offerType" value={offer.offerType} />
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
