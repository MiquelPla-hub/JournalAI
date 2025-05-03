// RealtimeChat.js
import React, { useState, useEffect, useRef } from 'react';
import './RealtimeChat.css';

function RealtimeChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const audioElementRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const connectToRealtime = async () => {
    try {
      // Step 1: Get ephemeral token from our backend
      const tokenResponse = await fetch('http://localhost:5000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-12-17',
          voice: 'verse',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Server responded with status: ${tokenResponse.status}`);
      }
      
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;
      setSessionInfo(data);
      
      // Step 2: Create WebRTC peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;
      
      // Step 3: Set up to play remote audio from the model
      const audioEl = audioElementRef.current;
      pc.ontrack = e => {
        console.log("Received track from server", e);
        audioEl.srcObject = e.streams[0];
      };
      
      // Step 4: Add local audio track for microphone input
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = ms;
      pc.addTrack(ms.getTracks()[0], ms);
      
      // Step 5: Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      
      dc.onopen = () => {
        console.log("Data channel open!");
        setIsConnected(true);
      };
      
      dc.onmessage = handleServerEvent;
      
      // Step 6: Create offer and establish connection
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });
      
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      console.log("Connection established!");
    } catch (error) {
      console.error("Error connecting to Realtime API:", error);
    }
  };
  
  const handleServerEvent = (e) => {
    try {
      const event = JSON.parse(e.data);
      console.log("Received event:", event);
      
      // Handle different server events
      switch (event.type) {
        case "session.created":
          console.log("Session created:", event.session.id);
          break;
        
        case "input_audio_buffer.speech_started":
          console.log("Speech started");
          setIsListening(true);
          break;
        
        case "input_audio_buffer.speech_stopped":
          console.log("Speech stopped");
          setIsListening(false);
          break;
        
        case "response.text.delta":
          console.log("Text delta received:", event.delta.text);
          setApiResponse(prev => prev + event.delta.text);
          break;
        
        case "input_audio_buffer.transcript.delta":
          console.log("Transcript delta received:", event.delta.text);
          setTranscript(prev => prev + event.delta.text);
          break;
        
        case "error":
          console.error("Server error:", event);
          break;
        
        case "response.done":
          console.log("Response completed");
          break;
        
        default:
          // Log unknown event types to help with debugging
          console.log("Unhandled event type:", event.type);
          break;
      }
    } catch (error) {
      console.error("Error parsing server event:", error, "Raw data:", e.data);
    }
  };
  
  const sendMessage = (text) => {
    if (!dataChannelRef.current) return;
    
    // Create a conversation item with the text
    const createItemEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: text,
          }
        ]
      },
    };
    
    dataChannelRef.current.send(JSON.stringify(createItemEvent));
    
    // Request a response from the model
    const createResponseEvent = {
      type: "response.create",
    };
    
    dataChannelRef.current.send(JSON.stringify(createResponseEvent));
  };
  
  const updateSession = (instructions) => {
    if (!dataChannelRef.current) return;
    
    const updateEvent = {
      type: "session.update",
      session: {
        instructions: instructions,
      },
    };
    
    dataChannelRef.current.send(JSON.stringify(updateEvent));
  };
  
  const disconnect = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsConnected(false);
    setIsListening(false);
    setTranscript('');
    setApiResponse('');
  };

  return (
    <div className="realtime-chat-container">
      <h1>OpenAI Realtime Chat</h1>
      
      <div className="connection-controls">
        {!isConnected ? (
          <button onClick={connectToRealtime}>Connect</button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>
      
      {isConnected && (
        <>
          <div className="status-indicator">
            {isListening ? 'Listening...' : 'Not listening'}
          </div>
          
          <div className="transcription-box">
            <h3>Your Speech</h3>
            <p>{transcript}</p>
          </div>
          
          <div className="response-box">
            <h3>AI Response</h3>
            <p>{apiResponse}</p>
          </div>
          
          <div className="manual-input">
            <input 
              type="text"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
          
          <div className="system-instructions">
            <textarea
              placeholder="Update system instructions..."
              rows={3}
              onBlur={(e) => {
                if (e.target.value) {
                  updateSession(e.target.value);
                }
              }}
            />
          </div>
          
          <audio ref={audioElementRef} autoPlay />
        </>
      )}
    </div>
  );
}

export default RealtimeChat;