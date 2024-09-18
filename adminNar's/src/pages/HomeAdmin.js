import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { HiMenuAlt3 } from 'react-icons/hi';
import Sidebar from './Sidebar';
import DrawerInventory from '../components/DrawerInventory';
import DrawerSalesreport from '../components/DrawerSalesreport';
import POSDashboard from '../components/POSDashboard';

const HomeAdmin = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with menu button for mobile */}
        <header className="bg-white shadow-sm z-10 md:hidden">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <HiMenuAlt3
              className="h-6 w-6 cursor-pointer"
              onClick={toggleSidebar}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedTab === 'dashboard' && <POSDashboard />}
            {selectedTab === 'inventory' && <DrawerInventory />}
            {selectedTab === 'sales' && <DrawerSalesreport />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeAdmin;