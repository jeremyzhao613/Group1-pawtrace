
import React, { useState } from 'react';
import { COMMUNITY_PETS } from '../services/mockData';

const PetsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
  const [showAddForm, setShowAddForm] = useState(false);
  const [myPets, setMyPets] = useState([
    { id: 'p1', name: 'Mocha', type: 'Corgi', age: '2 yrs', image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/95033e3192d642014a951f965ea4ed5b.png', traits: ['Playful', 'Foodie'] }
  ]);

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock adding a new pet
    const newPet = { 
      id: `p${Date.now()}`, 
      name: 'New Pet', 
      type: 'Unknown', 
      age: '1 yr', 
      image: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/a0c9378b7607e96469333185e4376a53.png',
      traits: ['New']
    };
    setMyPets([...myPets, newPet]);
    setShowAddForm(false);
  };

  return (
    <div className="tab-page h-full flex flex-col animate-fadeIn space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-paw text-primary"></i> Pets
          </h2>
          <p className="text-xs text-gray-600">Community updates and your pack.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowAddForm(true)}
             className="pixel-button text-xs flex items-center gap-2 h-8"
           >
             <i className="fas fa-plus"></i> Add Pet
           </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-200/50 pb-1">
        <button 
          onClick={() => setActiveTab('community')}
          className={`px-4 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'community' ? 'bg-white/60 font-bold text-primary' : 'text-gray-500 hover:bg-white/30'}`}
        >
          Community ({COMMUNITY_PETS.length})
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-1.5 text-xs rounded-t-lg transition-colors ${activeTab === 'mine' ? 'bg-white/60 font-bold text-primary' : 'text-gray-500 hover:bg-white/30'}`}
        >
          My Pets ({myPets.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'community' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMUNITY_PETS.map((pet) => (
              <div key={pet.id} className="pixel-card p-4 flex flex-col gap-3 animate-slideInLeft">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-white/50">
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 right-2 bg-white/80 px-2 py-0.5 text-[9px] rounded-full font-bold text-dark backdrop-blur-sm">Online</span>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-dark">{pet.name}</h3>
                      <p className="text-[10px] text-gray-500">{pet.type}</p>
                    </div>
                    <button className="text-primary hover:text-dark transition-colors"><i className="fas fa-comment-dots"></i></button>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2 italic">"{pet.mood}"</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                    <i className="fas fa-map-marker-alt text-primary"></i> {pet.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {showAddForm && (
              <div className="pixel-card p-4 mb-4 bg-primary/5 border-primary/30 animate-fadeIn">
                <h3 className="font-bold text-sm mb-3">New Pet Registration</h3>
                <form onSubmit={handleAddPet} className="space-y-3">
                  <input className="pixel-input text-xs" placeholder="Pet Name" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="pixel-input text-xs" placeholder="Type (Dog, Cat...)" />
                    <input className="pixel-input text-xs" placeholder="Age" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="pixel-button text-xs flex-1">Save</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="pixel-button bg-white text-gray-600 flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            )}
            
            {myPets.length > 0 ? (
              myPets.map((pet) => (
                <div key={pet.id} className="pixel-card flex gap-4 animate-fadeIn hover:translate-y-[-2px] transition-transform">
                  <img src={pet.image} alt={pet.name} className="w-16 h-16 rounded-full object-cover pixel-border bg-secondary" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold text-sm">{pet.name}</h3>
                      <button className="text-[10px] text-gray-400 hover:text-primary"><i className="fas fa-edit"></i></button>
                    </div>
                    <p className="text-xs text-gray-600">{pet.type} · {pet.age}</p>
                    <div className="flex gap-1 mt-2">
                      {pet.traits.map(t => <span key={t} className="px-2 py-0.5 bg-secondary rounded-full text-[10px] text-dark">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs py-8">No pets added yet. Click "Add Pet" to start!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetsTab;
