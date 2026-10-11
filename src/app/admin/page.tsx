import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle2, Clock, Gift, Users, Trophy } from 'lucide-react';
import QuickCodeChecker from './QuickCodeChecker';
import RedeemActionCell from './RedeemActionCell';

export const instant = false;

export default async function AdminDashboard(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams?.query === 'string' ? searchParams.query.trim() : '';
  const offerId = typeof searchParams?.offerId === 'string' ? searchParams.offerId : 'all';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'all';

  const totalRegistrations = await prisma.customer.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registrationsToday = await prisma.customer.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  const totalOffersAwarded = await prisma.claim.count();
  const redeemedOffers = await prisma.claim.count({
    where: { redemptionStatus: 'REDEEMED' },
  });
  const unredeemedOffers = await prisma.claim.count({
    where: { redemptionStatus: 'UNREDEEMED' },
  });

  const allOffers = await prisma.offer.findMany({
    orderBy: { name: 'asc' },
  });

  // Prisma Where Clause
  const whereClause: import('@prisma/client').Prisma.CustomerWhereInput = {};

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query } },
      { claims: { some: { claimCode: { contains: query, mode: 'insensitive' } } } },
    ];
  }

  const claimFilter: import('@prisma/client').Prisma.ClaimListRelationFilter = {};
  const claimWhereConditions: import('@prisma/client').Prisma.ClaimWhereInput = {};

  if (offerId && offerId !== 'all') {
    claimWhereConditions.offerId = offerId;
  }

  if (status === 'redeemed') {
    claimWhereConditions.redemptionStatus = 'REDEEMED';
  } else if (status === 'unredeemed') {
    claimWhereConditions.redemptionStatus = 'UNREDEEMED';
  }

  if (Object.keys(claimWhereConditions).length > 0) {
    claimFilter.some = claimWhereConditions;
    whereClause.claims = claimFilter;
  }

  const registrations = await prisma.customer.findMany({
    where: whereClause,
    include: {
      claims: {
        include: {
          offer: true,
        },
      },
    },
  });

  // Sort registrations with WhatsApp sharing priority:
  // Customers who recently initiated WhatsApp sharing appear first!
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const aWa = a.claims[0]?.whatsappInitiatedAt
      ? new Date(a.claims[0].whatsappInitiatedAt).getTime()
      : 0;
    const bWa = b.claims[0]?.whatsappInitiatedAt
      ? new Date(b.claims[0].whatsappInitiatedAt).getTime()
      : 0;

    if (aWa !== bWa) {
      return bWa - aWa; // Higher (more recent) WhatsApp timestamp first
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">
            Admin Dashboard
          </h1>
          <p className="text-sm text-zinc-100/50 mt-1">
            Manage registrations, verify claim codes, and track offer redemptions.
          </p>
        </div>
      </div>

      {/* Quick Code Checker Widget */}
      <QuickCodeChecker />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-100/50 uppercase tracking-wider">
              Total Registrations
            </CardTitle>
            <Users className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-100/50 uppercase tracking-wider">
              Registrations Today
            </CardTitle>
            <Clock className="w-4 h-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{registrationsToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-100/50 uppercase tracking-wider">
              Offers Awarded
            </CardTitle>
            <Trophy className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-100">{totalOffersAwarded}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/55 border-emerald-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.06)]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider">
              Redeemed Offers
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-emerald-400">{redeemedOffers}</div>
              <span className="text-xs text-zinc-100/50">/ {totalOffersAwarded} total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="bg-zinc-900/55 border-pink-500/20 backdrop-blur-md">
        <CardHeader className="flex flex-col gap-4 pb-6 border-b border-zinc-100/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">
                Registrations & Claims
              </CardTitle>
              <p className="text-xs text-zinc-100/50 mt-0.5">
                Entries with recent WhatsApp shares are prioritized at the top.
              </p>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 self-start md:self-auto">
              <Link
                href={`/admin?status=all${query ? `&query=${encodeURIComponent(query)}` : ''}${
                  offerId !== 'all' ? `&offerId=${offerId}` : ''
                }`}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  status === 'all'
                    ? 'bg-pink-500/20 text-white border border-pink-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                All ({totalOffersAwarded})
              </Link>
              <Link
                href={`/admin?status=unredeemed${query ? `&query=${encodeURIComponent(query)}` : ''}${
                  offerId !== 'all' ? `&offerId=${offerId}` : ''
                }`}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  status === 'unredeemed'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                Unredeemed ({unredeemedOffers})
              </Link>
              <Link
                href={`/admin?status=redeemed${query ? `&query=${encodeURIComponent(query)}` : ''}${
                  offerId !== 'all' ? `&offerId=${offerId}` : ''
                }`}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  status === 'redeemed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                Redeemed ({redeemedOffers})
              </Link>
            </div>
          </div>

          {/* Search & Filter Form */}
          <form method="GET" action="/admin" className="flex flex-col sm:flex-row gap-3 w-full">
            <input type="hidden" name="status" value={status} />

            <Input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search by name, phone, or claim code..."
              className="w-full sm:w-72 bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-sm"
            />

            <Select name="offerId" defaultValue={offerId}>
              <SelectTrigger className="w-full sm:w-52 bg-white/5 border-zinc-100/15 text-zinc-100 focus:ring-pink-500/20 text-sm">
                <SelectValue placeholder="All Offers" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1B17] border-pink-500/20 text-zinc-100">
                <SelectItem value="all">All Offers</SelectItem>
                {allOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="submit"
              className="bg-pink-500 hover:bg-pink-400 text-black font-bold text-sm px-5"
            >
              Filter
            </Button>

            {(query || (offerId && offerId !== 'all') || status !== 'all') && (
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-lg border text-sm font-medium h-9 px-4 bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
              >
                Reset Filters
              </a>
            )}
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-zinc-100/10 hover:bg-transparent">
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Customer</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Contact</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Winning Offer</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Claim Code</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">WhatsApp / Date</TableHead>
                <TableHead className="text-zinc-100/70 font-medium tracking-wide">Redemption Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegistrations.length === 0 ? (
                <TableRow className="border-zinc-100/10 hover:bg-white/5 transition-colors">
                  <TableCell colSpan={6} className="py-12 text-center text-zinc-100/50">
                    No matching registrations found with current filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRegistrations.map((customer) => {
                  const claim = customer.claims[0];
                  const hasWhatsApp = !!claim?.whatsappInitiatedAt;
                  const isExpired = !!(
                    claim?.offer?.expiresAt && new Date(claim.offer.expiresAt) < new Date()
                  );

                  return (
                    <TableRow
                      key={customer.id}
                      className={`border-zinc-100/10 hover:bg-white/5 transition-colors ${
                        hasWhatsApp ? 'bg-[#25D366]/[0.03]' : ''
                      }`}
                    >
                      {/* Customer Name */}
                      <TableCell className="font-semibold text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span>{customer.name}</span>
                          {hasWhatsApp && (
                            <span
                              title="Customer clicked Claim via WhatsApp!"
                              className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366]"
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* Phone Number */}
                      <TableCell className="text-zinc-100/80 font-mono text-xs">
                        {customer.phone}
                      </TableCell>

                      {/* Winning Offer */}
                      <TableCell>
                        {claim?.offer?.name ? (
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className="bg-pink-500/10 text-pink-400 border-pink-500/30 font-medium text-xs"
                            >
                              {claim.offer.name}
                            </Badge>
                            {isExpired && (
                              <div className="text-[10px] text-red-400 font-semibold">
                                Expired ({new Date(claim.offer.expiresAt!).toLocaleDateString()})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-100/30">-</span>
                        )}
                      </TableCell>

                      {/* Claim Code */}
                      <TableCell>
                        {claim?.claimCode ? (
                          <span className="font-mono text-xs px-2.5 py-1 bg-black/50 rounded-md border border-white/10 text-pink-300 font-bold select-all">
                            {claim.claimCode}
                          </span>
                        ) : (
                          <span className="text-zinc-100/30">-</span>
                        )}
                      </TableCell>

                      {/* Channel / WhatsApp Status & Date */}
                      <TableCell>
                        <div className="space-y-1">
                          {hasWhatsApp ? (
                            <Badge
                              variant="outline"
                              className="bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30 font-semibold text-[10px] inline-flex items-center gap-1 shadow-[0_0_8px_rgba(37,211,102,0.15)]"
                            >
                              <MessageCircle className="w-3 h-3 text-[#25D366]" />
                              <span>WhatsApp Shared</span>
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-zinc-100/50">Website Spin</span>
                          )}
                          <div className="text-[11px] text-zinc-100/40">
                            {new Date(customer.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </TableCell>

                      {/* Redemption Status & Mark Redeemed Action */}
                      <TableCell>
                        {claim ? (
                          <RedeemActionCell
                            claimId={claim.id}
                            initialStatus={claim.redemptionStatus}
                            initialRedeemedAt={
                              claim.redeemedAt ? claim.redeemedAt.toISOString() : null
                            }
                            isExpired={isExpired}
                            expiresAt={
                              claim.offer.expiresAt ? claim.offer.expiresAt.toISOString() : null
                            }
                          />
                        ) : (
                          <span className="text-zinc-100/30">No Claim</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
