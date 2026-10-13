import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ComputeBudgetProgram, Keypair, Transaction } from '@solana/web3.js';
import { DYNAMIC_BONDING_CURVE_PROGRAM_ID } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import bs58 from 'bs58';
import { verifyReviewedTransaction } from '@/lib/wallet-transaction';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  explorerUrl,
  LaunchReceipt,
  launchReceiptSchema,
  launchMessage,
  launchRequestSchema,
  MAX_LOGO_BYTES,
  SUPPORTED_PRESET,
} from '@/lib/launch';

const receiptKey = 'aegis-devnet-launch-receipt';
const inputClass =
  'w-full rounded-xl border border-neutral-700 bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';

export default function CreatePool() {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<LaunchReceipt | null>(null);
  const [storage, setStorage] = useState<{ ready: boolean; error?: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/upload', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to check token storage');
        setStorage(await response.json());
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setStorage({ ready: false, error: 'Unable to check token storage. Reload to retry.' });
      });
    try {
      const saved = launchReceiptSchema.safeParse(
        JSON.parse(localStorage.getItem(receiptKey) || 'null')
      );
      if (saved.success) setReceipt(saved.data);
    } catch {
      /* Ignore an invalid saved receipt. */
    }
    return () => controller.abort();
  }, []);

  const saveReceipt = (next: LaunchReceipt) => {
    setReceipt(next);
    try {
      localStorage.setItem(receiptKey, JSON.stringify(next));
    } catch {
      /* The visible receipt still works. */
    }
  };

  const checkReceipt = async () => {
    if (!receipt) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/send-transaction?signature=${encodeURIComponent(receipt.signature)}`
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.status === 'confirmed') saveReceipt({ ...receipt, status: 'confirmed' });
      else if (result.status === 'failed') {
        setReceipt(null);
        localStorage.removeItem(receiptKey);
        toast.error('The transaction failed on chain. You can prepare a new launch.');
      } else toast.info('Still unconfirmed. Check the devnet explorer before retrying.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to check confirmation');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !storage?.ready || !publicKey) return;
    if (!signMessage || !signTransaction) {
      toast.error(
        'Use a wallet that supports message and transaction signing, such as Phantom or Solflare.'
      );
      return;
    }
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const file = form.get('tokenLogo');
      if (
        !(file instanceof File) ||
        !file.size ||
        file.size > MAX_LOGO_BYTES ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
      ) {
        throw new Error('Choose a PNG, JPEG or WebP image no larger than 2 MB.');
      }
      const tokenLogo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Unable to read token logo'));
        reader.readAsDataURL(file);
      });
      const mint = Keypair.generate();
      const request = launchRequestSchema.parse({
        tokenName: form.get('tokenName'),
        tokenSymbol: String(form.get('tokenSymbol')).toUpperCase(),
        website: form.get('website'),
        twitter: form.get('twitter'),
        tokenLogo,
        mint: mint.publicKey.toBase58(),
        userWallet: publicKey.toBase58(),
        presetId: SUPPORTED_PRESET,
        expiresAt: Date.now() + 4 * 60_000,
      });
      const signature = Buffer.from(await signMessage(await launchMessage(request))).toString(
        'base64'
      );
      const preparedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, signature }),
      });
      const prepared = await preparedResponse.json();
      if (!preparedResponse.ok) throw new Error(prepared.error || 'Unable to prepare launch');
      if (prepared.network !== 'devnet' || prepared.mint !== request.mint)
        throw new Error('Unexpected launch response');
      const transaction = Transaction.from(Buffer.from(prepared.poolTx, 'base64'));
      if (
        !transaction.feePayer?.equals(publicKey) ||
        transaction.recentBlockhash !== prepared.blockhash ||
        transaction.instructions.some(
          (ix) =>
            !ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID) &&
            !ix.programId.equals(ComputeBudgetProgram.programId)
        )
      ) {
        throw new Error('Unexpected launch transaction');
      }
      // Preserve the config signature supplied by the server.
      transaction.partialSign(mint);
      const reviewed = transaction.serialize({ requireAllSignatures: false });
      const signed = await signTransaction(transaction);
      verifyReviewedTransaction(reviewed, signed);
      const pending = launchReceiptSchema.parse({
        mint: request.mint,
        configAddress: prepared.configAddress,
        poolAddress: prepared.poolAddress,
        metadataUrl: prepared.metadataUrl,
        signature: bs58.encode(signed.signature!),
        status: 'pending',
      });
      const signedTransaction = signed.serialize().toString('base64');
      saveReceipt(pending);
      try {
        const response = await fetch('/api/send-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedTransaction,
            lastValidBlockHeight: prepared.lastValidBlockHeight,
          }),
        });
        const result = await response.json();
        if (result.status === 'confirmed' && result.signature === pending.signature) {
          saveReceipt({ ...pending, status: 'confirmed' });
          toast.success('Pool confirmed on devnet');
        } else if (result.status === 'failed' || result.status === 'expired') {
          setReceipt(null);
          localStorage.removeItem(receiptKey);
          throw new Error(result.error || 'Launch failed');
        } else {
          toast.info('Confirmation is pending. Check the transaction before launching again.');
        }
      } catch (error) {
        // Keep the receipt when delivery or confirmation is uncertain.
        toast.error(
          error instanceof Error ? error.message : 'Check the transaction status in the explorer.'
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to launch token');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Launch on Devnet — Aegis</title>
      </Head>
      <Header />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-foreground">
        <div>
          <h1 className="text-3xl font-bold">Launch a token on devnet</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create a new DBC config and token pool together. Your wallet pays devnet account rent
            and transaction fees.
          </p>
        </div>
        {receipt ? (
          <section className="terminal-panel space-y-4 rounded-2xl p-6" aria-live="polite">
            <h2 className="text-xl font-bold">
              {receipt.status === 'confirmed'
                ? 'Pool confirmed on devnet'
                : 'Launch confirmation pending'}
            </h2>
            {receipt.status === 'pending' && (
              <p className="text-sm">
                Check the transaction before creating another token. A pending receipt does not mean
                the pool is live.
              </p>
            )}
            <dl className="space-y-3 text-sm">
              {(
                [
                  ['Mint', receipt.mint],
                  ['Pool', receipt.poolAddress],
                  ['Config', receipt.configAddress],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-neutral-400">{label}</dt>
                  <dd>
                    <a
                      className="break-all text-violet-400 underline"
                      href={explorerUrl('address', value)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {value}
                    </a>
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-neutral-400">Transaction</dt>
                <dd>
                  <a
                    className="break-all text-violet-400 underline"
                    href={explorerUrl('tx', receipt.signature)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {receipt.signature}
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={receipt.metadataUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-violet-400 underline"
            >
              View published metadata
            </a>
            <p className="text-sm text-neutral-400">
              Find your pool on the live devnet token page. A pending transaction may not have
              created its accounts yet.
            </p>
            <Link className="block text-violet-400 underline" href={`/launch/${receipt.mint}`}>
              View token and pool status
            </Link>
            <Link className="block text-violet-400 underline" href="/my-launches">
              My launches
            </Link>
            {receipt.status === 'pending' && (
              <Button type="button" onClick={checkReceipt} disabled={busy}>
                Check confirmation
              </Button>
            )}
            <Button
              type="button"
              onClick={() => {
                setReceipt(null);
                localStorage.removeItem(receiptKey);
              }}
            >
              {receipt.status === 'pending'
                ? 'I checked the transaction — return to launch'
                : 'Launch another token'}
            </Button>
          </section>
        ) : (
          <form onSubmit={submit} className="terminal-panel space-y-5 rounded-2xl p-6">
            <div className="grid gap-3 text-sm sm:grid-cols-3" aria-label="Launch steps">
              <p className="rounded-xl bg-violet-500/10 p-3">1. Add token details</p>
              <p className="rounded-xl bg-violet-500/10 p-3">2. Authorize metadata</p>
              <p className="rounded-xl bg-violet-500/10 p-3">3. Sign and launch</p>
            </div>
            <div className="rounded-xl border border-neutral-700 p-4 text-sm">
              <p className="font-semibold">Anti-Snipe Fair Launch · SOL quote</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-400">
                <li>1 billion tokens, 6 decimals, immutable metadata authority.</li>
                <li>Base fee: 99% → 1.25% over 120 slots; dynamic fees also enabled.</li>
                <li>
                  Graduation threshold: 85 SOL; migration configured for DAMM v2 with a 1% pool fee.
                </li>
                <li>Permanent LP lock configured: 50% creator, 50% partner after migration.</li>
                <li>Creator and partner fee recipients both use your wallet for this launch.</li>
              </ul>
              <p className="mt-2 text-neutral-400">
                Other presets remain available for preview in the{' '}
                <Link href="/studio" className="text-violet-400 underline">
                  studio
                </Link>
                . Migration execution is not automated yet.
              </p>
            </div>
            <label className="block space-y-2">
              <span>Token name</span>
              <input
                className={inputClass}
                name="tokenName"
                required
                minLength={3}
                maxLength={32}
                placeholder="My Token"
              />
            </label>
            <label className="block space-y-2">
              <span>Symbol</span>
              <input
                className={inputClass}
                name="tokenSymbol"
                required
                maxLength={10}
                pattern="[A-Za-z0-9]+"
                placeholder="TOKEN"
              />
            </label>
            <label className="block space-y-2">
              <span>Logo (PNG, JPEG or WebP, up to 2 MB)</span>
              <input
                className={inputClass}
                name="tokenLogo"
                type="file"
                required
                accept="image/png,image/jpeg,image/webp"
              />
            </label>
            <label className="block space-y-2">
              <span>Website (optional)</span>
              <input
                className={inputClass}
                name="website"
                type="url"
                maxLength={200}
                placeholder="https://example.com"
              />
            </label>
            <label className="block space-y-2">
              <span>X profile (optional)</span>
              <input
                className={inputClass}
                name="twitter"
                type="url"
                maxLength={200}
                placeholder="https://x.com/example"
              />
            </label>
            {!storage?.ready && (
              <p role="status" className="text-sm text-amber-400">
                {storage?.error || 'Checking token storage…'}
              </p>
            )}
            <p className="text-sm text-neutral-400">
              First authorize the metadata upload with a message, then review and sign the devnet
              launch transaction. Get test SOL from{' '}
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 underline"
              >
                Solana Faucet
              </a>
              .
            </p>
            {!publicKey ? (
              <Button type="button" onClick={() => setShowModal(true)}>
                Connect wallet
              </Button>
            ) : (
              <Button type="submit" disabled={busy || !storage?.ready}>
                {busy ? 'Preparing launch…' : 'Launch on devnet'}
              </Button>
            )}
          </form>
        )}
      </main>
    </>
  );
}
