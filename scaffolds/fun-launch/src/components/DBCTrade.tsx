import { useEffect, useState } from 'react';
import { useWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { Transaction, ComputeBudgetProgram, SystemProgram } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { DYNAMIC_BONDING_CURVE_PROGRAM_ID } from '@meteora-ag/dynamic-bonding-curve-sdk';
import bs58 from 'bs58';
import { verifyReviewedTransaction } from '@/lib/wallet-transaction';
import { Button } from './ui/button';
import { displayUnits, PreparedTrade, preparedTradeSchema, tokenUnits } from '@/lib/trade';
import { explorerUrl, transactionReceiptSchema, TransactionReceipt } from '@/lib/launch';

export default function DBCTrade({
  mint,
  available,
  onConfirmed,
}: {
  mint: string;
  available: boolean;
  onConfirmed: () => void;
}) {
  const { publicKey, signTransaction } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const owner = publicKey?.toBase58();
  const key = `aegis-devnet-trade:${mint}:${owner}`;
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState(100);
  const [quote, setQuote] = useState<PreparedTrade | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setQuote(null);
    setReceipt(null);
    setError('');
    try {
      const saved = transactionReceiptSchema.safeParse(
        JSON.parse(localStorage.getItem(key) || 'null')
      );
      if (saved.success) setReceipt(saved.data);
    } catch {
      /* Keep the form available if storage is disabled. */
    }
  }, [key]);
  const save = (next: TransactionReceipt | null) => {
    setReceipt(next);
    try {
      if (next) localStorage.setItem(key, JSON.stringify(next));
      else localStorage.removeItem(key);
    } catch {
      /* The visible receipt still works. */
    }
  };
  const review = async () => {
    if (!owner || busy || receipt?.status === 'pending') return;
    setBusy(true);
    setError('');
    setQuote(null);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint, owner, side, amount, slippageBps }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const prepared = preparedTradeSchema.parse(result);
      if (
        prepared.owner !== owner ||
        prepared.mint !== mint ||
        prepared.side !== side ||
        prepared.amountIn !== tokenUnits(amount, prepared.inputDecimals).toString()
      )
        throw new Error('Unexpected trade quote');
      setQuote(prepared);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to quote trade');
    } finally {
      setBusy(false);
    }
  };
  const execute = async () => {
    if (!quote || !publicKey || !signTransaction || busy || receipt?.status === 'pending') return;
    setBusy(true);
    setError('');
    try {
      if (quote.owner !== publicKey.toBase58() || Date.now() >= quote.expiresAt)
        throw new Error('Quote expired or wallet changed. Review a new quote.');
      const transaction = Transaction.from(Buffer.from(quote.transaction, 'base64'));
      const allowed = [
        DYNAMIC_BONDING_CURVE_PROGRAM_ID,
        ComputeBudgetProgram.programId,
        SystemProgram.programId,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ];
      if (
        !transaction.feePayer?.equals(publicKey) ||
        transaction.recentBlockhash !== quote.blockhash ||
        !transaction.instructions.some((ix) =>
          ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)
        ) ||
        transaction.instructions.some((ix) => !allowed.some((id) => id.equals(ix.programId)))
      )
        throw new Error('Unexpected trade transaction');
      const reviewed = transaction.serialize({ requireAllSignatures: false });
      const signed = await signTransaction(transaction);
      verifyReviewedTransaction(reviewed, signed, true);
      if (Date.now() >= quote.expiresAt)
        throw new Error('Quote expired during wallet review. Get a new quote.');
      const signature = bs58.encode(signed.signature!);
      const signedTransaction = signed.serialize().toString('base64');
      save({ signature, status: 'pending' });
      setQuote(null);
      const response = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction,
          lastValidBlockHeight: quote.lastValidBlockHeight,
        }),
      });
      const result = await response.json();
      if (result.status === 'confirmed' && result.signature === signature) {
        save({ signature, status: 'confirmed' });
        onConfirmed();
      } else if (result.status === 'failed' || result.status === 'expired') {
        save(null);
        throw new Error(result.error || 'Trade failed');
      } else
        setError('Confirmation is uncertain. Check the saved transaction before trading again.');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to submit trade; check the saved transaction.'
      );
    } finally {
      setBusy(false);
    }
  };
  const check = async () => {
    if (!receipt || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/send-transaction?signature=${receipt.signature}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.status === 'confirmed') {
        save({ ...receipt, status: 'confirmed' });
        onConfirmed();
      } else if (result.status === 'failed') {
        save(null);
        setError('Trade failed on chain.');
      } else setError('Still pending. Check the explorer before retrying.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to check confirmation');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-4 rounded-xl border border-neutral-700 p-5">
      <h2 className="text-xl font-bold">Trade on DBC · Devnet</h2>
      <p>
        Exact-input SOL/token trades. Fees can be very high shortly after launch. Your wallet pays
        transaction fees and any token-account rent in addition to the trade.
      </p>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      {receipt && (
        <div className="space-y-2" aria-live="polite">
          <p>Trade {receipt.status}</p>
          <a
            className="block break-all text-violet-400 underline"
            href={explorerUrl('tx', receipt.signature)}
            target="_blank"
            rel="noreferrer"
          >
            {receipt.signature}
          </a>
          {receipt.status === 'pending' && (
            <>
              <Button onClick={check} disabled={busy}>
                Check confirmation
              </Button>
              <Button
                onClick={() => {
                  save(null);
                  setQuote(null);
                }}
                disabled={busy}
              >
                I checked the explorer — clear pending receipt
              </Button>
            </>
          )}
        </div>
      )}
      {!available ? (
        <p>DBC trading is unavailable after migration or for unsupported token/quote types.</p>
      ) : !owner ? (
        <Button onClick={() => setShowModal(true)}>Connect wallet to trade</Button>
      ) : (
        <>
          <fieldset disabled={busy || receipt?.status === 'pending'} className="space-y-3">
            <label className="block">
              Direction
              <select
                className="ml-3 rounded border border-neutral-600 bg-background p-2"
                value={side}
                onChange={(e) => {
                  setSide(e.target.value as 'buy' | 'sell');
                  setQuote(null);
                }}
              >
                <option value="buy">Buy token with SOL</option>
                <option value="sell">Sell token for SOL</option>
              </select>
            </label>
            <label className="block">
              Amount ({side === 'buy' ? 'SOL' : 'token'})
              <input
                className="mt-1 block w-full rounded border border-neutral-600 bg-background p-3"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setQuote(null);
                }}
              />
            </label>
            <label className="block">
              Slippage
              <select
                className="ml-3 rounded border border-neutral-600 bg-background p-2"
                value={slippageBps}
                onChange={(e) => {
                  setSlippageBps(Number(e.target.value));
                  setQuote(null);
                }}
              >
                <option value={50}>0.5%</option>
                <option value={100}>1%</option>
                <option value={200}>2%</option>
              </select>
            </label>
            <Button onClick={review} disabled={!signTransaction || !amount}>
              Review quote
            </Button>
          </fieldset>
          {quote && (
            <div className="space-y-2" aria-live="polite">
              <p>
                Balances: {displayUnits(quote.solBalance, 9)} SOL ·{' '}
                {displayUnits(quote.tokenBalance, quote.tokenDecimals)} tokens
              </p>
              <p>
                Expected output: {displayUnits(quote.outputAmount, quote.outputDecimals)}{' '}
                {side === 'buy' ? 'tokens' : 'SOL'}
              </p>
              <p>
                Minimum received: {displayUnits(quote.minimumAmountOut, quote.outputDecimals)}{' '}
                {side === 'buy' ? 'tokens' : 'SOL'}
              </p>
              <p>
                Included swap fees: {displayUnits(quote.fee, quote.feeDecimals)} {quote.feeToken}
              </p>
              <p className="text-sm text-neutral-400">
                Your wallet may adjust the network priority fee, capped here at 0.001 SOL. This is
                separate from swap fees and token-account rent.
              </p>
              <p>Quote valid for 45 seconds; the transaction enforces this minimum output.</p>
              <Button onClick={execute} disabled={busy || receipt?.status === 'pending'}>
                Sign and submit {side}
              </Button>
            </div>
          )}
        </>
      )}
      {busy && <p role="status">Waiting for quote, wallet or confirmation…</p>}
    </section>
  );
}
