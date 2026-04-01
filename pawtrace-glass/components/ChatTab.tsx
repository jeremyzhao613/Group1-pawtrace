
import React, { useState, useEffect } from 'react';
import { CHAT_CONTACTS } from '../services/mockData';

const ChatTab: React.FC = () => {
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Clone mock data to local state to allow adding messages
  const [chats, setChats] = useState(CHAT_CONTACTS);

  // Initialize active contact if contacts exist
  useEffect(() => {
    if (chats.length > 0 && !activeContactId) {
      setActiveContactId(chats[0].id);
    }
  }, []);

  const activeContact = chats.find(c => c.id === activeContactId);
  const filteredContacts = chats.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage = { sender: 'me', text: inputText };
    
    const updatedChats = chats.map(c => {
      if (c.id === activeContactId) {
        return { 
          ...c, 
          history: [...(c.history || []), newMessage],
          lastMsg: inputText 
        };
      }
      return c;
    });
    
    setChats(updatedChats);
    setInputText('');

    // Mock reply simulation
    setTimeout(() => {
      const replyMsg = { sender: 'them', text: "That sounds awesome! 🐾 Let's do it." };
      setChats(prev => prev.map(c => {
        if (c.id === activeContactId) {
          return { 
            ...c, 
            history: [...(c.history || []), replyMsg],
            lastMsg: replyMsg.text
          };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="tab-page h-full flex flex-col animate-fadeIn">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-comments text-primary"></i> Friends Chat
        </h2>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-4 flex-1 min-h-0">
        {/* Contact List */}
        <div className="pixel-card flex flex-col gap-3 min-h-0">
          <input 
            className="pixel-input text-xs mb-2" 
            placeholder="Search friends..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${activeContactId === contact.id ? 'bg-primary/10 border border-primary/30 shadow-sm' : 'hover:bg-secondary/50 border border-transparent'}`}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full bg-white pixel-border object-cover" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-dark truncate">{contact.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="pixel-card flex flex-col min-h-0 p-0 overflow-hidden">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white/40 backdrop-blur-sm">
                <img src={activeContact.avatar} alt="Avatar" className="w-10 h-10 rounded-full pixel-border object-cover" />
                <div>
                  <h3 className="font-bold text-sm text-dark">{activeContact.name}</h3>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 
                    Online · Owner of {activeContact.pet} ({activeContact.petType})
                  </p>
                </div>
                <button className="ml-auto text-gray-400 hover:text-primary transition-colors">
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-white/20">
                {activeContact.history && activeContact.history.length > 0 ? (
                  activeContact.history.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-slideInLeft`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'me' 
                          ? 'bg-primary text-dark rounded-br-none' 
                          : 'bg-white border border-white/60 text-gray-700 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                    <i className="fas fa-comments text-4xl mb-2"></i>
                    <p className="text-xs">Start a conversation with {activeContact.name}!</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-white/60 border-t border-white/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Send Image">
                    <i className="fas fa-image"></i>
                  </button>
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-full px-4 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Type a message..."
                  />
                  <button type="submit" className="pixel-button h-9 px-4 text-xs rounded-full flex items-center gap-2 shadow-md">
                    <span>Send</span> <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs">
              <i className="fas fa-inbox text-4xl mb-2 opacity-20"></i>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
