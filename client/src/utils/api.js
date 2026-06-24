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
