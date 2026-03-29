const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service Account Not Found! Please place service-account.json in /backend.');
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
}

const db = admin.firestore();

async function seed() {
  console.log('🚀 Initializing Deep Seeding for et-edge-live...');

  const marketSignals = [
    {
      id: 'RELIANCE_BULL',
      symbol: 'RELIANCE',
      sentiment: 'Bullish',
      reasoning: "Technical breakout on the daily chart with structural high-volume accumulation. RSI shows sustainable momentum above 60, indicating a clear 'Buy on Dips' regime.",
      source: "[Source: Reuters]",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'TCS_NEUTRAL',
      symbol: 'TCS',
      sentiment: 'Neutral',
      reasoning: "Sector-wide rotation and FX volatility have capped upside. Consolidation within the INR 3800-4100 range expected until the next earnings trigger.",
      source: "[Source: Institutional Feed]",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'HDFC_BULL',
      symbol: 'HDFCBANK',
      sentiment: 'Bullish',
      reasoning: "Deep value noted at 2.1x P/B. Credit growth remains resilient at 18%, suggesting that the current consolidation phase is a 'Springboard' for structural re-rating.",
      source: "[Source: NSE Filing Q3]",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  const intelligenceEvents = [
    {
      id: 'INTEREST_RATES_Q1',
      type: 'macro',
      whatHappened: 'RBI Maintains Status Quo on Policy Rates at 6.5%',
      whyItMatters: 'Sustained interest rates focus on core inflation targeting while supporting housing demand. Positive for banking liquidity spreads.',
      source: '[Source: Institutional Feed]',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  console.log('📡 Populating market_signals...');
  for (const signal of marketSignals) {
    await db.collection('market_signals').doc(signal.id).set(signal);
    console.log(`✅ Seeded Signal: ${signal.symbol} (${signal.sentiment})`);
  }

  console.log('📡 Populating intelligence...');
  for (const event of intelligenceEvents) {
    await db.collection('intelligence').doc(event.id).set(event);
    console.log(`✅ Seeded Intelligence: ${event.whatHappened}`);
  }

  console.log('\n✨ Project Seeding Complete. The et-edge-live environment is now fully synchronized.');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ SEEDING FAILED:', err.message);
  process.exit(1);
});
