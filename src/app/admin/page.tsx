import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

export const instant = false;

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams?.query === 'string' ? searchParams.query : '';
  const offerId = typeof searchParams?.offerId === 'string' ? searchParams.offerId : 'all';

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

  const whereClause: import('@prisma/client').Prisma.CustomerWhereInput = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { phone: { contains: query } },
      { claims: { some: { claimCode: { contains: query } } } }
    ];
  }
  if (offerId && offerId !== 'all') {
    whereClause.claims = { some: { offerId } };
  }

  const registrations = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { claims: { include: { offer: true } } }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-100/50 uppercase tracking-wider">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-100/50 uppercase tracking-wider">Registrations Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{registrationsToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-100/50 uppercase tracking-wider">Offers Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{totalOffersAwarded}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-100/50 uppercase tracking-wider">Redeemed Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#25D366]">{redeemedOffers}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100/10">
          <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Registrations & Claims</CardTitle>
          
          <form method="GET" action="/admin" className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input 
              type="text" 
              name="query" 
              defaultValue={query}
              placeholder="Search name, phone, code..."
              className="w-full sm:w-64 bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500 focus-visible:ring-pink-500/20"
            />
            <Select name="offerId" defaultValue={offerId}>
              <SelectTrigger className="w-full sm:w-48 bg-white/5 border-zinc-100/15 text-zinc-100 focus:ring-pink-500/20">
                <SelectValue placeholder="All Offers" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1B17] border-pink-500/20 text-zinc-100">
                <SelectItem value="all">All Offers</SelectItem>
                {allOffers.map(offer => (
                  <SelectItem key={offer.id} value={offer.id}>{offer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="submit" 
              className="bg-pink-500 hover:bg-pink-400 text-black font-bold"
            >
              Search
            </Button>
            {(query || (offerId && offerId !== 'all')) && (
              <a 
                href="/admin"
                className="inline-flex items-center justify-center rounded-lg border text-sm font-medium h-8 px-4 bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300"
              >
                Clear
              </a>
            )}
          </form>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-zinc-100/10 hover:bg-transparent">
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Name</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Phone</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Date</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Winning Offer</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide text-right">Claim Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow className="border-zinc-100/10 hover:bg-white/5 transition-colors">
                  <TableCell colSpan={5} className="py-8 text-center text-zinc-100/50">
                    No matching registrations found
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map(customer => (
                  <TableRow key={customer.id} className="border-zinc-100/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-zinc-100">{customer.name}</TableCell>
                    <TableCell className="text-zinc-100/80">{customer.phone}</TableCell>
                    <TableCell className="text-zinc-100/50">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {customer.claims[0]?.offer?.name ? (
                        <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/30 font-normal">
                          {customer.claims[0]?.offer?.name}
                        </Badge>
                      ) : (
                        <span className="text-zinc-100/30">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.claims[0]?.claimCode ? (
                        <span className="font-mono text-xs px-2 py-1 bg-black/40 rounded border border-white/5 text-zinc-100/90">
                          {customer.claims[0]?.claimCode}
                        </span>
                      ) : (
                        <span className="text-zinc-100/30">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
