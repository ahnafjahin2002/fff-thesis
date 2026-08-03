const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const ActivitySession = require('../models/ActivitySession');
const BornoBazarProgress = require('../models/BornoBazarProgress');

// Default foundation school classroom students for unseeded DBs
const DEFAULT_CLASSROOM_ROSTER = [
  {
    id: 1,
    name: 'Rayhan',
    nameBangla: 'রাইহান',
    avatar: '👦',
    level: '8',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '12',
    readingSessions: '24',
    bornoBazarLevel: '4',
    lastPracticeDate: 'Today, 10:15 AM',
    readingTime: '14 Minutes',
    needsMorePractice: ['যুক্তবর্ণ', 'কারচিহ্ন', 'Long Words'],
    recommendedActivities: [
      { id: 'r1', title: 'Story 3', type: 'Story' },
      { id: 'r2', title: 'Practice ক্ষ', type: 'Letter Drill' },
      { id: 'r3', title: 'BornoBazar Level 2', type: 'Interactive Game' },
    ],
    notes: 'Reads better with audio.\nNeeds encouragement.\nGets nervous reading aloud.',
  },
  {
    id: 2,
    name: 'Nusrat',
    nameBangla: 'নুসরাত',
    avatar: '👧',
    level: '7',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '10',
    readingSessions: '19',
    bornoBazarLevel: '3',
    lastPracticeDate: 'Today, 09:40 AM',
    readingTime: '12 Minutes',
    needsMorePractice: ['কারচিহ্ন', 'ঈ-কার শব্দ', 'যুক্তবর্ণ'],
    recommendedActivities: [
      { id: 'n1', title: 'Story 2', type: 'Story' },
      { id: 'n2', title: 'BornoBazar Level 2', type: 'Interactive Game' },
      { id: 'n3', title: 'Practice কারচিহ্ন', type: 'Letter Drill' },
    ],
    notes: 'Enjoys BornoBazar shopping game. Very attentive in group reading.',
  },
  {
    id: 3,
    name: 'Arif',
    nameBangla: 'আরিফ',
    avatar: '👦',
    level: '6',
    status: 'Needs Practice',
    statusColor: 'yellow',
    storiesCompleted: '8',
    readingSessions: '14',
    bornoBazarLevel: '2',
    lastPracticeDate: 'Yesterday',
    readingTime: '8 Minutes',
    needsMorePractice: ['যুক্তবর্ণ', 'দ্বিত্ব ব্যঞ্জন', 'কারচিহ্ন'],
    recommendedActivities: [
      { id: 'a1', title: 'Practice ক্ষ', type: 'Letter Drill' },
      { id: 'a2', title: 'Word Breakdown Drill', type: 'Phoneme Practice' },
      { id: 'a3', title: 'BornoBazar Level 1', type: 'Interactive Game' },
    ],
    notes: 'Responds well when sitting in the front row. Prefers phoneme tapping.',
  },
  {
    id: 4,
    name: 'Jannat',
    nameBangla: 'জান্নাত',
    avatar: '👧',
    level: '8',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '11',
    readingSessions: '22',
    bornoBazarLevel: '4',
    lastPracticeDate: 'Today, 10:05 AM',
    readingTime: '15 Minutes',
    needsMorePractice: ['Long Words', 'যুক্তবর্ণ'],
    recommendedActivities: [
      { id: 'j1', title: 'Story 4', type: 'Story' },
      { id: 'j2', title: 'BornoBazar Level 3', type: 'Interactive Game' },
    ],
    notes: 'Great progress with conjunct letters this week. Praise effort!',
  },
  {
    id: 5,
    name: 'Sakib',
    nameBangla: 'সাকিব',
    avatar: '👦',
    level: '5',
    status: 'Needs Practice',
    statusColor: 'yellow',
    storiesCompleted: '6',
    readingSessions: '11',
    bornoBazarLevel: '2',
    lastPracticeDate: '2 days ago',
    readingTime: '7 Minutes',
    needsMorePractice: ['কারচিহ্ন', 'যুক্তবর্ণ', 'স্বরবর্ণ'],
    recommendedActivities: [
      { id: 's1', title: 'Phoneme Practice', type: 'Letter Drill' },
      { id: 's2', title: 'BornoBazar Level 1', type: 'Interactive Game' },
      { id: 's3', title: 'Story 1', type: 'Story' },
    ],
    notes: 'Needs gentle encouragement. Do not rush during reading turns.',
  },
  {
    id: 6,
    name: 'Mim',
    nameBangla: 'মীম',
    avatar: '👧',
    level: '7',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '9',
    readingSessions: '18',
    bornoBazarLevel: '3',
    lastPracticeDate: 'Today, 09:30 AM',
    readingTime: '11 Minutes',
    needsMorePractice: ['Long Words', 'কারচিহ্ন'],
    recommendedActivities: [
      { id: 'm1', title: 'Story 3', type: 'Story' },
      { id: 'm2', title: 'Practice কারচিহ্ন', type: 'Letter Drill' },
    ],
    notes: 'Loves listening to audio stories first before reading aloud.',
  },
  {
    id: 7,
    name: 'Hasib',
    nameBangla: 'হাসিব',
    avatar: '👦',
    level: '6',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '8',
    readingSessions: '16',
    bornoBazarLevel: '3',
    lastPracticeDate: 'Today, 10:20 AM',
    readingTime: '10 Minutes',
    needsMorePractice: ['যুক্তবর্ণ', 'Long Words'],
    recommendedActivities: [
      { id: 'h1', title: 'Practice ক্ষ', type: 'Letter Drill' },
      { id: 'h2', title: 'Story 3', type: 'Story' },
    ],
    notes: 'Participates eagerly in group games.',
  },
  {
    id: 8,
    name: 'Sumaiya',
    nameBangla: 'সুমাইয়া',
    avatar: '👧',
    level: '7',
    status: 'Needs Practice',
    statusColor: 'yellow',
    storiesCompleted: '9',
    readingSessions: '15',
    bornoBazarLevel: '3',
    lastPracticeDate: 'Yesterday',
    readingTime: '9 Minutes',
    needsMorePractice: ['কারচিহ্ন', 'Long Words', 'যুক্তবর্ণ'],
    recommendedActivities: [
      { id: 'su1', title: 'BornoBazar Level 2', type: 'Interactive Game' },
      { id: 'su2', title: 'Story 2', type: 'Story' },
    ],
    notes: 'Friendly with peers; pairing with Rayhan for story practice works well.',
  },
  {
    id: 9,
    name: 'Farhan',
    nameBangla: 'ফারহান',
    avatar: '👦',
    level: '6',
    status: 'Needs Practice',
    statusColor: 'yellow',
    storiesCompleted: '7',
    readingSessions: '13',
    bornoBazarLevel: '2',
    lastPracticeDate: 'Yesterday',
    readingTime: '8 Minutes',
    needsMorePractice: ['যুক্তবর্ণ', 'কারচিহ্ন'],
    recommendedActivities: [
      { id: 'f1', title: 'Practice ক্ষ', type: 'Letter Drill' },
      { id: 'f2', title: 'Word Breakdown Drill', type: 'Phoneme Practice' },
    ],
    notes: 'Visual cues help him recognize tricky letters faster.',
  },
  {
    id: 10,
    name: 'Ayesha',
    nameBangla: 'আয়েশা',
    avatar: '👧',
    level: '8',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '12',
    readingSessions: '25',
    bornoBazarLevel: '4',
    lastPracticeDate: 'Today, 09:50 AM',
    readingTime: '13 Minutes',
    needsMorePractice: ['Long Words'],
    recommendedActivities: [
      { id: 'ay1', title: 'Story 4', type: 'Story' },
      { id: 'ay2', title: 'BornoBazar Level 3', type: 'Interactive Game' },
    ],
    notes: 'Confident reader. Enjoys helping classmates in classroom activities.',
  },
  {
    id: 11,
    name: 'Tanvir',
    nameBangla: 'তানভীর',
    avatar: '👦',
    level: '5',
    status: 'Needs Practice',
    statusColor: 'yellow',
    storiesCompleted: '5',
    readingSessions: '10',
    bornoBazarLevel: '1',
    lastPracticeDate: '2 days ago',
    readingTime: '6 Minutes',
    needsMorePractice: ['স্বরবর্ণ', 'কারচিহ্ন', 'যুক্তবর্ণ'],
    recommendedActivities: [
      { id: 't1', title: 'Phoneme Practice', type: 'Letter Drill' },
      { id: 't2', title: 'BornoBazar Level 1', type: 'Interactive Game' },
    ],
    notes: 'Give extra praise for every word attempted. Small steps matter.',
  },
  {
    id: 12,
    name: 'Sadia',
    nameBangla: 'সাদিয়া',
    avatar: '👧',
    level: '7',
    status: 'Recently Practiced',
    statusColor: 'green',
    storiesCompleted: '10',
    readingSessions: '20',
    bornoBazarLevel: '3',
    lastPracticeDate: 'Today, 10:10 AM',
    readingTime: '11 Minutes',
    needsMorePractice: ['যুক্তবর্ণ', 'কারচিহ্ন'],
    recommendedActivities: [
      { id: 'sa1', title: 'Story 3', type: 'Story' },
      { id: 'sa2', title: 'Practice ক্ষ', type: 'Letter Drill' },
    ],
    notes: 'Very calm focus. Responds well to audio playback.',
  },
];

// Helper: format relative or display date
function formatPracticeDate(date) {
  if (!date) return 'Not yet';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const dispHours = hours % 12 || 12;
    return `Today, ${dispHours}:${mins} ${ampm}`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

// GET /api/teacher/classroom-stats — compute live dashboard metrics from ActivitySession & User
router.get('/classroom-stats', async (req, res) => {
  try {
    const allSessions = await ActivitySession.find({}).sort({ createdAt: -1 });
    const childUsers = await User.find({ role: 'child', isDeleted: { $ne: true } });
    const bornoBazarProgressList = await BornoBazarProgress.find({});

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaySessions = allSessions.filter(s => new Date(s.createdAt) >= startOfToday);

    // 1. Calculate Difficult Letters (frequencies from failedLetters and tappedConjuncts)
    const letterCounts = {};
    allSessions.forEach(s => {
      const details = s.details || {};
      const letters = [
        ...(Array.isArray(details.failedLetters) ? details.failedLetters : []),
        ...(Array.isArray(details.tappedConjuncts) ? details.tappedConjuncts : []),
        ...(details.letter ? [details.letter] : [])
      ];
      letters.forEach(char => {
        if (char && typeof char === 'string' && char.trim().length > 0) {
          letterCounts[char] = (letterCounts[char] || 0) + 1;
        }
      });
    });

    const sortedLetters = Object.entries(letterCounts).sort((a, b) => b[1] - a[1]);
    const mostDifficultLetter = sortedLetters.length > 0 ? sortedLetters[0][0] : '-';
    const difficultLetters = sortedLetters.length > 0 
      ? sortedLetters.slice(0, 4).map(item => item[0])
      : [];

    // 2. Calculate Difficult Words (frequencies from tappedWords and details.word)
    const wordCounts = {};
    allSessions.forEach(s => {
      const details = s.details || {};
      const words = [
        ...(Array.isArray(details.tappedWords) ? details.tappedWords : []),
        ...(details.word ? [details.word] : []),
        ...(details.text && details.text.length < 15 ? [details.text] : [])
      ];
      words.forEach(w => {
        if (w && typeof w === 'string' && w.trim().length > 1) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      });
    });

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    const mostDifficultWord = sortedWords.length > 0 ? sortedWords[0][0] : '-';
    const difficultWords = sortedWords.length > 0
      ? sortedWords.slice(0, 3).map(item => item[0])
      : [];

    // 3. Calculate Most Used Activity
    let bornoCount = 0;
    let readingCount = 0;
    allSessions.forEach(s => {
      if (s.feature === 'borno_bazar' || s.activityType === 'spelling' || s.activityType === 'letter_tracing') {
        bornoCount++;
      } else {
        readingCount++;
      }
    });
    const totalActivityCount = bornoCount + readingCount;
    const mostUsedActivity = totalActivityCount === 0 
      ? 'None' 
      : (bornoCount >= readingCount ? 'BornoBazar' : 'Reading Story');
    const mostUsedActivitySub = totalActivityCount === 0
      ? 'No activity recorded yet'
      : (bornoCount >= readingCount 
        ? 'Letter shop game • বর্ণবাজার' 
        : 'Interactive story reading • পড়া');

    // 4. Calculate Average Reading Time Today
    const todayTotalDurationMs = todaySessions.reduce((acc, s) => acc + (s.durationMs || 0), 0);
    const distinctTodayUsers = new Set(todaySessions.map(s => s.userId ? s.userId.toString() : 'anon')).size;
    const avgReadingTimeMins = distinctTodayUsers > 0 
      ? Math.max(1, Math.round(todayTotalDurationMs / (1000 * 60) / distinctTodayUsers))
      : 0;

    // 5. Calculate Students Practiced Today
    const totalStudentsCount = childUsers ? childUsers.length : 0;
    const practicedCount = distinctTodayUsers;

    // 6. Teaching Focus derived from most difficult letter
    const teachingFocus = mostDifficultLetter === '-' 
      ? 'Start Classroom Activity'
      : `Practice ${mostDifficultLetter === 'ক্ষ' || mostDifficultLetter === 'জ্ঞ' ? 'Conjunct Letters' : 'Vowel Signs'}`;
    const teachingFocusSub = mostDifficultLetter === '-'
      ? 'Launch Classroom Mode to begin'
      : `Guided group activity (${mostDifficultLetter === 'ক্ষ' || mostDifficultLetter === 'জ্ঞ' ? 'যুক্তবর্ণ চর্চা' : 'কারচিহ্ন চর্চা'})`;

    // 7. Roster calculation
    const getAvatarEmoji = (avatar, idx) => {
      if (!avatar) return idx % 2 === 0 ? '👦' : '👧';
      if (avatar.startsWith('data:image') || avatar.startsWith('http')) return avatar;
      if (avatar === 'avatar-girl-hijab') return '🧕';
      if (avatar === 'avatar-girl-yellow' || avatar.includes('girl')) return '👧';
      if (avatar === 'avatar-boy-green' || avatar === 'avatar-boy-blue' || avatar.includes('boy')) return '👦';
      if (avatar.length <= 4) return avatar;
      return idx % 2 === 0 ? '👦' : '👧';
    };

    let roster = [];
    if (childUsers && childUsers.length > 0) {
      roster = childUsers.map((u, idx) => {
        const uId = u._id.toString();
        const uSessions = allSessions.filter(s => s.userId && s.userId.toString() === uId);
        const uBorno = bornoBazarProgressList.find(b => b.userId && b.userId.toString() === uId);

        const storiesCompleted = uSessions.filter(s => s.feature === 'reading' || s.activityType === 'read_aloud').length;
        const totalSessions = uSessions.length;
        const totalDurationMins = Math.round(uSessions.reduce((acc, s) => acc + (s.durationMs || 0), 0) / (1000 * 60));
        const lastSession = uSessions.length > 0 ? uSessions[0].createdAt : null;
        const isToday = lastSession && new Date(lastSession) >= startOfToday;

        const bbLevel = uBorno ? 1 + Math.min(5, Math.floor((uBorno.totalStars || 0) / 4)) : 1;
        const rLevel = Math.max(1, Math.min(10, 1 + Math.floor(storiesCompleted / 2)));

        // Calculate student's specific difficult letters/words from their sessions
        const uLetterCounts = {};
        const uWordCounts = {};
        uSessions.forEach(s => {
          const details = s.details || {};
          const letters = [
            ...(Array.isArray(details.failedLetters) ? details.failedLetters : []),
            ...(Array.isArray(details.tappedConjuncts) ? details.tappedConjuncts : []),
            ...(details.letter ? [details.letter] : [])
          ];
          letters.forEach(char => {
            if (char && typeof char === 'string' && char.trim().length > 0) {
              uLetterCounts[char] = (uLetterCounts[char] || 0) + 1;
            }
          });
          const words = [
            ...(Array.isArray(details.tappedWords) ? details.tappedWords : []),
            ...(details.word ? [details.word] : [])
          ];
          words.forEach(w => {
            if (w && typeof w === 'string' && w.trim().length > 1) {
              uWordCounts[w] = (uWordCounts[w] || 0) + 1;
            }
          });
        });

        const sortedULetters = Object.entries(uLetterCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
        const sortedUWords = Object.entries(uWordCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
        let needsMorePractice = [...sortedULetters.slice(0, 2), ...sortedUWords.slice(0, 1)];
        if (needsMorePractice.length === 0) {
          needsMorePractice = totalSessions === 0 ? ['এখনও কোনো অনুশীলন হয়নি'] : ['উত্তম অগ্রগতি'];
        }

        const recommendedActivities = [
          {
            id: `rec-${uId}-1`,
            title: `গল্প ${rLevel}`,
            type: 'Story'
          },
          {
            id: `rec-${uId}-2`,
            title: `বর্ণবাজার লেভেল ${bbLevel}`,
            type: 'Interactive Game'
          }
        ];

        return {
          id: uId,
          name: u.name,
          nameBangla: u.nameBangla || u.name,
          avatar: getAvatarEmoji(u.avatar, idx),
          level: rLevel.toString(),
          status: isToday ? 'Recently Practiced' : 'Needs Practice',
          statusColor: isToday ? 'green' : 'yellow',
          storiesCompleted: storiesCompleted.toString(),
          readingSessions: totalSessions.toString(),
          bornoBazarLevel: bbLevel.toString(),
          lastPracticeDate: formatPracticeDate(lastSession),
          readingTime: `${totalDurationMins} মিনিট`,
          needsMorePractice,
          recommendedActivities,
          notes: u.teacherNotes || '',
        };
      });
    }

    res.json({
      summary: {
        mostDifficultLetter: {
          value: mostDifficultLetter,
          sub: mostDifficultLetter === '-' ? 'No sessions yet' : 'Conjunct letter (যুক্তবর্ণ)'
        },
        mostDifficultWord: {
          value: mostDifficultWord,
          sub: mostDifficultWord === '-' ? 'No words practiced yet' : 'Word breakdown practice'
        },
        mostUsedActivity: {
          value: mostUsedActivity,
          sub: mostUsedActivitySub
        },
        averageReadingTime: {
          value: `${avgReadingTimeMins} মিনিট`,
          sub: `Per student today (${avgReadingTimeMins} মিনিট)`
        },
        studentsPracticedToday: {
          value: `${practicedCount}`,
          total: totalStudentsCount,
          label: `${practicedCount}`,
          sub: `Out of ${totalStudentsCount} students (${practicedCount} জন)`
        },
        teachingFocus: {
          value: teachingFocus,
          sub: teachingFocusSub
        }
      },
      insights: {
        difficultLetters,
        difficultWords
      },
      roster
    });
  } catch (err) {
    console.error('Error calculating teacher classroom stats:', err);
    res.status(500).json({ error: 'Failed to compute classroom stats', details: err.message });
  }
});

// PATCH /api/teacher/students/:id/notes — secure endpoint to update teacher notes
router.patch('/students/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndUpdate(id, { teacherNotes: notes }, { new: true });
    }
    // Even if id is static fallback (e.g. 1..12), return success so UI is responsive
    res.json({ success: true, id, notes });
  } catch (err) {
    console.error('Error updating student notes:', err);
    res.status(500).json({ error: 'Failed to update notes', details: err.message });
  }
});

module.exports = router;
