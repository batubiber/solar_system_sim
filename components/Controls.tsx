import React, { useState } from 'react';
import { Play, Pause, Plus, RotateCcw, Sparkles, X, Compass, Move3d, List, Trash2, Calculator } from 'lucide-react';
import { BodyData, BodyType } from '../types';

interface ControlsProps {
  paused: boolean;
  setPaused: (p: boolean) => void;
  timeScale: number;
  setTimeScale: (t: number) => void;
  bodies: BodyData[];
  setBodies: (b: BodyData[]) => void;
  selectedBodyId: string | null;
  resetSimulation: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  paused,
  setPaused,
  timeScale,
  setTimeScale,
  bodies,
  setBodies,
  selectedBodyId,
  resetSimulation,
}) => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showBodyList, setShowBodyList] = useState(false);
  
  // Manual Creation State
  const [inputMode, setInputMode] = useState<'orbit' | 'vector'>('orbit');
  
  // Using strings for numeric fields to allow proper decimal input handling
  const [manualForm, setManualForm] = useState({
    name: 'Counter-Earth',
    type: BodyType.EarthLike,
    color: '#22A6B3',
    mass: '1',
    radius: '2',
    // Orbit Defaults (Earth-like)
    distance: '60',
    velocity: '0.913',
    // Vector Defaults
    posX: '-60', posY: '0', posZ: '0',
    velX: '0', velY: '0', velZ: '-0.913'
  });

  const selectedBody = bodies.find(b => b.id === selectedBodyId);

  const handleDeleteBody = (id: string) => {
    setBodies(bodies.filter(b => b.id !== id));
  };

  const calculateOrbitalVelocity = () => {
    const r = parseFloat(manualForm.distance);
    if (r > 0) {
      // v = sqrt(GM / r), where GM = 50 (from constants G=0.01, Mass=5000)
      const v = Math.sqrt(50 / r);
      setManualForm(prev => ({ ...prev, velocity: v.toFixed(3) }));
    }
  };

  // Manual Creation Handler
  const handleManualCreate = () => {
    const { name, type, color, mass, radius, distance, velocity, posX, posY, posZ, velX, velY, velZ } = manualForm;
    
    let finalPos = { x: 0, y: 0, z: 0 };
    let finalVel = { x: 0, y: 0, z: 0 };

    if (inputMode === 'orbit') {
        const d = Number(distance);
        finalPos = { x: d, y: 0, z: 0 };
        // Circular orbit velocity vector is perpendicular to position
        finalVel = { x: 0, y: 0, z: Number(velocity) };
    } else {
        finalPos = { x: Number(posX), y: Number(posY), z: Number(posZ) };
        finalVel = { x: Number(velX), y: Number(velY), z: Number(velZ) };
    }

    const newBody: BodyData = {
      id: `manual-${Date.now()}`,
      name: name || 'Unnamed',
      type: type,
      color: color,
      radius: Number(radius),
      mass: Number(mass),
      position: finalPos,
      velocity: finalVel,
      description: "A custom designed world.",
    };
    setBodies([...bodies, newBody]);
    setShowAddPanel(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
      
      {/* Top Bar: Selected Body Info Only (Title removed) */}
      <div className="flex justify-end items-start pointer-events-auto">
        {/* Selected Body Info */}
        {selectedBody && (
          <div className="bg-slate-900/80 backdrop-blur-md text-white p-4 rounded-lg border border-blue-500/30 w-64 shadow-xl">
            <h2 className="text-xl font-bold text-blue-400 flex justify-between">
              {selectedBody.name}
            </h2>
            <div className="space-y-1 mt-2 text-sm text-gray-300">
              <div className="flex justify-between"><span>Type:</span> <span>{selectedBody.type}</span></div>
              <div className="flex justify-between"><span>Mass:</span> <span>{selectedBody.mass.toFixed(2)} M⊕</span></div>
              <div className="flex justify-between"><span>Radius:</span> <span>{selectedBody.radius.toFixed(2)} R⊕</span></div>
            </div>
            <p className="mt-3 text-xs italic text-gray-400 border-t border-white/10 pt-2">
              "{selectedBody.description || "No data available."}"
            </p>
          </div>
        )}
      </div>

      {/* Panels Area */}
      <div className="absolute top-24 left-4 flex flex-col gap-4 w-80 pointer-events-auto max-h-[calc(100vh-150px)]">
        
        {/* Body List Panel */}
        {showBodyList && (
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-lg border border-green-500/30 shadow-2xl flex flex-col max-h-96">
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <List size={16} className="text-green-400" /> Celestial Catalog
              </h3>
              <button onClick={() => setShowBodyList(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {bodies.map(body => (
                <div key={body.id} className="flex items-center justify-between bg-white/5 p-2 rounded hover:bg-white/10 transition-colors group">
                   <div className="flex-1">
                      <div className={`font-bold text-sm ${selectedBodyId === body.id ? 'text-blue-400' : 'text-white'}`}>{body.name}</div>
                      <div className="text-[10px] text-gray-400">{body.type} • {body.mass.toFixed(1)} M⊕</div>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDeleteBody(body.id); }}
                     className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-900/30 rounded transition-all"
                     title="Delete"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              ))}
              {bodies.length === 0 && <div className="text-gray-500 text-xs text-center py-4">The universe is empty.</div>}
            </div>
          </div>
        )}

        {/* Add Body Panel */}
        {showAddPanel && (
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-lg border border-purple-500/30 shadow-2xl w-80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" /> Genesis Engine
              </h3>
              <button onClick={() => setShowAddPanel(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
            </div>

            {/* Manual Creation Form */}
            <div className="space-y-3">
                {/* Common Properties */}
                <div className="space-y-2">
                  <input type="text" placeholder="Name" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs" 
                      value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} />
                  
                  <div className="flex gap-2">
                      <select className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs flex-1"
                            value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value as BodyType})}>
                          {Object.values(BodyType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="color" className="h-6 w-10 rounded cursor-pointer" 
                            value={manualForm.color} onChange={e => setManualForm({...manualForm, color: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                      <div>
                          <label className="text-[10px] text-gray-400">Mass (Earths)</label>
                          <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs" 
                              value={manualForm.mass} onChange={e => setManualForm({...manualForm, mass: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-400">Radius (Earths)</label>
                          <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs" 
                              value={manualForm.radius} onChange={e => setManualForm({...manualForm, radius: e.target.value})} />
                      </div>
                  </div>
                </div>
                
                <div className="border-t border-white/10 my-1"></div>

                {/* Input Mode Tabs */}
                <div className="flex gap-2 bg-black/30 p-1 rounded">
                    <button 
                        onClick={() => setInputMode('orbit')} 
                        className={`flex-1 text-[10px] py-1 rounded transition-colors flex items-center justify-center gap-1 ${inputMode === 'orbit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Compass size={12} /> Orbit Mode
                    </button>
                    <button 
                        onClick={() => setInputMode('vector')} 
                        className={`flex-1 text-[10px] py-1 rounded transition-colors flex items-center justify-center gap-1 ${inputMode === 'vector' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Move3d size={12} /> Vector Mode
                    </button>
                </div>

                {/* Orbit Mode Inputs */}
                {inputMode === 'orbit' && (
                  <div className="grid grid-cols-2 gap-2">
                      <div>
                          <label className="text-[10px] text-gray-400">Orbit Distance</label>
                          <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs" 
                              value={manualForm.distance} onChange={e => setManualForm({...manualForm, distance: e.target.value})} />
                      </div>
                      <div className="relative">
                          <label className="text-[10px] text-gray-400 flex justify-between items-center">
                              Velocity
                              <button 
                                onClick={calculateOrbitalVelocity}
                                className="text-[9px] bg-blue-600/50 hover:bg-blue-600 px-1 rounded flex items-center gap-1 transition-colors text-blue-100"
                                title="Auto-calculate circular orbit velocity"
                              >
                                <Calculator size={8} /> Auto
                              </button>
                          </label>
                          <input type="number" step="0.001" className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs" 
                              value={manualForm.velocity} onChange={e => setManualForm({...manualForm, velocity: e.target.value})} />
                      </div>
                  </div>
                )}

                {/* Vector Mode Inputs */}
                {inputMode === 'vector' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Position (x, y, z)</label>
                      <div className="flex gap-1">
                        <input type="number" placeholder="X" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.posX} onChange={e => setManualForm({...manualForm, posX: e.target.value})} />
                        <input type="number" placeholder="Y" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.posY} onChange={e => setManualForm({...manualForm, posY: e.target.value})} />
                        <input type="number" placeholder="Z" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.posZ} onChange={e => setManualForm({...manualForm, posZ: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Velocity (x, y, z)</label>
                      <div className="flex gap-1">
                        <input type="number" placeholder="X" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.velX} onChange={e => setManualForm({...manualForm, velX: e.target.value})} />
                        <input type="number" placeholder="Y" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.velY} onChange={e => setManualForm({...manualForm, velY: e.target.value})} />
                        <input type="number" placeholder="Z" className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-white text-xs" 
                            value={manualForm.velZ} onChange={e => setManualForm({...manualForm, velZ: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}

                <button 
                onClick={handleManualCreate}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                Create Body
                </button>
            </div>
          </div>
        )}

      </div>


      {/* Bottom Bar: Controls */}
      <div className="flex justify-center items-end pb-6 pointer-events-auto">
        <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-6">
          
          {/* Playback */}
          <div className="flex items-center gap-2">
            <button onClick={() => setPaused(!paused)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
              {paused ? <Play size={24} fill="white" /> : <Pause size={24} fill="white" />}
            </button>
            <button onClick={resetSimulation} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors" title="Reset">
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/20"></div>

          {/* Time Scale */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono uppercase">Time Warp</span>
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={timeScale} 
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
              className="w-32 accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-mono w-8 text-right">{timeScale.toFixed(1)}x</span>
          </div>

          <div className="h-8 w-[1px] bg-white/20"></div>

          {/* Tools */}
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowBodyList(!showBodyList)} 
              className={`p-2 rounded-full transition-all ${showBodyList ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'hover:bg-white/10 text-white/80'}`}
              title="Celestial Catalog"
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setShowAddPanel(!showAddPanel)} 
              className={`p-2 rounded-full transition-all ${showAddPanel ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'hover:bg-white/10 text-white/80'}`}
              title="Add Planet"
            >
              <Plus size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Controls;