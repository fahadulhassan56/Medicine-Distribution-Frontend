import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { logout } from '../../features/auth/authSlice.js';
import logo from '../../assets/ITTIFAQ_LOGO.jpg'; 
import './Topbar.css'
const Topbar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="topbar h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="topbar-inner max-w-full h-full px-4 flex items-center justify-between">
        
        {/* LEFT SECTION: LOGO + BRAND */}
        <div className="topbar-brand flex items-center gap-5 size">
          <img
            src={logo}
            alt="ITTFAQ Logo"
            className="topbar-logo h-12 w-auto object-contain"
          />

          <div className='topbar-text'>
            <h1 className="topbar-title text-4xl font-bold text-blue-800 tracking-tight leading-none">
              ITTFAQ
            </h1>
            <p className="topbar-subtitle text-[15px] text-slate-500 uppercase tracking-wide mt-1">
              Medicine Distribution
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: USER + LOGOUT */}
        <div className="topbar-user flex items-center gap-4">
          <div className="topbar-username text-sm text-slate-600">
            {user?.name ? (
              <span>
                Signed in as{' '}
                <span className="font-semibold text-slate-800">{user.name}</span>
              </span>
            ) : (
              <span className="topbar-admin font-medium text-slate-800">Admin Panel</span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="topbar-logout text-xs font-semibold px-4 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
