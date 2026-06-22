// Fixed: was hardcoded to http://localhost:5000/api, which is why the
// production (Vercel) build kept calling localhost no matter what
// VITE_API_BASE_URL was set to in Vercel's project settings — this
// constant never read the env var at all.
//
// Falls back to localhost only when the env var is genuinely unset
// (e.g. local dev without a .env file), so local development still
// works without needing to set anything.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export function registerCustomer(payload) {
  return request('/customer/register', payload);
}
export function loginCustomer(payload) {
  return request('/customer/login', payload);
}

export function registerStaff(payload) {
  return request('/staff/register', payload);
}
export function loginStaff(payload) {
  return request('/staff/login', payload);
}

export function forgotPassword(payload) {
  return request('/auth/forgot-password', payload);
}
export function verifyOtp(payload) {
  return request('/auth/verify-otp', payload);
}
export function resetPassword(payload) {
  return request('/auth/reset-password', payload);
}

export function saveSession(token, user) {
  localStorage.setItem('autotrack_token', token);
  localStorage.setItem('autotrack_user', JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem('autotrack_token');
  localStorage.removeItem('autotrack_user');
}
export function getSession() {
  const token = localStorage.getItem('autotrack_token');
  const user = localStorage.getItem('autotrack_user');
  return token && user ? { token, user: JSON.parse(user) } : null;
}