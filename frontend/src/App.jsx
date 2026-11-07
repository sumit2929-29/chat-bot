import React from 'react'
import ChatbotWidget from './components/ChatbotWidget'

function App() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl text-gray-400 font-bold mb-4">Client Website Simulation</h1>
      <p className="text-gray-500">Look at the bottom right corner 👇</p>
      <ChatbotWidget />
    </div>
  )
}

export default App