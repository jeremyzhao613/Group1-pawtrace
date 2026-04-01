import React, { useState } from 'react';
import AIHealthTab from './components/AIHealthTab';
import MapTab from './components/MapTab';
import PetsTab from './components/PetsTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';

// Navigation Types
type Tab = 'map' | 'pets' | 'chat' | 'profile' | 'ai';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ai'); // Defaulting to AI for the demo
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Router logic
  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIHealthTab isActive={true} />;
      case 'map':
        return <MapTab />;
      case 'pets':
        return <PetsTab />;
      case 'chat':
        return <ChatTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'map', icon: 'fas fa-map-marked-alt', label: 'Map' },
    { id: 'pets', icon: 'fas fa-paw', label: 'Pets' },
    { id: 'chat', icon: 'fas fa-comments', label: 'Chat' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile' },
    { id: 'ai', icon: 'fas fa-heartbeat', label: 'AI Health' }
  ];

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-neutral text-dark selection:bg-primary/30">
      {/* Ambient Background Elements */}
      <span className="halo-pulse w-[520px] h-[520px] bg-primary/30 top-[-50px] left-[-50px] rounded-full fixed blur-3xl pointer-events-none"></span>
      <span className="halo-pulse w-[420px] h-[420px] bg-secondary/50 bottom-[10%] right-[-50px] rounded-full fixed blur-3xl pointer-events-none" style={{animationDelay: '-5s'}}></span>
      <span className="halo-pulse w-[300px] h-[300px] bg-pink-200/30 bottom-[-50px] left-[30%] rounded-full fixed blur-3xl pointer-events-none" style={{animationDelay: '-2s'}}></span>

      <div className="relative z-10 h-screen flex flex-col px-4 sm:px-6 py-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`app-shell flex flex-col lg:flex-row gap-6 w-full h-full ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          
          {/* Desktop Sidebar */}
          <aside className="glass-panel hidden lg:flex flex-col gap-6 w-64 shrink-0 transition-all duration-300 h-full">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 text-white flex items-center justify-center shadow-lg shadow-primary/40">
                <i className="fas fa-paw text-lg"></i>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-bold">PawTrace</p>
                <p className="text-lg font-bold text-dark -mt-0.5">Glass Demo</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-white/40 border border-white/50 p-4 flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold px-2 mb-1">Menu</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`app-nav-button w-full justify-start group ${activeTab === item.id ? 'active shadow-md' : 'hover:bg-white/40'}`}
                >
                  <div className={`w-6 flex justify-center transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <i className={item.icon}></i>
                  </div>
                  <span>{item.label}</span>
                  {item.id === 'ai' && activeTab !== 'ai' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-white/60 border border-white/60 p-3 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <img src="https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png" className="w-10 h-10 rounded-full pixel-border object-cover" alt="User" />
                 <div className="flex-1 min-w-0">
                   <p className="font-bold text-xs text-dark truncate">Pet Lover</p>
                   <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                     <p className="text-[10px] text-gray-500">Connected</p>
                   </div>
                 </div>
                 <button className="text-gray-400 hover:text-dark transition-colors"><i className="fas fa-cog"></i></button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
            <header className="glass-panel py-3 px-6 flex items-center justify-between shrink-0 z-20">
               <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold">Current Module</p>
                  <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                    {activeTab === 'ai' && <i className="fas fa-sparkles text-primary text-sm"></i>}
                    {activeTab === 'ai' ? 'AI Health Monitoring' : navItems.find(i => i.id === activeTab)?.label}
                  </h2>
               </div>
               <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-xs font-medium text-gray-600">
                    <i className="fas fa-clock text-primary"></i>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
               </div>
            </header>

            <main className="glass-panel flex-1 overflow-hidden flex flex-col relative p-0 border-white/40">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-6 px-4 z-50 lg:hidden flex justify-center pointer-events-none">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg scale-110 -translate-y-1' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <i className={`${item.icon} text-base`}></i>
              {activeTab === item.id && (
                <span className="absolute -bottom-6 text-[9px] font-bold text-dark bg-white/90 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;