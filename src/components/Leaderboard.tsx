import React from 'react';
import { Trophy, Shield, Award, Medal, Flame, Trees, CheckCircle2, User, HelpCircle, Target, ArrowRight } from 'lucide-react';
import { UserCivicProfile, CivicQuest } from '../types';

interface LeaderboardProps {
  profiles: UserCivicProfile[];
  quests: CivicQuest[];
  currentUserEmail: string;
  onSimulateQuestProgress?: (questId: string) => void;
}

export default function Leaderboard({
  profiles,
  quests,
  currentUserEmail,
  onSimulateQuestProgress,
}: LeaderboardProps) {

  const getBadgeIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className={className || "w-4 h-4"} />;
      case 'Shield': return <Shield className={className || "w-4 h-4"} />;
      case 'Trees': return <Trees className={className || "w-4 h-4"} />;
      default: return <Award className={className || "w-4 h-4"} />;
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
      default:
        return <span className="w-5 text-center text-xs font-bold text-slate-500">#{rank}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. RANKS & CONTRIBUTING CITIZENS */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl lg:col-span-2 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">Civic Leaderboard</h3>
            <p className="text-[11px] text-slate-500">Leading active community contributors by verification and solved rate</p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Weekly Update</span>
        </div>

        <div className="space-y-2">
          {profiles.map((profile, index) => {
            const isSelf = profile.email === currentUserEmail;
            return (
              <div
                key={profile.email}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  isSelf 
                    ? 'bg-emerald-50 border-emerald-250 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-150 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Display Medal */}
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {getRankMedal(index + 1)}
                  </div>

                  {/* Profile Details */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 font-display">
                      {profile.name}
                      {isSelf && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                          YOU
                        </span>
                      )}
                    </h4>
                    
                    {/* Tiny summary line of reports / validations */}
                    <p className="text-[10px] text-slate-455 mt-0.5">
                      {profile.reportsSubmitted} reports submitted • {profile.validationsDone} validations
                    </p>
                  </div>
                </div>

                {/* Sub Score rewards */}
                <div className="flex items-center gap-4">
                  {/* Badges strip */}
                  <div className="hidden sm:flex items-center gap-1">
                    {profile.badges.map((badge, bidx) => (
                      <div
                        key={bidx}
                        className={`p-1 rounded-md border text-xs cursor-help bg-white border-slate-200 text-slate-700`}
                        title={`${badge.name}: ${badge.description}`}
                      >
                        {getBadgeIcon(badge.iconName, "w-3.5 h-3.5")}
                      </div>
                    ))}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight">{profile.points}</span>
                    <p className="text-[9px] text-emerald-700 uppercase tracking-widest font-bold">Points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gamification Reputation Info */}
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-150 flex items-center gap-4 text-xs text-slate-600 leading-relaxed font-sans">
          <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
          <p>
            Earn <strong className="text-slate-800">150 points</strong> for every newly filed neighborhood issue, <strong className="text-slate-800">30 points</strong> for peer verification audits, and unlocked cosmetic badges to signify your local civic stewardship credentials.
          </p>
        </div>
      </div>

      {/* 2. WEEKLY ACTIVE QUESTS */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-display">
              <Target className="w-4 h-4 text-blue-700" />
              Civic Quests
            </h3>
            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
              Level 1 ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Participate in collaborative peer review to fulfill weekly quotas and unlock bonus prestige ranking points:
          </p>

          <div className="space-y-3.5">
            {quests.map((quest) => {
              const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
              return (
                <div key={quest.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{quest.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed leading-normal">{quest.description}</p>
                    </div>
                    {quest.isCompleted ? (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white animate-pulse" />
                        Done
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-255 px-1.5 py-0.5 rounded">
                        +{quest.pointsReward} xp
                      </span>
                    )}
                  </div>

                  {/* Progress tracker */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-450">
                      <span>{quest.category} progress</span>
                      <span className="font-bold text-slate-600">{quest.progress} / {quest.target}</span>
                    </div>
                    <div className="w-full bg-slate-100 border border-slate-150 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${quest.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Simulation Helper Action for easy validation in sandbox */}
                  {!quest.isCompleted && onSimulateQuestProgress && (
                    <button
                      onClick={() => onSimulateQuestProgress(quest.id)}
                      className="text-[9px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 mt-1 transition cursor-pointer"
                    >
                      Audit action demonstration
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] text-slate-450 text-center mt-5 font-sans">
          Quests refreshed once per week on local Monday 00:00 UTC.
        </div>
      </div>
    </div>
  );
}
