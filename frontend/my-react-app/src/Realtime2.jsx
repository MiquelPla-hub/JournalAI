import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Realtime2({ setRecomendations, isConnected, setIsConnected, setCircleColor}) {

  

  const [transcribedText, setTranscribedText] = useState('');
  const dataChannelRef = React.useRef(null);
  const pcRef = React.useRef(null);
  const summaryIntervalRef = React.useRef(null);
  const streamRef = React.useRef(null);
  
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
    
      // Create a peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up to play remote audio from the model
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
  const stream = e.streams[0];
  audioEl.srcObject = stream;

  // Web Audio API to analyze audio stream
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);

  let speaking = false;

  const detectSpeaking = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (volume > 10 && !speaking) {
      speaking = true;
      console.log("[AI started speaking - real audio detected]");
      setCircleColor('#646cff')
    } else if (volume <= 5 && speaking) {
      speaking = false;
      console.log("[AI stopped speaking]");
      setCircleColor('black')
    }

    requestAnimationFrame(detectSpeaking);
  };

  detectSpeaking();
};

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
    streamRef.current = mediaStream; // Store the stream for cleanup
    
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
      setRecomendations(response.data)
      // If we have transcribed text, update the state
      if (response.data && response.data.text) {
        setTranscribedText(response.data.text);
    
        
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
          You're a supportive and friendly mental-health assistant inside a journaling app.
          You need to act like a buddy explaining you their life, but in the backend evaluate the mental health.
          Your job is to respond like a buddy who listens, understands, and provides supportive tips.

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
      
      // Handle different types of server events
      switch (serverEvent.type) {
        case "session.created":
          // Update session with instructions if needed
          updateSessionInstructions();
          
          // Set up interval for requesting emotion summaries every 30 seconds
          summaryIntervalRef.current = setInterval(() => {
            requestEmotionSummary();
          }, 30000);
          break;
        
        case "input_audio_buffer.speech_started":
          break;
          
        case "input_audio_buffer.speech_stopped":
          break;
          
        case "response.text.delta":
          // We're not tracking text responses anymore
          
          break;
          
        case "response.done":
          // Extract and handle final content if available
          if (serverEvent.response && serverEvent.response.output) {
            const output = serverEvent.response.output;
            if (output && output.length > 0 && output[0].content) {
              const transcript = output[0].content[0].transcript;
              console.log(transcript);
            }
          }
          break;
          
        default:
          // Handle other event types as needed
      }
    } catch (error) {
      console.error("Error handling server event:", error, e.data);
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
    
    // Request a response from the model
    const responseEvent = {
      type: "response.create",
    };
    
    dataChannelRef.current.send(JSON.stringify(responseEvent));
  };

  const disconnect = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop and release media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
      }, 1000);
    } else {
      if (pcRef.current) {
        pcRef.current.close();
      }
      setIsConnected(false);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop and release media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (summaryIntervalRef.current) {
        clearInterval(summaryIntervalRef.current);
      }
      
      // Close any open connections
      if (pcRef.current) {
        pcRef.current.close();
      }
      
      // Clean up any audio elements added to the DOM
      document.querySelectorAll('audio').forEach(el => {
        if (el.srcObject && !el.hasAttribute('controls')) {
          el.srcObject = null;
          el.remove();
        }
      });
    };
  }, []);

  return (
    <>
      <button 
        onClick={() => {
          if(isConnected){
            disconnect();
            setIsConnected(false);
          }else{
            connectToRealtime();
            // We'll let the data channel open event set isConnected to true
          }
        }}
        style={{ backgroundColor: isConnected ? 'red' : '' }}
      >
        {!isConnected ? "Talk" : "Stop"}
      </button>
    </>
  );
}

export default Realtime2;