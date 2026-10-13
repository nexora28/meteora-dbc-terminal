import { ComputeBudgetProgram, Transaction } from '@solana/web3.js';

export const MAX_TRADE_PRIORITY_FEE_LAMPORTS = 1_000_000;

// Compare the reviewed operations, rather than account-index ordering in the wire message.
// Wallets can rebuild legacy messages; swap operations and account permissions stay intact.
export function verifyReviewedTransaction(
  reviewedBytes: Uint8Array,
  signed: Transaction,
  allowTradePriorityFee = false
) {
  const reviewed = Transaction.from(reviewedBytes);
  if (!signed.feePayer?.equals(reviewed.feePayer!))
    throw new Error('Wallet changed the fee payer. Reconnect the reviewed wallet.');
  if (signed.recentBlockhash !== reviewed.recentBlockhash)
    throw new Error('Wallet changed the blockhash. Review a fresh quote.');
  const isBudget = (ix: Transaction['instructions'][number]) =>
    ix.programId.equals(ComputeBudgetProgram.programId);
  if (allowTradePriorityFee) {
    let units = 1_400_000;
    let price = BigInt(0);
    const seen = new Set<number>();
    for (const ix of signed.instructions.filter(isBudget)) {
      const data = Buffer.from(ix.data);
      const type = data[0];
      if (type === undefined || seen.has(type) || ix.keys.length)
        throw new Error('Wallet returned an invalid compute budget. Review a new quote.');
      seen.add(type);
      if (type === 2 && data.length === 5) {
        units = data.readUInt32LE(1);
        if (!units || units > 1_400_000)
          throw new Error('Wallet returned an invalid compute limit. Review a new quote.');
      } else if (type === 3 && data.length === 9) {
        price = data.readBigUInt64LE(1);
      } else throw new Error('Wallet changed an unsupported compute setting. Review a new quote.');
    }
    const fee = (BigInt(units) * price + BigInt(999_999)) / BigInt(1_000_000);
    if (fee > BigInt(MAX_TRADE_PRIORITY_FEE_LAMPORTS))
      throw new Error('Wallet priority fee exceeds 0.001 SOL. Review a new quote.');
  }
  const beforeInstructions = allowTradePriorityFee
    ? reviewed.instructions.filter((ix) => !isBudget(ix))
    : reviewed.instructions;
  const afterInstructions = allowTradePriorityFee
    ? signed.instructions.filter((ix) => !isBudget(ix))
    : signed.instructions;
  if (beforeInstructions.length !== afterInstructions.length) {
    const addedPrograms = afterInstructions
      .filter((ix) => !beforeInstructions.some((before) => before.programId.equals(ix.programId)))
      .map((ix) => ix.programId.toBase58());
    throw new Error(
      `Wallet changed the instruction count (${beforeInstructions.length} to ${afterInstructions.length})${addedPrograms.length ? `; added program: ${[...new Set(addedPrograms)].join(', ')}` : ''}. Review a new quote.`
    );
  }
  for (let i = 0; i < beforeInstructions.length; i++) {
    const before = beforeInstructions[i]!;
    const after = afterInstructions[i]!;
    if (
      !after.programId.equals(before.programId) ||
      !Buffer.from(after.data).equals(Buffer.from(before.data)) ||
      after.keys.length !== before.keys.length ||
      after.keys.some((key, index) => {
        const expected = before.keys[index]!;
        return (
          !key.pubkey.equals(expected.pubkey) ||
          key.isSigner !== expected.isSigner ||
          key.isWritable !== expected.isWritable
        );
      })
    )
      throw new Error(`Wallet changed swap instruction ${i + 1}. Review a new quote.`);
  }
  if (!signed.signature || !signed.verifySignatures()) {
    throw new Error('Wallet signature is missing or invalid. Reconnect your wallet and try again.');
  }
}
