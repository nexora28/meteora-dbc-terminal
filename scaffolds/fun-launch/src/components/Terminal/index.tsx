export function TerminalComponent({ mint: _mint }: { mint: string }) {
  return (
    <div className="rounded-xl border border-neutral-700 p-4 text-sm text-neutral-400">
      Trading is unavailable in this devnet preview. Jupiter mainnet swaps are disabled. Launch
      receipts link directly to devnet accounts; native DBC trading is the next milestone.
    </div>
  );
}
export default TerminalComponent;
