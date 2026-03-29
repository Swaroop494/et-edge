const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to the service account downloaded for the personal project
const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service Account Not Found! Please place service-account.json in /backend.');
  process.exit(1);
}

// Ensure unique initialization for the seeding process
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
}

const db = admin.firestore();

async function seedLive() {
  console.log('🌱 Emergency Seeding: et-edge-live [Personal Account]...');

  const signalsOutput = [
    {
      id: 'RELIANCE_SIGNAL',
      symbol: 'RELIANCE',
      type: 'bullish',
      strength: 88,
      reasoning: 'Strong technical breakout above the 200-DMA with massive retail expansion.',
      source: '[Source: NSE Filing]',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'TCS_SIGNAL',
      symbol: 'TCS',
      type: 'neutral',
      strength: 52,
      reasoning: 'Caution on BFSI spending in North America offset by stable margins.',
      source: '[Source: Reuters]',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'HDFCBANK_SIGNAL',
      symbol: 'HDFC BANK',
      type: 'bullish',
      strength: 82,
      reasoning: 'Post-merger synergy beginning to reflect in NIM expansion and market share capture.',
      source: '[Source: Bloomberg]',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];

  const newsEvent = {
    id: 'RBI_RATE_DECISION',
    type: 'macro',
    whatHappened: 'Rates held steady.',
    whyItMatters: 'Neutral for banks, slightly bearish for high-growth tech valuations.',
    source: '[Source: Institutional Feed]',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  console.log('📡 Populating market_signals (Live-Ready)...');
  for (const sig of signalsOutput) {
    await db.collection('market_signals').doc(sig.id).set(sig);
    console.log(`✅ Seeded: ${sig.symbol} [Strength: ${sig.strength}]`);
  }

  console.log('📡 Populating intelligence (Live-Ready)...');
  await db.collection('intelligence').doc(newsEvent.id).set(newsEvent);
  console.log(`✅ Seeded Intelligence: ${newsEvent.id}`);

  console.log('\n✨ Seeding successful. The et-edge-live environment is now fully synchronized with Senior-Fiduciary data.');
  process.exit(0);
}

seedLive().catch(err => {
  console.error('\n❌ SEEDING FAILED:', err.message);
  process.exit(1);
});
