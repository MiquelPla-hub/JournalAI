import React from 'react';

import { FiHome, FiPlus, FiBook, FiSettings, FiInfo } from "react-icons/fi";
function LeftSidebar({ isOpen, onClose, setNewEntry }) {
  return (
    <div className={`left-sidebar ${isOpen ? 'visible' : 'hidden'}`}>
      <div className="sidebar-content">
        <h3>Journal AI</h3>
        <button className="new-entry-button" onClick={() => setNewEntry(true)}>
            <FiPlus size={20} /> <span>New Entry</span>
        </button>
        <ul>
          <li className="sidebar-item"> 
            <FiHome size={20} /> 
            <span>Home</span>
          </li>
          <li className="sidebar-item">
            <FiBook size={20} />
            <span>Journal Entries</span>
          </li>
          <li className="sidebar-item">
            <a href="/landing" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <FiInfo size={20} style={{ marginRight: '10px' }} />
              <span>About Us</span>
            </a>
          </li>
          <li className="sidebar-item">
            <FiSettings size={20} />
            <span>Settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebar;