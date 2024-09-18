import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { HiOutlineClipboardList, HiOutlineCube, HiOutlineChartSquareBar, HiLogout, HiX } from 'react-icons/hi';
import { RadioGroup } from '@headlessui/react';
import axios from 'axios';

const Sidebar = ({ isOpen, toggleSidebar, selectedTab, setSelectedTab }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8001/logout');
      router.push('/');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <aside className={`fixed md:static top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-neutral-800 text-white flex flex-col md:translate-x-0`}>
      {/* Close button for mobile */}
      <button onClick={toggleSidebar} className="md:hidden absolute top-2 right-2 text-white hover:text-gray-300">
        <HiX className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div className="flex items-center justify-center p-4 md:p-6">
        <Image
          src="/images/purenars.png"
          alt="Nar's School Supplies"
          width={180}
          height={60}
          objectFit="contain"
        />
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col py-4 mt-6">
        <RadioGroup value={selectedTab} onChange={setSelectedTab}>
          <RadioGroup.Option value="dashboard">
            {({ active, checked }) => (
              <a
                href="#"
                className={`flex items-center px-4 py-2 ${checked ? 'bg-neutral-600' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
              >
                <HiOutlineChartSquareBar className="w-6 h-6 mr-2" />
                Dashboard
              </a>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value="inventory">
            {({ active, checked }) => (
              <a
                href="#"
                className={`flex items-center px-4 py-2 ${checked ? 'bg-neutral-600' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
              >
                <HiOutlineCube className="w-6 h-6 mr-2" />
                Inventory
              </a>
            )}
          </RadioGroup.Option>
          <RadioGroup.Option value="sales">
            {({ active, checked }) => (
              <a
                href="#"
                className={`flex items-center px-4 py-2 ${checked ? 'bg-neutral-600' : ''} ${active ? 'text-white' : 'text-gray-300'}`}
              >
                <HiOutlineClipboardList className="w-6 h-6 mr-2" />
                Sales report
              </a>
            )}
          </RadioGroup.Option>
        </RadioGroup>
        <div className="h-px bg-neutral-600 my-4"></div> {/* Separator Line */}
        <button onClick={handleLogout} className="flex items-center px-4 py-2 hover:bg-red-700">
          <HiLogout className="w-6 h-6 mr-2" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;