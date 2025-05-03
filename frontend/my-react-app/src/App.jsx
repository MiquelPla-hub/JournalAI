import { useState, useRef, useEffect } from 'react'
import './App.css'
import Realtime2 from './Realtime2'
import LeftSidebar from './LeftSidebar'
import happyImg from './assets/happy.jpg'
import sadGif from './assets/sad.gif'
import angryGif from './assets/angry.gif'
import neutralGif from './assets/neutral.gif'
import surpriseGif from './assets/surprise.gif'
import critical from './assets/critical_depression.jpg'
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recomendations, setRecomendations] = useState([])

  const [activePanel, setActivePanel] = useState('custom')
  const [imagePopUp, setImagePopUp] = useState(true)
  const [imgURL, setImgURL] = useState("assets/sad.gif")
  const [responseMood, setResponseMood] = useState("")
  const [displayImage, setDisplayImage] = useState(false)
  const [isBadgeOpen, setIsBadgeOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [circleColor, setCircleColor] = useState('black')
  const [newEntry, setNewEntry] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {

    if(recomendations && Object.keys(recomendations).length > 0 && isConnected){
      console.log(recomendations.recommendation.data.mood)
      switch (recomendations.recommendation.data.mood) {
        case "happy":
        setImgURL(happyImg)
        setDisplayImage(true)
        break
      case "sad":
        setImgURL(sadGif)
        setDisplayImage(true)
        break
      case "angry":
        setImgURL(angryGif)
        setDisplayImage(true)
        break
        case "neutral":
        setImgURL(neutralGif)
        setDisplayImage(true)
        break
      case "surprise":
        setImgURL(surpriseGif)
        setDisplayImage(true)
        break
      case "critical depression":
        setImgURL(critical)
        setDisplayImage(true)
        break
      }
        setResponseMood(recomendations.recommendation.data.mood_response)
        setImagePopUp(true)
        console.log(recomendations.recommendation.data.mood_response)
       
       
        
          setIsBadgeOpen(true)
          setTimeout(() => {
            setDisplayImage(false)
            setIsBadgeOpen(false)
          }, 5000)
      
    }
  }, [recomendations])

  
  const togglePanel = () => {
  setActivePanel((prev) => (prev === 'custom' ? 'dev' : 'custom'))
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

  useEffect(() => {
    if(newEntry){
      setResponse("")
      setMessage("")
      setRecomendations({})
      setIsConnected(false)
      setNewEntry(false)
    }
  }, [newEntry])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Check if message is empty
      if (!message.trim()) {

        setIsLoading(false)
        return
      }
      
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      setResponse(data.data.response)
    } catch (error) {
      console.error('Error:', error)

    } finally {
      setIsLoading(false)
    }
  }

  // Function to start the camera
  const startCamera = async () => {
    try {
      // First set isCameraOn to true, so the video element renders
      setIsCameraOn(true);
      
      // Add a small delay to ensure the video element is in the DOM
      setTimeout(async () => {
        if (!videoRef.current) {
          console.error("Video reference still not available after delay");
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Camera stream attached to video element");
          
          // Add event listeners for debugging
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current.play()
              .then(() => console.log("Video playing successfully"))
              .catch(e => console.error("Error playing video:", e));
          };
          
          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
          };
        }
      }, 100); // Short delay to ensure DOM update
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraOn(false);
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Clean up camera when component unmounts
  useEffect(() => {
    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn]);

  return (
    <div className={`app-wrapper ${isModalOpen ? 'modal-open' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <LeftSidebar isOpen={isSidebarOpen} setNewEntry={setNewEntry} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="main-container"> 
        {/* Camera toggle button - move it away from where camera will appear */}
        <button 
          className="camera-toggle" 
          onClick={toggleCamera}
          style={{ top: '20px', left: isCameraOn ? '280px' : '20px' }}
        >
          {isCameraOn ? 'X' : 'Turn On Camera'}
        </button>

        {/* Camera container */}
        {isCameraOn && (
          <div className="camera-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            ></video>
            
          </div>
        )}
        
        <div className="title-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1>How are you feeling today?</h1>

          <button className="modal-toggle-button" onClick={openModal}>
            Open Modal
          </button>

         <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: circleColor,
            marginTop: '80px',
            transition: 'transform 0.3s',
            transform: circleColor === '#646cff' ? 'scale(1.5)' : undefined,
          }}
        ></div>
        </div>
      
      {!isModalOpen && (
          <button className="modal-toggle-button" onClick={openModal}>
            View Statistics
          </button>
        )}
     
        {response && (
          <div className="response-container">
            <p >{response}</p>
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
                <button 
                  type="submit" 
                  className="generate-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
                <Realtime2 
                  setRecomendations={setRecomendations}
                  isConnected={isConnected}
                  setIsConnected={setIsConnected}
                  setCircleColor={setCircleColor}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className={`side-modal ${isModalOpen ? 'open' : ''}`}>
        {isModalOpen && (
          <button onClick={closeModal} className="close-modal-button">
            &times;
          </button>
        )}
      </div>


       {isBadgeOpen && (
         <div className="badge-container">
              <div className="badge-content">
              <p className="left-text">Here you can see some support material for your situation:</p>
            <br />
            <div className="limited-box"></div>
            <br />

            {displayImage && <img src={imgURL} alt="Can't find the image" style={{ width: '500px', height: '450px' }} />}
          
            <br/>
            <p>
              {responseMood}
            </p>
            <br/>
              </div>
          </div>
       )}

       
    </div>
  )
}

export default App
