import { useState } from 'react'
import './App.css'
import Realtime2 from './Realtime2'
import LeftSidebar from './LeftSidebar'

function App() {

  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const openModal = () => {
    setIsModalOpen(true)
    setIsSidebarOpen(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsSidebarOpen(true)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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
    <div className={`app-wrapper ${isModalOpen ? 'modal-open' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <LeftSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="main-container"> 
        <div className="title-container">
         
          <h1>How are you feeling today?</h1>
      
          <button className="modal-toggle-button" onClick={openModal}>
            Open Modal
          </button>
        </div>
        
        {response && (
          <div className="response-container">
            <p className="text-gray-700">{response}</p>
          </div>
        ) }

        <div className="chat-container">
          <form onSubmit={handleSubmit}>
            <div className="chat-input-container">
              <textarea
                value={message}
                onChange={handleMessageChange}
                placeholder="How are you feeling today?"
                className="chat-input"
              />
              <div className="buttons-container">
                <button type="submit" className="generate-button">
                  Generate
                </button>
                <Realtime2 />
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className={`side-modal ${isModalOpen ? 'open' : ''}`}>
        <button onClick={closeModal} className="close-modal-button">
          &times;
        </button>
       
      </div>
    </div>
  )
}

export default App
