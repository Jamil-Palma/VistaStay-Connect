// src/components/CityChat.tsx
import React, { useState } from 'react';
import { analyzeData } from '../services/api';

interface CityChatProps {
  uuid: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const CityChat: React.FC<CityChatProps> = ({ uuid, messages, setMessages }) => {
  const [input, setInput] = useState<string>('');

  const handleSendMessage = async () => {
    if (!uuid || !input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await analyzeData(uuid, input);
      const botMessageText = response.data.response || "I don't have enough information on that.";

      const botMessage: Message = { sender: 'bot', text: botMessageText };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', text: "An error occurred. Please try again." }
      ]);
    }
  };

  return (
    <div className="city-chat">
      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about the city..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default CityChat;
