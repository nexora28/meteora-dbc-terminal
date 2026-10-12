import { useState } from 'react';
import { DBCPreset } from './presets';

interface DeveloperStackExporterProps {
  preset: DBCPreset;
  customInitialMcap?: number;
  customMigrationMcap?: number;
  customMigrationThreshold?: number;
}

export const DeveloperStackExporter = ({
  preset,
  customInitialMcap,
  customMigrationMcap,
  customMigrationThreshold,
}: DeveloperStackExporterProps) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const json = JSON.stringify(
    {
      previewOnly: true,
      presetId: preset.id,
      quoteToken: preset.quoteToken,
      initialMarketCap: customInitialMcap ?? preset.initialMarketCapSol,
      migrationMarketCap: customMigrationMcap ?? preset.migrationMarketCapSol,
      migrationQuoteThreshold: customMigrationThreshold ?? preset.migrationQuoteThresholdSol,
      startingFeePercent: preset.startingFeePercent,
      endingFeePercent: preset.endingFeePercent,
      feeDecayDurationSlots: preset.feeDecayDurationSlots,
      creatorFeeSharePercent: preset.creatorFeeSharePercent,
    },
    null,
    2
  );
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-800 p-5">
      <h3 className="font-bold">Preview settings</h3>
      <p>
        These illustrative settings are not an executable SDK or CLI config. Custom settings do not
        change the supported devnet launch.
      </p>
      <p>
        The launch page creates a DBC pool configured for DAMM v2 migration. Eligible pools can be
        migrated manually from the live token page. Compounding and DLMM integration are not
        implemented.
      </p>
      <button
        type="button"
        className="rounded border border-neutral-600 px-3 py-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(json);
            setCopied(true);
            setError('');
          } catch {
            setError('Unable to copy. Select the JSON below to copy it manually.');
          }
        }}
      >
        {copied ? 'Copied preview JSON' : 'Copy preview JSON'}
      </button>
      {error && <p role="alert">{error}</p>}
      <pre className="max-h-64 overflow-auto text-xs">{json}</pre>
    </section>
  );
};
