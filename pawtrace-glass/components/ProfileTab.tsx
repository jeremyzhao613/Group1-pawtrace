
import React, { useState } from 'react';
import { INITIAL_USER } from '../services/mockData';

const ProfileTab: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(INITIAL_USER);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="tab-page h-full flex flex-col animate-fadeIn space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-user text-primary"></i> My Profile
        </h2>
      </div>

      <div className="grid md:grid-cols-[1.5fr,1fr] gap-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        {/* Main Profile Card */}
        <div className="pixel-card flex flex-col gap-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative group cursor-pointer">
              <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full pixel-border bg-secondary object-cover shadow-lg" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <i className="fas fa-camera"></i>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1 w-full">
              {isEditing ? (
                <input 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="pixel-input text-lg font-bold mb-2 text-center sm:text-left"
                  placeholder="Display Name"
                />
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-dark">{user.name}</h3>
                  <span className="px-2 py-0.5 bg-secondary text-[10px] rounded-full text-dark font-semibold border border-white/50">Pet Lover</span>
                </div>
              )}
              <p className="text-xs text-gray-500 font-medium">{user.username}</p>
              
              <div className="pt-2">
                {isEditing ? (
                  <textarea 
                    value={user.bio}
                    onChange={(e) => setUser({...user, bio: e.target.value})} 
                    className="pixel-input text-xs h-20 resize-none w-full"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{user.bio}</p>
                )}
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                 <div className="flex items-center gap-2">
                   <i className="fas fa-map-marker-alt text-primary w-4 text-center"></i>
                   {isEditing ? <input value={user.campus} onChange={e => setUser({...user, campus: e.target.value})} className="pixel-input py-1 px-2 text-xs" /> : <span>{user.campus}</span>}
                 </div>
                 <div className="flex items-center gap-2">
                   <i className="fas fa-envelope text-primary w-4 text-center"></i>
                   {isEditing ? <input value={user.contact} onChange={e => setUser({...user, contact: e.target.value})} className="pixel-input py-1 px-2 text-xs" /> : <span>{user.contact}</span>}
                 </div>
                 <div className="flex items-center gap-2">
                   <i className="fas fa-star text-primary w-4 text-center"></i>
                   {isEditing ? <input value={user.starSign} onChange={e => setUser({...user, starSign: e.target.value})} className="pixel-input py-1 px-2 text-xs" /> : <span>{user.starSign}</span>}
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
            <div className="p-3 rounded-2xl bg-gray-50/80 hover:bg-white transition-colors border border-transparent hover:border-primary/20">
              <p className="text-xl font-bold text-primary">{user.pets}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pets</p>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50/80 hover:bg-white transition-colors border border-transparent hover:border-primary/20">
              <p className="text-xl font-bold text-primary">{user.friends}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Friends</p>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50/80 hover:bg-white transition-colors border border-transparent hover:border-primary/20">
              <p className="text-xl font-bold text-primary">{user.visits}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Visits</p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="flex flex-col gap-4">
          <div className="pixel-card space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <i className="fas fa-cog text-primary"></i> Settings
            </h3>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={handleSave} className="pixel-button w-full text-xs bg-green-500 hover:bg-green-600 text-white border-none shadow-green-200">
                  <i className="fas fa-check mr-1"></i> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="pixel-button w-full text-xs bg-gray-200 text-gray-600 hover:bg-gray-300 border-none shadow-none">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="pixel-button w-full text-xs flex items-center justify-center gap-2">
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            )}
            <button className="pixel-button w-full text-xs bg-red-50 hover:bg-red-100 text-red-500 border-red-100 flex items-center justify-center gap-2 shadow-none hover:shadow-sm">
              <i className="fas fa-sign-out-alt"></i> Log Out
            </button>
          </div>

          <div className="pixel-card space-y-3 bg-gradient-to-br from-primary/5 to-white border-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-dark">
                <i className="fas fa-moon text-primary"></i> Pet Insight
              </h3>
              <button className="text-[10px] text-primary hover:underline font-medium">Refresh</button>
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed border-l-2 border-primary/30 pl-3">
              "Mocha's energy is peaking this week! Great time for agility training or a new puzzle toy to keep him engaged."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
