import prisma from '@/lib/prisma';
import {
  addOffer,
  updateOffer,
  deleteOffer,
  updateCampaignName,
  updateCampaignStatus,
  seedDefaultOffers,
} from './actions';
import { DEFAULT_OFFERS_LIST } from '@/lib/defaultOffers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const instant = false;

export default async function OffersAdmin() {
  let campaign = await prisma.campaign.findFirst({
    where: { status: 'ACTIVE' },
    include: { offers: { orderBy: { sequencePosition: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  if (!campaign) {
    campaign = await prisma.campaign.findFirst({
      include: { offers: { orderBy: { sequencePosition: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: "Grand Opening Special",
        status: "ACTIVE",
        selectionMode: "WEIGHTED",
        offers: {
          create: DEFAULT_OFFERS_LIST,
        },
      },
      include: { offers: { orderBy: { sequencePosition: 'asc' } } }
    });
  } else if (campaign.offers.length === 0) {
    const campaignId = campaign.id;
    await prisma.offer.createMany({
      data: DEFAULT_OFFERS_LIST.map((offer) => ({
        ...offer,
        campaignId,
        isActive: true,
      })),
    });
    campaign = await prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: { offers: { orderBy: { sequencePosition: 'asc' } } },
    });
  }

  const totalWeight = campaign.offers.filter(o => o.isActive).reduce((sum, o) => sum + o.weight, 0);

  const statusColors = {
    'ACTIVE': 'bg-green-500/10 text-green-400 border-green-500/20',
    'PAUSED': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'ENDED': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Campaign Management</h1>
      </div>

      <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 pb-6 border-b border-zinc-100/10">
            
            <div className="flex-1 w-full max-w-xl space-y-4">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Campaign Name</CardTitle>
                <CardDescription className="text-zinc-100/50 mt-1">Update the public-facing name of your spinning wheel campaign.</CardDescription>
              </div>
              
              <form action={updateCampaignName.bind(null, campaign.id) as unknown as (payload: FormData) => void} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input 
                    name="name" 
                    type="text" 
                    defaultValue={campaign.name}
                    required 
                    className="w-full bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500 focus-visible:ring-pink-500/20" 
                  />
                </div>
                <Button type="submit" className="bg-pink-500 hover:bg-pink-400 text-black font-bold px-6 whitespace-nowrap">
                  Update
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Status Controls</CardTitle>
                <CardDescription className="text-zinc-100/50 mt-1">Manage the lifecycle of the campaign.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                  {campaign.status}
                </Badge>
                
                <form className="flex gap-2">
                  {campaign.status !== 'ACTIVE' && (
                    <Button type="submit" formAction={updateCampaignStatus.bind(null, campaign.id, 'ACTIVE') as unknown as (payload: FormData) => void} variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300">
                      Activate
                    </Button>
                  )}
                  {campaign.status !== 'PAUSED' && (
                    <Button type="submit" formAction={updateCampaignStatus.bind(null, campaign.id, 'PAUSED') as unknown as (payload: FormData) => void} variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300">
                      Pause
                    </Button>
                  )}
                  {campaign.status !== 'ENDED' && (
                    <Button type="submit" formAction={updateCampaignStatus.bind(null, campaign.id, 'ENDED') as unknown as (payload: FormData) => void} variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                      End Event
                    </Button>
                  )}
                </form>
              </div>
            </div>
            
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ADD OFFER SIDE */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Add New Offer</CardTitle>
              <CardDescription className="text-zinc-100/50">Create a new prize slice on the wheel.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addOffer.bind(null, campaign.id) as unknown as (payload: FormData) => void} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-zinc-100/70">Offer Name</Label>
                  <Input name="name" type="text" required placeholder="e.g. 50% Off Pre-wedding Shoot" className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-100/70">Description <span className="text-zinc-100/30 font-light text-xs">(Optional)</span></Label>
                  <Input name="description" type="text" className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-100/70">Image URL <span className="text-zinc-100/30 font-light text-xs">(Optional)</span></Label>
                  <Input name="imageUrl" type="url" placeholder="https://..." className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-zinc-100/70">Expiration Date</Label>
                    <span className="text-zinc-100/40 font-light text-xs">Leave blank for unlimited</span>
                  </div>
                  <Input 
                    name="expiresAt" 
                    type="datetime-local" 
                    className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-100/70">Type</Label>
                    <Select name="offerType" defaultValue="DISCOUNT_PERCENT">
                      <SelectTrigger className="bg-white/5 border-zinc-100/15 text-zinc-100 focus:ring-pink-500/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E1B17] border-pink-500/20 text-zinc-100">
                        <SelectItem value="DISCOUNT_PERCENT">Discount (%)</SelectItem>
                        <SelectItem value="DISCOUNT_AMOUNT">Discount ($)</SelectItem>
                        <SelectItem value="FREE_SERVICE">Free Service</SelectItem>
                        <SelectItem value="NO_WIN">No Win</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-100/70">Probability Weight</Label>
                    <Input name="weight" type="number" required min="1" defaultValue="1" className="bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-400 text-black font-bold mt-2">
                  Add Offer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* LIST OFFERS SIDE */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Current Offers ({campaign.offers.length})</CardTitle>
                <CardDescription className="text-zinc-100/50">Manage the offers and their probabilities. Total weight represents 100% chance.</CardDescription>
              </div>
              <form action={seedDefaultOffers.bind(null, campaign.id) as unknown as (payload: FormData) => void}>
                <Button variant="outline" size="sm" type="submit" className="bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20 text-xs shrink-0 cursor-pointer">
                  ⚡ Load Default 6 Offers
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.offers.length === 0 ? (
                  <div className="text-zinc-100/50 p-8 border border-dashed border-zinc-100/10 rounded-xl text-center">
                    No offers added yet. Create one to populate the wheel.
                  </div>
                ) : (
                  campaign.offers.map(offer => {
                    const prob = totalWeight > 0 && offer.isActive ? Math.round((offer.weight / totalWeight) * 100) : 0;
                    return (
                      <Card key={offer.id} className="bg-black/40 border-zinc-100/10 hover:border-pink-500/30 transition-colors">
                        <CardContent className="p-5">
                          <form className="flex flex-col gap-4">
                            <input type="hidden" name="offerId" value={offer.id} />
                            
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                              <div className="flex-1 space-y-3 w-full">
                                <Input 
                                  name="name" 
                                  defaultValue={offer.name} 
                                  className="w-full h-auto px-0 py-1 bg-transparent font-bold text-lg text-white border-0 border-b border-transparent focus-visible:ring-0 rounded-none focus-visible:border-pink-500" 
                                />
                                <Input 
                                  name="description" 
                                  defaultValue={offer.description || ''} 
                                  className="w-full h-auto px-0 py-1 bg-transparent text-sm text-zinc-100/70 border-0 border-b border-transparent focus-visible:ring-0 rounded-none focus-visible:border-pink-500" 
                                  placeholder="Offer Description"
                                />
                                <Input 
                                  name="imageUrl" 
                                  type="url"
                                  defaultValue={offer.imageUrl || ''} 
                                  className="w-full h-auto px-0 py-1 bg-transparent text-sm text-zinc-100/70 border-0 border-b border-transparent focus-visible:ring-0 rounded-none focus-visible:border-pink-500" 
                                  placeholder="Image URL (Optional)"
                                />
                              </div>
                              
                              <div className="bg-[#1E1B17] px-4 py-3 rounded-lg border border-zinc-100/5 text-right min-w-[120px] flex-shrink-0">
                                <div className="text-xs text-zinc-100/50 uppercase tracking-widest mb-1">Win Chance</div>
                                <div className="text-2xl font-bold text-pink-500">{prob}%</div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-2 pt-4 border-t border-zinc-100/5">
                              <div className="flex items-center gap-3">
                                <Label className="text-xs text-zinc-100/70">Weight</Label>
                                <Input 
                                  name="weight" 
                                  type="number" 
                                  defaultValue={offer.weight} 
                                  className="w-20 h-8 px-2 text-sm bg-black/50 border-pink-500/30 text-zinc-100 focus-visible:ring-pink-500/30" 
                                />
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <Label className="text-xs text-zinc-100/70">Active</Label>
                                <div className="pt-0.5">
                                  <input 
                                    name="isActive" 
                                    type="checkbox" 
                                    defaultChecked={offer.isActive} 
                                    className="w-4 h-4 rounded border-pink-500/50 bg-black/50 accent-pink-500" 
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-zinc-100/70">Expires</Label>
                                <Input 
                                  name="expiresAt" 
                                  type="datetime-local" 
                                  defaultValue={offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : ''} 
                                  className="w-44 h-8 px-2 text-xs bg-black/50 border-pink-500/30 text-zinc-100 focus-visible:ring-pink-500/30" 
                                />
                              </div>

                              {offer.expiresAt && new Date(offer.expiresAt) < new Date() ? (
                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                                  Expired
                                </Badge>
                              ) : offer.expiresAt ? (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">
                                  Active till {new Date(offer.expiresAt).toLocaleDateString()}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]">
                                  Unlimited
                                </Badge>
                              )}
                              
                              <div className="flex-1 min-w-[20px]"></div>
                              
                              <div className="flex gap-2">
                                <Button type="submit" size="sm" variant="secondary" formAction={updateOffer.bind(null, offer.id) as unknown as (payload: FormData) => void} className="bg-white/10 hover:bg-white/20 text-zinc-100">
                                  Save
                                </Button>
                                <Button type="submit" size="sm" variant="destructive" formAction={deleteOffer.bind(null, offer.id) as unknown as (payload: FormData) => void} className="bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 border border-red-900/50">
                                  Delete
                                </Button>
                              </div>
                            </div>
                            
                            <input type="hidden" name="offerType" value={offer.offerType} />
                          </form>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
