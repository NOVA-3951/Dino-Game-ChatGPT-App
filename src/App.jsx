import React, { useState, useRef, useEffect } from 'react'
import DinoGame from './components/DinoGame'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm DinoBot. Type 'play' or 'start game' to play the Chrome Dinosaur Game! You can also ask me about the game or type 'help' for more options."
    }
  ])
  const [input, setInput] = useState('')
  const [showGame, setShowGame] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showGame])

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase().trim()
    
    if (msg.includes('play') || msg.includes('start game') || msg.includes('dino') || msg.includes('game')) {
      setShowGame(true)
      setGameKey(prev => prev + 1)
      return "Let's play! The dinosaur game is loading below. Press SPACE or tap to jump over the cacti. Good luck!"
    }
    
    if (msg.includes('stop') || msg.includes('end') || msg.includes('close game') || msg.includes('quit')) {
      setShowGame(false)
      return "Game closed! Type 'play' whenever you want to play again."
    }
    
    if (msg.includes('help') || msg.includes('?')) {
      return `Here's what I can do:
• Type 'play' or 'start game' to launch the Dinosaur Game
• Type 'stop' or 'quit' to close the game
• Type 'score' for high score tips
• Type 'controls' to learn how to play
• Just have fun! 🦖`
    }
    
    if (msg.includes('control') || msg.includes('how to play')) {
      return `Game Controls:
• Press SPACEBAR or UP ARROW to jump
• On mobile: Tap the screen to jump
• Avoid the cacti to survive!
• The game speeds up over time
Ready to try? Type 'play'!`
    }
    
    if (msg.includes('score') || msg.includes('tip')) {
      return `High Score Tips:
• Time your jumps carefully
• Jump early for distant cacti
• Jump late for close cacti
• Stay focused as speed increases
• Practice makes perfect!`
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hey there! Ready to play some dino? Type 'play' to start!"
    }
    
    return "I'm here to help you play the dinosaur game! Type 'play' to start, or 'help' for more options."
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    setTimeout(() => {
      const botResponse = getBotResponse(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }])
    }, 500)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <span className="logo">🦖</span>
          <h1>DinoChat</h1>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '🦖' : '👤'}
              </div>
              <div className="message-content">
                <pre>{message.content}</pre>
              </div>
            </div>
          ))}
          
          {showGame && (
            <div className="message assistant">
              <div className="message-avatar">🎮</div>
              <div className="message-content game-container">
                <DinoGame key={gameKey} />
                <button className="close-game" onClick={() => setShowGame(false)}>
                  Close Game ✕
                </button>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'play' to start the game..."
            className="chat-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </footer>
    </div>
  )
}

export default App
