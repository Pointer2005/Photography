'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { markClaimRedeemed, undoClaimRedemption } from './actions';

interface RedeemActionCellProps {
  claimId: string;
  initialStatus: string;
  initialRedeemedAt: string | null;
  isExpired: boolean;
  expiresAt: string | null;
}

export default function RedeemActionCell({
  claimId,
  initialStatus,
  initialRedeemedAt,
  isExpired,
  expiresAt,
}: RedeemActionCellProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [redeemedAt, setRedeemedAt] = useState<string | null>(initialRedeemedAt);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = () => {
    setError(null);
    startTransition(async () => {
      // Optimistic update
      setStatus('REDEEMED');
      setRedeemedAt(new Date().toISOString());

      const res = await markClaimRedeemed(claimId);
      if (!res.success) {
        // Revert on error
        setStatus('UNREDEEMED');
        setRedeemedAt(null);
        setError(res.error || 'Failed to redeem');
      } else {
        router.refresh();
      }
    });
  };

  const handleUndo = () => {
    setError(null);
    startTransition(async () => {
      // Optimistic update
      setStatus('UNREDEEMED');
      setRedeemedAt(null);

      const res = await undoClaimRedemption(claimId);
      if (!res.success) {
        setStatus('REDEEMED');
        setError(res.error || 'Failed to undo');
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {status === 'REDEEMED' ? (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold px-2.5 py-1 inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Redeemed</span>
          </Badge>

          {redeemedAt && (
            <span className="text-[11px] text-zinc-100/50 hidden md:inline">
              {new Date(redeemedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={isPending}
            title="Undo Redemption"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-amber-400 hover:bg-amber-950/20"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
          </Button>
        </div>
      ) : isExpired ? (
        <Badge
          variant="outline"
          className="bg-red-500/15 text-red-400 border-red-500/30 font-medium px-2.5 py-1 inline-flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span>Expired</span>
          {expiresAt && (
            <span className="text-[10px] text-red-300/60 ml-0.5">
              ({new Date(expiresAt).toLocaleDateString()})
            </span>
          )}
        </Badge>
      ) : (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium px-2.5 py-1"
          >
            Pending
          </Badge>

          <Button
            type="button"
            size="sm"
            onClick={handleRedeem}
            disabled={isPending}
            className="h-7 px-2.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 transition-all shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>Mark Redeemed</span>
              </>
            )}
          </Button>
        </div>
      )}

      {error && <span className="text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
