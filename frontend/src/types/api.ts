/**
 * Unified API Schema for ET Edge Platform Intelligence
 * V4 Standard - Recursive Memory & Neural Core
 */

export interface MarketSignal {
  id: string;
  symbol: string;
  type: 'bullish' | 'bearish';
  strength: number; // 0-100
  reasoning: string;
  source: string;
  timestamp: string;
}

export interface LearningStats {
  accuracy: number;
  samples: number;
  lastUpdate: string;
  errorMargin: number;
  // UI extended fields for the Intelligence Pulse
  isImproving?: boolean;
  totalLogs?: number;
  latestLesson?: string;
}

export interface UserPortfolio {
  holdings: string[];
  riskAppetite: 'low' | 'med' | 'high';
  totalValue: number;
}

export interface AgentResponse<T> {
  success: boolean;
  data: T;
  reasoningTrace: Array<{
    step?: number;
    tool: string;
    output: string;
    status: 'success' | 'running' | 'skipped' | 'idle';
  }>;
  outputs?: any;
  stepsCompleted?: number;
}
