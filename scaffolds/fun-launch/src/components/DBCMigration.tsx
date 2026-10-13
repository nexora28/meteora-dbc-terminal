import { useEffect, useState } from 'react';
import { useWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { ComputeBudgetProgram, Transaction } from '@solana/web3.js';
import { DYNAMIC_BONDING_CURVE_PROGRAM_ID } from '@meteora-ag/dynamic-bonding-curve-sdk';
import bs58 from 'bs58';
import { verifyReviewedTransaction } from '@/lib/wallet-transaction';
import { Button } from './ui/button';
import { explorerUrl, transactionReceiptSchema, TransactionReceipt } from '@/lib/launch';

export default function DBCMigration({
  mint,
  eligible,
  migrated,
  target,
  verified,
  onConfirmed,
}: {
  mint: string;
  eligible: boolean;
  migrated: boolean;
  target: string | null;
  verified: boolean;
  onConfirmed: () => void;
}) {
  const { publicKey, signTransaction } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const key = `aegis-devnet-migration:${mint}:${publicKey?.toBase58()}`;
  useEffect(() => {
    setReceipt(null);
    setError('');
    try {
      const saved = transactionReceiptSchema.safeParse(
        JSON.parse(localStorage.getItem(key) || 'null')
      );
      if (saved.success) setReceipt(saved.data);
    } catch {
      /* Receipt stays visible if browser storage is disabled. */
    }
  }, [key]);
  const save = (next: TransactionReceipt | null) => {
    setReceipt(next);
    try {
      if (next) localStorage.setItem(key, JSON.stringify(next));
      else localStorage.removeItem(key);
    } catch {
      /* Receipt stays visible. */
    }
  };
  const migrate = async () => {
    if (busy || !publicKey || !signTransaction || !eligible || receipt?.status === 'pending')
      return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint, payer: publicKey.toBase58() }),
      });
      const prepared = await response.json();
      if (!response.ok) throw new Error(prepared.error);
      if (
        prepared.network !== 'devnet' ||
        prepared.mint !== mint ||
        prepared.payer !== publicKey.toBase58() ||
        prepared.dammPoolAddress !== target ||
        !Number.isSafeInteger(prepared.lastValidBlockHeight) ||
        prepared.lastValidBlockHeight <= 0
      )
        throw new Error('Unexpected migration response');
      const transaction = Transaction.from(Buffer.from(prepared.transaction, 'base64'));
      if (
        !transaction.feePayer?.equals(publicKey) ||
        transaction.recentBlockhash !== prepared.blockhash ||
        !transaction.verifySignatures(false) ||
        !transaction.instructions.some((ix) =>
          ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID)
        ) ||
        transaction.instructions.some(
          (ix) =>
            !ix.programId.equals(DYNAMIC_BONDING_CURVE_PROGRAM_ID) &&
            !ix.programId.equals(ComputeBudgetProgram.programId)
        )
      )
        throw new Error('Unexpected migration transaction');
      const reviewed = transaction.serialize({ requireAllSignatures: false });
      const signed = await signTransaction(transaction);
      verifyReviewedTransaction(reviewed, signed);
      const signedTransaction = signed.serialize().toString('base64');
      const signature = bs58.encode(signed.signature!);
      save({ signature, status: 'pending' });
      const submitted = await fetch('/api/send-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction,
          lastValidBlockHeight: prepared.lastValidBlockHeight,
        }),
      });
      const result = await submitted.json();
      if (result.status === 'confirmed' && result.signature === signature) {
        save({ signature, status: 'confirmed' });
        onConfirmed();
      } else if (result.status === 'failed' || result.status === 'expired') {
        save(null);
        throw new Error(result.error || 'Migration failed');
      } else setError('Confirmation is uncertain. Check the transaction before retrying.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to migrate; check the saved transaction.');
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
        setError('Migration failed on chain.');
      } else setError('Still pending. Check the explorer before retrying.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to check confirmation');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-3 rounded-xl border border-neutral-700 p-5">
      <h2 className="text-xl font-bold">DAMM v2 graduation</h2>
      <p>
        {migrated
          ? 'DBC reports migrated.'
          : eligible
            ? 'The on-chain quote reserve has reached the graduation threshold.'
            : 'The pool must reach its on-chain graduation threshold before migration.'}
      </p>
      <p>
        Your connected wallet pays migration account rent and transaction fees. In-app migration
        supports SOL/SPL pools without locked vesting.
      </p>
      {target && (
        <>
          <a
            className="block break-all text-violet-400 underline"
            href={explorerUrl('address', target)}
            target="_blank"
            rel="noreferrer"
          >
            Expected DAMM v2 pool: {target}
          </a>
          <p>
            {verified
              ? 'Account found at the expected address and owned by the DAMM v2 program.'
              : 'No DAMM v2-owned account verified at this address yet.'}
          </p>
        </>
      )}
      <p>Account ownership does not verify individual position locks or LP amounts.</p>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      {receipt && (
        <div className="space-y-2" aria-live="polite">
          <p>Migration transaction {receipt.status}</p>
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
              <Button disabled={busy} onClick={check}>
                Check confirmation
              </Button>
              <Button disabled={busy} onClick={() => save(null)}>
                I checked the explorer — clear pending receipt
              </Button>
            </>
          )}
        </div>
      )}
      {!migrated &&
        eligible &&
        (publicKey ? (
          <Button
            onClick={migrate}
            disabled={busy || !signTransaction || receipt?.status === 'pending'}
          >
            Review and sign migration
          </Button>
        ) : (
          <Button onClick={() => setShowModal(true)}>Connect wallet to migrate</Button>
        ))}
      <a
        className="block text-violet-400 underline"
        href="https://migrator.meteora.ag/"
        target="_blank"
        rel="noreferrer"
      >
        Official manual migrator (select Devnet and enter this mint)
      </a>
      {busy && <p role="status">Waiting for wallet or migration confirmation…</p>}
    </section>
  );
}
