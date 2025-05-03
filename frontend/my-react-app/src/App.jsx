import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RealtimeChat from './RealtimeChat'
import Realtime2 from './Realtime2'


function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
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
    <div className={`app-wrapper ${isModalOpen ? 'modal-open' : ''}`}>
      <div className="main-container"> 
        <div className="title-container">
          <h1>Journal AI</h1>
          <button onClick={toggleModal} className="modal-toggle-button">
            Open Panel
          </button>
        </div>
        
        {response ?  (
          <div className="response-container">
            <p className="text-gray-700">{response}</p>
          </div>
        ) :(
          <div className="notebook-container">
            <img src="notebook.svg" height="50" width="50" alt="logo" />
          </div>
        )}

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
        <button onClick={toggleModal} className="close-modal-button">
          &times;
        </button>
       
      </div>
    </div>
  )
}

export default App
