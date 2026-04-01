
import React, { useState } from 'react';
import { LOCATIONS } from '../services/mockData';

const MapTab: React.FC = () => {
  const [activeLocation, setActiveLocation] = useState<any | null>(null);

  return (
    <div className="tab-page h-full flex flex-col animate-fadeIn space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-map-marked-alt text-primary"></i>
            Taicang Pet Map
          </h2>
          <p className="text-xs text-gray-600">Click markers to discover pet-friendly spots.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr,0.8fr] gap-4 flex-1 min-h-0">
        {/* Map Container */}
        <div className="pixel-card relative overflow-hidden h-full min-h-[300px] p-0 flex flex-col">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/BlankMap-World6.svg/2000px-BlankMap-World6.svg.png')`, filter: 'contrast(0.9) opacity(0.5)' }}></div>
          
          {/* Markers Layer */}
          <div className="absolute inset-0">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                className={`absolute w-8 h-8 rounded-full border-2 border-dark flex items-center justify-center text-white font-semibold cursor-pointer transition-transform duration-200 shadow-lg ${activeLocation?.id === loc.id ? 'scale-125 z-20 ring-4 ring-primary/30' : 'hover:scale-110 z-10'}`}
                style={{ 
                  background: 'linear-gradient(135deg, #99cdd8, #5ba7b8)',
                  boxShadow: '4px 4px 0 rgba(31, 59, 66, 0.55)',
                  top: loc.coords.top,
                  left: loc.coords.left
                }}
                onClick={() => setActiveLocation(loc)}
                title={loc.name}
              >
                <span className="text-xs">🐾</span>
              </button>
            ))}
          </div>

          {/* Location Card Overlay */}
          {activeLocation && (
            <div className="absolute top-4 left-4 max-w-xs pixel-card bg-white/95 shadow-xl animate-slideInLeft z-30">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{activeLocation.name}</h3>
                  <p className="text-[10px] text-gray-600">{activeLocation.type}</p>
                </div>
                <button onClick={() => setActiveLocation(null)} className="text-gray-400 hover:text-dark">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-xs text-gray-700 mb-2 leading-relaxed">{activeLocation.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {activeLocation.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-secondary text-dark rounded-full text-[9px]">{tag}</span>
                ))}
              </div>
              <div className="text-[10px] text-gray-600 space-y-0.5">
                <p><i className="fas fa-star text-yellow-400 mr-1"></i> {activeLocation.rating}</p>
                <p><i className="fas fa-clock text-primary mr-1"></i> {activeLocation.hours}</p>
              </div>
              <button className="pixel-button w-full mt-3 text-[10px] h-8">Visit Spot</button>
            </div>
          )}
        </div>

        {/* Sidebar List */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="pixel-card space-y-2 shrink-0">
            <h3 className="font-semibold text-sm">Pet Reminders</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span className="text-lg">🗓️</span>
              Xiao Hei vaccination due in 2 days
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <span className="text-lg">🍰</span>
              Mocha's Birthday next week!
            </div>
          </div>

          <div className="pixel-card flex-1 flex flex-col min-h-0">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <i className="fas fa-store text-primary"></i> Spots ({LOCATIONS.length})
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setActiveLocation(loc)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 flex flex-col gap-1
                    ${activeLocation?.id === loc.id 
                      ? 'bg-primary/10 border-primary/50 shadow-sm' 
                      : 'bg-white/50 border-white/40 hover:bg-white/80 hover:border-primary/30'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-dark">{loc.name}</span>
                    <span className="text-[10px] text-primary font-medium">{loc.rating.split(' ')[0]}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 truncate">{loc.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTab;
