import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Realtime2() {
  const [key, setKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [emotionSummary, setEmotionSummary] = useState(null);
  const dataChannelRef = React.useRef(null);
  const pcRef = React.useRef(null);
  const summaryIntervalRef = React.useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  const connectToRealtime = async () => {
    try {
      // Step 1: Get ephemeral token from our backend
      const tokenResponse = await axios.post('http://localhost:5000/api/session', {
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'coral', 
      });
      
      if (tokenResponse.status !== 200) {
        throw new Error(`Server responded with status: ${tokenResponse.status}`);
      }
      
      const data = tokenResponse.data;
      const EPHEMERAL_KEY = data.client_secret.value;
      setKey(EPHEMERAL_KEY);

      // Create a peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up to play remote audio from the model
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = e => audioEl.srcObject = e.streams[0];

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      pc.addTrack(ms.getTracks()[0]);
      
      // Set up audio recording for transcription
      startRecording(ms);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      
      dc.addEventListener("message", handleServerEvent);
      dc.addEventListener("open", () => {
        setIsConnected(true);
        console.log("Data channel opened");
      });
      
      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

    } catch (error) {
      console.error('Error fetching token:', error);
      return;
    }
  }

  // New function to start recording audio
  const startRecording = (mediaStream) => {
    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Create a blob from the recorded audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Transcribe the audio
      transcribeAudio(audioBlob);
      
      // Reset for next recording
      audioChunksRef.current = [];
    };
    
    // Start recording in 5-second chunks for continuous transcription
    mediaRecorder.start();
    setIsRecording(true);
    
    // Set up interval to stop and restart recording every 5 seconds
    const recordingInterval = setInterval(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.start();
      } else {
        clearInterval(recordingInterval);
      }
    }, 15000);
  };
  
  // Function to transcribe the recorded audio
  const transcribeAudio = async (audioBlob) => {
    try {
      // Create a form data object to send the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      // Send the audio to the backend for transcription
      const response = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // If we have transcribed text, update the state
      if (response.data && response.data.text) {
        setTranscribedText(response.data.text);
        console.log('Transcribed text:', response.data.text);
        
        // Optionally, automatically send the transcribed text as a message
        if (response.data.text.trim()) {
          sendTextMessage(response.data.text);
        }
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  // Update session with custom instructions for emotion detection
  const updateSessionInstructions = () => {
    if (!dataChannelRef.current) return;
    
    const event = {
      type: "session.update",
      session: {
        instructions: `
          You are a helpful assistant engaging in natural spoken conversations. 
          Continuously analyze the user's emotional state from their speech or text.
          
          Important:
          - Always respond conversationally (speaking normally, human-like).
          - Additionally, every time you detect or update the user's emotion (happy, sad, neutral, angry, etc.), silently send a JSON-formatted emotion event through the data channel in the following format:

          {
            "type": "user.emotion.update",
            "emotion": "happy" | "sad" | "neutral" | "angry" | "confused" | "other",
            "confidence": 0.0 to 1.0,
            "reason": "brief reason explaining your detection"
          }

          - When you receive a "request.emotion.summary" event, respond with a comprehensive JSON summary of the conversation's emotional content:

          {
            "type": "emotion.summary",
            "requestId": [the ID from the request],
            "emotionTimeline": [
              {
                "timestamp": "relative time in conversation",
                "emotion": "detected emotion",
                "confidence": 0.0 to 1.0,
                "context": "what was being discussed"
              }
            ],
            "dominantEmotions": ["primary", "secondary"],
            "summary": "brief textual summary of emotional journey"
          }

          NEVER speak the JSON aloud. Only send it silently over the data channel.
        `
      },
    };
    
    dataChannelRef.current.send(JSON.stringify(event));
  };

  // Request emotion summary
  const requestEmotionSummary = () => {
    if (!dataChannelRef.current) return;
    
    const summaryRequest = {
      type: "request.emotion.summary",
      requestId: Date.now().toString()
    };
    
    dataChannelRef.current.send(JSON.stringify(summaryRequest));
  };

  // Handle server events from the data channel
  const handleServerEvent = (e) => {
    try {
      const serverEvent = JSON.parse(e.data);
      console.log("Received server event:", serverEvent);

      // Handle different types of server events
      switch (serverEvent.type) {
        case "session.created":
          console.log("Session created successfully");
          // Update session with instructions if needed
          updateSessionInstructions();
          
          // Set up interval for requesting emotion summaries every 30 seconds
          summaryIntervalRef.current = setInterval(() => {
            requestEmotionSummary();
          }, 30000);
          
          break;
        
        case "input_audio_buffer.speech_started":
          console.log("Speech detected - user is speaking");
          setIsListening(true);
          break;
          
        case "input_audio_buffer.speech_stopped":
          console.log("Speech stopped - user finished speaking");
          setIsListening(false);
          break;
          
        case "response.text.delta":
          // Handle incremental text updates
          if (serverEvent.delta && serverEvent.delta.text) {
            addModelMessage(serverEvent.delta.text, true);
          }
          break;
          
        case "response.done":
          console.log("Response completed:", serverEvent.response);
          // Final response handling if needed
          break;
          
        case "user.emotion.update":
          console.log("User Emotion Detected:", serverEvent);
          // Update the current emotion data
          setEmotionData({
            emotion: serverEvent.emotion,
            confidence: serverEvent.confidence,
            reason: serverEvent.reason,
            timestamp: new Date().toISOString()
          });
          break;
          
        case "emotion.summary":
          console.log("Received emotion summary:", serverEvent);
          // Store the summary JSON
          setEmotionSummary(serverEvent);
          break;
          
        default:
          // Handle other event types as needed
          break;
      }
    } catch (error) {
      console.error("Error handling server event:", error);
    }
  };

  // Send a text message to the model
  const sendTextMessage = (text) => {
    if (!dataChannelRef.current) return;
    
    // Create a conversation item with user input
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
    
    // Send the message to create a conversation item
    dataChannelRef.current.send(JSON.stringify(createItemEvent));
    
    // Add message to UI
    addUserMessage(text);
    
    // Request a response from the model
    const responseEvent = {
      type: "response.create",
    };
    
    dataChannelRef.current.send(JSON.stringify(responseEvent));
  };

  // Add a user message to the UI
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
  };

  // Add a model message to the UI
  const addModelMessage = (text, isDelta = false) => {
    setMessages(prev => {
      // If this is a delta (partial) update and we already have an assistant message
      if (isDelta && prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        // Update the last message
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: newMessages[newMessages.length - 1].content + text
        };
        return newMessages;
      } else {
        // Add a new message
        return [...prev, { role: 'assistant', content: text }];
      }
    });
  };

  // Modify disconnect to stop recording
  const disconnect = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Clear the summary interval
    if (summaryIntervalRef.current) {
      clearInterval(summaryIntervalRef.current);
      summaryIntervalRef.current = null;
    }
    
    // Request final summary before disconnecting
    if (dataChannelRef.current) {
      const finalSummaryRequest = {
        type: "request.emotion.summary",
        requestId: "final-summary",
        isFinal: true
      };
      
      dataChannelRef.current.send(JSON.stringify(finalSummaryRequest));
      
      // Give the model a moment to respond before disconnecting
      setTimeout(() => {
        if (pcRef.current) {
          pcRef.current.close();
        }
        if (dataChannelRef.current) {
          dataChannelRef.current.close();
        }
        setIsConnected(false);
        setMessages([]);
        setEmotionData(null);
        setEmotionSummary(null);
      }, 1000);
    } else {
      if (pcRef.current) {
        pcRef.current.close();
      }
      setIsConnected(false);
      setMessages([]);
      setEmotionData(null);
      setEmotionSummary(null);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const text = input.value.trim();
    if (text) {
      sendTextMessage(text);
      input.value = '';
    }
  };

  return (
    <div className="realtime-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>OpenAI Realtime Chat</h1>
      
      {!isConnected ? (
        <button 
          onClick={connectToRealtime}
          style={{ padding: '10px 20px', fontSize: '16px', marginBottom: '20px' }}
        >
          Connect to Realtime
        </button>
      ) : (
        <button 
          onClick={disconnect}
          style={{ padding: '10px 20px', fontSize: '16px', marginBottom: '20px', backgroundColor: '#ff4d4d' }}
        >
          Disconnect
        </button>
      )}
      
      {isListening && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          Listening...
        </div>
      )}
      
      {isRecording && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Recording for transcription...
        </div>
      )}
      
      {/* Current Emotion Display */}
      {emotionData && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}>
          <h3>Current Emotion</h3>
          <p><strong>Emotion:</strong> {emotionData.emotion}</p>
          <p><strong>Confidence:</strong> {(emotionData.confidence * 100).toFixed(1)}%</p>
          <p><strong>Reason:</strong> {emotionData.reason}</p>
        </div>
      )}
      
      {/* Emotion Summary Display */}
      {emotionSummary && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h3>Emotion Summary</h3>
          <p><strong>Dominant Emotions:</strong> {emotionSummary.dominantEmotions?.join(', ')}</p>
          <p><strong>Summary:</strong> {emotionSummary.summary}</p>
          <details>
            <summary>View Full JSON</summary>
            <pre style={{ 
              backgroundColor: '#f8f8f8', 
              padding: '10px', 
              borderRadius: '5px',
              overflowX: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(emotionSummary, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {transcribedText && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#e6f7ff', 
          borderRadius: '5px',
          border: '1px solid #91d5ff'
        }}>
          <h3>Last Transcription</h3>
          <p>{transcribedText}</p>
        </div>
      )}
      
      <div className="messages-container" style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              maxWidth: '70%',
              backgroundColor: msg.role === 'user' ? '#0084ff' : '#e5e5ea',
              color: msg.role === 'user' ? 'white' : 'black',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      {isConnected && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              name="messageInput"
              placeholder="Type a message..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                fontSize: '16px',
                borderRadius: '5px 0 0 5px',
                border: '1px solid #ccc',
              }}
            />
            <button 
              type="submit"
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#0084ff',
                color: 'white',
                border: 'none',
                borderRadius: '0 5px 5px 0',
              }}
            >
              Send
            </button>
          </div>
        </form>
      )}
      
      {/* Manual Summary Request Button */}
      {isConnected && (
        <button
          onClick={requestEmotionSummary}
          style={{ 
            marginTop: '10px',
            padding: '8px 15px', 
            fontSize: '14px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Request Emotion Summary
        </button>
      )}
    </div>
  );
}

export default Realtime2;