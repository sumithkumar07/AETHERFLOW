/**
 * 🌌 Cosmic Effects Hook
 * 
 * Custom React hook for managing cosmic-level visual effects and animations:
 * - Sacred geometry transformations
 * - Reality distortion effects
 * - Quantum field animations
 * - Neural activity visualization
 * - Time dilation effects
 * - Dimensional stability monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const useCosmicEffects = (config = {}) => {
  const {
    enableParticles = true,
    enableQuantumFields = true,
    enableNeuralWaves = true,
    enableRealityDistortion = false,
    enableTimeDilation = false,
    enableSacredGeometry = true,
    realityCoherence = 0.997,
    vibeFrequency = 432,
    cosmicHarmony = 0.85
  } = config;

  // Core cosmic state
  const [cosmicState, setCosmicState] = useState({
    dimensionalStability: 1.0,
    quantumCoherence: realityCoherence,
    vibeFrequency: vibeFrequency,
    cosmicHarmony: cosmicHarmony,
    temporalFlow: 'normal',
    realityVersion: '3.0.cosmic',
    neuralActivity: 0.0,
    activeEffects: []
  });

  // Visual effects state
  const [effectsState, setEffectsState] = useState({
    particles: enableParticles,
    quantumFields: enableQuantumFields,
    neuralWaves: enableNeuralWaves,
    realityDistortion: enableRealityDistortion,
    timeDilation: enableTimeDilation,
    sacredGeometry: enableSacredGeometry
  });

  // Animation references
  const animationRefs = useRef({
    cosmic: null,
    particles: null,
    quantum: null,
    neural: null,
    distortion: null
  });

  // Effect intensities
  const [intensities, setIntensities] = useState({
    particles: 0.6,
    quantum: 0.8,
    neural: 0.5,
    distortion: 0.3,
    harmony: 0.85
  });

  // Performance monitoring
  const performanceRef = useRef({
    fps: 60,
    lastFrameTime: 0,
    frameCount: 0,
    adaptiveQuality: true
  });

  // Initialize cosmic effects system
  useEffect(() => {
    console.log('🌌 Initializing Cosmic Effects System...');
    
    // Start cosmic state monitoring
    startCosmicStateMonitoring();
    
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Setup cosmic event listeners
    setupCosmicEventListeners();

    return () => {
      // Cleanup animations
      Object.values(animationRefs.current).forEach(ref => {
        if (ref) cancelAnimationFrame(ref);
      });
      
      // Remove event listeners
      cleanupCosmicEventListeners();
    };
  }, []);

  // Cosmic state monitoring
  const startCosmicStateMonitoring = useCallback(() => {
    const updateCosmicState = () => {
      const now = Date.now();
      const timeVariation = Math.sin(now / 10000) * 0.1;
      const harmonicVariation = Math.cos(now / 7000) * 0.05;

      setCosmicState(prev => ({
        ...prev,
        vibeFrequency: vibeFrequency + timeVariation * 20,
        cosmicHarmony: Math.max(0.5, Math.min(1.0, 
          prev.cosmicHarmony + harmonicVariation + (Math.random() - 0.5) * 0.02
        )),
        quantumCoherence: Math.max(0.9, Math.min(1.0,
          prev.quantumCoherence + (Math.random() - 0.5) * 0.001
        )),
        dimensionalStability: Math.max(0.8, Math.min(1.0,
          prev.dimensionalStability + (Math.random() - 0.5) * 0.005
        ))
      }));

      animationRefs.current.cosmic = requestAnimationFrame(updateCosmicState);
    };

    updateCosmicState();
  }, [vibeFrequency]);

  // Performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    const monitorPerformance = () => {
      const now = performance.now();
      const deltaTime = now - performanceRef.current.lastFrameTime;
      
      if (deltaTime > 0) {
        performanceRef.current.fps = 1000 / deltaTime;
        performanceRef.current.lastFrameTime = now;
        performanceRef.current.frameCount++;

        // Adaptive quality adjustment
        if (performanceRef.current.adaptiveQuality) {
          if (performanceRef.current.fps < 30) {
            // Reduce effect intensities for better performance
            setIntensities(prev => ({
              ...prev,
              particles: Math.max(0.2, prev.particles - 0.1),
              quantum: Math.max(0.2, prev.quantum - 0.1),
              neural: Math.max(0.2, prev.neural - 0.1)
            }));
          } else if (performanceRef.current.fps > 55) {
            // Increase effect intensities for better visuals
            setIntensities(prev => ({
              ...prev,
              particles: Math.min(1.0, prev.particles + 0.05),
              quantum: Math.min(1.0, prev.quantum + 0.05),
              neural: Math.min(1.0, prev.neural + 0.05)
            }));
          }
        }
      }

      setTimeout(monitorPerformance, 1000); // Monitor every second
    };

    monitorPerformance();
  }, []);

  // Sacred geometry calculations
  const calculateGoldenRatio = useCallback((width, height) => {
    const phi = 1.618033988749;
    return {
      ratio: phi,
      primarySection: width / phi,
      secondarySection: width - (width / phi),
      spiralPoints: generateFibonacciSpiral(width, height, phi),
      sacredAngles: [60, 72, 108, 120, 144] // degrees
    };
  }, []);

  const generateFibonacciSpiral = useCallback((width, height, phi) => {
    const points = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < 200; i++) {
      const angle = i * 0.1;
      const radius = angle * 3 * (phi / 2);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      points.push({ x, y, angle, radius });
    }
    
    return points;
  }, []);

  // Particle system management
  const createParticleSystem = useCallback((canvasRef, options = {}) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const {
      particleCount = 100,
      particleTypes = ['circle', 'triangle', 'hexagon', 'diamond'],
      colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b'],
      speed = 1.0,
      size = 2.0
    } = options;

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: (0.5 + Math.random() * 1.5) * size,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    }));

    return { particles, ctx, canvas };
  }, []);

  // Quantum field visualization
  const generateQuantumField = useCallback((width, height, coherence = 0.9) => {
    const field = [];
    const resolution = 20; // Grid resolution
    
    for (let x = 0; x < width; x += resolution) {
      for (let y = 0; y < height; y += resolution) {
        const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2);
        const wave = Math.sin(distance * 0.05 + Date.now() * 0.001);
        const amplitude = coherence * 50;
        const intensity = wave * amplitude / (distance / 50 + 1);
        
        field.push({
          x, y, 
          intensity,
          coherence: coherence + Math.sin(Date.now() * 0.002 + distance * 0.01) * 0.1,
          phase: Math.atan2(y - height/2, x - width/2)
        });
      }
    }
    
    return field;
  }, []);

  // Neural network visualization
  const createNeuralNetwork = useCallback((nodeCount = 20) => {
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      activity: Math.random(),
      connections: [],
      size: 2 + Math.random() * 4,
      activation: 0
    }));

    // Create connections between nodes
    nodes.forEach((node, i) => {
      const connectionCount = 2 + Math.floor(Math.random() * 4);
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i && !node.connections.includes(targetIndex)) {
          node.connections.push(targetIndex);
        }
      }
    });

    return nodes;
  }, []);

  // Reality distortion effects
  const applyRealityDistortion = useCallback((canvasRef, intensity = 0.3) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply distortion algorithm
    const time = Date.now() * 0.001;
    const distortionWaves = [
      { frequency: 0.05, amplitude: intensity * 10, offset: time },
      { frequency: 0.08, amplitude: intensity * 15, offset: time * 1.5 },
      { frequency: 0.12, amplitude: intensity * 8, offset: time * 0.8 }
    ];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        let distortionX = 0;
        let distortionY = 0;

        distortionWaves.forEach(wave => {
          const distance = Math.sqrt((x - canvas.width/2)**2 + (y - canvas.height/2)**2);
          distortionX += Math.sin(distance * wave.frequency + wave.offset) * wave.amplitude;
          distortionY += Math.cos(distance * wave.frequency + wave.offset * 1.2) * wave.amplitude;
        });

        const sourceX = Math.max(0, Math.min(canvas.width - 1, Math.round(x + distortionX)));
        const sourceY = Math.max(0, Math.min(canvas.height - 1, Math.round(y + distortionY)));

        const targetIndex = (y * canvas.width + x) * 4;
        const sourceIndex = (sourceY * canvas.width + sourceX) * 4;

        data[targetIndex] = data[sourceIndex];     // R
        data[targetIndex + 1] = data[sourceIndex + 1]; // G
        data[targetIndex + 2] = data[sourceIndex + 2]; // B
        data[targetIndex + 3] = data[sourceIndex + 3]; // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Time dilation effects
  const applyTimeDilation = useCallback((factor = 1.0) => {
    const dilationEffect = {
      timeScale: factor,
      visualSlowdown: factor < 1,
      acceleratedTime: factor > 1,
      temporalDistortion: Math.abs(1 - factor)
    };

    // Apply to CSS animations
    const root = document.documentElement;
    root.style.setProperty('--time-dilation-factor', factor.toString());
    root.style.setProperty('--cosmic-animation-speed', `${2 / factor}s`);

    return dilationEffect;
  }, []);

  // Event system
  const setupCosmicEventListeners = useCallback(() => {
    const handleCosmicEvent = (event) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'reality_shift':
          setCosmicState(prev => ({
            ...prev,
            dimensionalStability: data.stability,
            quantumCoherence: data.coherence
          }));
          break;
          
        case 'neural_activity':
          setCosmicState(prev => ({
            ...prev,
            neuralActivity: data.activity
          }));
          break;
          
        case 'vibe_frequency_change':
          setCosmicState(prev => ({
            ...prev,
            vibeFrequency: data.frequency
          }));
          break;
          
        default:
          console.log('Unknown cosmic event:', type, data);
      }
    };

    window.addEventListener('cosmicEvent', handleCosmicEvent);
    
    return () => {
      window.removeEventListener('cosmicEvent', handleCosmicEvent);
    };
  }, []);

  const cleanupCosmicEventListeners = useCallback(() => {
    // Cleanup is handled in the setup function return
  }, []);

  // Control functions
  const toggleEffect = useCallback((effectName) => {
    setEffectsState(prev => ({
      ...prev,
      [effectName]: !prev[effectName]
    }));
  }, []);

  const setEffectIntensity = useCallback((effectName, intensity) => {
    setIntensities(prev => ({
      ...prev,
      [effectName]: Math.max(0, Math.min(1, intensity))
    }));
  }, []);

  const triggerCosmicEvent = useCallback((eventType, data = {}) => {
    window.dispatchEvent(new CustomEvent('cosmicEvent', {
      detail: { type: eventType, data }
    }));
  }, []);

  const resetCosmicState = useCallback(() => {
    setCosmicState({
      dimensionalStability: 1.0,
      quantumCoherence: 0.997,
      vibeFrequency: 432,
      cosmicHarmony: 0.85,
      temporalFlow: 'normal',
      realityVersion: '3.0.cosmic',
      neuralActivity: 0.0,
      activeEffects: []
    });

    setEffectsState({
      particles: true,
      quantumFields: true,
      neuralWaves: true,
      realityDistortion: false,
      timeDilation: false,
      sacredGeometry: true
    });
  }, []);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return {
      fps: performanceRef.current.fps,
      frameCount: performanceRef.current.frameCount,
      effectsActive: Object.values(effectsState).filter(Boolean).length,
      totalIntensity: Object.values(intensities).reduce((sum, intensity) => sum + intensity, 0),
      adaptiveQuality: performanceRef.current.adaptiveQuality
    };
  }, [effectsState, intensities]);

  return {
    // State
    cosmicState,
    effectsState,
    intensities,
    
    // Calculations
    calculateGoldenRatio,
    generateFibonacciSpiral,
    generateQuantumField,
    createNeuralNetwork,
    
    // Particle system
    createParticleSystem,
    
    // Visual effects
    applyRealityDistortion,
    applyTimeDilation,
    
    // Controls
    toggleEffect,
    setEffectIntensity,
    triggerCosmicEvent,
    resetCosmicState,
    
    // Performance
    getPerformanceMetrics,
    
    // Animation refs for external use
    animationRefs
  };
};

export default useCosmicEffects;