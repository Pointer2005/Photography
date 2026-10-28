'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface OfferOption {
  id: string;
  name: string;
}

interface AdminFilterBarProps {
  currentQuery: string;
  currentOfferId: string;
  currentStatus: string;
  totalCount: number;
  unredeemedCount: number;
  redeemedCount: number;
  offers: OfferOption[];
}

export default function AdminFilterBar({
  currentQuery,
  currentOfferId,
  currentStatus,
  totalCount,
  unredeemedCount,
  redeemedCount,
  offers,
}: AdminFilterBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(currentQuery);
  const [offerId, setOfferId] = useState(currentOfferId);
  const [status, setStatus] = useState(currentStatus);

  const applyFilters = (newStatus?: string, newOfferId?: string, newQuery?: string) => {
    const s = newStatus !== undefined ? newStatus : status;
    const o = newOfferId !== undefined ? newOfferId : offerId;
    const q = newQuery !== undefined ? newQuery : query;

    const params = new URLSearchParams();
    if (s && s !== 'all') params.set('status', s);
    if (o && o !== 'all') params.set('offerId', o);
    if (q && q.trim()) params.set('query', q.trim());

    const url = `/admin${params.toString() ? `?${params.toString()}` : ''}`;

    startTransition(() => {
      router.push(url, { scroll: false });
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    applyFilters(newStatus);
  };

  const handleOfferChange = (newOfferId: string | null) => {
    const val = newOfferId || 'all';
    setOfferId(val);
    applyFilters(undefined, val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setQuery('');
    setOfferId('all');
    setStatus('all');
    startTransition(() => {
      router.push('/admin', { scroll: false });
    });
  };

  const isFiltered = currentQuery || currentOfferId !== 'all' || currentStatus !== 'all';

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar: Title & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">
            Registrations & Claims
          </h2>
          <p className="text-xs text-zinc-100/50 mt-0.5">
            Entries with recent WhatsApp shares are prioritized at the top.
          </p>
        </div>

        {/* Quick Status Filter Tabs with Instant Transition */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => handleStatusChange('all')}
            disabled={isPending}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              status === 'all'
                ? 'bg-pink-500/20 text-white border border-pink-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('unredeemed')}
            disabled={isPending}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              status === 'unredeemed'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            Unredeemed ({unredeemedCount})
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange('redeemed')}
            disabled={isPending}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              status === 'redeemed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            Redeemed ({redeemedCount})
          </button>
        </div>
      </div>

      {/* Client Search & Filter Controls (Instant SPA transitions, no hard page reloads) */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or claim code..."
          className="w-full sm:w-72 bg-white/5 border-zinc-100/15 text-zinc-100 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 text-sm"
        />

        <Select value={offerId} onValueChange={handleOfferChange}>
          <SelectTrigger className="w-full sm:w-52 bg-white/5 border-zinc-100/15 text-zinc-100 focus:ring-pink-500/20 text-sm">
            <SelectValue placeholder="All Offers" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1B17] border-pink-500/20 text-zinc-100">
            <SelectItem value="all">All Offers</SelectItem>
            {offers.map((offer) => (
              <SelectItem key={offer.id} value={offer.id}>
                {offer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-pink-500 hover:bg-pink-400 text-black font-bold text-sm px-5 transition-all shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Filtering...</span>
            </>
          ) : (
            <span>Filter</span>
          )}
        </Button>

        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isPending}
            className="rounded-lg border text-sm font-medium h-9 px-4 bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            Reset Filters
          </Button>
        )}
      </form>
    </div>
  );
}
