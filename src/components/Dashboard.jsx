import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiKey, FiLogOut } from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');
  const { logout } = useQuranAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Not Signed In</h3>
        <p className="text-gray-500 text-sm mb-4">Please sign in to view your dashboard</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4">
          <h2 className="text-white text-xl font-semibold">Account Overview</h2>
          <p className="text-emerald-100 text-sm mt-1">Your Quran Foundation profile</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiUser className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-gray-800 font-medium">{user.name || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiMail className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-gray-800 font-medium">{user.email || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiKey className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">User ID</p>
              <p className="text-gray-800 font-mono text-sm">{user.id || 'Not provided'}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">✓ Connected to Quran Foundation API</p>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition"
            >
              <FiLogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Verification Badge */}
      <div className="mt-4 text-center">
        <p className="text-xs text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
          ✓ Verified: Using Quran Foundation User API
        </p>
      </div>
    </div>
  );
}