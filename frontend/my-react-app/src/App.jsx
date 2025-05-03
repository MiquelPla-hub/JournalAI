import { useState } from 'react'
import './App.css'
import Realtime2 from './Realtime2'
import LeftSidebar from './LeftSidebar'
import { useEffect } from 'react'
function App() {

  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recomendations, setRecomendations] = useState([])

  const [activePanel, setActivePanel] = useState('custom')
  const [imagePopUp, setImagePopUp] = useState(false)
  
 

  useEffect(() => {
    if(recomendations && Object.keys(recomendations).length > 0){
        setImagePopUp(true)
        console.log(recomendations.recommendation.data.mood)
       
       
          setIsModalOpen(true)
          setTimeout(() => {
            setIsModalOpen(false)
          }, 5000)
      
    }
  }, [recomendations])


  const togglePanel = () => {
  setActivePanel((prev) => (prev === 'custom' ? 'dev' : 'custom'))
}
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
                <Realtime2 
                  
                  setRecomendations={setRecomendations}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className={`side-modal ${isModalOpen ? 'open' : ''}`}>
        <button onClick={closeModal} className="close-modal-button">
          &times;
        </button>

        <button onClick={togglePanel} className="toggle-panel-button">
          Switch Panel
        </button>

        {activePanel === 'custom' ? (
          <div className="custom-panel">
            <p className="left-text">Here you can see some support material for your situation:</p>
            <br />
            <div className="limited-box"></div>
            <br />
            <p>
              Welcome to your AI-powered voice journal. Speak freely, reflect deeply, and let the assistant
              help you process your thoughts through real-time transcription and meaningful feedback.
            </p>
            {imagePopUp && <img src="sad.jpeg" alt="sad" />}
          </div>
        ) : (
          <div className="dev-panel">
            <p>This is the developer panel. Add dev tools or logs here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
