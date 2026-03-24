'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResidentLayout from '@/app/components/ResidentLayout';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function ResidentProfilePage() {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('resident');
    if (!stored) {
      router.push('/login');
      return;
    }
    const residentData = JSON.parse(stored);
    setResident(residentData);
    setPhone(residentData.owner_phone || '');
    setLoading(false);
  }, [router]);

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch('http://localhost:5000/api/resident/profile', {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ flatId: resident?.id, phone }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Phone number updated successfully');
        const updated = { ...resident, owner_phone: phone };
        setResident(updated);
        localStorage.setItem('resident', JSON.stringify(updated));
      } else {
        setError(data.message || 'Failed to update phone');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 4) {
      setPwError('Password must be at least 4 characters.');
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/resident/change-password', {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ flatId: resident?.id, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPwMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(data.message || 'Failed to change password.');
      }
    } catch {
      setPwError('Network error. Try again.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('resident');
    localStorage.removeItem('resident_token');
    document.cookie = 'resident_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const content = (
    <div className="p-4 md:p-8 space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
      </div>

      {message && (
        <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/20">{message}</div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">{error}</div>
      )}

      <div className="space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Name</label>
              <p className="font-medium text-white mt-0.5">{resident?.owner_name}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Email</label>
              <p className="font-medium text-white mt-0.5">{resident?.owner_email}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Flat Number</label>
              <p className="font-medium text-white mt-0.5">{resident?.flat_number}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Update Phone Number</h2>
          <form onSubmit={handleUpdatePhone} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit phone"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm border border-blue-500/20 shadow-sm"
            >
              {saving ? 'Saving...' : 'Update Phone'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-1">Change Password</h2>
          <p className="text-xs text-slate-500 mb-4">Use the password provided by your admin to verify, then set a new one.</p>

          {pwMessage && (
            <div className="mb-3 p-3 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/20">{pwMessage}</div>
          )}
          {pwError && (
            <div className="mb-3 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">{pwError}</div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm border border-indigo-500/20 shadow-sm"
            >
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Session</h2>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-medium transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return <ResidentLayout>{content}</ResidentLayout>;
}
