const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service Account Not Found!');
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
}

const db = admin.firestore();

async function runSeed() {
  console.log('🚀 Emergency Seed: Senior Financial Analyst Grounding...');

  const signals = [
    {
      id: 'SIGNAL_HDFCBANK_EMERGENCY',
      symbol: "HDFCBANK",
      type: "technical_signal",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      is_video_worthy: true,
      whatHappened: "HDFC Bank technical breakout confirmed above ₹1,750 resistance level.",
      reasoning: "The stock has successfully cleared its 52-week high on 2.4x volume expansion. Relative Strength Index (RSI) remains in the bullish zone at 68, supported by sustained FII inflows and strong momentum in the O2C segment.",
      outputs: {
        recommendation: {
          impactScore: 0.95,
          headline: "HDFC Bank: Mid-Term Breakout Confirmed",
          balancedView: "Price action is supported by heavy institutional volume. While RSI suggests momentum, proximity to psychological resistance at ₹1,800 warrants calibrated entry."
        }
      }
    },
    {
      id: 'SIGNAL_RELIANCE_EMERGENCY',
      symbol: "RELIANCE",
      type: "macro_signal",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      is_video_worthy: true,
      whatHappened: "Institutional momentum shifts in high-cap banking stocks as retail participation accelerates.",
      reasoning: "Abnormal volume spikes occurring at key structural support zones, specifically within major private lenders. This convergence of technical indicators suggests institutional rotation rather than generic market noise.",
      outputs: {
        recommendation: {
          impactScore: 0.88,
          headline: "Market Alert: Institutional Rotation Detected",
          balancedView: "We advise calibrating risk exposure to these established supports until further volatility compression is observed. Data-driven analysis complete."
        }
      }
    }
  ];

  const intelligence = {
    id: 'INTEL_BATCH_EMERGENCY',
    type: 'batch_news',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    articles: [
      {
        title: "Banking Sector Resilience Signals Broad Market Recovery",
        aiAnalysis: {
          sentiment: "Positive",
          impactScore: 88,
          reasoning: "Major private lenders are reporting margin expansion despite global rate volatility. This is driving a rotation back into quality banking stocks.",
          source: "[Source: ET Edge Institutional Intelligence]"
        }
      }
    ]
  };

  for (const s of signals) {
    await db.collection('market_signals').doc(s.id).set(s);
    console.log(`✅ Seeded Signal: ${s.symbol}`);
  }

  await db.collection('intelligence').doc(intelligence.id).set(intelligence);
  console.log(`✅ Seeded Intelligence: ${intelligence.id}`);

  console.log('✨ Emergency Seed Complete.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
