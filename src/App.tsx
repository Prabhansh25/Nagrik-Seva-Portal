import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ShieldCheck, Trophy, Sparkles, LineChart, 
  MapPin, HelpCircle, AlertTriangle, Hammer, Leaf, Zap, Shield, 
  Clock, Heart, Info, ChevronRight, CheckCircle2, RefreshCw, LogIn, LogOut, Trees
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Internal modules
import { Issue, CivicQuest, UserCivicProfile } from './types';
import { db } from './firebase';
import { 
  collection, doc, setDoc, getDocs, onSnapshot, 
  updateDoc, writeBatch, arrayUnion, arrayRemove 
} from 'firebase/firestore';

import { 
  METRO_DISTRICTS, INITIAL_CHALLENGES, 
  INITIAL_LEADERBOARD, STATIC_INITIAL_ISSUES 
} from './utils/civicData';

// Subcomponents
import VisualCityMap from './components/VisualCityMap';
import ImpactDashboard from './components/ImpactDashboard';
import PredictiveInsightsPanel from './components/PredictiveInsightsPanel';
import Leaderboard from './components/Leaderboard';
import ReportIssueModal from './components/ReportIssueModal';
import IssueDetailsPanel from './components/IssueDetailsPanel';
import LoginPortal from './components/LoginPortal';

export default function App() {
  // Navigation tabs
  type TabType = 'map' | 'dashboard' | 'insights' | 'leaderboard';
  const [activeTab, setActiveTab] = useState<TabType>('map');

  // Issues & Profile states
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirebaseMode, setIsFirebaseMode] = useState(true);

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Current logged in citizen credentials (for gamification & logging audits)
  const [currentEmail, setCurrentEmail] = useState(() => localStorage.getItem('civic_user_email') || 'prabhansh0125@gmail.com');
  const [currentName, setCurrentName] = useState(() => localStorage.getItem('civic_user_name') || 'Prabhansh Shrivastava');
  const [currentRole, setCurrentRole] = useState<'citizen' | 'admin'>(() => (localStorage.getItem('civic_user_role') as 'citizen' | 'admin') || 'citizen');
  const [currentCity, setCurrentCity] = useState(() => localStorage.getItem('civic_user_city') || 'Bengaluru');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('civic_user_email'));

  const [leaderboard, setLeaderboard] = useState<UserCivicProfile[]>(INITIAL_LEADERBOARD);
  const [quests, setQuests] = useState<CivicQuest[]>(INITIAL_CHALLENGES);

  const handleLogin = (name: string, email: string, role: 'citizen' | 'admin', city: string) => {
    localStorage.setItem('civic_user_email', email);
    localStorage.setItem('civic_user_name', name);
    localStorage.setItem('civic_user_role', role);
    localStorage.setItem('civic_user_city', city);
    setCurrentEmail(email);
    setCurrentName(name);
    setCurrentRole(role);
    setCurrentCity(city);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('civic_user_email');
    localStorage.removeItem('civic_user_name');
    localStorage.removeItem('civic_user_role');
    localStorage.removeItem('civic_user_city');
    setCurrentEmail('');
    setCurrentName('');
    setCurrentRole('citizen');
    setCurrentCity('');
    setIsLoggedIn(false);
  };

  // Selected details drawer
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Location selector during reporting workflow
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingLat, setReportingLat] = useState(40.718);
  const [reportingLng, setReportingLng] = useState(-74.002);
  const [reportingLocationName, setReportingLocationName] = useState('Main St Sector');
  const [isSelectingLocationMode, setIsSelectingLocationMode] = useState(false);

  // Account switching drawer
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [tempName, setTempName] = useState('');

  // 1. SYNC ISSUES AND PERSIST WITH CORRESPONDING FIREBASE STATE/LOCAL-FALLBACK
  useEffect(() => {
    setLoading(true);
    let unsubscribe: () => void = () => {};

    try {
      const issuesRef = collection(db, 'issues');
      
      // Attempt real-time Firestore synchronization
      unsubscribe = onSnapshot(issuesRef, (snapshot) => {
        if (snapshot.empty) {
          // Empty DB. Let's pre-populate mock data to Firestore so index looks gorgeous
          console.log("Firestore empty. Bulk seeding initial sample issues...");
          const batch = writeBatch(db);
          STATIC_INITIAL_ISSUES.forEach((issue) => {
            const docRef = doc(collection(db, 'issues'), issue.id);
            batch.set(docRef, {
              ...issue,
              upvotedBy: issue.upvotedBy || [],
              validations: issue.validations || {},
            });
          });
          batch.commit()
            .then(() => {
              console.log("Seeding Firestore succeeded!");
            })
            .catch((err) => {
              console.warn("Batch write error: falling back to local database simulation.", err);
              fallbackToLocalStorage();
            });
        } else {
          const list: Issue[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Issue);
          });
          // Sort reports by date (newest first)
          list.sort((a, b) => b.createdAt - a.createdAt);
          setIssues(list);
          setIsFirebaseMode(true);
          setLoading(false);
        }
      }, (error) => {
        console.warn("Firestore snapshot error. Running index in fallback local-simulate mode:", error);
        fallbackToLocalStorage();
      });

    } catch (err) {
      console.warn("Firebase initialize missing or failed. Transitioning to browser localStorage:", err);
      fallbackToLocalStorage();
    }

    return () => {
      unsubscribe();
    };

    function fallbackToLocalStorage() {
      setIsFirebaseMode(false);
      const saved = localStorage.getItem('citizen_issues');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setIssues(parsed.sort((a: any, b: any) => b.createdAt - a.createdAt));
        } catch (_) {
          setIssues(STATIC_INITIAL_ISSUES);
        }
      } else {
        localStorage.setItem('citizen_issues', JSON.stringify(STATIC_INITIAL_ISSUES));
        setIssues(STATIC_INITIAL_ISSUES);
      }
      setLoading(false);
    }
  }, []);

  // 2. CALCULATE DYNAMIC LEADERBOARD USER STATUS
  useEffect(() => {
    // Generate active points for currenUser based on reports submitted and validations completed
    const userReportsCount = issues.filter(i => i.reportedByEmail === currentEmail).length;
    // Calculate total validations done by currenUser
    let userValidationsCount = 0;
    issues.forEach(issue => {
      if (issue.validations && issue.validations[currentEmail]) {
        userValidationsCount++;
      }
    });

    const calculatedPoints = 500 + (userReportsCount * 150) + (userValidationsCount * 30);
    
    // Update currenUser inside leaderboards
    const updatedLeaderboard = INITIAL_LEADERBOARD.map(profile => {
      if (profile.email === currentEmail) {
        return {
          ...profile,
          reportsSubmitted: userReportsCount,
          validationsDone: userValidationsCount,
          points: calculatedPoints,
        };
      }
      return profile;
    });

    // Handle currenUser insertion if missing
    const hasSelf = updatedLeaderboard.some(p => p.email === currentEmail);
    if (!hasSelf) {
      updatedLeaderboard.push({
        name: currentName,
        email: currentEmail,
        points: calculatedPoints,
        rank: 5,
        reportsSubmitted: userReportsCount,
        validationsDone: userValidationsCount,
        resolvedHelpCount: 0,
        badges: [
          { id: 'b5', name: 'Active Citizen', description: 'Enrolled in community support dashboard.', iconName: 'Award', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', unlockedAt: Date.now() }
        ]
      });
    }

    // Sort leaderboard profiles by points desc and rebuild rank order index
    const sorted = [...updatedLeaderboard].sort((a, b) => b.points - a.points);
    const ranked = sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setLeaderboard(ranked);

    // 3. TRIGGER CORRESPONDING QUEST COMPLETIONS
    const updatedQuests = INITIAL_CHALLENGES.map(quest => {
      let progress = 0;
      if (quest.id === 'q-1') progress = userReportsCount;
      if (quest.id === 'q-2') progress = userValidationsCount;
      if (quest.id === 'q-3') {
        // Comments tracker count is simulated
        progress = quest.progress;
      }
      if (quest.id === 'q-4') {
        progress = issues.filter(i => i.upvotedBy?.includes(currentEmail)).length;
      }

      return {
        ...quest,
        progress: Math.min(quest.target, progress),
        isCompleted: progress >= quest.target,
      };
    });
    setQuests(updatedQuests);

  }, [issues, currentEmail]);

  // Helper: Persist locally when in fallback offline mode
  const saveIssuesLocal = (newList: Issue[]) => {
    setIssues(newList);
    localStorage.setItem('citizen_issues', JSON.stringify(newList));
  };

  // Action: Upvote hazard reports
  const handleVote = async (issueId: string) => {
    const target = issues.find(i => i.id === issueId);
    if (!target) return;

    const isUpvoted = target.upvotedBy?.includes(currentEmail);
    const updatedVotes = isUpvoted ? target.votes - 1 : target.votes + 1;
    const updatedUpvotedBy = isUpvoted 
      ? (target.upvotedBy || []).filter(e => e !== currentEmail)
      : [...(target.upvotedBy || []), currentEmail];

    setSelectedIssue(prev => prev && prev.id === issueId ? { ...prev, votes: updatedVotes, upvotedBy: updatedUpvotedBy } : prev);

    if (isFirebaseMode) {
      try {
        const docRef = doc(db, 'issues', issueId);
        await updateDoc(docRef, {
          votes: updatedVotes,
          upvotedBy: isUpvoted ? arrayRemove(currentEmail) : arrayUnion(currentEmail)
        });
      } catch (err) {
        console.error("Firestore vote save failed:", err);
      }
    } else {
      const updatedList = issues.map(i => {
        if (i.id === issueId) {
          return { ...i, votes: updatedVotes, upvotedBy: updatedUpvotedBy };
        }
        return i;
      });
      saveIssuesLocal(updatedList);
    }
  };

  // Action: Peer verification audit (validate / dispute)
  const handleValidate = async (issueId: string, type: 'validate' | 'dispute') => {
    const target = issues.find(i => i.id === issueId);
    if (!target) return;

    // Check existing type
    const prevType = target.validations?.[currentEmail];
    if (prevType === type) return; // No change needed

    let validationDelta = 0;
    let disputeDelta = 0;

    if (type === 'validate') {
      validationDelta = 1;
      if (prevType === 'dispute') disputeDelta = -1;
    } else {
      disputeDelta = 1;
      if (prevType === 'validate') validationDelta = -1;
    }

    const updatedValidations = {
      ...(target.validations || {}),
      [currentEmail]: type
    };

    const countVal = (target.validationCount || 0) + validationDelta;
    const countDisp = (target.disputeCount || 0) + disputeDelta;

    // Transition status based on verification threshold
    let targetStatus = target.status;
    if (targetStatus === 'Pending' && countVal >= 3) {
      targetStatus = 'Verified';
    } else if (countDisp > countVal + 2) {
      targetStatus = 'Disputed';
    }

    const updatedProps: Partial<Issue> = {
      validations: updatedValidations,
      validationCount: countVal,
      disputeCount: countDisp,
      status: targetStatus,
    };

    setSelectedIssue(prev => prev && prev.id === issueId ? { ...prev, ...updatedProps } : prev);

    if (isFirebaseMode) {
      try {
        const docRef = doc(db, 'issues', issueId);
        await updateDoc(docRef, {
          [`validations.${currentEmail}`]: type,
          validationCount: countVal,
          disputeCount: countDisp,
          status: targetStatus,
        });
      } catch (err) {
        console.error("Firestore validation save failed:", err);
      }
    } else {
      const updatedList = issues.map(i => {
        if (i.id === issueId) {
          return { ...i, ...updatedProps };
        }
        return i;
      });
      saveIssuesLocal(updatedList);
    }
  };

  // Action: Post Comment (Fires database and localStorage)
  const handlePostComment = async (issueId: string, content: string) => {
    // Comments are synced locally inside the Detail Component storage keys, but we can log updates
    if (isFirebaseMode) {
      console.log(`Citizen commented on report ID: ${issueId}. Writing metadata trace.`);
      try {
        const docRef = doc(db, 'issues', issueId);
        // Track comment activity log directly in issue votes
        await updateDoc(docRef, {
          votes: issues.find(i => i.id === issueId)!.votes + 1
        });
      } catch (_) {}
    }
  };

  // Action: Simulated public officer administrative update (Status & Response)
  const handleUpdateOfficialStatus = async (issueId: string, status: Issue['status'], officialResponse: string) => {
    const updatedProps: Partial<Issue> = {
      status,
      officialResponse,
      resolvedAt: status === 'Resolved' ? Date.now() : undefined,
    };

    setSelectedIssue(prev => prev && prev.id === issueId ? { ...prev, ...updatedProps } : prev);

    if (isFirebaseMode) {
      try {
        const docRef = doc(db, 'issues', issueId);
        await updateDoc(docRef, updatedProps);
      } catch (err) {
        console.error("Firestore official dispatch status commit error:", err);
      }
    } else {
      const updatedList = issues.map(i => {
        if (i.id === issueId) {
          return { ...i, ...updatedProps };
        }
        return i;
      });
      saveIssuesLocal(updatedList);
    }
  };

  // Action: Report newly logged public issue
  const handleCreateReport = async (partialIssue: Partial<Issue>) => {
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: partialIssue.title || 'Untitled Community Concern',
      description: partialIssue.description || 'No description offered.',
      category: partialIssue.category || 'Infrastructure',
      status: 'Pending',
      priority: partialIssue.priority || 'Medium',
      locationName: partialIssue.locationName || 'Unknown grid coordinates',
      latitude: partialIssue.latitude || 40.718,
      longitude: partialIssue.longitude || -74.002,
      imageUrl: partialIssue.imageUrl,
      reportedBy: currentName,
      reportedByEmail: currentEmail,
      createdAt: Date.now(),
      votes: 1,
      upvotedBy: [currentEmail],
      validationCount: 1,
      disputeCount: 0,
      validations: { [currentEmail]: 'validate' },
      aiSuggestedSolution: partialIssue.aiSuggestedSolution,
    };

    if (isFirebaseMode) {
      try {
        await setDoc(doc(db, 'issues', newIssue.id), newIssue);
        setSelectedIssue(newIssue);
      } catch (err) {
        console.error("Firestore report submit failed, caching locally:", err);
        const newList = [newIssue, ...issues];
        saveIssuesLocal(newList);
      }
    } else {
      const newList = [newIssue, ...issues];
      saveIssuesLocal(newList);
      setSelectedIssue(newIssue);
    }

    setShowReportModal(false);
    setIsSelectingLocationMode(false);
  };

  // Click on Custom Vector Map coordinate
  const handleMapLocationSelected = (lat: number, lng: number, name: string) => {
    setReportingLat(lat);
    setReportingLng(lng);
    setReportingLocationName(name);
    
    if (isSelectingLocationMode) {
      setShowReportModal(true);
    }
  };

  const handleQuestSimulation = (questId: string) => {
    // Simulate updating Comments or audits checklist count to test gamification awards instantly!
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest) return;

    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const nextProgress = Math.min(q.target, q.progress + 1);
        return {
          ...q,
          progress: nextProgress,
          isCompleted: nextProgress >= q.target,
        };
      }
      return q;
    }));
  };

  const handleAccountSwitchAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempEmail.trim()) return;

    setCurrentEmail(tempEmail.trim());
    if (tempName.trim()) {
      setCurrentName(tempName.trim());
    }
    setShowAccountSwitch(false);
  };

  // Filtering reports
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || issue.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getCategoryThemeIcon = (categoryStr: string) => {
    switch (categoryStr) {
      case 'Infrastructure': return <Hammer className="w-4 h-4 text-blue-400" />;
      case 'Waste Management': return <Leaf className="w-4 h-4 text-orange-400" />;
      case 'Safety & Hazard': return <Shield className="w-4 h-4 text-red-400" />;
      case 'Utilities': return <Zap className="w-4 h-4 text-yellow-405" />;
      case 'Parks & Recreation': return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'Traffic & Transit': return <Clock className="w-4 h-4 text-violet-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPortal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-800">
      
      {/* HEADER SECTION BAR */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-35 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center font-black text-white shadow-sm font-display text-sm tracking-tight">
              CC
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-800 flex items-center gap-1.5 leading-none font-display">
                CitizenCivic
              </h1>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                Collaborative Municipal Network
              </span>
            </div>
          </div>
          
          {/* Core navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 border border-slate-200 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${activeTab === 'map' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              🗺️ Spatial Map
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              📈 Community Impact
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${activeTab === 'insights' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              🔮 Predictive Foresight
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${activeTab === 'leaderboard' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              🏆 Civic Prestige
            </button>
          </nav>

          {/* Citizen profile switch controls */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl hidden lg:block text-right">
              <div className="text-[9px] font-bold text-blue-700 leading-none uppercase tracking-wide">
                {currentRole === 'admin' ? 'Municipal Officer' : 'Active Citizen'} • {currentCity || 'India'}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 max-w-[150px] truncate">{currentName}</div>
            </div>

            <button
              onClick={() => {
                setTempEmail(currentEmail);
                setTempName(currentName);
                setShowAccountSwitch(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 hover:text-slate-800 text-slate-700 rounded-xl border border-slate-200 transition flex items-center gap-1.5 text-xs font-bold shadow-xs hover:border-slate-350"
              title="Switch user account context"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline font-sans">Role Sandbox</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Sign Out of Civic Network"
            >
              <LogOut className="w-3.5 h-3.5 text-red-700" />
              <span className="hidden sm:inline font-sans">Sign Out</span>
            </button>

            {/* Server health check state indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg text-[9px] font-mono font-bold uppercase select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {isFirebaseMode ? 'Firestore' : 'Sandbox'}
            </div>
          </div>

        </div>

        {/* MOBILE NAVIGATION BAR */}
        <div className="md:hidden flex border-t border-slate-200 overflow-x-auto bg-white">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-center text-xs font-bold border-r border-slate-100 ${activeTab === 'map' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-700' : 'text-slate-500'}`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 text-center text-xs font-bold border-r border-slate-100 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-700' : 'text-slate-500'}`}
          >
            📈 Impact
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-2 text-center text-xs font-bold border-r border-slate-100 ${activeTab === 'insights' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-700' : 'text-slate-500'}`}
          >
            🔮 Foresight
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 text-center text-xs font-bold ${activeTab === 'leaderboard' ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-700' : 'text-slate-500'}`}
          >
            🏆 Prestige
          </button>
        </div>
      </header>

      {/* CORE FRAMEWORK STAGE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-700" />
            <p className="text-xs text-slate-500 tracking-wider font-mono font-bold uppercase">Synthesizing spatial database streams...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: INTERACTIVE PLATFORM AND SPATIAL DISPATCH */}
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* INSTRUCTION CHIP */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-display">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Collaborative Spatial Mapping Grid
                    </h3>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      Select reported incidents from the custom vector map to evaluate details, peer audit proximity validation, and comments. Click "Report New Incident" and choose coordinates on the grid.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsSelectingLocationMode(true);
                      setSelectedIssue(null);
                    }}
                    className="flex-shrink-0 bg-blue-700 hover:bg-blue-650 font-bold text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition"
                  >
                    <Plus className="w-4 h-4 text-white stroke-[3]" />
                    Report New Incident
                  </button>
                </div>

                {/* VISUAL MAP SYSTEM */}
                <VisualCityMap
                  issues={issues}
                  selectedIssue={selectedIssue}
                  onSelectIssue={(issue) => {
                    setSelectedIssue(issue);
                    setIsSelectingLocationMode(false);
                  }}
                  isSelectingLocation={isSelectingLocationMode}
                  onLocationSelected={handleMapLocationSelected}
                  selectedLocation={isSelectingLocationMode ? { lat: reportingLat, lng: reportingLng } : null}
                />

                {/* ROW GRID: INCIDENTS FILTERS LIST AND SELECTED DETAILS VIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COMPONENT (COL-SPAN-6): LIVE DISPATCH QUEUE */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-sm">
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">Community Incident Queue ({filteredIssues.length})</h3>
                      
                      {/* Search Bar Input */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search matching issues, locations, descriptions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition shadow-inner"
                        />
                      </div>

                      {/* Dropdown Filters row */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-20/200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
                        >
                          <option value="All">All Categories</option>
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Waste Management">Waste & Sanitation</option>
                          <option value="Safety & Hazard">Safety Risk</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Parks & Recreation">Parks & Rec</option>
                          <option value="Traffic & Transit">Transit</option>
                        </select>

                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-20/200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
                        >
                          <option value="All">All Priorities</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>

                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-20/200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:border-blue-600 focus:bg-white transition font-medium"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Disputed">Disputed</option>
                        </select>
                      </div>
                    </div>

                    {/* Report scroll list */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue) => {
                          const isSelected = selectedIssue && selectedIssue.id === issue.id;
                          return (
                            <div
                              key={issue.id}
                              onClick={() => {
                                setSelectedIssue(issue);
                                setIsSelectingLocationMode(false);
                              }}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-50/75 border-blue-600/70 shadow-xs'
                                  : 'bg-slate-50/35 border-slate-150 hover:bg-slate-50/70 hover:border-slate-250'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-mono">
                                      {getCategoryThemeIcon(issue.category)}
                                      {issue.category}
                                    </span>
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                      issue.priority === 'Critical' ? 'bg-red-50 text-red-750 border-red-200' :
                                      issue.priority === 'High' ? 'bg-amber-50 text-amber-750 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                      {issue.priority}
                                    </span>
                                  </div>

                                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1 font-display">{issue.title}</h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{issue.description}</p>
                                </div>

                                <div className="text-right flex flex-col justify-between items-end h-full">
                                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border ${
                                    issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-750 border-emerald-200' :
                                    issue.status === 'In Progress' ? 'bg-blue-50 text-blue-750 border-blue-200' :
                                    issue.status === 'Verified' ? 'bg-indigo-50 text-indigo-750 border-indigo-200' :
                                    'bg-amber-50 text-amber-750 border-amber-200'
                                  }`}>
                                    {issue.status}
                                  </span>

                                  <span className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
                                    👍 {issue.votes}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-slate-450 text-xs italic">
                          No matching report logs discovered in active search filter grids.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COMPONENT (COL-SPAN-5): ACTIVE SELECTED INSPECTOR SHEET */}
                  <div className="lg:col-span-6">
                    {selectedIssue ? (
                      <div key={selectedIssue.id}>
                        <IssueDetailsPanel
                          issue={selectedIssue}
                          currentUserEmail={currentEmail}
                          currentUserName={currentName}
                          onVote={handleVote}
                          onValidate={handleValidate}
                          onPostComment={handlePostComment}
                          onUpdateOfficialStatus={handleUpdateOfficialStatus}
                          allIssues={issues}
                          onSelectIssue={setSelectedIssue}
                        />
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[400px] shadow-sm">
                        <div className="w-12 h-12 rounded-2xl border border-slate-150 bg-slate-50 flex items-center justify-center text-lg shadow-inner">
                          🗺️
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 font-display">Incident Details Inspector</h4>
                          <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed font-sans">
                            Click on any pin directly on the top map, or choose a report file from the live dispatch community queue to start a peer audit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: IMPACT METRICS DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ImpactDashboard issues={issues} />
              </motion.div>
            )}

            {/* TAB 3: GEMINI PREDICTIVE FORESIGHTS */}
            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PredictiveInsightsPanel issues={issues} />
              </motion.div>
            )}

            {/* TAB 4: CIVIC LEADERS & REPUTATION */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Leaderboard
                  profiles={leaderboard}
                  quests={quests}
                  currentUserEmail={currentEmail}
                  onSimulateQuestProgress={handleQuestSimulation}
                />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 CitizenCivic Technology Network. Open Source Public Trust Core. City of Metro Hub.</p>
      </footer>

      {/* MODAL OVERLAY: CREATE REPORT INSTRUCTIONS */}
      {showReportModal && (
        <ReportIssueModal
          onClose={() => {
            setShowReportModal(false);
            setIsSelectingLocationMode(false);
          }}
          onSubmit={handleCreateReport}
          lat={reportingLat}
          lng={reportingLng}
          locationName={reportingLocationName}
        />
      )}

      {/* MODAL OVERLAY: ROLE SANDBOX / EMAIL RECONFIG */}
      {showAccountSwitch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleAccountSwitchAction}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wide flex items-center gap-1.5 font-display">
                <span>🔄</span> Sandbox Role Selector & Account Re-key
              </h3>
              <button 
                type="button"
                onClick={() => setShowAccountSwitch(false)}
                className="text-slate-405 hover:text-slate-800 transition text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Test other citizen characters, gamification quest items progress, and admin dispatch updates by switching accounts inside this sandbox context:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Profile Name</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="e.g. Inspector John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">E-mail address (Used as UID)</label>
                <input
                  type="email"
                  required
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="e.g. john@city.gov"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAccountSwitch(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-55 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-650 text-white font-bold px-4 py-1.5 rounded-lg transition"
              >
                Apply Re-key
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
