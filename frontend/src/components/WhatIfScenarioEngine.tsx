"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api";

const WhatIfScenarioEngine = () => {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunScenario = async () => {
    if (!scenario) return;
    setLoading(true);
    try {
      const data = await apiFetch<any>("/api/what-if", {
        method: "POST",
        body: JSON.stringify({ scenarioText: scenario }),
      });
      setResult(data);
    } catch (err) {
      console.error("Scenario failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Scenario Engine</h1>
        <p className="text-gray-400 mb-8 text-sm">Predict market shifts before they manifest.</p>

        <div className="relative mb-12">
          <input
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="What if crude oil prices spike to $120?"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white pr-32 focus:border-purple-500 outline-none transition-all"
          />
          <button
            onClick={handleRunScenario}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Run Scenario"}
          </button>
        </div>

        {/* RESULTS GAUGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Equities', 'Risk', 'Momentum'].map((sector) => (
            <div key={sector} className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] uppercase text-gray-500 tracking-tighter">{sector}</span>
              {/* FIX: Dynamic color and text based on AI Verdict */}
              <div className={cn(
                "text-xl font-bold mt-2",
                result?.impactDirection === 'positive' ? 'text-green-400' : 
                result?.impactDirection === 'negative' ? 'text-red-400' : 'text-purple-400'
              )}>
                {result ? (result.impactDirection === 'positive' ? 'Bullish' : 'Bearish') : 'Mixed'}
              </div>
            </div>
          ))}
        </div>
        
        {result && (
          <div className="mt-8 p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
            <h4 className="text-purple-400 text-xs font-bold mb-2 uppercase">Neural Result</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {result.scenarioResult?.actualOutcome || result.scenarioResult?.reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }

export default WhatIfScenarioEngine;