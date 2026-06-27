import { Issue, CivicQuest, UserCivicProfile } from '../types';

export const METRO_DISTRICTS = [
  { id: 'd1', name: 'Indiranagar Ward (BBMP)', bounds: { minLat: 40.71, maxLat: 40.73, minLng: -74.01, maxLng: -73.99 } },
  { id: 'd2', name: 'Bandra West Ward (BMC)', bounds: { minLat: 40.72, maxLat: 40.74, minLng: -74.03, maxLng: -74.01 } },
  { id: 'd3', name: 'Yamuna Ghats Zone (NDMC)', bounds: { minLat: 40.69, maxLat: 40.71, minLng: -74.03, maxLng: -73.99 } },
  { id: 'd4', name: 'Shivaji Nagar (PMC)', bounds: { minLat: 40.70, maxLat: 40.72, minLng: -73.98, maxLng: -73.95 } },
  { id: 'd5', name: 'Jubilee Hills Ward (GHMC)', bounds: { minLat: 40.73, maxLat: 40.75, minLng: -73.99, maxLng: -73.96 } }
];

export const INITIAL_CHALLENGES: CivicQuest[] = [
  {
    id: 'q-1',
    title: 'Civic Sentinel (Nagarik Prahari)',
    description: 'Submit your first verified community issue report to the ward commissioner.',
    pointsReward: 150,
    progress: 0,
    target: 1,
    category: 'Reporting',
    isCompleted: false
  },
  {
    id: 'q-2',
    title: 'Satyamev Jayate (Truth Seeker)',
    description: 'Verify or dispute 5 community public reports to maintain crowdsourced integrity.',
    pointsReward: 250,
    progress: 1,
    target: 5,
    category: 'Verification',
    isCompleted: false
  },
  {
    id: 'q-3',
    title: 'Ward Chopal Collaborator',
    description: 'Comment on 3 separate local civic issues in your district to offer ground-level feedback.',
    pointsReward: 200,
    progress: 0,
    target: 3,
    category: 'Collaboration',
    isCompleted: false
  },
  {
    id: 'q-4',
    title: 'Swachh Bharat Catalyst',
    description: 'Upvote 10 critical waste or sewage infrastructure reports to expedite Nagar Nigam prioritization.',
    pointsReward: 100,
    progress: 2,
    target: 10,
    category: 'Priority',
    isCompleted: false
  }
];

export const INITIAL_LEADERBOARD: UserCivicProfile[] = [
  {
    name: 'Priya Sharma (Ward Officer)',
    email: 'priya.sharma@bbmp.gov.in',
    points: 1450,
    rank: 1,
    reportsSubmitted: 12,
    validationsDone: 34,
    resolvedHelpCount: 5,
    badges: [
      { id: 'b1', name: 'Nagar Sevak', description: 'Reported an issue that received direct municipal resolution.', iconName: 'Flame', color: 'bg-amber-100 text-amber-700 border-amber-300', unlockedAt: 1729000000000 },
      { id: 'b2', name: 'Dharma Adhikari', description: 'Validated over 25 public reports with 100% ground accuracy.', iconName: 'Shield', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', unlockedAt: 1729100000000 }
    ]
  },
  {
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@bmc.gov.in',
    points: 1200,
    rank: 2,
    reportsSubmitted: 8,
    validationsDone: 22,
    resolvedHelpCount: 3,
    badges: [
      { id: 'b2', name: 'Dharma Adhikari', description: 'Validated over 25 public reports with 100% ground accuracy.', iconName: 'Shield', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', unlockedAt: 1729200000000 },
      { id: 'b3', name: 'Pothole Inspector', description: 'Successfully cataloged and tracked 5 separate high-risk road craters.', iconName: 'Hammer', color: 'bg-blue-100 text-blue-700 border-blue-300', unlockedAt: 1729300000000 }
    ]
  },
  {
    name: 'Amit Verma (PWD Engineer)',
    email: 'amit.verma@pmc.gov.in',
    points: 980,
    rank: 3,
    reportsSubmitted: 7,
    validationsDone: 15,
    resolvedHelpCount: 2,
    badges: [
      { id: 'b1', name: 'Nagar Sevak', description: 'Reported an issue that received direct municipal resolution.', iconName: 'Flame', color: 'bg-amber-100 text-amber-700 border-amber-300', unlockedAt: 1729400000000 }
    ]
  },
  {
    name: 'Kavitha Nair',
    email: 'kavitha.nair@ghmc.gov.in',
    points: 750,
    rank: 4,
    reportsSubmitted: 4,
    validationsDone: 11,
    resolvedHelpCount: 1,
    badges: [
      { id: 'b4', name: 'Haritha Haram Guardian', description: 'Reported park and green space issues, supporting environmental cleanup.', iconName: 'Trees', color: 'bg-green-100 text-green-700 border-green-300', unlockedAt: 1729500000000 }
    ]
  }
];

export const STATIC_INITIAL_ISSUES: Issue[] = [
  {
    id: 'issue-seed-1',
    title: 'Severe Crater-like Pothole near Indiranagar Double Road',
    description: 'A deep pothole has opened up in the center lane of Indiranagar Double Road, right after the metro pillar crosswalk. Several two-wheelers have nearly slipped trying to swerve around it. It gets severely waterlogged during monsoon rains and is highly dangerous.',
    category: 'Infrastructure',
    status: 'Verified',
    priority: 'High',
    locationName: 'Double Rd, Pillar 124, Indiranagar Ward (BBMP)',
    latitude: 40.718,
    longitude: -74.002,
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'Priya Sharma (Ward Officer)',
    reportedByEmail: 'priya.sharma@bbmp.gov.in',
    createdAt: Date.now() - 34 * 3600 * 1000,
    votes: 24,
    upvotedBy: ['priya.sharma@bbmp.gov.in', 'rohan.deshmukh@bmc.gov.in'],
    validationCount: 8,
    disputeCount: 0,
    validations: {
      'rohan.deshmukh@bmc.gov.in': 'validate',
      'amit.verma@pmc.gov.in': 'validate',
      'kavitha.nair@ghmc.gov.in': 'validate'
    },
    aiSuggestedSolution: 'Excavate the damaged asphalt around the crater, clear the loose aggregates and silt, dry out the waterlogged base, apply a heavy tack coat, pack with high-quality hot bituminous mixture, compress with a static roller, and seal the joints.',
    officialResponse: 'Municipal Ward Dispatch order #9421 completed physical on-site inspection. Road maintenance team scheduled for complete road recarpeting this Friday night.'
  },
  {
    id: 'issue-seed-2',
    title: 'Overflowing Garbage & Lack of Secondary Bins',
    description: 'The municipal कचरा (garbage) bins at the Bandra Promenade walkway are completely full, leading to trash spilling onto the rocks and walking track. Swachh Bharat guidelines are not being met here. High winds are blowing plastic waste directly into the sea.',
    category: 'Waste Management',
    status: 'In Progress',
    priority: 'Medium',
    locationName: 'Carter Road, Promenade Walk, Bandra West Ward (BMC)',
    latitude: 40.699,
    longitude: -74.021,
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'Rohan Deshmukh',
    reportedByEmail: 'rohan.deshmukh@bmc.gov.in',
    createdAt: Date.now() - 18 * 3600 * 1000,
    votes: 15,
    upvotedBy: ['rohan.deshmukh@bmc.gov.in', 'amit.verma@pmc.gov.in'],
    validationCount: 5,
    disputeCount: 1,
    validations: {
      'amit.verma@pmc.gov.in': 'validate',
      'kavitha.nair@ghmc.gov.in': 'validate',
      'sabotage@fake.com': 'dispute'
    },
    aiSuggestedSolution: 'Deploy an off-schedule BMC waste pickup carrier immediately. Wash down the coordinate grid using eco-friendly deodorizing sprays, and install dual heavy-duty dry/wet smart garbage compactors.',
    officialResponse: 'BMC solid waste management department is re-routing clean-up truck #BMC-42 to clear the accumulation and sanitize the location.'
  },
  {
    id: 'issue-seed-3',
    title: 'Fallen Gulmohar Tree Blocking Pedestrian Metro Path',
    description: 'A large Gulmohar tree collapsed during yesterday\'s monsoon thunderstorm, completely blocking the pedestrian walkway and part of the main lane near the Shivaji Nagar Metro station bypass.',
    category: 'Parks & Recreation',
    status: 'Resolved',
    priority: 'High',
    locationName: 'Metro Station Lane, Shivaji Nagar (PMC)',
    latitude: 40.741,
    longitude: -73.978,
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'Kavitha Nair',
    reportedByEmail: 'kavitha.nair@ghmc.gov.in',
    createdAt: Date.now() - 48 * 3600 * 1000,
    votes: 19,
    upvotedBy: ['kavitha.nair@ghmc.gov.in', 'rohan.deshmukh@bmc.gov.in'],
    validationCount: 12,
    disputeCount: 0,
    validations: {
      'rohan.deshmukh@bmc.gov.in': 'validate',
      'priya.sharma@bbmp.gov.in': 'validate'
    },
    aiSuggestedSolution: 'Utilize heavy tree cutters and wood chippers from the PMC garden division to section the trunk, load branches onto a transport tractor, sweep the left-over organic debris, and reopen the sidewalk.',
    officialResponse: 'PMC Garden Department has completely cut, removed, and logged the fallen tree. Metro footpath is fully cleared and swept for pedestrians.',
    resolvedAt: Date.now() - 4 * 3600 * 1000
  },
  {
    id: 'issue-seed-4',
    title: 'Malfunctioning Pedestrian Crosswalk & Traffic Buzzer',
    description: 'The green pedestrian walking signal buzzer is loose and completely broken. Young children from the nearby NDMC school are forced to cross this highly congested lane with zero traffic assistance.',
    category: 'Traffic & Transit',
    status: 'Pending',
    priority: 'Critical',
    locationName: 'NDMC Primary School Lane, Yamuna Ghats Zone (NDMC)',
    latitude: 40.711,
    longitude: -73.968,
    reportedBy: 'Amit Verma (PWD Engineer)',
    reportedByEmail: 'amit.verma@pmc.gov.in',
    createdAt: Date.now() - 2 * 3600 * 1000,
    votes: 38,
    upvotedBy: ['amit.verma@pmc.gov.in', 'priya.sharma@bbmp.gov.in', 'rohan.deshmukh@bmc.gov.in'],
    validationCount: 3,
    disputeCount: 0,
    validations: {
      'priya.sharma@bbmp.gov.in': 'validate',
      'rohan.deshmukh@bmc.gov.in': 'validate'
    },
    aiSuggestedSolution: 'Initiate a complete electronic controller diagnostic check on the traffic signal panel. Replace the broken manual pushbutton module, test buzzer decibel ranges for the visually impaired, and calibrate timings.'
  },
  {
    id: 'issue-seed-5',
    title: 'Exposed High-Voltage DP Box Cables near Children Park',
    description: 'An open electricity DP (distribution) box has its cover plate missing right next to the park swings. Thick high-voltage cables are fully exposed to rainwater and within grab range of children.',
    category: 'Utilities',
    status: 'In Progress',
    priority: 'Critical',
    locationName: 'Public Playground Area, Jubilee Hills Ward (GHMC)',
    latitude: 40.732,
    longitude: -74.022,
    imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'Priya Sharma (Ward Officer)',
    reportedByEmail: 'priya.sharma@bbmp.gov.in',
    createdAt: Date.now() - 6 * 3600 * 1000,
    votes: 42,
    upvotedBy: ['priya.sharma@bbmp.gov.in'],
    validationCount: 9,
    disputeCount: 0,
    validations: {
      'kavitha.nair@ghmc.gov.in': 'validate',
      'rohan.deshmukh@bmc.gov.in': 'validate'
    },
    aiSuggestedSolution: 'Immediately cordone off the DP box using warning tape. Coordinate with the state electricity distribution board (TSSPDCL) to cut off the grid briefly, insulate the active wire junctions, and bolt a fresh double-lock steel door cover onto the distribution panel.'
  }
];
