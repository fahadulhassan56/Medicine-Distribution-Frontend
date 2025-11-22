import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
