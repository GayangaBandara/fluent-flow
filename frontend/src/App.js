import React, { useState, useRef } from "react";

function App() {
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    setAudioUrl(null);
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.start();
      // Start client-side speech recognition if available (fallback to browser Web Speech API)
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.onresult = (event) => {
            // Get the latest result
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
          };
          recognition.onerror = (err) => {
            console.debug('Speech recognition error', err);
          };
          recognition.start();
          recognitionRef.current = recognition;
        }
      } catch (err) {
        console.debug('SpeechRecognition not available', err);
      }
    } catch (err) {
      console.error('Microphone access denied or not available', err);
      setIsRecording(false);
      alert('Unable to access microphone. Please allow microphone permission.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    // Stop client-side recognition if running
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        recognitionRef.current = null;
      }
    } catch (e) {
      console.debug('Error stopping recognition', e);
    }
    const audioBlob = await new Promise((resolve) => {
      mediaRecorder.onstop = () => resolve(new Blob(audioChunksRef.current, { type: "audio/webm" }));
    });

    try {
      const form = new FormData();
      form.append("file", audioBlob, "recording.webm");
      form.append("history", JSON.stringify(conversationHistory));
      // Attach client-side transcript (if available) so backend can prefer it over mock transcription
      if (transcript && transcript.trim().length > 0) {
        form.append('client_transcript', transcript.trim());
      }
      const res = await fetch("http://localhost:8000/chat/voice", { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${text}`);
      }
      const j = await res.json();
      setTranscript(j.transcript || "");
      setReply(j.reply || "");
      
      // Update conversation history
      const newHistory = [...conversationHistory];
      if (j.transcript) {
        newHistory.push({ type: 'user', content: j.transcript });
      }
      if (j.reply) {
        newHistory.push({ type: 'assistant', content: j.reply });
      }
      setConversationHistory(newHistory.slice(-10)); // Keep last 10 messages
      
      if (j.audio_url) {
        setAudioUrl(`http://localhost:8000${j.audio_url}`);
      } else {
        setAudioUrl(null);
      }
    } catch (err) {
      console.error('Upload or server error', err);
      alert('Failed to send audio to backend: ' + err.message);
    }
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setTranscript("");
    setReply("");
    setAudioUrl(null);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Fluent Flow - Voice Chat MVP (React)</h1>
      <p>An English learning chatbot with voice capabilities</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          data-testid="record-button" 
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isRecording ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {isRecording ? "Stop Recording" : "Start Voice Chat"}
        </button>
        
        <button 
          onClick={clearConversation}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Clear Conversation
        </button>
      </div>

      <div style={{ marginTop: 20, border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ marginBottom: 15 }}>
          <strong>Transcript:</strong>
          <div style={{ 
            marginTop: '8px', 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            minHeight: '30px'
          }}>
            {transcript || <em style={{ color: '#6c757d' }}>No transcript yet...</em>}
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <strong>AI Tutor Response:</strong>
          <div style={{ 
            marginTop: '8px', 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            minHeight: '30px'
          }}>
            {reply || <em style={{ color: '#6c757d' }}>No response yet...</em>}
          </div>
        </div>
      </div>

      {audioUrl && (
        <div style={{ marginTop: 20 }}>
          <strong>Response Audio:</strong>
          <div style={{ marginTop: '10px' }}>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {conversationHistory.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <strong>Conversation History:</strong>
          <div style={{ marginTop: '10px' }}>
            {conversationHistory.slice(-6).map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '8px', 
                padding: '8px', 
                borderRadius: '4px',
                backgroundColor: msg.type === 'user' ? '#e3f2fd' : '#f3e5f5'
              }}>
                <strong>{msg.type === 'user' ? 'You:' : 'AI Tutor:'}</strong> {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 30, padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '6px', border: '1px solid #d4edda' }}>
        <strong>How to use:</strong>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Click "Start Voice Chat" and allow microphone access</li>
          <li>Speak in English (the AI will help with pronunciation and grammar)</li>
          <li>Click "Stop Recording" to send your voice to the AI tutor</li>
          <li>Listen to the AI's response and continue the conversation</li>
        </ol>
      </div>
    </div>
  );
}

export default App;