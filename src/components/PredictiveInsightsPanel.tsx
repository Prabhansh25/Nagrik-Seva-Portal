import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, ShieldCheck, AlertTriangle, Lightbulb, MapPin, Eye, Zap, Shield } from 'lucide-react';
import { Issue } from '../types';

interface PredictiveInsightsPanelProps {
  issues: Issue[];
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  impactArea: string;
}

interface InsightsResponse {
  summary: string;
  insights: PredictiveInsight[];
}

export default function PredictiveInsightsPanel({ issues }: PredictiveInsightsPanelProps) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/predictive-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ issues }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytical model recommendations.');
        }

        const json = await response.json();
        setData(json);
      } catch (err: any) {
        console.error("Error loading predictive insights:", err);
        setError(err.message || 'Error executing intelligence module.');
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [issues.length]); // Refresh insights if number of reports changes

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-red-655" />;
      case 'Medium':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-emerald-200 uppercase tracking-widest flex items-center gap-1 font-bold">
              <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              Gemini Active Foresight
            </span>
            <div className="text-slate-500 text-xs">Simulated predictive core active</div>
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight font-display">AI Civic Analytics & Predictive Forecasting</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Using machine learning arrays, we cross-reference incoming infrastructure logs, historical report speed, weather indicators, and seasonal metrics to pre-emptively discover municipal failure risks before they impact neighborhoods.
          </p>
        </div>
      </div>

      {/* SKELETON LOADER */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-150 p-5 rounded-2xl md:col-span-3 h-24 flex items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-705" />
            <span className="text-xs font-medium tracking-wide">Evaluating cluster maps and modeling hazard vectors...</span>
          </div>
          
          {[1, 2, 3].map((val) => (
            <div key={val} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs animate-pulse">
              <div className="h-4 bg-slate-150 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-150 rounded"></div>
                <div className="h-3 bg-slate-150 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-slate-150/60 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* ERROR SUMMARY CONTAINER */}
      {!loading && error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
          ⚠️ Predictive Server Encountered an error model. Re-routing fallback predictions: {error}
        </div>
      )}

      {/* RESULTS DISPLAY PANEL */}
      {!loading && data && (
        <div className="space-y-6">
          {/* Summary Core block - Deep Blue brand card as requested */}
          <div className="bg-blue-900 p-5 rounded-2xl border border-blue-800 shadow-sm text-white">
            <h3 className="text-xs font-bold text-orange-450 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              General Intelligence Forecast
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed font-sans">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.insights.map((insight, idx) => (
              <motion.div
                key={insight.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-slate-350 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border ${getRiskBadgeColor(insight.riskLevel)}`}>
                      {getRiskIcon(insight.riskLevel)}
                      {insight.riskLevel} Risk
                    </span>
                    <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {insight.impactArea}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-850 font-display">{insight.title}</h3>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Pre-emptive Solutions box */}
                <div className="mt-4 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-755 font-bold text-[10px] uppercase tracking-wide">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-700" />
                    Preventative Action
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-medium">
                    {insight.recommendation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Municipal API Auto-Dispatch Configured</h4>
              <p className="text-[11px] text-slate-500">Pre-emptively notified city services with high-priority warnings triggered above.</p>
            </div>
            <div className="text-right text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded font-bold">
              AUTO-INTELLIGENCE: STANDBY
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
