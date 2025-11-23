import React from 'react';
import { NavLink } from 'react-router-dom';

// Put your logo file in /public as /ittfaq-logo.png (or change the src below)
const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/customers', label: 'Customers' },
  { to: '/purchases', label: 'Purchases' },
  { to: '/sales', label: 'Sales' },
  { to: '/payments', label: 'Payments' },
  { to: '/returns', label: 'Returns' },
  { to: '/stock', label: 'Stock' },
  { to: '/reports', label: 'Reports' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/settings', label: 'Settings' }
];

const Sidebar = () => {
  return (
    <nav className="w-64 flex flex-col bg-[#0066B3] text-white shadow-xl">
      {/* Logo */}
      <div className="bg-white flex items-center justify-center py-4 border-b border-blue-100">
        <img
          src="/ittfaq-logo.png"
          alt="ITTFAQ Medicine Distribution"
          className="h-14 w-auto"
        />
      </div>

      {/* Title */}
      <div className="px-4 py-3 border-b border-blue-300">
        <h2 className="text-base font-semibold tracking-wide">
          ITTFAQ Med Dist.
        </h2>
        <p className="text-[11px] text-blue-50">
          Inventory Management System
        </p>
      </div>

      {/* Navigation */}
      <ul className="flex-1 overflow-y-auto py-3 space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [
                  'mx-2 flex items-center rounded-r-full px-4 py-2 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white text-[#0066B3] font-semibold shadow-sm'
                    : 'text-blue-50 hover:bg-[#007ACC] hover:text-white hover:pl-5'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer / small strip */}
      <div className="px-4 py-3 border-t border-blue-400 text-[10px] text-blue-50/80">
        © {new Date().getFullYear()} ITTFAQ Medicine Distribution
      </div>
    </nav>
  );
};

export default Sidebar;
