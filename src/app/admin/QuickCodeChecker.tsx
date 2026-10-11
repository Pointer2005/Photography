'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  Sparkles,
  Phone,
  User,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { verifyClaimLookup, markClaimRedeemed } from './actions';

interface ClaimLookupResult {
  id: string;
  claimCode: string;
  customerName: string;
  customerPhone: string;
  offerName: string;
  offerDescription: string | null;
  offerExpiresAt: string | null;
  isExpired: boolean;
  redemptionStatus: string;
  redeemedAt: string | null;
  whatsappInitiatedAt: string | null;
  createdAt: string;
}

export default function QuickCodeChecker() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ClaimLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isRedeeming, startRedeem] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSuccessMsg(null);
    setResult(null);

    startSearch(async () => {
      const res = await verifyClaimLookup(query);
      if (res.success && res.claim) {
        setResult(res.claim);
      } else {
        setError(res.error || 'No matching claim found');
      }
    });
  };

  const handleRedeemNow = () => {
    if (!result) return;
    setError(null);
    setSuccessMsg(null);

    startRedeem(async () => {
      const res = await markClaimRedeemed(result.id);
      if (res.success) {
        setResult((prev) =>
          prev
            ? {
                ...prev,
                redemptionStatus: 'REDEEMED',
                redeemedAt: new Date().toISOString(),
              }
            : null
        );
        setSuccessMsg(`Successfully redeemed code "${result.claimCode}"!`);
      } else {
        setError(res.error || 'Failed to redeem offer');
      }
    });
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <Card className="bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-black/80 border-pink-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.08)]">
      <CardContent className="p-5 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Quick Code Verifier & Redeemer</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Instant Look-up
                </span>
              </h2>
              <p className="text-xs text-zinc-100/50">
                Verify customer codes from WhatsApp or in-studio visits in 1 second.
              </p>
            </div>
          </div>
        </div>

        {/* Search input form */}
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste Claim Code (e.g. PHOTO-XYZ123) or enter Phone Number..."
              className="pl-10 h-10 bg-black/40 border-zinc-100/15 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-pink-500 focus-visible:ring-pink-500/20 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="h-10 px-5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-pink-500/20"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>

            {(result || error || successMsg) && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="h-10 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-rose-300 text-xs animate-fade-in">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-emerald-300 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Verification Card Result */}
        {result && (
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-100/50 uppercase tracking-wider">
                  Claim Code:
                </span>
                <span className="font-mono text-base font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-md border border-pink-500/20">
                  {result.claimCode}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {result.redemptionStatus === 'REDEEMED' ? (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs py-1 px-3 font-semibold inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Redeemed on {new Date(result.redeemedAt!).toLocaleDateString()}</span>
                  </Badge>
                ) : result.isExpired ? (
                  <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs py-1 px-3 font-semibold inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Expired Offer</span>
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs py-1 px-3 font-semibold inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Valid & Unredeemed</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-100/50">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer Name</span>
                </div>
                <div className="text-sm font-bold text-white">{result.customerName}</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-100/50">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </div>
                <div className="text-sm font-bold text-white">{result.customerPhone}</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-100/50">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Winning Offer</span>
                </div>
                <div className="text-sm font-bold text-pink-300">{result.offerName}</div>
                {result.offerExpiresAt && (
                  <div className="text-[10px] text-zinc-400">
                    Expiry: {new Date(result.offerExpiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Bottom Section */}
            {result.redemptionStatus === 'UNREDEEMED' && !result.isExpired && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl">
                <div className="text-xs text-emerald-300">
                  ✅ Code is verified and eligible for redemption.
                </div>
                <Button
                  type="button"
                  onClick={handleRedeemNow}
                  disabled={isRedeeming}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-9 px-5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Redeeming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      <span>Confirm & Redeem Offer Now</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {result.redemptionStatus === 'REDEEMED' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Notice: This claim code was already redeemed on{' '}
                  <strong className="text-white">
                    {new Date(result.redeemedAt!).toLocaleString()}
                  </strong>
                  . It cannot be used a second time.
                </span>
              </div>
            )}

            {result.isExpired && result.redemptionStatus !== 'REDEEMED' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  Notice: This offer expired on{' '}
                  <strong className="text-white">
                    {new Date(result.offerExpiresAt!).toLocaleDateString()}
                  </strong>{' '}
                  and can no longer be redeemed.
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
