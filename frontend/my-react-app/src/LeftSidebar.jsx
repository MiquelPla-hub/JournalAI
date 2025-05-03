import React from 'react';

import { FiHome, FiPlus, FiBook, FiSettings } from "react-icons/fi";
function LeftSidebar({ isOpen, onClose }) {
  return (
    <div className={`left-sidebar ${isOpen ? 'visible' : 'hidden'}`}>
      <div className="sidebar-content">
        <h3>Journal AI</h3>
        <button className="new-entry-button">
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
            <FiSettings size={20} />
            <span>Settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebar;