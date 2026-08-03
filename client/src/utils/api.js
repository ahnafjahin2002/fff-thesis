const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/api/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getChildStudents = async (teacherId) => {
  const url = teacherId ? `${API_URL}/api/users?role=child&teacherId=${teacherId}` : `${API_URL}/api/users?role=child`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

export const createStudent = async (studentData) => {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'child',
      ...studentData
    })
  });
  if (!res.ok) throw new Error('Failed to create student');
  return res.json();
};

export const getUser = async (userId) => {
  const response = await fetch(`${API_URL}/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const createUser = async (data) => {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

export const loginUser = async (userId, pin) => {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pin })
  });
  if (!res.ok) throw new Error('Invalid PIN or failed to login');
  return res.json();
};

export const getProgress = async (userId) => {
  const response = await fetch(`${API_URL}/api/progress/${userId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch progress');
  }
  return response.json();
};

export const updateProgress = async (userId, data) => {
  const response = await fetch(`${API_URL}/api/progress/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update progress');
  return response.json();
};

const OFFLINE_SESSIONS_KEY = 'fff_offline_sessions_queue';

export const getOfflineSessions = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveOfflineSession = (sessionData) => {
  try {
    const queue = getOfflineSessions();
    const exists = queue.some(s => s.clientSessionId === sessionData.clientSessionId);
    if (!exists) {
      queue.push(sessionData);
      localStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(queue));
    }
  } catch (e) {
    console.error("Failed to save offline session:", e);
  }
};

export const syncOfflineSessions = async () => {
  const queue = getOfflineSessions();
  if (!queue || queue.length === 0) return { synced: 0 };

  const remaining = [];
  let syncedCount = 0;

  for (const sessionData of queue) {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (response.ok) {
        syncedCount++;
      } else {
        remaining.push(sessionData);
      }
    } catch (err) {
      remaining.push(sessionData);
    }
  }

  localStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(remaining));

  if (syncedCount > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fff_session_synced', { detail: { syncedCount } }));
    window.dispatchEvent(new CustomEvent('fff_session_created', { detail: { isSyncRefresh: true } }));
  }

  return { synced: syncedCount, remaining: remaining.length };
};

// Automatic listener to trigger synchronization on online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineSessions();
  });
  setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncOfflineSessions();
    }
  }, 20000);
}

export const createSession = async (data) => {
  const sessionData = {
    ...data,
    clientSessionId: data.clientSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: data.createdAt || new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    
    // Auto-sync any previously queued offline sessions
    syncOfflineSessions().catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fff_session_created', { detail: result }));
    }
    return result;
  } catch (err) {
    console.warn("Server unavailable or POST /api/sessions failed. Session queued offline:", err);
    saveOfflineSession(sessionData);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fff_session_created', { detail: { ...sessionData, isOfflineQueued: true } }));
    }
    return { ...sessionData, isOfflineQueued: true };
  }
};

export const getSessions = async (userId) => {
  const response = await fetch(`${API_URL}/api/sessions/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
};

export const updateBornoBazarProgress = async (userId, data) => {
  const response = await fetch(`${API_URL}/api/borno-bazar/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update BornoBazar progress');
  return response.json();
};

export const getBornoBazarProgress = async (userId) => {
  const response = await fetch(`${API_URL}/api/borno-bazar/${userId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch BornoBazar progress');
  }
  return response.json();
};

export const getClassroomStats = async () => {
  const response = await fetch(`${API_URL}/api/teacher/classroom-stats`);
  if (!response.ok) throw new Error('Failed to fetch classroom stats');
  return response.json();
};

export const updateStudentNote = async (studentId, notes) => {
  const response = await fetch(`${API_URL}/api/teacher/students/${studentId}/notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error('Failed to update student note');
  return response.json();
};

export const updateUserProfile = async (userId, data) => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user profile');
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

