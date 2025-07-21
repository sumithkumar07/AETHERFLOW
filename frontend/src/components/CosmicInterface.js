/**
 * 🌌 Cosmic Interface - The Ultimate Programming Reality
 * 
 * This component integrates all cosmic-level features into the IDE:
 * - Sacred Geometry UI layouts
 * - Avatar Pantheon controls  
 * - VIBE Token economy display
 * - Karma level indicator
 * - Techno-Shaman Mode activator
 * - Chaos Forge interface
 * - Digital Alchemy Lab
 * - Cosmic Debugger portal
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Users, Coins, Star, Mic, MicOff, Wand2, Flame, 
  GitBranch, Clock, Sparkles, Hexagon, Triangle, Circle,
  Brain, Atom, Layers, Settings, Crown, Diamond
} from 'lucide-react';
import cosmicEngine from '../services/cosmicVibeEngine';

const CosmicInterface = ({ onCosmicAction, isVisible = true }) => {
  const [vibeTokens, setVibeTokens] = useState(1000);
  const [karmaLevel, setKarmaLevel] = useState('Novice');
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [shamanMode, setShamanMode] = useState(false);
  const [chaosActive, setChaosActive] = useState(false);
  const [cosmicStats, setCosmicStats] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [flowState, setFlowState] = useState(false);
  
  const interfaceRef = useRef(null);

  useEffect(() => {
    // Initialize cosmic interface
    if (cosmicEngine.isInitialized) {
      updateCosmicState();
    }
    
    const interval = setInterval(updateCosmicState, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateCosmicState = () => {
    setVibeTokens(cosmicEngine.getVibeTokenBalance());
    const karma = cosmicEngine.updateKarmaLevel();
    setKarmaLevel(karma?.level || 'Novice');
    setCurrentAvatar(cosmicEngine.currentAvatar);
  };

  const handleAvatarSummon = (avatarId) => {
    const avatar = cosmicEngine.summonAvatar(avatarId);
    if (avatar) {
      setCurrentAvatar(avatar);
      updateCosmicState();
      onCosmicAction?.({
        type: 'avatar_summoned',
        avatar,
        message: `${avatar.name} has been summoned to assist you!`
      });
    }
  };

  const handleShamanToggle = async () => {
    if (shamanMode) {
      if (cosmicEngine.recognition) {
        cosmicEngine.recognition.stop();
      }
      setShamanMode(false);
    } else {
      const activated = await cosmicEngine.activateShamanMode();
      setShamanMode(activated);
      if (activated) {
        updateCosmicState();
        onCosmicAction?.({
          type: 'shaman_activated',
          message: 'Techno-Shaman Mode activated! Voice commands are now available.'
        });
      }
    }
  };

  const handleMineTokens = () => {
    const result = cosmicEngine.mineVibeTokens(50, 'Manual mining');
    updateCosmicState();
    onCosmicAction?.({
      type: 'tokens_mined',
      result,
      message: `Mined ${result.mined} VIBE tokens!`
    });
  };

  const handleChaosForge = () => {
    const chaos = cosmicEngine.activateChaosForge();
    setChaosActive(true);
    updateCosmicState();
    onCosmicAction?.({
      type: 'chaos_activated',
      chaos,
      message: `Chaos Forge activated! Challenge: ${chaos.scenario}`
    });
    
    // Deactivate after time limit
    setTimeout(() => setChaosActive(false), chaos.timeLimit);
  };

  const handleQuantumShift = () => {
    const shift = cosmicEngine.quantumVibeShift();
    updateCosmicState();
    onCosmicAction?.({
      type: 'quantum_shift',
      shift,
      message: `Quantum Vibe Shift complete! Now in: ${shift.toReality}`
    });
  };

  const handleFlowState = () => {
    const bonuses = cosmicEngine.enterFlowState();
    setFlowState(true);
    updateCosmicState();
    onCosmicAction?.({
      type: 'flow_state',
      bonuses,
      message: 'Entered the Flow State! Enhanced focus and creativity activated.'
    });
    
    // Flow state lasts 30 minutes
    setTimeout(() => setFlowState(false), bonuses.duration);
  };

  const getKarmaColor = (level) => {
    const colors = {
      'Novice': 'text-gray-400',
      'Apprentice': 'text-green-400',
      'Journeyman': 'text-blue-400',
      'Expert': 'text-purple-400',
      'Master': 'text-yellow-400',
      'Grandmaster': 'text-red-400',
      'Cosmic Entity': 'text-pink-400'
    };
    return colors[level] || 'text-gray-400';
  };

  const getKarmaIcon = (level) => {
    const icons = {
      'Novice': Star,
      'Apprentice': Sparkles,
      'Journeyman': Crown,
      'Expert': Diamond,
      'Master': Brain,
      'Grandmaster': Atom,
      'Cosmic Entity': Layers
    };
    const IconComponent = icons[level] || Star;
    return <IconComponent size={16} />;
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={interfaceRef}
      className="cosmic-interface bg-gray-900 border-l border-gray-700 w-80 h-full flex flex-col sacred-border"
      style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
      }}
    >
      {/* Cosmic Header */}
      <div className="cosmic-header p-4 border-b border-gray-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="flex items-center space-x-2 mb-3">
          <div className="hexagon bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h2 className="text-lg font-bold text-white">Cosmic Interface</h2>
        </div>
        
        {/* VIBE Token Balance */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Coins className="text-yellow-400" size={16} />
            <span className="text-sm text-gray-300">VIBE Tokens</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400 font-bold">{vibeTokens}</span>
            <button
              onClick={handleMineTokens}
              className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
              title="Mine VIBE tokens"
            >
              Mine
            </button>
          </div>
        </div>
        
        {/* Karma Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getKarmaIcon(karmaLevel)}
            <span className="text-sm text-gray-300">Karma</span>
          </div>
          <span className={`text-sm font-semibold ${getKarmaColor(karmaLevel)}`}>
            {karmaLevel}
          </span>
        </div>
      </div>

      {/* Avatar Pantheon */}
      <div className="avatar-pantheon p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
          <Users size={16} />
          <span>Avatar Pantheon</span>
        </h3>
        
        {currentAvatar && (
          <div className="current-avatar mb-3 p-2 bg-indigo-900/30 rounded-lg border border-indigo-700">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-white">{currentAvatar.name}</span>
            </div>
            <p className="text-xs text-gray-400">{currentAvatar.specialty}</p>
            <p className="text-xs text-indigo-300 italic mt-1">"{currentAvatar.catchPhrase}"</p>
          </div>
        )}
        
        <div className="avatar-grid grid grid-cols-3 gap-1">
          {Object.entries(cosmicEngine.avatarPantheon).map(([id, avatar]) => (
            <button
              key={id}
              onClick={() => handleAvatarSummon(id)}
              className={`p-2 rounded-lg text-xs transition-all ${
                currentAvatar?.id === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              title={avatar.catchPhrase}
            >
              {avatar.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Cosmic Tools */}
      <div className="cosmic-tools flex-1 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
          <Wand2 size={16} />
          <span>Cosmic Tools</span>
        </h3>

        {/* Techno-Shaman Mode */}
        <button
          onClick={handleShamanToggle}
          className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-all ${
            shamanMode
              ? 'bg-green-600 hover:bg-green-700 cosmic-pulse'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {shamanMode ? <Mic className="text-white" size={16} /> : <MicOff className="text-gray-400" size={16} />}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Techno-Shaman</div>
            <div className="text-xs text-gray-300">
              {shamanMode ? 'Voice commands active' : 'Activate voice commands'}
            </div>
          </div>
        </button>

        {/* Chaos Forge */}
        <button
          onClick={handleChaosForge}
          className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-all ${
            chaosActive
              ? 'bg-red-600 hover:bg-red-700 cosmic-pulse'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          disabled={vibeTokens < 75}
        >
          <Flame className={chaosActive ? 'text-orange-300' : 'text-gray-400'} size={16} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Chaos Forge</div>
            <div className="text-xs text-gray-300">
              {chaosActive ? 'Chaos scenario active!' : 'Stress test reality'}
            </div>
          </div>
          <span className="text-xs text-yellow-400">75 VIBE</span>
        </button>

        {/* Flow State */}
        <button
          onClick={handleFlowState}
          className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-all ${
            flowState
              ? 'bg-blue-600 hover:bg-blue-700 karma-aura'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <Circle className={flowState ? 'text-blue-300' : 'text-gray-400'} size={16} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Flow State</div>
            <div className="text-xs text-gray-300">
              {flowState ? 'In the zone!' : 'Enter deep focus'}
            </div>
          </div>
        </button>

        {/* Quantum Vibe Shift */}
        <button
          onClick={handleQuantumShift}
          className="w-full p-3 rounded-lg flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 transition-all"
          disabled={vibeTokens < 200}
        >
          <Atom className="text-purple-400" size={16} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Quantum Shift</div>
            <div className="text-xs text-gray-300">Shift to better reality</div>
          </div>
          <span className="text-xs text-yellow-400">200 VIBE</span>
        </button>

        {/* Cosmic Debugger */}
        <button
          onClick={() => {
            const timeTravel = cosmicEngine.cosmicTimeTravel();
            onCosmicAction?.({
              type: 'time_travel',
              timeTravel,
              message: `Time travel initiated to: ${timeTravel.destination}`
            });
          }}
          className="w-full p-3 rounded-lg flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 transition-all"
          disabled={vibeTokens < 125}
        >
          <Clock className="text-indigo-400" size={16} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Time Travel</div>
            <div className="text-xs text-gray-300">Debug through time</div>
          </div>
          <span className="text-xs text-yellow-400">125 VIBE</span>
        </button>

        {/* Digital Alchemy */}
        <button
          onClick={() => {
            setSelectedTool('alchemy');
            onCosmicAction?.({
              type: 'alchemy_opened',
              message: 'Digital Alchemy Lab opened!'
            });
          }}
          className="w-full p-3 rounded-lg flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 transition-all"
          disabled={vibeTokens < 100}
        >
          <Triangle className="text-emerald-400" size={16} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Alchemy Lab</div>
            <div className="text-xs text-gray-300">Transform code</div>
          </div>
          <span className="text-xs text-yellow-400">100 VIBE</span>
        </button>
      </div>

      {/* Sacred Geometry Patterns */}
      <div className="sacred-footer p-4 border-t border-gray-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="hexagon bg-indigo-500/50"></div>
          <div className="pentagon bg-purple-500/50"></div>
          <div className="hexagon bg-blue-500/50"></div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Sacred Geometry Engaged</div>
          <div className="text-xs text-indigo-300">φ = {cosmicEngine.cosmicPatterns.goldenRatio.toFixed(3)}</div>
        </div>
      </div>

      {/* Voice Commands Help */}
      {shamanMode && (
        <div className="voice-commands absolute bottom-0 left-0 right-0 bg-green-900/90 p-3 text-xs text-green-100">
          <div className="font-semibold mb-1">🎙️ Voice Commands Active:</div>
          <div className="space-y-1 opacity-80">
            <div>"summon linus" - Call Linus Torvalds</div>
            <div>"activate chaos forge" - Start chaos testing</div>
            <div>"enter the flow" - Activate focus mode</div>
            <div>"mine vibe tokens" - Mine VIBE tokens</div>
            <div>"quantum vibe shift" - Shift reality</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicInterface;