import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Create a Sidebar component
const Sidebar = () => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 sidebar">
      <div className="sidebar-logo">
        <h2 className="text-xl font-bold">Content Generator</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <a href="#" className="sidebar-nav-item block p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-nav-item active-link block p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Social Media
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-nav-item block p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Blog Posts
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-nav-item block p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email Templates
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-nav-item block p-2 rounded hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      const data = await response.json()
      setResponse(data.data.response)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 main-content">
        <div className="container px-4 py-8"> 
          <h1 className="text-2xl font-bold mb-4">Social Media Content Generator</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Enter your message here..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md mt-2">
              Generate
            </button>
          </form>
          {response && (
            <div className="mt-4 p-4 border border-gray-300 rounded-md">
              <h2 className="text-lg font-bold mb-2">Generated Content:</h2>
              <p className="text-gray-700">{response}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
