import React from 'react';
import { NavLink } from 'react-router-dom';

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
    <nav className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold">ITTIFAQ Med Dist.</h2>
        <p className="text-xs text-slate-400">Inventory Management System</p>
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [
                  'block px-4 py-2 text-sm',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
