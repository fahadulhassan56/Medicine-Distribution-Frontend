import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { logout } from '../../features/auth/authSlice.js';
import logo from '../../assets/ITTIFAQ_LOGO.jpg'; 

const Topbar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-full h-full px-4 flex items-center justify-between">
        
        {/* LEFT SECTION: LOGO + BRAND */}
        <div className="flex items-center gap-5 size">
          <img
            src={logo}
            alt="ITTFAQ Logo"
            className="h-12 w-auto object-contain"
          />

          <div>
            <h1 className="text-4xl font-bold text-blue-800 tracking-tight leading-none">
              ITTFAQ
            </h1>
            <p className="text-[15px] text-slate-500 uppercase tracking-wide mt-1">
              Medicine Distribution
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: USER + LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">
            {user?.name ? (
              <span>
                Signed in as{' '}
                <span className="font-semibold text-slate-800">{user.name}</span>
              </span>
            ) : (
              <span className="font-medium text-slate-800">Admin</span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-4 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
