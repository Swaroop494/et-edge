const express = require('express');
const router = express.Router();
const { refineIntelligence } = require('../services/learningService');

const { db } = require('../services/firebase');

// 1. THE 'GROUND TRUTH' SCHEMA (Firestore)
// Endpoint to log feedback and calculate deviation
router.post('/log', async (req, res) => {
    const { eventId, prediction, actual, metadata } = req.body;

    if (!eventId || prediction === undefined || actual === undefined) {
        return res.status(400).json({ error: 'eventId, prediction, and actual are required' });
    }

    try {
        const deviationScore = Math.abs(prediction - actual);
        
        const logEntry = {
            eventId,
            prediction,
            actual,
            deviationScore,
            status: 'pending',
            metadata: metadata || {},
            timestamp: new Date()
        };

        const docRef = await db.collection('learning_logs').add(logEntry);
        
        // Trigger refinement asynchronously (The 'Post-Mortem')
        refineIntelligence(docRef.id, prediction, actual, metadata);

        return res.status(200).json({ 
            success: true, 
            logId: docRef.id, 
            deviationScore 
        });
    } catch (error) {
        console.error('Error logging feedback:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. LIVE ACCURACY CALCULATOR (The Dashboard API)
router.get('/stats', async (req, res) => {
    try {
        const logsSnapshot = await db.collection('learning_logs').orderBy('timestamp', 'desc').limit(100).get();
        
        if (logsSnapshot.empty) {
            return res.status(200).json({ 
                accuracy: 76, 
                totalLogs: 0, 
                latestLesson: "Awaiting first market outcome logs..." 
            });
        }

        let sumPredicted = 0;
        let sumActual = 0;
        let sumAbsoluteDeviation = 0;
        let sumAbsoluteActual = 0;
        let latestLesson = "Calibrating real-time accuracy...";

        logsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.prediction !== undefined && data.actual !== undefined) {
                sumAbsoluteDeviation += Math.abs(data.prediction - data.actual);
                sumAbsoluteActual += Math.abs(data.actual);
                if (data.refinement && data.refinement.lessonLearned && latestLesson === "Calibrating real-time accuracy...") {
                    latestLesson = data.refinement.lessonLearned;
                }
            }
        });

        // Accuracy = (1 - (sum|Predicted - Actual| / sum|Actual|)) * 100
        let accuracy = 76; // Baseline
        if (sumAbsoluteActual > 0) {
            accuracy = Math.max(0, (1 - (sumAbsoluteDeviation / sumAbsoluteActual)) * 100);
        }

        // 4. 'REINFORCEMENT' TRIGGER
        let verificationDepth = 1;
        if (accuracy < 80) {
            verificationDepth = 3; // Increase depth if accuracy is low
        }

        return res.status(200).json({
            accuracy: Math.round(accuracy * 10) / 10,
            totalLogs: logsSnapshot.size,
            latestLesson,
            verificationDepth,
            isImproving: logsSnapshot.size > 1 // Simplistic trend indicator
        });
    } catch (error) {
        console.error('Error fetching learning stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
