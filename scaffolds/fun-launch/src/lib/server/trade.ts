import { Connection, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  getMint,
  NATIVE_MINT,
  unpackAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  DynamicBondingCurveClient,
  getCurrentPoint,
  getFeeMode,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import { TradeRequest, tokenUnits } from '../trade';

export async function prepareTrade(connection: Connection, request: TradeRequest) {
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const pool = await client.state.getPoolByBaseMint(request.mint);
  if (!pool) throw new Error('No DBC pool found for this mint');
  const state = pool.account.poolState;
  if (state.isMigrated) throw new Error('This pool has migrated; DBC trading has ended');
  const config = await client.state.getPoolConfig(state.config);
  if (!config || !config.quoteMint.equals(NATIVE_MINT) || config.tokenType !== 0)
    throw new Error('Trading currently supports SPL tokens quoted in SOL only');
  if (config.enableFirstSwapWithMinFee)
    throw new Error('First-swap minimum-fee configs are not supported by this trade form');
  if (state.quoteReserve.gte(config.migrationQuoteThreshold))
    throw new Error('The curve is complete; this pool needs migration');
  const owner = new PublicKey(request.owner);
  const mint = new PublicKey(request.mint);
  const [token, currentPoint, solBalance, account] = await Promise.all([
    getMint(connection, mint),
    getCurrentPoint(connection, config.activationType),
    connection.getBalance(owner, 'confirmed'),
    connection.getAccountInfo(getAssociatedTokenAddressSync(mint, owner), 'confirmed'),
  ]);
  const tokenBalance = account
    ? unpackAccount(
        getAssociatedTokenAddressSync(mint, owner),
        account,
        TOKEN_PROGRAM_ID
      ).amount.toString()
    : '0';
  const sell = request.side === 'sell';
  const amountIn = tokenUnits(request.amount, sell ? token.decimals : 9);
  if (sell && amountIn.gt(new BN(tokenBalance))) throw new Error('Insufficient token balance');
  if (!sell && amountIn.gte(new BN(solBalance)))
    throw new Error('Insufficient SOL balance; leave SOL for fees and account rent');
  const quote = client.pool.swapQuote({
    virtualPool: pool.account,
    config,
    amountIn,
    swapBaseForQuote: sell,
    slippageBps: request.slippageBps,
    hasReferral: false,
    currentPoint,
    eligibleForFirstSwapWithMinFee: false,
  });
  if (quote.minimumAmountOut.isZero())
    throw new Error('Trade output rounds to zero; use a larger amount');
  const transaction = await client.pool.swap({
    owner,
    pool: pool.publicKey,
    amountIn,
    minimumAmountOut: quote.minimumAmountOut,
    swapBaseForQuote: sell,
    referralTokenAccount: null,
  });
  transaction.instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
  const latest = await connection.getLatestBlockhash('confirmed');
  transaction.feePayer = owner;
  transaction.recentBlockhash = latest.blockhash;
  const bytes = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
  if (bytes.length > 1232) throw new Error('Trade transaction exceeds packet size');
  const feeMode = getFeeMode(config.collectFeeMode, sell ? 0 : 1, false);
  return {
    network: 'devnet' as const,
    mint: request.mint,
    owner: request.owner,
    side: request.side,
    poolAddress: pool.publicKey.toBase58(),
    amountIn: amountIn.toString(),
    outputAmount: quote.outputAmount.toString(),
    minimumAmountOut: quote.minimumAmountOut.toString(),
    fee: quote.tradingFee.add(quote.protocolFee).toString(),
    inputDecimals: sell ? token.decimals : 9,
    outputDecimals: sell ? 9 : token.decimals,
    feeDecimals: feeMode.feesOnBaseToken ? token.decimals : 9,
    feeToken: feeMode.feesOnBaseToken ? 'token' : 'SOL',
    solBalance: String(solBalance),
    tokenBalance,
    tokenDecimals: token.decimals,
    transaction: bytes.toString('base64'),
    ...latest,
    expiresAt: Date.now() + 45_000,
  };
}
