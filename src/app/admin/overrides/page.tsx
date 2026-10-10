import { PrismaClient } from '@prisma/client';
import { addOverride, deleteOverride } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

export const instant = false;

export default async function OverridesAdmin() {
  const campaign = await prisma.campaign.findFirst({
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
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-[#C8A24E]">Fixed Winners</h1>
        <Card className="bg-[#161412]/55 border-[#C8A24E]/20 backdrop-blur-md">
          <CardContent className="p-8 text-center text-[#F5F0E8]/70">
            No active campaign found. Please create one on the Offers page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#C8A24E] mb-2">Fixed Winners (Overrides)</h1>
        <p className="text-[#F5F0E8]/60 max-w-3xl leading-relaxed">
          Assign specific winning offers to predetermined mobile numbers. When a customer registers with a matching number, they will bypass the random wheel probabilities and be guaranteed to win their assigned offer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="bg-[#161412]/55 border-[#C8A24E]/20 backdrop-blur-md sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#C8A24E]">Add New Override</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addOverride.bind(null, campaign.id) as unknown as (payload: FormData) => void} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[#F5F0E8]/70">Mobile Number</Label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    required
                    className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus-visible:border-[#C8A24E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#F5F0E8]/70">Assign Offer</Label>
                  <Select name="offerId" required>
                    <SelectTrigger className="bg-white/5 border-[#F5F0E8]/15 text-[#F5F0E8] focus:ring-[#C8A24E]/20">
                      <SelectValue placeholder="Select an offer" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1B17] border-[#C8A24E]/20 text-[#F5F0E8]">
                      {campaign.offers.map((offer) => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-[#C8A24E] hover:bg-[#DFC07A] text-[#0C0B09] font-bold mt-2"
                >
                  Save Override
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="bg-[#161412]/55 border-[#C8A24E]/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-[#C8A24E]">Configured Overrides</CardTitle>
              <CardDescription className="text-[#F5F0E8]/50">List of all active and claimed phone number overrides.</CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.overrides.length === 0 ? (
                <div className="p-8 border border-dashed border-[#F5F0E8]/10 rounded-xl text-center text-[#F5F0E8]/50">
                  No overrides configured yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {campaign.overrides.map((override) => (
                    <Card key={override.id} className={`bg-black/40 ${override.isUsed ? 'border-red-500/20' : 'border-[#C8A24E]/30'} flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors`}>
                      <CardContent className="p-5 flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-white font-mono tracking-wider">{override.phone}</h3>
                            {override.isUsed ? (
                              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold uppercase tracking-wider text-[10px]">Claimed</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-bold uppercase tracking-wider text-[10px]">Waiting</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#C8A24E] font-medium flex items-center gap-2">
                            <span className="text-[#F5F0E8]/40">Assigned Offer:</span> {override.offer.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <form action={deleteOverride.bind(null, override.id) as unknown as (payload: FormData) => void}>
                            <Button type="submit" variant="destructive" size="sm" className="bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 border border-red-900/50">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
