const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/api/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
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

export const createSession = async (data) => {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create session');
  const result = await response.json();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fff_session_created', { detail: result }));
  }
  return result;
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

