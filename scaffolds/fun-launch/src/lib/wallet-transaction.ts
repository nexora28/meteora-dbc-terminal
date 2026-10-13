import { Transaction } from '@solana/web3.js';

// Compare the reviewed operations, rather than account-index ordering in the wire message.
// Wallets can rebuild legacy messages; every instruction and account permission must stay intact.
export function verifyReviewedTransaction(reviewedBytes: Uint8Array, signed: Transaction) {
  const reviewed = Transaction.from(reviewedBytes);
  if (
    !signed.feePayer?.equals(reviewed.feePayer!) ||
    signed.recentBlockhash !== reviewed.recentBlockhash ||
    signed.instructions.length !== reviewed.instructions.length
  )
    throw new Error('Wallet changed the reviewed transaction. Review a new quote.');
  for (let i = 0; i < reviewed.instructions.length; i++) {
    const before = reviewed.instructions[i]!;
    const after = signed.instructions[i]!;
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
      throw new Error('Wallet changed the reviewed transaction. Review a new quote.');
  }
  if (!signed.signature || !signed.verifySignatures()) {
    throw new Error('Wallet signature is missing or invalid. Reconnect your wallet and try again.');
  }
}
