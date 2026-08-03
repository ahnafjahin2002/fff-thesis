import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getClassroomStats, updateStudentNote, updateUserProfile, createUser, deleteUser, getSessions, getBornoBazarProgress } from '../utils/api';
import { useClassroom } from '../context/ClassroomContext';
import ClassroomTurnSelector from '../features/ClassroomPractice/ClassroomTurnSelector';
import ClassroomCelebrationModal from '../features/ClassroomPractice/ClassroomCelebrationModal';
import './TeacherWorkspacePage.css';

// Existing friendly classroom illustrations from assets
import classroomIllustration from '../assets/mother_child_reading.png';
import mascotEncourage from '../assets/mascot-encourage.png';
import dashboardMeaningfulBg from '../assets/dashboard-meaningful-bg.png';

// Bangla numeral converter & translators
const toBanglaNum = (num) => {
  if (num === undefined || num === null || num === '--') return '--';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

const translateStatus = (status) => {
  if (status === 'Recently Practiced') return 'সম্প্রতি অনুশীলন করেছে';
  if (status === 'Needs Practice') return 'অনুশীলন প্রয়োজন';
  if (status === 'Ready for Challenge') return 'চ্যালেঞ্জের জন্য প্রস্তুত';
  return status || 'অনুশীলন প্রয়োজন';
};

const translateActivityName = (act) => {
  if (!act || act === '-' || act === 'None') return 'কোনো অ্যাক্টিভিটি নেই';
  if (act === 'Reading Story') return 'গল্প পড়া (Reading Story)';
  if (act === 'BornoBazar') return 'বর্ণবাজার (BornoBazar)';
  if (act === 'Quiz Game') return 'মজার কুইজ (Quiz Game)';
  if (act === 'Word Practice') return 'শব্দ অনুশীলন (Word Practice)';
  if (act === 'Sentence Builder') return 'বাক্য তৈরি (Sentence Builder)';
  if (act === 'Custom Reading') return 'কাস্টম পড়া (Custom Reading)';
  return act;
};

const translateTeachingFocus = (val) => {
  if (!val || val === 'Start Classroom Activity') return 'ক্লাসরুম অ্যাক্টিভিটি শুরু করুন';
  if (val.includes('Conjunct Letters')) return 'যুক্তবর্ণ চর্চা';
  if (val.includes('Vowel Signs')) return 'কারচিহ্ন চর্চা';
  return val;
};

const translateSubText = (sub) => {
  if (!sub) return '';
  if (sub === 'No sessions yet') return 'কোনো সেশন নেই';
  if (sub === 'No words practiced yet') return 'কোনো শব্দ অনুশীলন করা হয়নি';
  if (sub === 'No activity recorded yet') return 'কোনো অ্যাক্টিভিটি নেই';
  if (sub.startsWith('Per student today')) return 'আজ প্রতি শিক্ষার্থী';
  if (sub.includes('Out of')) return sub.replace(/Out of (\d+) students \((.*?)\)/, (m, p1, p2) => `মোট ${toBanglaNum(p1)} জন শিক্ষার্থীর মধ্যে (${p2})`);
  if (sub === 'Launch Classroom Mode to begin') return 'শুরু করতে ক্লাসরুম মোড চালু করুন';
  return sub;
};

// Supportive student roster for Bangladeshi foundation school classroom (20-40 students context)

const INITIAL_STUDENTS = [
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

// Evidence-based recommendations for Bengali foundation classroom reading
const TEACHING_TIPS = [
  {
    title: 'Teaching Tip',
    quote: 'Praise effort before correcting mistakes.',
    explanation:
      'Children become more willing to participate when mistakes are treated as opportunities to learn.',
  },
  {
    title: 'Teaching Tip',
    quote: 'Use choral reading for tricky conjunct letters.',
    explanation:
      'Reading together aloud reduces individual anxiety and builds rhythmic familiarity with words like ক্ষ and জ্ঞ.',
  },
  {
    title: 'Teaching Tip',
    quote: 'Break long words into syllables first.',
    explanation:
      'Dyslexic readers process smaller phoneme chunks much faster than whole complex words.',
  },
  {
    title: 'Teaching Tip',
    quote: 'Connect letters to familiar everyday objects.',
    explanation:
      'In BornoBazar, associating letters with local market items reinforces multi-sensory memory.',
  },
];

export default function TeacherWorkspacePage() {
  const navigate = useNavigate();
  const { startClassroomSession, pickNextRandomStudent, activeClassroomStudent } = useClassroom();

  // Sidebar state matching existing dashboard
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live dashboard telemetry state
  const [classroomData, setClassroomData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Individual Student Progress Modal State
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Teacher profile & photo state
  const [teacherPhoto, setTeacherPhoto] = useState(() => localStorage.getItem('teacherProfilePhoto') || null);
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('activeUserName') || 'শিক্ষক');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const photoInputRef = useRef(null);

  // Add Student modal & form state
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNickname, setNewStudentNickname] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('প্রথম শ্রেণী');
  const [newStudentAvatar, setNewStudentAvatar] = useState('👦');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addStudentError, setAddStudentError] = useState('');
  const studentPhotoInputRef = useRef(null);

  const EMOJI_OPTIONS = [
    '👦', '👧', '👶', '🧑‍🎓', '👩‍🎓', '👨‍🎓', '🧕',
    '🐯', '🦁', '🐱', '🐼', '🦊', '🐰', '🐨', '🐵',
    '🦋', '🌟', '🏆', '📚', '🚀'
  ];

  const handleStudentPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewStudentAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      setAddStudentError('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    try {
      setIsAddingStudent(true);
      setAddStudentError('');
      await createUser({
        name: newStudentName.trim(),
        nameBangla: newStudentName.trim(),
        nickname: newStudentNickname.trim() || '',
        classGrade: newStudentGrade.trim() || 'প্রথম শ্রেণী',
        role: 'child',
        avatar: newStudentAvatar || '👦',
        teacherId: localStorage.getItem('activeUserId') || null
      });
      await fetchDashboardData();
      setNewStudentName('');
      setNewStudentNickname('');
      setNewStudentGrade('প্রথম শ্রেণী');
      setNewStudentAvatar('👦');
      setAddStudentModalOpen(false);
    } catch (err) {
      console.error('Failed to create student:', err);
      setAddStudentError('শিক্ষার্থী যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে শিক্ষার্থী '${studentName}'-কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await deleteUser(studentId);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('শিক্ষার্থী মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleSaveName = async () => {
    localStorage.setItem('activeUserName', teacherName);
    setIsEditingName(false);
    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      try {
        await updateUserProfile(activeUserId, { name: teacherName });
      } catch (err) {
        console.warn('Failed to save name to backend:', err);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setTeacherPhoto(base64Data);
      localStorage.setItem('teacherProfilePhoto', base64Data);
      const activeUserId = localStorage.getItem('activeUserId');
      if (activeUserId) {
        try {
          await updateUserProfile(activeUserId, { avatar: base64Data });
        } catch (err) {
          console.warn('Failed to save photo to backend:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setTeacherPhoto(null);
    localStorage.removeItem('teacherProfilePhoto');
    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      try {
        await updateUserProfile(activeUserId, { avatar: '' });
      } catch (err) {
        console.warn('Failed to clear photo on backend:', err);
      }
    }
  };

  const fetchDashboardData = useCallback(async () => {

    try {
      setStatsError(null);
      const data = await getClassroomStats();
      setClassroomData(data);
      if (data.roster) {
        setStudents(data.roster);
        try {
          localStorage.setItem('fff_classroom_roster', JSON.stringify(data.roster));
        } catch (e) {
          console.warn('Failed to cache roster offline:', e);
        }
        if (data.roster.length > 0) {
          setSelectedStudentId((prevId) => {
            const exists = data.roster.some(
              (r) => String(r.id) === String(prevId)
            );
            return exists ? prevId : data.roster[0].id;
          });
        } else {
          setSelectedStudentId(null);
        }
      }
      setLoadingStats(false);
    } catch (err) {
      console.error('Error fetching classroom stats:', err);
      setStatsError(err.message || 'Failed to load live classroom data');
      const cached = localStorage.getItem('fff_classroom_roster');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudents(parsed);
            if (!selectedStudentId) setSelectedStudentId(parsed[0].id);
          }
        } catch (e) {
          console.warn('Failed to parse offline cached roster:', e);
        }
      }
      setLoadingStats(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchDashboardData();

    const handleSessionCreated = () => {
      fetchDashboardData();
    };
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener('fff_session_created', handleSessionCreated);
    window.addEventListener('fff_session_synced', handleSessionCreated);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);

    return () => {
      window.removeEventListener('fff_session_created', handleSessionCreated);
      window.removeEventListener('fff_session_synced', handleSessionCreated);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
    };
  }, [fetchDashboardData]);

  // Classroom activity selection
  const [selectedActivity, setSelectedActivity] = useState('Reading Story');
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [launchedActivityTitle, setLaunchedActivityTitle] = useState('');
  const [turnSelectorOpen, setTurnSelectorOpen] = useState(false);

  // Teaching tip rotation
  const [tipIndex, setTipIndex] = useState(0);

  // Filtered student roster
  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nameBangla.includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const selectedStudent = useMemo(() => {
    return (
      students.find(
        (s) =>
          s.id === selectedStudentId ||
          String(s.id) === String(selectedStudentId)
      ) || students[0] || null
    );
  }, [students, selectedStudentId]);

  const handleNoteChange = (text) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? { ...s, notes: text } : s))
    );
  };

  const handleSaveNote = async () => {
    try {
      await updateStudentNote(selectedStudent.id, selectedStudent.notes);
      setSaveStatus('✓ Saved');
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveStatus('✓ Saved locally');
    }
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleLaunchClassroomMode = (activityName) => {
    const title = activityName || selectedActivity;
    if (!students || students.length === 0) {
      alert('ক্লাসরুম অনুশীলন শুরু করতে আগে অন্তত ১ জন শিক্ষার্থী যোগ করুন।');
      setAddStudentModalOpen(true);
      return;
    }
    setLaunchedActivityTitle(title);
    startClassroomSession(students, title);
    setTurnSelectorOpen(true);
  };

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % TEACHING_TIPS.length);
  };

  const currentTip = TEACHING_TIPS[tipIndex];

  // Live formatted date string in Bangla
  const todayFormatted = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat('bn-BD', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatter.format(new Date());
    } catch (e) {
      const d = new Date();
      return `${toBanglaNum(d.getDate())}/${toBanglaNum(d.getMonth() + 1)}/${toBanglaNum(d.getFullYear())}`;
    }
  }, []);

  const banglaGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'শুভ সকাল';
    if (h >= 12 && h < 17) return 'শুভ দুপুর';
    if (h >= 17 && h < 21) return 'শুভ সন্ধ্যা';
    return 'শুভ রাত্রি';
  }, []);


  return (
    <div className="tw-app-root">
      {/* ── SIDEBAR (Matching Existing Design Language Exactly) ── */}
      <aside className={`tw-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="tw-sidebar-logo" onClick={() => navigate('/dashboard')}>
          <div className="tw-sidebar-logo-icon">📖</div>
          <div>
            <div className="tw-sidebar-logo-text">পড়তে পারি</div>
            <div className="tw-sidebar-logo-sub">বাংলা শেখার সাথী</div>
          </div>
        </div>

        <nav>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>🏠</span>
            <span>হোম</span>
          </div>
          <div
            className="tw-nav-item active"
            onClick={() => navigate('/teacher-workspace')}
          >
            <span>👨‍🏫</span>
            <span>শিক্ষক ওয়ার্কস্পেস</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/reading')}
          >
            <span>📚</span>
            <span>পড়া</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/borno-bazar')}
          >
            <span>🏪</span>
            <span>বর্ণের দোকান</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/parents')}
          >
            <span>👨‍👩‍👧</span>
            <span>অভিভাবক গাইড</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>🎯</span>
            <span>ট্রেনিং</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>🧩</span>
            <span>কুইজ</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>🏆</span>
            <span>অর্জন</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <span>⚙️</span>
            <span>সেটিংস</span>
          </div>
          <div
            className="tw-nav-item"
            onClick={() => navigate('/')}
            style={{ marginTop: 8 }}
          >
            <span>🚪</span>
            <span>লগআউট</span>
          </div>
        </nav>

        <div className="tw-sidebar-motivate">
          <div style={{ fontSize: 24, marginBottom: 4 }}>🌱</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0a6e3a' }}>
            সব শিশুর সমান সুযোগ
          </div>
          <div style={{ fontSize: 11, color: '#687076', marginTop: 2 }}>
            Low-resource classroom ready
          </div>
        </div>
      </aside>

      {/* Sidebar mobile overlay */}
      <div
        className={`tw-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── MAIN WORKSPACE AREA ── */}
      <main
        className="tw-main-area"
        style={{
          background: `linear-gradient(180deg, rgba(235, 248, 240, 0.65) 0%, rgba(228, 245, 235, 0.70) 100%), url(${dashboardMeaningfulBg}) center/cover no-repeat fixed`,
        }}
      >
        {/* ── SECTION 1: WELCOME HEADER ── */}
        <header
          className="tw-top-bar"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: '22px',
            border: '1px solid rgba(24, 179, 104, 0.3)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="tw-top-left">
            <button
              className="tw-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <span style={{ width: 22 }} />
              <span style={{ width: 16 }} />
              <span style={{ width: 22 }} />
            </button>

            <div className="tw-welcome-text">
              <div className="tw-page-title">শিক্ষক ওয়ার্কস্পেস (Teacher Workspace)</div>
              <h1 className="tw-welcome-heading">
                {`${banglaGreeting}, ${teacherName}`}
              </h1>
              <div className="tw-welcome-sub">
                শ্রেণীকক্ষে বাংলা পড়ার লাইভ অগ্রগতি এবং ড্যাশবোর্ড
              </div>
            </div>
          </div>

          <div className="tw-top-right">
            <div className="tw-date-pill">
              <span>📅</span>
              <span>{todayFormatted}</span>
            </div>

            <div className="tw-search-bar">
              <span style={{ fontSize: 15, color: '#64748b' }}>🔍</span>
              <input
                type="text"
                placeholder="শিক্ষার্থী বা অ্যাক্টিভিটি খুঁজুন..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <button
              className="tw-notification-btn"
              aria-label="Notifications"
              title="Classroom notifications"
            >
              <span>🔔</span>
              <span className="tw-notification-dot" />
            </button>

            <div
              className="tw-profile-pill"
              onClick={() => setProfileModalOpen(true)}
              style={{ cursor: 'pointer' }}
              title="প্রোফাইল ও ছবি পরিবর্তন করুন (Change Profile Photo)"
            >
              <div className="tw-profile-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {teacherPhoto ? (
                  <img
                    src={teacherPhoto}
                    alt="Teacher"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  '👩‍🏫'
                )}
              </div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {teacherName}
              </span>
            </div>
          </div>
        </header>


        {/* ── GUIDED CLASSROOM SETUP BANNER (First Time / Empty Roster) ── */}
        {students.length === 0 && !loadingStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: '2px dashed #10b981',
              borderRadius: 22,
              padding: '24px 30px',
              marginBottom: 24,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 38, background: '#e0f2fe', padding: 14, borderRadius: 18 }}>🏫</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#065f46', marginBottom: 4 }}>
                  আপনার ক্লাসরুম সেটআপ সম্পন্ন করুন (Setup Your Classroom)
                </h3>
                <p style={{ fontSize: 14, color: '#047857', fontWeight: 600, margin: 0 }}>
                  আপনার ক্লাসরুমে এখনো কোনো শিক্ষার্থী যোগ করা হয়নি। ড্যাশবোর্ড ও ক্লাসরুম প্র্যাকটিস চালু করতে প্রথমে শিক্ষার্থী যোগ করুন।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddStudentModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>➕</span>
              <span>নতুন শিক্ষার্থী যোগ করুন</span>
            </button>
          </motion.div>
        )}

        {/* ── SECTION 2: TODAY'S CLASSROOM (6 Summary Cards) ── */}
        <section style={{ marginBottom: 12 }}>
          <div className="tw-section-header">
            <div className="tw-section-heading">
              <span>🏫</span>
              <span>আজকের শ্রেণীকক্ষ (Today&apos;s Classroom)</span>
            </div>
            <span className="tw-section-subtitle">
              শ্রেণীকক্ষের এক নজরে লাইভ অবস্থা • মোট {toBanglaNum(classroomData?.summary?.studentsPracticedToday?.total || students.length)} জন শিক্ষার্থী
            </span>
          </div>

          {statsError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: 16,
                padding: '14px 18px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span
                  style={{ fontSize: 14, color: '#991b1b', fontWeight: 600 }}
                >
                  লাইভ তথ্য লোড করা যায়নি: {statsError}
                </span>
              </div>
              <button
                onClick={fetchDashboardData}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          )}

          {(() => {
            const summary = classroomData?.summary || {
              mostDifficultLetter: {
                value: '-',
                sub: 'কোনো সেশন নেই',
              },
              mostDifficultWord: {
                value: '-',
                sub: 'কোনো শব্দ অনুশীলন করা হয়নি',
              },
              mostUsedActivity: {
                value: 'None',
                sub: 'কোনো অ্যাক্টিভিটি নেই',
              },
              averageReadingTime: {
                value: '0 Minutes',
                sub: 'আজ প্রতি শিক্ষার্থী (০ মিনিট)',
              },
              studentsPracticedToday: {
                value: '0',
                total: 0,
                label: '০',
                sub: 'মোট ০ জন শিক্ষার্থীর মধ্যে (০ জন)',
              },
              teachingFocus: {
                value: 'Start Classroom Activity',
                sub: 'শুরু করতে ক্লাসরুম মোড চালু করুন',
              },
            };

            return (
              <div className="tw-summary-grid">
                {/* Card 1: Most Difficult Letter */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#eef9f1' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#0a6e3a' }}
                  >
                    🔤
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">
                      সবচেয়ে কঠিন বর্ণ
                    </div>
                    <div className="tw-summary-value">
                      {summary.mostDifficultLetter.value}
                    </div>
                    <div className="tw-summary-sub">
                      {translateSubText(summary.mostDifficultLetter.sub)}
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Most Difficult Word */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#fffbee' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#b45309' }}
                  >
                    📖
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">সবচেয়ে কঠিন শব্দ</div>
                    <div className="tw-summary-value">
                      {summary.mostDifficultWord.value}
                    </div>
                    <div
                      className="tw-summary-sub"
                      style={{ color: '#b45309' }}
                    >
                      {translateSubText(summary.mostDifficultWord.sub)}
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: Most Used Activity */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#f0efff' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#5b3fd9' }}
                  >
                    🎮
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">সর্বাধিক ব্যবহৃত অ্যাক্টিভিটি</div>
                    <div className="tw-summary-value" style={{ fontSize: 20 }}>
                      {translateActivityName(summary.mostUsedActivity.value)}
                    </div>
                    <div
                      className="tw-summary-sub"
                      style={{ color: '#5b3fd9' }}
                    >
                      {translateSubText(summary.mostUsedActivity.sub)}
                    </div>
                  </div>
                </motion.div>

                {/* Card 4: Average Reading Time */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#fff0f5' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#be185d' }}
                  >
                    ⏱️
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">
                      গড় পড়ার সময়
                    </div>
                    <div className="tw-summary-value">
                      {`${toBanglaNum(parseInt(summary.averageReadingTime.value) || 0)} মিনিট`}
                    </div>
                    <div
                      className="tw-summary-sub"
                      style={{ color: '#be185d' }}
                    >
                      আজ প্রতি শিক্ষার্থী
                    </div>
                  </div>
                </motion.div>

                {/* Card 5: Students Practiced Today */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#e8f7ee' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#0f9055' }}
                  >
                    👧👦
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">
                      আজ অনুশীলন করেছে
                    </div>
                    <div className="tw-summary-value">
                      {toBanglaNum(summary.studentsPracticedToday.value || 0)}
                    </div>
                    <div className="tw-summary-sub">
                      {`মোট ${toBanglaNum(summary.studentsPracticedToday.total || 0)} জনের মধ্যে (${toBanglaNum(summary.studentsPracticedToday.value || 0)} জন)`}
                    </div>
                  </div>
                </motion.div>

                {/* Card 6: Today's Teaching Focus */}
                <motion.div
                  className="tw-summary-card"
                  style={{ background: '#fff8e8' }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="tw-summary-icon-box"
                    style={{ color: '#a16207' }}
                  >
                    🎯
                  </div>
                  <div className="tw-summary-content">
                    <div className="tw-summary-label">
                      আজকের পাঠদানের ফোকাস
                    </div>
                    <div className="tw-summary-value" style={{ fontSize: 20 }}>
                      {translateTeachingFocus(summary.teachingFocus.value)}
                    </div>
                    <div
                      className="tw-summary-sub"
                      style={{ color: '#a16207' }}
                    >
                      {translateSubText(summary.teachingFocus.sub)}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}

        </section>

        {/* ── SECTION 3: START CLASSROOM ── */}
        <section
          className="tw-start-classroom-card"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 254, 246, 0.98) 100%)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(24, 179, 104, 0.4)',
            boxShadow: '0 10px 32px rgba(24, 179, 104, 0.16)',
          }}
        >
          <div className="tw-start-header-wrap">
            <div className="tw-start-title-area">
              <div className="tw-start-badge">
                <span>🖥️</span>
                <span>একজন শিক্ষক • একটি ল্যাপটপ • একটি প্রজেক্টর</span>
              </div>
              <h2>ক্লাসরুম মোড শুরু করুন</h2>
              <p>
                পুরো ক্লাসের জন্য আজকের পড়ার অ্যাক্টিভিটি শুরু করুন। শ্রেণীকক্ষের পর্দায় প্রজেক্ট করুন—পৃথক কোনো ডিভাইসের প্রয়োজন নেই!
              </p>
            </div>

            <div className="tw-start-illustration-wrap">
              <img
                src={classroomIllustration}
                alt="Friendly classroom reading"
                className="tw-start-illustration-img"
              />
            </div>
          </div>

          <div className="tw-activity-cards-grid">
            {/* Activity 1: Reading Story */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'Reading Story' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('Reading Story')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">📚</div>
                  <span className="tw-activity-tag">পুরো ক্লাস</span>
                </div>
                <h3>গল্প পড়া (Reading Story)</h3>
                <p>
                  শব্দ হাইলাইট ও অডিও সমর্থন সহ ইন্টারেক্টিভ গল্প পড়া।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'Reading Story' ? '#0f9055' : '#687076',
                }}
              >
                {selectedActivity === 'Reading Story' ? '● নির্বাচিত' : '○ নির্বাচন করুন'}
              </div>
            </div>

            {/* Activity 2: BornoBazar */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'BornoBazar' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('BornoBazar')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">🏪</div>
                  <span className="tw-activity-tag">ইন্টারেক্টিভ</span>
                </div>
                <h3>বর্ণবাজার (BornoBazar)</h3>
                <p>
                  বাংলা বর্ণ ও কেনাকাটার দক্ষতা অনুশীলনের মজার বাজার গেম।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'BornoBazar' ? '#0f9055' : '#687076',
                }}
              >
                {selectedActivity === 'BornoBazar' ? '● নির্বাচিত' : '○ নির্বাচন করুন'}
              </div>
            </div>

            {/* Activity 3: Quiz Game */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'Quiz Game' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('Quiz Game')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">🧩</div>
                  <span className="tw-activity-tag">কুইজ ও খেলা</span>
                </div>
                <h3>মজার কুইজ (Quiz Game)</h3>
                <p>
                  শব্দ ও ছবি মেলাও এবং শূন্যস্থান পূরণের ইন্টারেক্টিভ কুইজ গেম।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'Quiz Game' ? '#0f9055' : '#687076',
                }}
              >
                {selectedActivity === 'Quiz Game' ? '● নির্বাচিত' : '○ নির্বাচন করুন'}
              </div>
            </div>

            {/* Activity 4: Word Practice */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'Word Practice' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('Word Practice')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">✏️</div>
                  <span className="tw-activity-tag">নির্দেশিত</span>
                </div>
                <h3>শব্দ অনুশীলন (Word Practice)</h3>
                <p>
                  ধ্বনি বিশ্লেষণ এবং যুক্তবর্ণ (Conjunct Letters) চর্চা।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'Word Practice' ? '#0f9055' : '#687076',
                }}
              >
                {selectedActivity === 'Word Practice' ? '● নির্বাচিত' : '○ নির্বাচন করুন'}
              </div>
            </div>

            {/* Activity 5: Sentence Builder */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'Sentence Builder' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('Sentence Builder')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">📝</div>
                  <span className="tw-activity-tag">ভাষা গঠন</span>
                </div>
                <h3>বাক্য তৈরি (Sentence Builder)</h3>
                <p>
                  শব্দ সাজিয়ে সঠিক বাংলা বাক্য তৈরি করার ইন্টারেক্টিভ অনুশীলন।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'Sentence Builder' ? '#0f9055' : '#687076',
                }}
              >
                {selectedActivity === 'Sentence Builder' ? '● নির্বাচিত' : '○ নির্বাচন করুন'}
              </div>
            </div>

            {/* Activity 6: Custom Reading */}
            <div
              className={`tw-activity-card ${
                selectedActivity === 'Custom Reading' ? 'selected' : ''
              }`}
              onClick={() => setSelectedActivity('Custom Reading')}
            >
              <div>
                <div className="tw-activity-top">
                  <div className="tw-activity-icon">🎯</div>
                  <span className="tw-activity-tag">ফ্লেক্সিবল</span>
                </div>
                <h3>কাস্টম পড়া (Custom Reading)</h3>
                <p>
                  আজকের নির্দিষ্ট পাঠের জন্য নির্বাচিত শব্দ বা বর্ণ।
                </p>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    selectedActivity === 'Custom Reading'
                      ? '#0f9055'
                      : '#687076',
                }}
              >
                {selectedActivity === 'Custom Reading'
                  ? '● নির্বাচিত'
                  : '○ নির্বাচন করুন'}
              </div>
            </div>
          </div>

          <div className="tw-start-action-bar">
            <div className="tw-projector-info">
              <div className="tw-projector-info-icon">💡</div>
              <span>
                নির্বাচিত: <strong>{translateActivityName(selectedActivity)}</strong> — স্ক্রিন প্রজেকশনের জন্য প্রস্তুত
              </span>
            </div>

            <button
              className="tw-launch-classroom-btn"
              onClick={() => handleLaunchClassroomMode(selectedActivity)}
            >
              <span>🚀</span>
              <span>ক্লাসরুম মোড চালু করুন 🖥️</span>
            </button>
          </div>
        </section>


        {/* ── SECTION 4: STUDENTS (Split Layout) ── */}
        <section>
          <div className="tw-section-header">
            <div className="tw-section-heading">
              <span>👧👦</span>
              <span>শিক্ষার্থী তালিকা (Classroom Roster)</span>
            </div>
            <span className="tw-section-subtitle">
              সহায়তামূলক অনুশীলনের অগ্রগতি • কোনো স্কোর, র‍্যাঙ্ক বা তুলনা নেই
            </span>
          </div>

          <div className="tw-students-split-layout">
            {/* Left Panel: Student List */}
            <div className="tw-student-list-panel">
              <div className="tw-student-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>শিক্ষার্থী তালিকা ({toBanglaNum(filteredStudents.length)})</h3>
                <button
                  onClick={() => setAddStudentModalOpen(true)}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                  title="নতুন শিক্ষার্থী যোগ করুন"
                >
                  <span>➕</span>
                  <span>শিক্ষার্থী যোগ করুন</span>
                </button>
              </div>

              <input
                type="text"
                className="tw-student-search-input"
                placeholder="শিক্ষার্থী খুঁজুন..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />

              <div className="tw-student-list-items">
                {filteredStudents.map((s) => {
                  const isActive = s.id === selectedStudent.id;
                  return (
                    <div
                      key={s.id}
                      className={`tw-student-row ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedStudentId(s.id)}
                    >
                      <div className="tw-student-row-left">
                        <div className="tw-student-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.avatar && (s.avatar.startsWith('data:image') || s.avatar.startsWith('http')) ? (
                            <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            s.avatar || '👦'
                          )}
                        </div>
                        <div className="tw-student-name-box">
                          <span className="tw-student-name">
                            {s.name} ({s.nameBangla})
                          </span>
                          <span className="tw-student-level-badge">
                            লেভেল {toBanglaNum(s.level)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`tw-status-badge ${
                          s.statusColor === 'green'
                            ? 'tw-status-green'
                            : 'tw-status-yellow'
                        }`}
                      >
                        {translateStatus(s.status)}
                      </span>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: 15,
                    }}
                  >
                    কোনো শিক্ষার্থী পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Selected Student Details */}
            <div className="tw-student-detail-panel">
              {!selectedStudent ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👧👦</div>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#334155' }}>কোনো শিক্ষার্থী তালিকা নেই</div>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>পড়ার অগ্রগতি দেখতে শিক্ষার্থীদের প্রোফাইল তৈরি করুন।</div>
                  <button
                    onClick={() => setAddStudentModalOpen(true)}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    ➕ শিক্ষার্থী যোগ করুন (Add Student)
                  </button>
                </div>
              ) : (
                <>
                  <div className="tw-detail-top-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="tw-detail-profile-main">
                      <div className="tw-detail-avatar-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedStudent.avatar && (selectedStudent.avatar.startsWith('data:image') || selectedStudent.avatar.startsWith('http')) ? (
                          <img src={selectedStudent.avatar} alt={selectedStudent.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          selectedStudent.avatar || '👦'
                        )}
                      </div>
                  <div>
                    <div className="tw-detail-name">
                      {selectedStudent.name} ({selectedStudent.nameBangla})
                    </div>
                    <div className="tw-detail-sub-status">
                      <span
                        className={`tw-status-badge ${
                          selectedStudent.statusColor === 'green'
                            ? 'tw-status-green'
                            : 'tw-status-yellow'
                        }`}
                      >
                        {translateStatus(selectedStudent.status)}
                      </span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        • সহায়তামূলক অনুশীলন বিবরণী
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStudent(selectedStudent.id, selectedStudent.name)}
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                  title="এই শিক্ষার্থীকে তালিকা থেকে মুছুন"
                >
                  <span>🗑️</span>
                  <span>শিক্ষার্থী মুছুন</span>
                </button>
              </div>

              {/* View Full Individual Progress View CTA */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStudentForModal(selectedStudent);
                  setProgressModalOpen(true);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: '18px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 4px 14px rgba(3, 105, 161, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>📊</span>
                <span>{selectedStudent.name}-এর বিস্তারিত অগ্রগতি ও টাইমলাইন দেখুন</span>
              </button>

              {/* 6 Summary Stats */}
              <div className="tw-detail-stats-grid">
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">পড়ার লেভেল</div>
                  <div className="tw-mini-stat-value">
                    লেভেল {toBanglaNum(selectedStudent.level)}
                  </div>
                </div>
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">সম্পন্ন গল্প</div>
                  <div className="tw-mini-stat-value">
                    {toBanglaNum(selectedStudent.storiesCompleted)}
                  </div>
                </div>
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">পড়ার সেশন</div>
                  <div className="tw-mini-stat-value">
                    {toBanglaNum(selectedStudent.readingSessions)}
                  </div>
                </div>
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">বর্ণবাজার লেভেল</div>
                  <div className="tw-mini-stat-value">
                    লেভেল {toBanglaNum(selectedStudent.bornoBazarLevel)}
                  </div>
                </div>
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">সর্বশেষ অনুশীলনের তারিখ</div>
                  <div
                    className="tw-mini-stat-value"
                    style={{ fontSize: 15 }}
                  >
                    {selectedStudent.lastPracticeDate}
                  </div>
                </div>
                <div className="tw-mini-stat-card">
                  <div className="tw-mini-stat-label">মোট পড়ার সময়</div>
                  <div className="tw-mini-stat-value">
                    {selectedStudent.readingTime}
                  </div>
                </div>
              </div>

              {/* NEEDS MORE PRACTICE (Chips) */}
              <div className="tw-detail-section">
                <div className="tw-detail-section-title">
                  <span>অধিক অনুশীলন প্রয়োজন</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    ফোকাস ক্ষেত্র
                  </span>
                </div>
                <div className="tw-chips-list">
                  {selectedStudent.needsMorePractice.map((chip, idx) => (
                    <span key={idx} className="tw-practice-chip">
                      <span>📌</span>
                      <span>{chip}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* RECOMMENDED NEXT ACTIVITY (with 1-click Launch) */}
              <div className="tw-detail-section">
                <div className="tw-detail-section-title">
                  <span>পরবর্তী সুপারিশকৃত অ্যাক্টিভিটি</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    ১-ক্লিকে শুরু
                  </span>
                </div>
                <div className="tw-recommended-list">
                  {selectedStudent.recommendedActivities.map((act) => (
                    <div key={act.id} className="tw-recommended-item">
                      <div className="tw-recommended-text">
                        <span>🏷️</span>
                        <span>{act.title}</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            fontWeight: 500,
                          }}
                        >
                          ({act.type})
                        </span>
                      </div>
                      <button
                        className="tw-launch-item-btn"
                        onClick={() =>
                          handleLaunchClassroomMode(
                            `${act.title} for ${selectedStudent.name}`
                          )
                        }
                      >
                        ▶ শুরু করুন
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TEACHER NOTES (Only visible to teachers) */}
              <div className="tw-detail-section" style={{ marginBottom: 0 }}>
                <div className="tw-detail-section-title">
                  <span>শিক্ষকের নোট</span>
                  <span className="tw-notes-visibility-badge">
                    <span>🔒</span>
                    <span>শুধুমাত্র শিক্ষকের জন্য দৃশ্যমান</span>
                  </span>
                </div>
                <div className="tw-teacher-notes-area">
                  <textarea
                    className="tw-notes-textarea"
                    value={selectedStudent.notes}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="শিক্ষার্থীর অগ্রগতি সম্পর্কে ব্যক্তিগত নোট, উৎসাহ বা অডিও পছন্দ লিখুন..."
                  />
                  <div className="tw-notes-footer">
                    <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                      {saveStatus}
                    </span>
                    <button
                      className="tw-save-note-btn"
                      onClick={handleSaveNote}
                    >
                      নোট সংরক্ষণ করুন
                    </button>
                  </div>
                </div>
              </div>
            </>
            )}
            </div>
          </div>
        </section>


        {/* ── SECTION 5: CLASSROOM INSIGHTS (Simple Cards, no charts) ── */}
        <section>
          <div className="tw-section-header">
            <div className="tw-section-heading">
              <span>📊</span>
              <span>শ্রেণীকক্ষ ইনসাইটস (Classroom Insights)</span>
            </div>
            <span className="tw-section-subtitle">
              আপনার প্রতিদিনের পাঠ পরিকল্পনা সহজ করার সংক্ষিপ্ত বিবরণ
            </span>
          </div>

          {(() => {
            const insights = classroomData?.insights || {
              difficultLetters: ['ক্ষ', 'জ্ঞ', 'শ্র', 'ষ্ক'],
              difficultWords: ['প্রকৃতি', 'বিজ্ঞান', 'পরিবেশ'],
            };
            const summary = classroomData?.summary || {
              mostDifficultLetter: { value: 'ক্ষ' },
              mostUsedActivity: { value: 'BornoBazar' },
            };

            return (
              <div className="tw-insights-grid">
                {/* Card 1: Most Difficult Letters */}
                <div className="tw-insight-card">
                  <div>
                    <div className="tw-insight-card-top">
                      <div className="tw-insight-title">সবচেয়ে কঠিন বর্ণ</div>
                      <div className="tw-insight-icon" style={{ color: '#0a6e3a' }}>
                        🔤
                      </div>
                    </div>
                    <div className="tw-insight-main-value">
                      {insights.difficultLetters.map((char, i) => (
                        <span key={i} className="tw-insight-chip">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="tw-insight-sub">
                    যুক্তবর্ণ শিখতে ধ্বনি বিশ্লেষণ ও সমস্বরে পাঠ অত্যন্ত ফলপ্রসূ।
                  </div>
                </div>

                {/* Card 2: Most Difficult Words */}
                <div className="tw-insight-card">
                  <div>
                    <div className="tw-insight-card-top">
                      <div className="tw-insight-title">সবচেয়ে কঠিন শব্দ</div>
                      <div className="tw-insight-icon" style={{ color: '#b45309' }}>
                        📖
                      </div>
                    </div>
                    <div className="tw-insight-main-value">
                      {insights.difficultWords.map((word, i) => (
                        <span key={i} className="tw-insight-chip">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="tw-insight-sub">
                    শব্দ হাইলাইট ব্যবহার করে সিলেবল বা অক্ষরে ভেঙে পড়ান।
                  </div>
                </div>

                {/* Card 3: Most Played Activity */}
                <div className="tw-insight-card">
                  <div>
                    <div className="tw-insight-card-top">
                      <div className="tw-insight-title">সর্বাধিক ব্যবহৃত অ্যাক্টিভিটি</div>
                      <div className="tw-insight-icon" style={{ color: '#5b3fd9' }}>
                        🎮
                      </div>
                    </div>
                    <div
                      className="tw-insight-main-value"
                      style={{ fontSize: 24, color: '#5b3fd9' }}
                    >
                      {translateActivityName(summary.mostUsedActivity.value)}
                    </div>
                  </div>
                  <div className="tw-insight-sub">
                    লাইভ ক্লাসরুম সেশন রেকর্ড করা হয়েছে। শিক্ষার্থীরা ইন্টারেক্টিভ অনুশীলন পছন্দ করে!
                  </div>
                </div>

                {/* Card 4: Suggested Lesson for Tomorrow */}
                <div className="tw-insight-card">
                  <div>
                    <div className="tw-insight-card-top">
                      <div className="tw-insight-title">
                        আগামীকালের প্রস্তাবিত পাঠ
                      </div>
                      <div className="tw-insight-icon" style={{ color: '#0f9055' }}>
                        🌅
                      </div>
                    </div>
                    <div
                      className="tw-insight-main-value"
                      style={{ fontSize: 18 }}
                    >
                      গল্প ৩ + অনুশীলন ({summary.mostDifficultLetter.value})
                    </div>
                  </div>
                  <div className="tw-insight-sub">
                    আজকের শেখা শব্দের ওপর ভিত্তি করে তৈরি। ১-ক্লিকে প্রজেকশনের জন্য প্রস্তুত।
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── SECTION 6: TEACHING TIP (Evidence-Based Recommendation) ── */}
        <section className="tw-teaching-tip-card">
          <div className="tw-tip-left">
            <div className="tw-tip-icon-box">💡</div>
            <div className="tw-tip-content">
              <div className="tw-tip-heading">
                <span>{currentTip.title}</span>
                <span
                  style={{
                    fontSize: 12,
                    background: '#e8f7ee',
                    color: '#0a6e3a',
                    padding: '2px 10px',
                    borderRadius: 100,
                  }}
                >
                  গবেষণালব্ধ (Evidence-based)
                </span>
              </div>
              <div className="tw-tip-quote">&ldquo;{currentTip.quote}&rdquo;</div>
              <div className="tw-tip-explanation">
                {currentTip.explanation}
              </div>
            </div>
          </div>

          <button className="tw-rotate-tip-btn" onClick={handleNextTip}>
            <span>🔄</span>
            <span>পরবর্তী টিপ্স ({toBanglaNum(tipIndex + 1)}/{toBanglaNum(4)})</span>
          </button>
        </section>
      </main>

      {/* ── CLASSROOM MODE PROJECTION MODAL ── */}
      <AnimatePresence>
        {classroomModalOpen && (
          <motion.div
            className="tw-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setClassroomModalOpen(false)}
          >
            <motion.div
              className="tw-modal-box"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="tw-modal-close-btn"
                onClick={() => setClassroomModalOpen(false)}
              >
                ✕
              </button>

              <div className="tw-modal-header-banner">
                <div
                  style={{
                    fontSize: 48,
                    marginBottom: 8,
                  }}
                >
                  🖥️
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0a6e3a',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  ক্লাসরুম মোড সক্রিয়
                </div>
              </div>

              <h3 className="tw-modal-title">প্রজেকশনের জন্য প্রস্তুত</h3>
              <p className="tw-modal-desc">
                আপনার ল্যাপটপটি পুরো শ্রেণীকক্ষের (২০–৪০ জন শিক্ষার্থী) জন্য প্রজেক্ট করতে প্রস্তুত। অডিও এবং শব্দ হাইলাইটিং স্ক্রিনে সিঙ্ক্রোনাইজ হবে।
              </p>

              <div className="tw-modal-activity-badge" style={{ marginBottom: 16 }}>
                <span>🎯</span>
                <span>{launchedActivityTitle}</span>
              </div>

              {/* Randomized Turn-Taking Routine Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
                  র‌্যান্ডম ক্লাসরুম অংশগ্রহণকারী পুল (মোট {toBanglaNum(students.length)} জন)
                </div>
                {activeClassroomStudent ? (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #10b981',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{activeClassroomStudent.avatar || '👦'}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#065f46' }}>
                        {activeClassroomStudent.name} ({activeClassroomStudent.nameBangla})
                      </div>
                      <div style={{ fontSize: 13, color: '#047857' }}>
                        এই পর্বের জন্য নির্বাচিত • লেভেল {toBanglaNum(activeClassroomStudent.level || 1)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={() => pickNextRandomStudent()}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      🎲 শুরু করতে লটারি করে শিক্ষার্থী নির্বাচন করুন
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  className="tw-modal-footer-btn"
                  onClick={() => {
                    let studentToUse = activeClassroomStudent;
                    if (!studentToUse) {
                      studentToUse = pickNextRandomStudent();
                    }
                    if (!studentToUse && students && students.length > 0) {
                      studentToUse = students[0];
                    }
                    if (!studentToUse) {
                      alert('⚠️ কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি। অনুগ্রহ করে প্রথমে শিক্ষার্থী যোগ করুন!');
                      return;
                    }

                    setClassroomModalOpen(false);
                    // Navigate to appropriate activity
                    if (
                      launchedActivityTitle.includes('BornoBazar') ||
                      launchedActivityTitle.includes('বর্ণবাজার') ||
                      launchedActivityTitle.includes('Sentence') ||
                      launchedActivityTitle.includes('বাক্য')
                    ) {
                      navigate('/borno-bazar');
                    } else if (
                      launchedActivityTitle.includes('Quiz') ||
                      launchedActivityTitle.includes('কুইজ')
                    ) {
                      navigate('/dashboard?view=quiz');
                    } else if (
                      launchedActivityTitle.includes('Word') ||
                      launchedActivityTitle.includes('শব্দ')
                    ) {
                      navigate('/dashboard?view=trace');
                    } else {
                      navigate('/reading');
                    }
                  }}
                >
                  {activeClassroomStudent
                    ? `▶ ${activeClassroomStudent.name}-এর জন্য শুরু করুন →`
                    : '▶ শিক্ষার্থী নির্বাচন করুন ও শুরু করুন →'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── TEACHER PROFILE MODAL ── */}
        {profileModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
            }}
            onClick={() => setProfileModalOpen(false)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: 28,
                width: 420,
                maxWidth: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                position: 'relative',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setProfileModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>

              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                শিক্ষক প্রোফাইল ও ছবি (Teacher Profile)
              </div>

              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  background: '#f1f5f9',
                  border: '4px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontSize: 48,
                }}
              >
                {teacherPhoto ? (
                  <img
                    src={teacherPhoto}
                    alt="Teacher"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '👩‍🏫'
                )}
              </div>

              {isEditingName ? (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 16,
                      textAlign: 'center',
                      width: 200,
                    }}
                    placeholder="আপনার নাম লিখুন"
                  />
                  <button
                    onClick={handleSaveName}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ সংরক্ষণ
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>{teacherName}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#64748b',
                    }}
                    title="নাম সম্পাদনা করুন (Edit Name)"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                শ্রেণীকক্ষ তত্ত্বাবধায়ক (Classroom Teacher)
              </div>

              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  📷 ছবি আপলোড করুন
                </button>
                {teacherPhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    🗑️ ছবি মুছুন
                  </button>
                )}
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
                আপনার আপলোড করা ছবি প্রোফাইল কার্ড এবং হেডার বারে প্রদর্শিত হবে।
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD STUDENT MODAL ── */}
      <AnimatePresence>
        {addStudentModalOpen && (
          <div
            className="tw-modal-overlay"
            onClick={() => setAddStudentModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <div
              className="tw-modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: 28,
                width: '100%',
                maxWidth: 460,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  ➕ নতুন শিক্ষার্থী যোগ করুন (Add Student)
                </h3>
                <button
                  onClick={() => setAddStudentModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    fontSize: 18,
                    color: '#64748b',
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStudent}>
                {/* 1. Student Name */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    শিক্ষার্থীর নাম (Student Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সাদিয়া বা সাকিব"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 1b. Student Nickname (Optional) */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    ডাকনাম (Optional Nickname)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: রাইহান"
                    value={newStudentNickname}
                    onChange={(e) => setNewStudentNickname(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 1c. Student Grade / Class */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    শ্রেণী (Grade / Class)
                  </label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 15,
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="প্রথম শ্রেণী">প্রথম শ্রেণী (Grade 1)</option>
                    <option value="দ্বিতীয় শ্রেণী">দ্বিতীয় শ্রেণী (Grade 2)</option>
                    <option value="তৃতীয় শ্রেণী">তৃতীয় শ্রেণী (Grade 3)</option>
                    <option value="প্রাক-প্রাথমিক">প্রাক-প্রাথমিক (Pre-Primary)</option>
                  </select>
                </div>

                {/* 2. Avatar / Emoji selector or Custom Photo Upload */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    প্রোফাইল ছবি বা ইমোজি নির্বাচন করুন (Select Avatar or Upload Photo)
                  </label>

                  {/* Preview box */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        border: '2px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {newStudentAvatar && (newStudentAvatar.startsWith('data:image') || newStudentAvatar.startsWith('http')) ? (
                        <img
                          src={newStudentAvatar}
                          alt="Student Avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        newStudentAvatar || '👦'
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={studentPhotoInputRef}
                        style={{ display: 'none' }}
                        onChange={handleStudentPhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => studentPhotoInputRef.current?.click()}
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📷 ছবি আপলোড করুন (Upload Photo)
                      </button>
                    </div>
                  </div>

                  {/* Emoji grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 8,
                      maxHeight: 140,
                      overflowY: 'auto',
                      padding: 4,
                    }}
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewStudentAvatar(emoji)}
                        style={{
                          background: newStudentAvatar === emoji ? '#d1fae5' : '#f8fafc',
                          border: newStudentAvatar === emoji ? '2px solid #10b981' : '1px solid #e2e8f0',
                          borderRadius: 10,
                          height: 44,
                          fontSize: 22,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {addStudentError && (
                  <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 16, fontWeight: 500 }}>
                    {addStudentError}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setAddStudentModalOpen(false)}
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 15,
                    }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingStudent}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 15,
                      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                      opacity: isAddingStudent ? 0.7 : 1,
                    }}
                  >
                    {isAddingStudent ? 'যোগ করা হচ্ছে...' : '✓ সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ── STUDENT PROGRESS MODAL ── */}
        {progressModalOpen && selectedStudentForModal && (
          <StudentProgressModal
            student={selectedStudentForModal}
            onClose={() => setProgressModalOpen(false)}
            onUpdateNote={handleNoteChange}
            onLaunchActivity={(actName) => handleLaunchClassroomMode(actName)}
          />
        )}
        {/* ── CLASSROOM TURN SELECTOR MODAL ── */}
        {turnSelectorOpen && (
          <ClassroomTurnSelector
            roster={students}
            onLaunchActivity={(actName) => {
              setTurnSelectorOpen(false);
              if (actName === 'BornoBazar') {
                navigate('/borno-bazar');
              } else {
                navigate('/reading');
              }
            }}
            onClose={() => setTurnSelectorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── INDIVIDUAL STUDENT PROGRESS MODAL COMPONENT ──
function StudentProgressModal({ student, onClose, onUpdateNote, onLaunchActivity }) {
  const [sessions, setSessions] = useState([]);
  const [bornoData, setBornoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState(student.notes || '');
  const [noteSaveStatus, setNoteSaveStatus] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!student?.id) return;
      try {
        setLoading(true);
        const [sessData, bornoProgress] = await Promise.all([
          getSessions(student.id).catch(() => []),
          getBornoBazarProgress(student.id).catch(() => null)
        ]);
        if (isMounted) {
          setSessions(Array.isArray(sessData) ? sessData : []);
          setBornoData(bornoProgress);
        }
      } catch (err) {
        console.error("Failed to load student progress detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [student]);

  // Aggregate metrics
  const totalSessions = sessions.length;
  const avgAccuracy = totalSessions > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 100), 0) / totalSessions)
    : 100;
  const totalDurationMs = sessions.reduce((acc, s) => acc + (s.durationMs || 0), 0);
  const avgDurationMins = totalSessions > 0
    ? Math.max(1, Math.round(totalDurationMs / (1000 * 60 * totalSessions)))
    : 0;
  
  const storiesCompleted = sessions.filter(s => s.feature === 'reading' || s.activityType === 'read_aloud').length;
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastPracticeDate = lastSession 
    ? new Date(lastSession.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : student.lastPracticeDate || 'এখনও কোনো অনুশীলন হয়নি';

  // BornoBazar Data
  const coins = bornoData?.totalCoins || (student.bornoBazarLevel ? student.bornoBazarLevel * 50 : 0);
  const stars = bornoData?.totalStars || (student.storiesCompleted ? student.storiesCompleted * 2 : 0);
  const wordsSpelledCount = bornoData?.wordsSpelled?.length || 0;
  const lettersLearnedCount = bornoData?.lettersLearned?.length || 0;

  // Identify Needs More Practice (Difficult letters / words)
  const difficultLetters = useMemo(() => {
    const counts = {};
    sessions.forEach(s => {
      const details = s.details || {};
      const chars = [
        ...(Array.isArray(details.failedLetters) ? details.failedLetters : []),
        ...(Array.isArray(details.tappedConjuncts) ? details.tappedConjuncts : [])
      ];
      chars.forEach(c => { if (c) counts[c] = (counts[c] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 4);
  }, [sessions]);

  const difficultWords = useMemo(() => {
    const counts = {};
    sessions.forEach(s => {
      const details = s.details || {};
      const words = [
        ...(Array.isArray(details.tappedWords) ? details.tappedWords : []),
        ...(details.word ? [details.word] : [])
      ];
      words.forEach(w => { if (w && w.length > 1) counts[w] = (counts[w] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 4);
  }, [sessions]);

  // Growth Summary Trend Calculation
  const growthTrend = useMemo(() => {
    if (sessions.length < 2) {
      return { accuracyChange: 0, durationChange: 0 };
    }
    const latest = sessions[sessions.length - 1];
    const previous = sessions[sessions.length - 2];
    const accDiff = (latest.accuracy || 100) - (previous.accuracy || 100);
    const durDiffSec = Math.round(((latest.durationMs || 0) - (previous.durationMs || 0)) / 1000);
    return { accuracyChange: accDiff, durationChange: durDiffSec };
  }, [sessions]);

  // Suggested Next Activity based on ActivitySession history
  const suggestedNextActivity = useMemo(() => {
    if (difficultLetters.length > 0) {
      const charSessCount = sessions.filter(s => 
        s.details?.failedLetters?.includes(difficultLetters[0]) || 
        s.details?.tappedConjuncts?.includes(difficultLetters[0])
      ).length;
      return {
        title: `যুক্তবর্ণ অনুশীলন (${difficultLetters[0]})`,
        activityName: 'Reading Story',
        icon: '📚',
        reason: `সেশন হিস্ট্রি অনুযায়ী '${difficultLetters[0]}' যুক্তবর্ণের ব্যবহারে শিক্ষার্থী চ্যালেঞ্জ বোধ করেছে (${toBanglaNum(charSessCount || 1)}টি সেশনে চিহ্নিত)।`
      };
    }
    if (difficultWords.length > 0) {
      return {
        title: `শব্দ রিডিং ড্রিল (${difficultWords[0]})`,
        activityName: 'Reading Story',
        icon: '📖',
        reason: `অতীত সেশনে '${difficultWords[0]}' পড়তে শিক্ষার্থী একাধিকবার অডিও রি-প্লে বেছে নিয়েছে। পুনরাবৃত্তি প্রয়োজন।`
      };
    }
    const readingCount = sessions.filter(s => s.feature === 'reading' || s.activityType === 'read_aloud').length;
    const bornoCount = sessions.filter(s => s.feature === 'borno_bazar' || s.activityType === 'tracing' || s.activityType === 'spelling').length;

    if (readingCount <= bornoCount) {
      return {
        title: 'গল্প পড়া (Reading Story)',
        activityName: 'Reading Story',
        icon: '📖',
        reason: `শিক্ষার্থীর মোট ${toBanglaNum(sessions.length)}টি অনুশীলনের মধ্যে বর্ণবাজার সম্পন্ন হয়েছে বেশি (${toBanglaNum(bornoCount)}টি)। পড়ার ফ্লুয়েন্সি ও সাবলীলতার জন্য গল্প পড়া উপযুক্ত।`
      };
    }
    return {
      title: 'বর্ণবাজার (BornoBazar)',
      activityName: 'BornoBazar',
      icon: '🏪',
      reason: `শিক্ষার্থীর বিগত ${toBanglaNum(readingCount)}টি গল্প পড়ার সেশনের পর আনন্দের সাথে কারচিহ্ন ও শব্দ গঠন অনুশীলনের জন্য বর্ণবাজার সেরা।`
    };
  }, [sessions, difficultLetters, difficultWords]);

  const handleSaveNote = async () => {
    try {
      await updateStudentNote(student.id, noteText);
      onUpdateNote(student.id, noteText);
      setNoteSaveStatus('✓ সেভ হয়েছে');
    } catch (e) {
      setNoteSaveStatus('✓ সেভ হয়েছে (Local)');
    }
    setTimeout(() => setNoteSaveStatus(''), 2500);
  };

  return (
    <div className="tw-modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="tw-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
      >
        {/* Modal Header */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '24px 28px', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden' }}>
              {student.avatar && (student.avatar.startsWith('data:image') || student.avatar.startsWith('http')) ? (
                <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                student.avatar || '👦'
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                {student.name} ({student.nameBangla})
              </h2>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                {student.classGrade || 'প্রথম শ্রেণী'} • সহায়তামূলক ব্যক্তিগত অগ্রগতি (Individual Growth View)
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* 0. COMPACT GROWTH SUMMARY CARD */}
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1.5px solid #86efac', borderRadius: 18, padding: '16px 22px', marginBottom: 20, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🌱</span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#166534', margin: 0 }}>
                    ব্যক্তিগত বৃদ্ধি সারসংক্ষেপ (Growth Summary)
                  </h4>
                  <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                    বিগত {toBanglaNum(sessions.length)}টি সেশনের রিয়েল-টাইম তথ্য বিশ্লেষণ
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#166534', display: 'block', fontWeight: 600 }}>সঠিকতা পরিবর্তন</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>
                    {growthTrend.accuracyChange >= 0 ? `📈 +${toBanglaNum(growthTrend.accuracyChange)}%` : `📉 ${toBanglaNum(growthTrend.accuracyChange)}%`}
                  </span>
                </div>
                <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#166534', display: 'block', fontWeight: 600 }}>পড়ার সময় পরিবর্তন</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>
                    {growthTrend.durationChange <= 0 ? `⚡ ${toBanglaNum(Math.abs(growthTrend.durationChange))}s দ্রুত` : `⏱️ ${toBanglaNum(growthTrend.durationChange)}s`}
                  </span>
                </div>
                <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#166534', display: 'block', fontWeight: 600 }}>সম্পন্ন গল্প</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>
                    📚 {toBanglaNum(storiesCompleted)}টি
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Student Information & Teacher Notes */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📝</span> <span>শিক্ষক নোটস ও অবজারভেশন (Pedagogical Notes)</span>
            </h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="শিক্ষার্থী সম্পর্কে আপনার পর্যবেক্ষণ ও নোট লিখুন..."
              rows={3}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{noteSaveStatus}</span>
              <button
                onClick={handleSaveNote}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                ✓ নোট সংরক্ষণ করুন
              </button>
            </div>
          </div>

          {/* 2. Reading Progress Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📚</span> <span>পড়ার অগ্রগতি (Reading Progress)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>সম্পন্ন গল্প</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d', marginTop: 4 }}>{toBanglaNum(storiesCompleted)}টি</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>গড় পড়ার সময়</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>{toBanglaNum(avgDurationMins)} মিনিট</div>
              </div>
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#6b21a8', fontWeight: 600 }}>গড় সঠিকতা</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#7e22ce', marginTop: 4 }}>{toBanglaNum(avgAccuracy)}%</div>
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>সর্বশেষ অনুশীলন</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#c2410c', marginTop: 6 }}>{lastPracticeDate}</div>
              </div>
            </div>
          </div>

          {/* 3. BornoBazar Gamification Metrics */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏪</span> <span>বর্ণবাজার অগ্রগতি (BornoBazar Progress)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#854d0e', fontWeight: 600 }}>অর্জিত কয়েন 🪙</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ca8a04', marginTop: 4 }}>{toBanglaNum(coins)}</div>
              </div>
              <div style={{ background: '#fffbebf', border: '1px solid #fde68a', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#78350f', fontWeight: 600 }}>মোট তারা 🌟</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 4 }}>{toBanglaNum(stars)}</div>
              </div>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#115e59', fontWeight: 600 }}>বানানকৃত শব্দ 📝</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0d9488', marginTop: 4 }}>{toBanglaNum(wordsSpelledCount)}টি</div>
              </div>
              <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 14, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#9d174d', fontWeight: 600 }}>অক্ষর আয়ত্ত 🔤</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#db2777', marginTop: 4 }}>{toBanglaNum(lettersLearnedCount)}টি</div>
              </div>
            </div>
          </div>

          {/* 4. Needs More Practice */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#991b1b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎯</span> <span>চিহ্নিত অনুশীলনের বিষয় (Needs More Practice)</span>
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {difficultLetters.map(char => (
                <span key={char} style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                  অক্ষর: {char}
                </span>
              ))}
              {difficultWords.map(word => (
                <span key={word} style={{ background: '#ffffff', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                  শব্দ: {word}
                </span>
              ))}
              {difficultLetters.length === 0 && difficultWords.length === 0 && (
                <span style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>
                  ✨ চমৎকার! কোনো নির্দিষ্ট কঠিন অক্ষর বা শব্দ ধরা পড়েনি। উত্তম অগ্রগতি।
                </span>
              )}
            </div>
          </div>

          {/* 5. Progress Timeline */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📈</span> <span>সেশন ভিত্তিক অগ্রগতির টাইমলাইন (Progress Timeline)</span>
            </h3>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>সেশন হিস্ট্রি লোড হচ্ছে...</div>
            ) : sessions.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                এখনও কোনো সেশন সম্পন্ন হয়নি। ক্লাসরুম অনুশীলনের মাধ্যমে এখানে সেশন হিস্ট্রি যুক্ত হবে।
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.map((sess, idx) => {
                  const prevSess = idx > 0 ? sessions[idx - 1] : null;
                  const accDiff = prevSess ? (sess.accuracy || 100) - (prevSess.accuracy || 100) : 0;
                  const isLatest = idx === sessions.length - 1;

                  return (
                    <div
                      key={sess._id || idx}
                      style={{
                        background: isLatest ? '#f0fdf4' : '#ffffff',
                        border: isLatest ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: isLatest ? '#10b981' : '#64748b', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            {sess.feature === 'reading' ? '📖 পড়া (Reading Story)' : '🏪 বর্ণবাজার (BornoBazar)'}
                            {isLatest && <span style={{ background: '#bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: 6, fontSize: 11, marginLeft: 8 }}>সর্বশেষ</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {new Date(sess.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • সময়কাল: {Math.max(1, Math.round((sess.durationMs || 0) / 1000))} সেকেন্ড
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{toBanglaNum(sess.accuracy || 100)}% সঠিকতা</div>
                          {accDiff !== 0 && (
                            <div style={{ fontSize: 12, fontWeight: 700, color: accDiff > 0 ? '#16a34a' : '#dc2626' }}>
                              {accDiff > 0 ? `📈 +${toBanglaNum(accDiff)}% উন্নয়ন` : `📉 ${toBanglaNum(accDiff)}%`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. Suggested Next Activity */}
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1.5px solid #6ee7b7', borderRadius: 18, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 36, background: '#ffffff', padding: 10, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {suggestedNextActivity.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  পরবর্তী প্রস্তাবিত অ্যাক্টিভিটি (Suggested Next Activity)
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46', marginTop: 2 }}>
                  {suggestedNextActivity.title}
                </div>
                <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                  কারণ: {suggestedNextActivity.reason}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onLaunchActivity(suggestedNextActivity.activityName);
              }}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            >
              ▶ এই অ্যাক্টিভিটি শুরু করুন →
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

