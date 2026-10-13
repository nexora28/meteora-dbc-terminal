/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the serverless CommonJS loader explicitly. */
const assert = require('node:assert/strict');
const { Connection } = require('@solana/web3.js');

assert.doesNotThrow(() => new Connection('https://api.devnet.solana.com'));
console.log('CommonJS Solana runtime imports passed without require(ESM) support.');
