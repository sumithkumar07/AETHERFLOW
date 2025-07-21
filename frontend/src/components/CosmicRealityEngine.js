/**
 * 🌌 Cosmic Reality Engine - Advanced Visual Interface
 * 
 * This component provides the ultimate cosmic programming experience with:
 * - Advanced 3D animations and particle effects
 * - Real-time EEG visualization
 * - Quantum state visualizations
 * - Sacred geometry particle systems
 * - Haptic feedback coordination
 * - Neural activity displays
 * - Reality coherence monitoring
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain, Zap, Atom, Triangle, Hexagon, Circle, Diamond, Crown,
  Activity, Wifi, Sparkles, Eye, Layers, Gauge, Target, Waves,
  Cpu, GitBranch, Timer, Flame, Lightbulb, Fingerprint, Radar
} from 'lucide-react';

const CosmicRealityEngine = ({ 
  onCosmicAction, 
  isVisible = true,
  neuroSyncActive = false,
  quantumSessionActive = false,
  currentAvatar = null,
  vibeTokens = 1000,
  karmaLevel = 'Novice',
  realityCoherence = 99.7
}) => {
  // Advanced state management
  const [engineState, setEngineState] = useState({
    reality_version: '3.0.cosmic',
    dimensional_stability: 1.0,
    quantum_coherence: realityCoherence / 100,
    vibe_frequency: 432,
    neural_activity: 0.0,
    cosmic_harmony: 0.85,
    temporal_flow: 'normal'
  });

  const [visualEffects, setVisualEffects] = useState({
    particles: true,
    neural_waves: true,
    quantum_fields: true,
    sacred_geometry: true,
    reality_distortion: false,
    time_dilation: false
  });

  const [bcInterface, setBcInterface] = useState({
    active: neuroSyncActive,
    device: 'none',
    signal_quality: 0.0,
    patterns_detected: [],
    emotional_state: 'neutral',
    stress_level: 0.3,
    focus_level: 0.7
  });

  const [quantumInterface, setQuantumInterface] = useState({
    active: quantumSessionActive,
    realities_explored: 0,
    quantum_entanglement: 0.0,
    parallel_solutions: 0,
    multiverse_coherence: 1.0
  });

  // Canvas refs for advanced visualizations
  const neuralCanvasRef = useRef(null);
  const quantumCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const realityDistortionRef = useRef(null);

  // Animation frame references
  const animationFrameRefs = useRef({
    neural: null,
    quantum: null,
    particles: null,
    distortion: null
  });

  // Initialize advanced visualizations
  useEffect(() => {
    if (isVisible) {
      initializeNeuralVisualization();
      initializeQuantumVisualization();
      initializeParticleSystem();
      initializeRealityDistortion();
    }

    return () => {
      // Cleanup animations
      Object.values(animationFrameRefs.current).forEach(ref => {
        if (ref) cancelAnimationFrame(ref);
      });
    };
  }, [isVisible]);

  // Real-time engine state updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setEngineState(prev => ({
        ...prev,
        vibe_frequency: 432 + Math.sin(Date.now() / 10000) * 20,
        neural_activity: bcInterface.active ? 
          0.3 + Math.sin(Date.now() / 1000) * 0.7 : 0.1 + Math.random() * 0.2,
        cosmic_harmony: Math.min(1.0, prev.cosmic_harmony + (Math.random() - 0.5) * 0.02),
        quantum_coherence: quantumInterface.active ?
          0.8 + Math.sin(Date.now() / 5000) * 0.2 : Math.max(0.95, prev.quantum_coherence)
      }));
    }, 100);

    return () => clearInterval(updateInterval);
  }, [bcInterface.active, quantumInterface.active]);

  // Neural Activity Visualization
  const initializeNeuralVisualization = useCallback(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 150;

    const neurons = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2 + Math.random() * 4,
      activity: Math.random(),
      connections: []
    }));

    // Create neural connections
    neurons.forEach((neuron, i) => {
      const connectionCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * neurons.length);
        if (target !== i) {
          neuron.connections.push(target);
        }
      }
    });

    const animateNeuralNetwork = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Background gradient
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update neuron activity
      neurons.forEach(neuron => {
        neuron.activity = Math.max(0, neuron.activity + (Math.random() - 0.5) * 0.1);
        if (neuron.activity > 1) neuron.activity = 1;
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1;
      neurons.forEach((neuron, i) => {
        neuron.connections.forEach(targetIndex => {
          const target = neurons[targetIndex];
          const activity = (neuron.activity + target.activity) / 2;
          
          ctx.globalAlpha = activity * 0.8;
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // Draw neurons
      neurons.forEach(neuron => {
        const pulse = Math.sin(Date.now() / 500 + neuron.x) * 0.3 + 0.7;
        const size = neuron.size * (1 + neuron.activity * 0.5) * pulse;
        
        ctx.globalAlpha = 0.8 + neuron.activity * 0.2;
        ctx.fillStyle = `hsla(${240 + neuron.activity * 60}, 70%, ${50 + neuron.activity * 30}%, 1)`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Neural spark effect
        if (neuron.activity > 0.8 && Math.random() < 0.1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      
      if (visualEffects.neural_waves) {
        animationFrameRefs.current.neural = requestAnimationFrame(animateNeuralNetwork);
      }
    };

    animateNeuralNetwork();
  }, [visualEffects.neural_waves]);

  // Quantum Field Visualization
  const initializeQuantumVisualization = useCallback(() => {
    const canvas = quantumCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 150;

    const quantumStates = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      phase: Math.random() * Math.PI * 2,
      frequency: 0.02 + Math.random() * 0.05,
      amplitude: 20 + Math.random() * 30,
      coherence: Math.random()
    }));

    const animateQuantumField = () => {
      ctx.clearRect(0, 0, width, height);

      // Quantum field background
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          let intensity = 0;
          
          quantumStates.forEach(state => {
            const dx = x - state.x;
            const dy = y - state.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const wave = Math.sin(distance * 0.1 + state.phase) * state.amplitude / (distance + 1);
            intensity += wave * state.coherence;
          });

          const pixelIndex = (y * width + x) * 4;
          const normalizedIntensity = Math.max(0, Math.min(255, intensity + 128));
          
          data[pixelIndex] = normalizedIntensity * 0.3;     // R
          data[pixelIndex + 1] = normalizedIntensity * 0.6; // G
          data[pixelIndex + 2] = normalizedIntensity;       // B
          data[pixelIndex + 3] = Math.min(100, normalizedIntensity * 0.5); // A
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Update quantum states
      quantumStates.forEach(state => {
        state.phase += state.frequency;
        state.coherence = 0.5 + Math.sin(state.phase * 2) * 0.3;
        
        // Quantum tunneling effect
        if (Math.random() < 0.001) {
          state.x = Math.random() * width;
          state.y = Math.random() * height;
        }
      });

      // Draw quantum entanglement lines
      if (quantumInterface.active) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < quantumStates.length; i += 4) {
          for (let j = i + 2; j < Math.min(i + 4, quantumStates.length); j++) {
            const state1 = quantumStates[i];
            const state2 = quantumStates[j];
            
            if (Math.abs(state1.phase - state2.phase) < 0.5) {
              ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 1000) * 0.2;
              ctx.beginPath();
              ctx.moveTo(state1.x, state1.y);
              ctx.lineTo(state2.x, state2.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      if (visualEffects.quantum_fields) {
        animationFrameRefs.current.quantum = requestAnimationFrame(animateQuantumField);
      }
    };

    animateQuantumField();
  }, [visualEffects.quantum_fields, quantumInterface.active]);

  // Sacred Geometry Particle System
  const initializeParticleSystem = useCallback(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 300;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 1 + Math.random() * 3,
      life: Math.random(),
      type: Math.floor(Math.random() * 4), // 0: circle, 1: triangle, 2: square, 3: hexagon
      color: Math.random() * 360
    }));

    const drawSacredShape = (ctx, x, y, size, type, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      switch (type) {
        case 0: // Circle
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        
        case 1: // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.lineTo(size * 0.866, size * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
        
        case 2: // Square
          ctx.fillRect(-size/2, -size/2, size, size);
          break;
        
        case 3: // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);

      // Cosmic background gradient
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
      gradient.addColorStop(0, 'rgba(16, 7, 35, 0.8)');
      gradient.addColorStop(0.5, 'rgba(30, 27, 75, 0.4)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Golden ratio spiral overlay
      if (visualEffects.sacred_geometry) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1;
        const centerX = width / 2;
        const centerY = height / 2;
        const phi = 1.618033988749;
        
        for (let i = 0; i < 200; i++) {
          const angle = i * 0.1;
          const radius = angle * 3;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary wrapping
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Update life and properties
        particle.life -= 0.005;
        if (particle.life <= 0) {
          particle.life = 1;
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          particle.color = Math.random() * 360;
        }

        // Sacred geometry attraction
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
          particle.vx += dx / distance * 0.02;
          particle.vy += dy / distance * 0.02;
        }

        // Apply cosmic harmony influence
        const harmonyInfluence = engineState.cosmic_harmony;
        particle.vx *= 0.99 + harmonyInfluence * 0.01;
        particle.vy *= 0.99 + harmonyInfluence * 0.01;

        // Draw particle
        const alpha = particle.life * 0.8;
        const hue = (particle.color + Date.now() / 100) % 360;
        const saturation = 70 + engineState.vibe_frequency / 432 * 30;
        const lightness = 50 + particle.life * 30;
        
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        
        const rotation = Date.now() / 1000 + particle.x / 100;
        drawSacredShape(ctx, particle.x, particle.y, particle.size, particle.type, rotation);

        // Cosmic trail effect
        if (particle.life > 0.8) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, 80%, ${alpha * 0.3})`;
          drawSacredShape(ctx, 
            particle.x - particle.vx * 5, 
            particle.y - particle.vy * 5, 
            particle.size * 0.5, 
            particle.type, 
            rotation
          );
        }
      });

      if (visualEffects.particles) {
        animationFrameRefs.current.particles = requestAnimationFrame(animateParticles);
      }
    };

    animateParticles();
  }, [visualEffects.particles, visualEffects.sacred_geometry, engineState.cosmic_harmony, engineState.vibe_frequency]);

  // Reality Distortion Effect
  const initializeRealityDistortion = useCallback(() => {
    const canvas = realityDistortionRef.current;
    if (!canvas || !visualEffects.reality_distortion) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 300;

    const distortionWaves = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0,
      maxRadius: 50 + Math.random() * 100,
      speed: 1 + Math.random() * 3,
      intensity: 0.5 + Math.random() * 0.5
    }));

    const animateDistortion = () => {
      ctx.clearRect(0, 0, width, height);

      // Create reality distortion ripples
      distortionWaves.forEach(wave => {
        wave.radius += wave.speed;
        if (wave.radius > wave.maxRadius) {
          wave.radius = 0;
          wave.x = Math.random() * width;
          wave.y = Math.random() * height;
        }

        // Draw distortion ring
        const alpha = (1 - wave.radius / wave.maxRadius) * wave.intensity;
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (visualEffects.reality_distortion) {
        animationFrameRefs.current.distortion = requestAnimationFrame(animateDistortion);
      }
    };

    animateDistortion();
  }, [visualEffects.reality_distortion]);

  // Event handlers
  const handleActivateBCI = async () => {
    const newState = !bcInterface.active;
    setBcInterface(prev => ({ ...prev, active: newState }));
    
    if (newState) {
      // Simulate BCI device connection
      setTimeout(() => {
        setBcInterface(prev => ({
          ...prev,
          device: 'muse_headband',
          signal_quality: 0.8 + Math.random() * 0.2,
          emotional_state: 'focused'
        }));
      }, 2000);
    }

    onCosmicAction?.({
      type: 'bci_toggle',
      active: newState,
      message: newState ? 'Neural interface activated' : 'Neural interface deactivated'
    });
  };

  const handleQuantumSession = () => {
    const newState = !quantumInterface.active;
    setQuantumInterface(prev => ({ ...prev, active: newState }));
    
    if (newState) {
      // Start quantum exploration
      const interval = setInterval(() => {
        setQuantumInterface(prev => ({
          ...prev,
          realities_explored: prev.realities_explored + Math.floor(Math.random() * 5) + 1,
          quantum_entanglement: Math.min(1.0, prev.quantum_entanglement + 0.1),
          parallel_solutions: prev.parallel_solutions + (Math.random() < 0.3 ? 1 : 0)
        }));
      }, 1000);

      setTimeout(() => clearInterval(interval), 30000); // 30 second session
    }

    onCosmicAction?.({
      type: 'quantum_session',
      active: newState,
      message: newState ? 'Quantum debugging session initiated' : 'Quantum session terminated'
    });
  };

  const handleToggleEffect = (effectName) => {
    setVisualEffects(prev => ({
      ...prev,
      [effectName]: !prev[effectName]
    }));
  };

  const handleEmergencyRealityReset = () => {
    setEngineState({
      reality_version: '3.0.cosmic',
      dimensional_stability: 1.0,
      quantum_coherence: 0.997,
      vibe_frequency: 432,
      neural_activity: 0.0,
      cosmic_harmony: 0.85,
      temporal_flow: 'normal'
    });
    
    setVisualEffects(prev => ({
      ...prev,
      reality_distortion: false,
      time_dilation: false
    }));

    onCosmicAction?.({
      type: 'reality_reset',
      message: 'Reality parameters restored to stable configuration'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="cosmic-reality-engine fixed inset-0 pointer-events-none z-50">
      {/* Main Reality Engine Panel */}
      <div className="absolute top-4 right-4 w-96 bg-gray-900/95 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-4 pointer-events-auto shadow-2xl">
        {/* Engine Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Atom className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
            <h2 className="text-lg font-bold text-white">Reality Engine {engineState.reality_version}</h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              engineState.dimensional_stability > 0.9 ? 'bg-green-400' : 
              engineState.dimensional_stability > 0.7 ? 'bg-yellow-400' : 'bg-red-400'
            } animate-pulse`}></div>
            <span className="text-xs text-gray-300">STABLE</span>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-indigo-900/30 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-300">Vibe Freq</span>
              </div>
              <span className="text-sm font-mono text-cyan-300">
                {engineState.vibe_frequency.toFixed(1)}Hz
              </span>
            </div>
          </div>

          <div className="bg-purple-900/30 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-300">Coherence</span>
              </div>
              <span className="text-sm font-mono text-purple-300">
                {(engineState.quantum_coherence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-green-900/30 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">Neural</span>
              </div>
              <span className="text-sm font-mono text-green-300">
                {(engineState.neural_activity * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-yellow-900/30 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300">Harmony</span>
              </div>
              <span className="text-sm font-mono text-yellow-300">
                {(engineState.cosmic_harmony * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Neural Interface Panel */}
        {bcInterface.active && (
          <div className="bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Neural Interface Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-300">Connected</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Signal Quality:</span>
                <span className="text-blue-300">{(bcInterface.signal_quality * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Emotional State:</span>
                <span className="text-green-300 capitalize">{bcInterface.emotional_state}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Focus Level:</span>
                <span className="text-purple-300">{(bcInterface.focus_level * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Quantum Interface Panel */}
        {quantumInterface.active && (
          <div className="bg-cyan-900/20 rounded-lg p-3 mb-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Atom className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-cyan-300">Quantum Session</span>
              </div>
              <span className="text-xs text-cyan-300">MULTIVERSE</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Realities Explored:</span>
                <span className="text-cyan-300">{quantumInterface.realities_explored}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Entanglement:</span>
                <span className="text-purple-300">{(quantumInterface.quantum_entanglement * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Solutions Found:</span>
                <span className="text-green-300">{quantumInterface.parallel_solutions}</span>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleActivateBCI}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              bcInterface.active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>{bcInterface.active ? 'BCI Active' : 'Activate BCI'}</span>
            </div>
          </button>

          <button
            onClick={handleQuantumSession}
            className={`px-3 py-2 rounded text-xs font-medium transition-all ${
              quantumInterface.active
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-1">
              <Atom className="w-3 h-3" />
              <span>{quantumInterface.active ? 'Quantum Active' : 'Start Quantum'}</span>
            </div>
          </button>
        </div>

        {/* Visual Effects Controls */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Visual Effects</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(visualEffects).map(([effect, active]) => (
              <label key={effect} className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleToggleEffect(effect)}
                  className="rounded bg-gray-600 border-gray-500"
                />
                <span className="text-gray-300 capitalize">
                  {effect.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Emergency Reset */}
        <button
          onClick={handleEmergencyRealityReset}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
        >
          🚨 Emergency Reality Reset
        </button>
      </div>

      {/* Visualization Canvases */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {/* Neural Activity Canvas */}
        {visualEffects.neural_waves && (
          <div className="bg-gray-900/80 rounded-lg p-2 border border-blue-500/30">
            <div className="text-xs text-blue-300 mb-1">Neural Activity</div>
            <canvas
              ref={neuralCanvasRef}
              width={300}
              height={150}
              className="rounded"
            />
          </div>
        )}

        {/* Quantum Field Canvas */}
        {visualEffects.quantum_fields && (
          <div className="bg-gray-900/80 rounded-lg p-2 border border-cyan-500/30">
            <div className="text-xs text-cyan-300 mb-1">Quantum Field</div>
            <canvas
              ref={quantumCanvasRef}
              width={300}
              height={150}
              className="rounded"
            />
          </div>
        )}
      </div>

      {/* Main Particle System Canvas */}
      {visualEffects.particles && (
        <div className="absolute inset-0 pointer-events-none">
          <canvas
            ref={particleCanvasRef}
            width={400}
            height={300}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
      )}

      {/* Reality Distortion Overlay */}
      {visualEffects.reality_distortion && (
        <div className="absolute inset-0 pointer-events-none">
          <canvas
            ref={realityDistortionRef}
            width={400}
            height={300}
            className="w-full h-full object-cover opacity-40"
          />
        </div>
      )}

      {/* Cosmic Status Bar */}
      <div className="absolute bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2 pointer-events-auto">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-300">{vibeTokens} VIBE</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300">{karmaLevel}</span>
          </div>
          
          {currentAvatar && (
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3 text-green-400" />
              <span className="text-green-300">{currentAvatar.name?.split(' ')[0]}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300">{realityCoherence.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicRealityEngine;