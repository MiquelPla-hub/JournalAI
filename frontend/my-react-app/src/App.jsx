import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


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
    
    
        <div className="main-container"> 
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
     
   
  )
}

export default App
