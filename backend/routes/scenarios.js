const express = require('express');
const router = express.Router();
const { generateDynamicScenario } = require('../services/scenarioEngine');
const { db } = require('../services/firebase');

/**
 * 1. TRIGGER AGENTIC SCENARIO GENERATION (The 'Any-Signal' Parser)
 * Can accept a specific inputSignal (from a judge prompt) or picker the highest-impact signal from the DB.
 */
router.post('/generate', async (req, res) => {
    try {
        const { inputSignal } = req.body;
        const scenarios = await generateDynamicScenario(inputSignal);
        return res.status(200).json({ success: true, ...scenarios });
    } catch (err) {
        console.error("Scenario generation error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * 3. 'TRACK ACTUAL' Audit Route
 * Triggered manually by a 'Track Actual' button on the dashboard after a 24-hour market outcome occurs.
 * Updates the 'actual' market change in learning_logs, completing the Learning Loop.
 */
router.post('/audit', async (req, res) => {
    const { logId, actualChange } = req.body;

    if (!logId || actualChange === undefined) {
        return res.status(400).json({ error: 'logId and actualChange are required' });
    }

    try {
        const logRef = db.collection('learning_logs').doc(logId);
        const logDoc = await logRef.get();

        if (!logDoc.exists) {
            return res.status(404).json({ error: 'Log not found' });
        }

        const logData = logDoc.data();
        const deviationScore = Math.abs(logData.prediction - actualChange);

        await logRef.update({
            actual: actualChange,
            deviationScore,
            status: 'audited', // Manually audited by user/admin
            auditedAt: new Date()
        });

        // Optionally trigger refinement logic here
        // const { refineIntelligence } = require('../services/learningService');
        // refineIntelligence(logId, logData.prediction, actualChange, logData.metadata);

        return res.status(200).json({
            success: true,
            deviationScore,
            message: `Learning loop updated for log ${logId}. Accuracy tracked.`
        });
    } catch (err) {
        console.error("Audit error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
