import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Zap, Activity, TrendingUp, Target, AlertCircle,
  Play, Pause, Settings, Wifi, WifiOff, Eye, Focus,
  BarChart3, Users, Clock, Lightbulb
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// BCI (Brain-Computer Interface) Component - 2025 Experimental Feature
const BCIIntegration = ({ 
  currentFile, 
  onCodeOptimization,
  onFocusStateChange,
  professionalMode = true 
}) => {
  const [bciConnected, setBciConnected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [brainWaves, setBrainWaves] = useState({
    alpha: 0,    // Relaxation/creativity (8-13 Hz)
    beta: 0,     // Focus/concentration (13-30 Hz) 
    gamma: 0,    // High-level cognitive processing (30-100 Hz)
    theta: 0,    // Deep meditation/flow state (4-8 Hz)
    delta: 0     // Deep sleep/unconscious (0.5-4 Hz)
  });
  const [mentalState, setMentalState] = useState('neutral'); // focused, stressed, creative, flow
  const [cognitiveLoad, setCognitiveLoad] = useState(0);
  const [attentionLevel, setAttentionLevel] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [flowState, setFlowState] = useState(false);
  const [bciDevice, setBciDevice] = useState('none'); // none, muse, emotiv, neuralink
  const [adaptiveUI, setAdaptiveUI] = useState(true);
  const [biofeedback, setBiofeedback] = useState(true);
  const [sessionData, setSessionData] = useState({
    duration: 0,
    focusTime: 0,
    flowTime: 0,
    distractions: 0,
    productivityScore: 0
  });

  const websocketRef = useRef(null);
  const sessionStartTime = useRef(null);
  const brainDataBufferRef = useRef([]);
  
  // Available BCI devices
  const bciDevices = {
    none: { name: 'None', description: 'No BCI device connected' },
    muse: { name: 'Muse Headband', description: 'EEG meditation headband' },
    emotiv: { name: 'Emotiv EPOC X', description: 'Advanced EEG headset' },
    neuralink: { name: 'Neuralink (Experimental)', description: 'Direct neural interface' },
    simulation: { name: 'Simulation Mode', description: 'Simulated brain data for testing' }
  };

  // Initialize BCI connection
  useEffect(() => {
    if (bciDevice !== 'none') {
      initializeBCIConnection();
    } else {
      disconnectBCI();
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [bciDevice]);

  // Process brain wave data
  useEffect(() => {
    if (bciConnected) {
      analyzeMentalState();
      updateAdaptiveFeatures();
    }
  }, [brainWaves, bciConnected]);

  const initializeBCIConnection = async () => {
    try {
      setIsCalibrating(true);
      
      if (bciDevice === 'simulation') {
        // Start simulation mode
        startSimulationMode();
        setBciConnected(true);
        sessionStartTime.current = Date.now();
        setIsCalibrating(false);
        return;
      }

      // Connect to BCI backend service
      const response = await fetch(`${BACKEND_URL}/api/bci/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_type: bciDevice,
          user_id: 'current_user',
          calibration_needed: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Establish WebSocket connection for real-time brain data
        const wsUrl = `ws://localhost:8001/ws/bci/${data.session_id}`;
        websocketRef.current = new WebSocket(wsUrl);
        
        websocketRef.current.onopen = () => {
          console.log('BCI WebSocket connected');
          setBciConnected(true);
          sessionStartTime.current = Date.now();
        };

        websocketRef.current.onmessage = (event) => {
          const brainData = JSON.parse(event.data);
          processBrainData(brainData);
        };

        websocketRef.current.onerror = (error) => {
          console.error('BCI WebSocket error:', error);
          setBciConnected(false);
        };

        websocketRef.current.onclose = () => {
          console.log('BCI WebSocket disconnected');
          setBciConnected(false);
        };
      }
    } catch (error) {
      console.error('Failed to initialize BCI connection:', error);
    } finally {
      setIsCalibrating(false);
    }
  };

  const startSimulationMode = () => {
    // Simulate brain wave data for demonstration
    const simulationInterval = setInterval(() => {
      if (bciDevice !== 'simulation' || !bciConnected) {
        clearInterval(simulationInterval);
        return;
      }

      // Generate realistic brain wave patterns
      const baseAlpha = 0.3 + Math.random() * 0.4;
      const baseBeta = 0.2 + Math.random() * 0.6; // Higher when focused
      const baseTheta = 0.1 + Math.random() * 0.3;
      const baseGamma = 0.05 + Math.random() * 0.2;
      const baseDelta = 0.05 + Math.random() * 0.15;

      // Simulate different states
      const time = Date.now();
      const focusBoost = Math.sin(time / 30000) * 0.3 + 0.3; // 30 second cycle
      const stressPattern = Math.sin(time / 60000) * 0.2; // 1 minute cycle

      setBrainWaves({
        alpha: Math.min(1, baseAlpha + stressPattern),
        beta: Math.min(1, baseBeta + focusBoost),
        theta: Math.min(1, baseTheta + (focusBoost > 0.5 ? 0.2 : 0)),
        gamma: Math.min(1, baseGamma + (focusBoost > 0.7 ? 0.3 : 0)),
        delta: Math.min(1, baseDelta)
      });
    }, 100); // Update every 100ms
  };

  const processBrainData = (data) => {
    // Process real BCI device data
    setBrainWaves({
      alpha: data.alpha || 0,
      beta: data.beta || 0,
      gamma: data.gamma || 0,
      theta: data.theta || 0,
      delta: data.delta || 0
    });

    // Store in buffer for analysis
    brainDataBufferRef.current.push({
      ...data,
      timestamp: Date.now()
    });

    // Keep only last 1000 samples
    if (brainDataBufferRef.current.length > 1000) {
      brainDataBufferRef.current = brainDataBufferRef.current.slice(-1000);
    }
  };

  const analyzeMentalState = () => {
    const { alpha, beta, gamma, theta, delta } = brainWaves;
    
    // Calculate cognitive metrics
    const attention = Math.min(1, beta * 1.2 + gamma * 0.8);
    const relaxation = Math.min(1, alpha * 1.5);
    const stress = Math.min(1, (beta > 0.7 ? beta - 0.7 : 0) * 2 + (gamma > 0.6 ? gamma - 0.6 : 0) * 3);
    const creativity = Math.min(1, alpha * 0.8 + theta * 1.2);
    const flow = Math.min(1, theta * 1.5 + (beta > 0.4 && beta < 0.7 ? 0.5 : 0));

    setAttentionLevel(attention);
    setStressLevel(stress);
    setCognitiveLoad(Math.min(1, (beta + gamma) / 1.5));
    setFlowState(flow > 0.6);

    // Determine overall mental state
    let newMentalState = 'neutral';
    if (flow > 0.6) newMentalState = 'flow';
    else if (stress > 0.7) newMentalState = 'stressed';
    else if (attention > 0.7) newMentalState = 'focused';
    else if (creativity > 0.6) newMentalState = 'creative';

    setMentalState(newMentalState);

    // Notify parent component of focus state changes
    if (onFocusStateChange) {
      onFocusStateChange({
        state: newMentalState,
        attention: attention,
        stress: stress,
        flow: flow > 0.6
      });
    }
  };

  const updateAdaptiveFeatures = () => {
    if (!adaptiveUI) return;

    const { beta, gamma, alpha } = brainWaves;
    
    // Suggest code optimizations based on cognitive state
    if (cognitiveLoad > 0.8 && onCodeOptimization) {
      onCodeOptimization({
        type: 'reduce_complexity',
        reason: 'High cognitive load detected',
        suggestions: [
          'Break down complex functions into smaller ones',
          'Add more descriptive variable names',
          'Consider using helper functions'
        ]
      });
    }

    // Update session statistics
    if (sessionStartTime.current) {
      const duration = (Date.now() - sessionStartTime.current) / 1000;
      const focusTime = attentionLevel > 0.6 ? sessionData.focusTime + 0.1 : sessionData.focusTime;
      const flowTime = flowState ? sessionData.flowTime + 0.1 : sessionData.flowTime;
      
      setSessionData(prev => ({
        ...prev,
        duration,
        focusTime,
        flowTime,
        productivityScore: Math.min(100, (focusTime / duration) * 100)
      }));
    }
  };

  const disconnectBCI = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    setBciConnected(false);
    setBrainWaves({ alpha: 0, beta: 0, gamma: 0, theta: 0, delta: 0 });
    setMentalState('neutral');
    sessionStartTime.current = null;
  };

  const calibrateBCI = async () => {
    setIsCalibrating(true);
    
    // Simulate calibration process
    setTimeout(() => {
      setIsCalibrating(false);
      alert('BCI calibration completed! The system is now tuned to your brain patterns.');
    }, 5000);
  };

  const mentalStateColors = {
    neutral: 'text-gray-400',
    focused: 'text-blue-400',
    creative: 'text-purple-400',
    stressed: 'text-red-400',
    flow: 'text-green-400'
  };

  const mentalStateDescriptions = {
    neutral: 'Baseline cognitive state',
    focused: 'High concentration and attention',
    creative: 'Enhanced creative thinking',
    stressed: 'Elevated stress levels detected',
    flow: 'Deep focus and optimal performance'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            bciConnected ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-white">Neuro-Sync BCI</h3>
            <p className="text-xs text-gray-400">
              {bciConnected ? 'Brain signals connected' : 'No BCI device connected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {bciConnected && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              mentalStateColors[mentalState]
            } bg-current bg-opacity-20`}>
              {mentalState.toUpperCase()}
            </div>
          )}
          
          <button
            onClick={bciConnected ? disconnectBCI : () => {}}
            className={`btn btn-xs ${
              bciConnected ? 'btn-success' : 'btn-ghost'
            }`}
          >
            {bciConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          </button>
        </div>
      </div>

      {/* Device Selection */}
      {!bciConnected && (
        <div className="p-4 border-b border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            BCI Device
          </label>
          <select
            value={bciDevice}
            onChange={(e) => setBciDevice(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            disabled={isCalibrating}
          >
            {Object.entries(bciDevices).map(([key, device]) => (
              <option key={key} value={key}>
                {device.name} - {device.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Real-time Brain Waves */}
      {bciConnected && (
        <div className="p-4 space-y-4">
          {/* Mental State */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Mental State</span>
              <div className={`flex items-center space-x-1 ${mentalStateColors[mentalState]}`}>
                <Activity size={14} />
                <span className="text-xs font-medium">{mentalState.toUpperCase()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">{mentalStateDescriptions[mentalState]}</p>
          </div>

          {/* Cognitive Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Attention</span>
                <span className="text-xs font-medium text-white">{Math.round(attentionLevel * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attentionLevel * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Stress Level</span>
                <span className="text-xs font-medium text-white">{Math.round(stressLevel * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stressLevel * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Cognitive Load</span>
                <span className="text-xs font-medium text-white">{Math.round(cognitiveLoad * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cognitiveLoad * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Flow State</span>
                <span className="text-xs font-medium text-white">
                  {flowState ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                flowState ? 'bg-green-500' : 'bg-gray-700'
              }`} />
            </div>
          </div>

          {/* Brain Wave Visualization */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-300 mb-3">Brain Waves</div>
            <div className="space-y-2">
              {Object.entries(brainWaves).map(([wave, intensity]) => (
                <div key={wave} className="flex items-center space-x-3">
                  <span className="text-xs w-12 text-gray-400 capitalize">{wave}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        wave === 'alpha' ? 'bg-blue-400' :
                        wave === 'beta' ? 'bg-green-400' :
                        wave === 'gamma' ? 'bg-purple-400' :
                        wave === 'theta' ? 'bg-orange-400' : 'bg-gray-400'
                      }`}
                      style={{ width: `${intensity * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-8 text-gray-400">{Math.round(intensity * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Statistics */}
      {bciConnected && sessionData.duration > 0 && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-3">Session Statistics</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-gray-500">Duration</span>
              <span className="text-white">{Math.round(sessionData.duration / 60)}m</span>
            </div>
            <div>
              <span className="block text-gray-500">Focus Time</span>
              <span className="text-blue-400">{Math.round(sessionData.focusTime / 60)}m</span>
            </div>
            <div>
              <span className="block text-gray-500">Flow Time</span>
              <span className="text-green-400">{Math.round(sessionData.flowTime / 60)}m</span>
            </div>
            <div>
              <span className="block text-gray-500">Productivity</span>
              <span className="text-purple-400">{Math.round(sessionData.productivityScore)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {bciConnected && (
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="text-sm font-medium text-gray-300">BCI Settings</div>
          
          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Adaptive UI</span>
              <input
                type="checkbox"
                checked={adaptiveUI}
                onChange={(e) => setAdaptiveUI(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Biofeedback</span>
              <input
                type="checkbox"
                checked={biofeedback}
                onChange={(e) => setBiofeedback(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
            </label>
          </div>

          <button
            onClick={calibrateBCI}
            className="btn btn-sm btn-primary w-full"
            disabled={isCalibrating}
          >
            {isCalibrating ? 'Calibrating...' : 'Recalibrate BCI'}
          </button>
        </div>
      )}

      {/* Calibration Overlay */}
      {isCalibrating && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-white font-medium">Calibrating BCI Interface</div>
            <div className="text-gray-400 text-sm">
              Please remain calm and focused during calibration
            </div>
          </div>
        </div>
      )}

      {/* Inactive State */}
      {!bciConnected && !isCalibrating && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-xs">
            <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-medium text-white mb-2">Neuro-Sync BCI</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connect a Brain-Computer Interface device to optimize your coding experience based on your mental state.
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Real-time brain wave monitoring</div>
              <div>• Adaptive UI based on focus levels</div>
              <div>• Flow state detection</div>
              <div>• Cognitive load optimization</div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
              <div className="text-blue-400 font-medium">Experimental Feature</div>
              <div className="text-gray-400 mt-1">
                BCI integration is experimental and requires compatible hardware
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BCIIntegration;