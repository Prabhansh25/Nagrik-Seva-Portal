import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ThumbsUp, ShieldCheck, ShieldAlert, MessageCircle, Clock, 
  Trash, Send, AlertTriangle, UserCheck, Lock, CheckCircle2, MapPin,
  FileText, Activity, Check
} from 'lucide-react';
import { Issue, Comment } from '../types';

interface IssueDetailsPanelProps {
  issue: Issue;
  currentUserEmail: string;
  currentUserName: string;
  onVote: (issueId: string) => void;
  onValidate: (issueId: string, type: 'validate' | 'dispute') => void;
  onPostComment: (issueId: string, content: string) => void;
  onUpdateOfficialStatus?: (issueId: string, status: Issue['status'], officialResponse: string) => void;
  allIssues?: Issue[];
  onSelectIssue?: (issue: Issue) => void;
}

export default function IssueDetailsPanel({
  issue,
  currentUserEmail,
  currentUserName,
  onVote,
  onValidate,
  onPostComment,
  onUpdateOfficialStatus,
  allIssues = [],
  onSelectIssue,
}: IssueDetailsPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [officialResponseInput, setOfficialResponseInput] = useState('');
  const [selectedAdminStatus, setSelectedAdminStatus] = useState<Issue['status']>('In Progress');

  // Distance calculator using Haversine formula
  const getDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyIssues = allIssues
    ? allIssues
        .filter((other) => other.id !== issue.id)
        .map((other) => ({
          ...other,
          distance: getDistanceInMiles(issue.latitude, issue.longitude, other.latitude, other.longitude),
        }))
        .filter((other) => other.distance <= 5)
        .sort((a, b) => a.distance - b.distance)
    : [];

  // Simulated comments list loader
  useEffect(() => {
    setLoadingComments(true);
    // Preset mock comments based on issue ID to populate instantly
    const seedComments: Comment[] = [
      {
        id: 'c-seed-1',
        issueId: 'issue-seed-1',
        authorName: 'Elena Rostova',
        authorEmail: 'elena.rostova@metro.gov',
        content: 'I verified this pothole is about 6 inches deep. Be extremely careful driving at night, since it is very hard to see without high-beam lights!',
        createdAt: Date.now() - 30 * 3600 * 1000,
      },
      {
        id: 'c-seed-2',
        issueId: 'issue-seed-1',
        authorName: 'Marcus Vance',
        authorEmail: 'mvance99@gmail.com',
        content: 'Passed this lane today. It makes cars swerve into the bike lane which is a secondary hazard for cyclists.',
        createdAt: Date.now() - 25 * 3600 * 1000,
      },
      {
        id: 'c-seed-3',
        issueId: 'issue-seed-2',
        authorName: 'Siddharth Patel',
        authorEmail: 'sidpatel@fastmail.com',
        content: 'The recycling bins are filled specifically with bulk cardboard boxes that should have been broken down. Sanitation definitely has to clear this today.',
        createdAt: Date.now() - 12 * 3600 * 1000,
      }
    ];

    // Filter for current open issue
    const filtered = seedComments.filter(com => com.issueId === issue.id);
    
    // Read local/session storage comments to maintain new user posts
    const stKey = `comments_${issue.id}`;
    const localSaved = localStorage.getItem(stKey);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        setComments([...filtered, ...parsed]);
      } catch (err) {
        setComments(filtered);
      }
    } else {
      setComments(filtered);
    }
    
    setLoadingComments(false);
    setOfficialResponseInput(issue.officialResponse || '');
  }, [issue.id]);

  const handleVoteSubmit = () => {
    onVote(issue.id);
  };

  const handleVerifyProximity = () => {
    onValidate(issue.id, 'validate');
  };

  const handleDisputeProximity = () => {
    onValidate(issue.id, 'dispute');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      issueId: issue.id,
      authorName: currentUserName,
      authorEmail: currentUserEmail,
      content: commentText.trim(),
      createdAt: Date.now(),
    };

    const stKey = `comments_${issue.id}`;
    const existingStr = localStorage.getItem(stKey);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const updated = [...existing, newComment];
    localStorage.setItem(stKey, JSON.stringify(updated));

    setComments(prev => [...prev, newComment]);
    onPostComment(issue.id, commentText.trim());
    setCommentText('');
  };

  const handleAdminUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialResponseInput.trim()) return;
    
    if (onUpdateOfficialStatus) {
      onUpdateOfficialStatus(issue.id, selectedAdminStatus, officialResponseInput.trim());
    }
  };

  const hasUpvoted = issue.upvotedBy?.includes(currentUserEmail);
  const userValidationType = issue.validations?.[currentUserEmail];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-6">
      
      {/* 1. PHOTO COVER OR COLOR BANNER CARD */}
      {issue.imageUrl ? (
        <div className="relative h-64 w-full bg-slate-950 overflow-hidden border-b border-slate-250">
          <img 
            src={issue.imageUrl} 
            alt={issue.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-slate-50 via-slate-100 to-blue-50 px-6 py-4 flex items-center border-b border-slate-200">
          <span className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest">Incident Report File</span>
        </div>
      )}

      {/* 2. CORE DETAILS BLOCK */}
      <div className="px-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-slate-105 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 font-bold uppercase">
              {issue.category}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
              issue.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
              issue.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              issue.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {issue.priority} Priority
            </span>
          </div>

          <span className="text-[10px] text-slate-450 font-mono">
            Reported: {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug font-display">{issue.title}</h2>
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            📍 {issue.locationName}
          </p>
        </div>

        <p className="text-xs font-sans text-slate-600 leading-relaxed bg-slate-50 p-3.5 border border-slate-150 rounded-xl">
          {issue.description}
        </p>

        {/* REPUTATION AND VOTING ACTIONS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-slate-100 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoteSubmit}
              className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                hasUpvoted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-emerald-500' : ''}`} />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote Hazard'}</span>
            </button>
            <span className="text-xs text-slate-500 font-semibold">
              {issue.votes} citizens prioritizing this
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Submitted by: <span className="text-slate-750 font-bold">{issue.reportedBy}</span>
          </div>
        </div>
      </div>

      {/* 3. PEER PROXIMITY VERIFICATION RATIOS */}
      <div className="px-6 space-y-3.5">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Proximity Verification Ratios
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wide">Validation Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-emerald-600">{issue.validationCount}</span>
                <span className="text-slate-500 text-xs">/ {issue.validationCount + issue.disputeCount} audits</span>
              </div>
            </div>
            
            {/* Visual ratio graph */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-3 border border-slate-200">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${(issue.validationCount / Math.max(1, issue.validationCount + issue.disputeCount)) * 100}%` }}
              ></div>
              <div 
                className="bg-red-550 h-full" 
                style={{ width: `${(issue.disputeCount / Math.max(1, issue.validationCount + issue.disputeCount)) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              If disputes accumulate heavily, the municipal department initiates immediate secondary manual checks.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wide">Crowd audit gate</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Have you physically inspected this location or passed it recently? Confirm report accuracy:
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={handleVerifyProximity}
                disabled={userValidationType === 'validate'}
                className={`flex-1 py-1.5 px-3.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition ${
                  userValidationType === 'validate'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{userValidationType === 'validate' ? 'Verified' : 'Verify'}</span>
              </button>

              <button
                onClick={handleDisputeProximity}
                disabled={userValidationType === 'dispute'}
                className={`flex-1 py-1.5 px-3.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition ${
                  userValidationType === 'dispute'
                    ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{userValidationType === 'dispute' ? 'Disputed' : 'Dispute'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI AUTOMATED PRE-EMPTIVE SUGGESTIONS (TECHNOLOGY SOLUTION BOX) */}
      {issue.aiSuggestedSolution && (
        <div className="px-6">
          <div className="bg-blue-50/40 p-4 border border-blue-150 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-750 font-bold text-xs uppercase tracking-wide">
              <span>🤖</span>
              <span>AI Intelligent Municipal Dispatch Suggestion</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans italic">
              "{issue.aiSuggestedSolution}"
            </p>
          </div>
        </div>
      )}

      {/* 4. AI AUTOMATED PRE-EMPTIVE SUGGESTIONS (TECHNOLOGY SOLUTION BOX) */}
      {issue.aiSuggestedSolution && (
        <div className="px-6">
          <div className="bg-blue-50/40 p-4 border border-blue-150 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-750 font-bold text-xs uppercase tracking-wide">
              <span>🤖</span>
              <span>AI Intelligent Municipal Dispatch Suggestion</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans italic">
              "{issue.aiSuggestedSolution}"
            </p>
          </div>
        </div>
      )}

      {/* MUNICIPAL PROGRESS TIMELINE TRACKER */}
      <div className="px-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <Activity className="w-4 h-4 text-blue-700" />
          Nagar Nigam Action & Progress Tracker
        </h3>
        
        <div className="bg-slate-50/30 border border-slate-150 rounded-2xl p-4 md:p-5">
          <div className="relative border-l-2 border-slate-200 ml-3.5 pl-5 space-y-6">
            
            {/* Step 1: Citizen Report Logged */}
            <div className="relative">
              <span className="absolute -left-[30px] top-0 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-850 font-display">Step 1: Public Complaint Filed</h4>
                  <span className="text-[10px] font-mono text-slate-450 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Incident logged in ward registry by citizen <span className="font-semibold text-slate-800">{issue.reportedBy}</span>. Geolocation tags synced.
                </p>
              </div>
            </div>

            {/* Step 2: Community Crowdsourced Validation */}
            <div className="relative">
              <span className={`absolute -left-[30px] top-0 rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center ${
                issue.status !== 'Pending' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-blue-600 text-white animate-pulse'
              }`}>
                <UserCheck className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-850 font-display">Step 2: Community Verification (Satyamev Jayate)</h4>
                  <span className="text-[10px] font-mono text-slate-450 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                    {new Date(issue.createdAt + 15 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {issue.status === 'Pending' ? (
                    <span className="text-blue-700 font-medium">Waiting for {Math.max(0, 3 - issue.validationCount)} more peer approvals to verify authenticity.</span>
                  ) : issue.status === 'Disputed' ? (
                    <span className="text-red-700 font-medium">Disputed by ward citizens! High verification deviation flags raised.</span>
                  ) : (
                    <span>Trust approved. Ground legitimacy established by <span className="font-semibold text-slate-800">{issue.validationCount} validations</span>.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Step 3: Ward Officer Assessment */}
            <div className="relative">
              <span className={`absolute -left-[30px] top-0 rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center ${
                ['Verified', 'In Progress', 'Resolved'].includes(issue.status)
                  ? 'bg-emerald-500 text-white'
                  : issue.status === 'Pending'
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-blue-600 text-white animate-pulse'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-850 font-display">Step 3: Ward Office Officer Inspection</h4>
                  <span className="text-[10px] font-mono text-slate-450 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                    {['Verified', 'In Progress', 'Resolved'].includes(issue.status) 
                      ? new Date(issue.createdAt + 2 * 3600 * 1000).toLocaleDateString() 
                      : 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {['Verified', 'In Progress', 'Resolved'].includes(issue.status) ? (
                    <span>Nagar Nigam Ward Commissioner acknowledged the validated report and allocated dispatch budget.</span>
                  ) : (
                    <span className="text-slate-450 italic">Awaiting community verification approval before official inspection routing.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Step 4: Ground Remediation Pipeline */}
            <div className="relative">
              <span className={`absolute -left-[30px] top-0 rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center ${
                issue.status === 'Resolved'
                  ? 'bg-emerald-500 text-white'
                  : issue.status === 'In Progress'
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-850 font-display">Step 4: Active Remediation & Crew Dispatch</h4>
                  <span className="text-[10px] font-mono text-slate-450 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                    {issue.status === 'Resolved' || issue.status === 'In Progress'
                      ? new Date(issue.createdAt + 6 * 3600 * 1000).toLocaleDateString()
                      : 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {issue.status === 'Resolved' ? (
                    <span>Contractors completed remediation on site. Public space reinstated.</span>
                  ) : issue.status === 'In Progress' ? (
                    <span className="text-blue-700 font-medium">Field engineers deployed on site. Material supply line and work order active.</span>
                  ) : (
                    <span className="text-slate-450 italic">Scheduled in municipal queue pending engineer review assignment.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Step 5: Resolution Close & Sign-Off */}
            <div className="relative">
              <span className={`absolute -left-[30px] top-0 rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center ${
                issue.status === 'Resolved'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-850 font-display">Step 5: Resolution Certified & Closed</h4>
                  <span className="text-[10px] font-mono text-slate-450 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                    {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {issue.status === 'Resolved' ? (
                    <span>Nagar Nigam Ward engineer signed off on resolution quality audit. complaint successfully marked resolved.</span>
                  ) : (
                    <span className="text-slate-450 italic">Pending official closing certification. Verified resolution logs will appear upon completion.</span>
                  )}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* NEARBY INCIDENTS SECTION (5-MILE RADIUS) */}
      <div className="px-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <MapPin className="w-4 h-4 text-blue-700" />
          Nearby Incidents (Within 5 Miles)
        </h3>
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {nearbyIssues.length > 0 ? (
            nearbyIssues.map((nearby) => (
              <div
                key={nearby.id}
                onClick={() => onSelectIssue?.(nearby)}
                className="p-3 bg-slate-50/50 hover:bg-slate-100/70 border border-slate-150 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer shadow-2xs hover:shadow-xs group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-blue-750 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shadow-3xs">
                      📍 {nearby.distance.toFixed(1)} mi
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {nearby.category}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                      nearby.priority === 'Critical' ? 'bg-red-50 text-red-750 border-red-200' :
                      nearby.priority === 'High' ? 'bg-amber-50 text-amber-750 border-amber-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {nearby.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700 transition font-display">
                    {nearby.title}
                  </h4>
                </div>
                
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                    nearby.status === 'Resolved' ? 'bg-emerald-50 text-emerald-750 border-emerald-200' :
                    nearby.status === 'In Progress' ? 'bg-blue-50 text-blue-750 border-blue-200' :
                    nearby.status === 'Verified' ? 'bg-indigo-50 text-indigo-750 border-indigo-200' :
                    'bg-amber-50 text-amber-750 border-amber-200'
                  }`}>
                    {nearby.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    👍 {nearby.votes} votes
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5 bg-slate-50/35 border border-slate-150 rounded-xl text-slate-450 text-xs italic">
              No other reported incidents identified within a 5-mile radius.
            </div>
          )}
        </div>
      </div>

      {/* 5. OFFICIAL MUNICIPAL ACCOUNT RESPONSE OR ADMIN CONTROLS */}
      <div className="px-6">
        <div className="bg-slate-50/20 border border-slate-150 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              Municipal Action Hub & Transparency
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
              issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              issue.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
              issue.status === 'Verified' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {issue.status}
            </span>
          </div>

          {issue.officialResponse ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Official Civil Department Dispatcher:</span>
                {issue.resolvedAt && (
                  <span className="text-[10px] text-emerald-750 font-bold bg-emerald-50 border border-emerald-250 px-1.5 rounded">
                    CLOSED AT: {new Date(issue.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150">
                {issue.officialResponse}
              </p>
            </div>
          ) : (
            <div className="text-[11px] text-slate-450 italic">
              Pending review by certified district engineers. Direct municipal updates will appear here live.
            </div>
          )}

          {/* SIMULATED DISTRICT ENG WORK STATION PANEL */}
          {onUpdateOfficialStatus && (
            <div className="border-t border-slate-150 pt-3.5 space-y-3">
              <details className="group">
                <summary className="text-[10px] font-bold text-blue-750 uppercase tracking-widest cursor-pointer select-none list-none flex items-center justify-between hover:text-blue-600 transition">
                  🛠️ Developer/District Engineer Console (Sandbox Controls)
                  <span className="group-open:rotate-180 transition-transform text-slate-400">▼</span>
                </summary>

                <form onSubmit={handleAdminUpdateSubmit} className="mt-4 space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Update Status</label>
                      <select
                         value={selectedAdminStatus}
                         onChange={(e) => setSelectedAdminStatus(e.target.value as Issue['status'])}
                         className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-[11px] outline-none focus:border-blue-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Verified">Verified Proximity</option>
                        <option value="In Progress">In Progress (Maintenance scheduled)</option>
                        <option value="Resolved">Resolved (Repair completed)</option>
                        <option value="Disputed">Disputed / Fake claim</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase font-bold text-slate-500">District dispatcher account</label>
                      <input
                        type="text"
                        disabled
                        value="Administrative Sandbox Console v1.0"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-500 text-[11px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] uppercase font-bold text-slate-550">Official Municipal response statement</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g., Road repair unit #4 dispatched asphalt levels flush at Main St."
                      value={officialResponseInput}
                      onChange={(e) => setOfficialResponseInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-850 text-[11px] placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg transition shadow-sm"
                  >
                    Commit Status & Notify Citizens
                  </button>
                </form>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* 6. PEER CITIZEN COLLABORATION COMMENT SECTION */}
      <div className="px-6 pb-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
          <MessageCircle className="w-4 h-4 text-blue-700" />
          Collaborative Audits Comments ({comments.length})
        </h3>

        {/* Post Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Add relevant notes (e.g. detour schedules, danger level update)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
          />
          <button
            type="submit"
            className="p-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl transition shadow-sm"
            title="Post Comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Comments Feed List */}
        <div className="space-y-3 h-48 overflow-y-auto pr-1">
          {loadingComments ? (
            <div className="text-center py-4 text-xs text-slate-400 animate-pulse">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => {
              const commenterInit = (comment.authorName || 'C')[0].toUpperCase();
              return (
                <div key={comment.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 text-[10px] font-bold text-slate-750 flex items-center justify-center">
                    {commenterInit}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2.5 text-[10px]">
                      <span className="font-bold text-slate-705 truncate">{comment.authorName}</span>
                      <span className="text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal font-sans">{comment.content}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              No comment audits logged. Offer structural context above!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
