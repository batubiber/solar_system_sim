import React, { useState, useCallback, useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import { BodyData } from './types';
import { getRealPlanetaryData } from './services/realDataService';

const App: React.FC = () => {
  // Start with empty array, will populate on mount to avoid hydration mismatches 
  // or initial render issues if library loads async (though imports are top level)
  const [bodies, setBodies] = useState<BodyData[]>([]);
  const [timeScale, setTimeScale] = useState(1);
  const [paused, setPaused] = useState(false);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);

  // Load real data on mount
  useEffect(() => {
    setBodies(getRealPlanetaryData());
  }, []);

  const handleReset = useCallback(() => {
    setBodies(getRealPlanetaryData());
    setTimeScale(1);
    setPaused(false);
    setSelectedBodyId(null);
  }, []);

  const handleBodyClick = useCallback((id: string) => {
    setSelectedBodyId(prev => prev === id ? null : id);
  }, []);

  // Show nothing or a loader until bodies are initialized
  if (bodies.length === 0) return <div className="w-full h-full bg-black"></div>;

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          bodies={bodies} 
          timeScale={timeScale} 
          paused={paused}
          onBodyClick={handleBodyClick}
          selectedBodyId={selectedBodyId}
        />
      </div>

      {/* UI Overlay Layer */}
      <Controls 
        paused={paused}
        setPaused={setPaused}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        bodies={bodies}
        setBodies={setBodies}
        selectedBodyId={selectedBodyId}
        resetSimulation={handleReset}
      />
    </div>
  );
};

export default App;