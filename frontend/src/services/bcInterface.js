/**
 * 🧠 Brain-Computer Interface Service
 * 
 * This service provides BCI integration capabilities:
 * - EEG device communication
 * - Webcam-based stress detection  
 * - Emotional compiler integration
 * - Haptic feedback coordination
 * - Neural pattern recognition
 * - Real-time biometric monitoring
 */

class BCIInterface {
  constructor() {
    this.isInitialized = false;
    this.activeSession = null;
    this.supportedDevices = {
      'muse': { name: 'Muse Headband', channels: 4, sampleRate: 256 },
      'neuralink': { name: 'Neuralink Dev Kit', channels: 1024, sampleRate: 20000 },
      'emotiv': { name: 'Emotiv EPOC X', channels: 14, sampleRate: 128 },
      'webcam_stress': { name: 'Webcam Stress Detector', channels: 1, sampleRate: 30 }
    };
    
    // EEG pattern recognition
    this.eegPatterns = {
      focus: { alpha: [8, 12], beta: [13, 30], threshold: 0.7 },
      frustration: { theta: [4, 8], gamma: [30, 100], threshold: 0.8 },
      flow: { alpha: [8, 12], theta: [4, 8], threshold: 0.9 },
      creativity: { theta: [4, 8], alpha: [8, 12], threshold: 0.75 }
    };
    
    // Webcam stress detection
    this.webcamActive = false;
    this.videoElement = null;
    this.canvas = null;
    this.faceDetectionModel = null;
    
    // Emotional compiler state
    this.emotionalState = 'neutral';
    this.stressLevel = 0.3;
    this.lastOptimization = null;
    
    this.initializeBCI();
  }

  async initializeBCI() {
    try {
      console.log('🧠 Initializing Brain-Computer Interface...');
      
      // Initialize webcam stress detection
      await this.initializeWebcamStressDetection();
      
      // Initialize haptic feedback (if supported)
      this.initializeHapticFeedback();
      
      // Setup neural pattern recognition
      this.setupNeuralPatternRecognition();
      
      this.isInitialized = true;
      console.log('🧠 BCI Interface initialized successfully!');
      
    } catch (error) {
      console.error('BCI initialization failed:', error);
    }
  }

  // === EEG DEVICE INTEGRATION ===

  async connectDevice(deviceType = 'webcam_stress') {
    try {
      console.log(`🔌 Connecting to ${deviceType} device...`);
      
      const deviceInfo = this.supportedDevices[deviceType];
      if (!deviceInfo) {
        throw new Error(`Unsupported device type: ${deviceType}`);
      }

      // Simulate device connection
      await this.simulateDeviceConnection(deviceType);
      
      this.activeSession = {
        sessionId: this.generateSessionId(),
        deviceType,
        deviceInfo,
        connected: true,
        startTime: new Date(),
        signalQuality: 0.85,
        patternsDetected: [],
        optimizationsGenerated: 0
      };

      // Start real-time monitoring
      this.startRealTimeMonitoring();
      
      return {
        success: true,
        sessionId: this.activeSession.sessionId,
        device: deviceInfo,
        message: `Connected to ${deviceInfo.name}`
      };
      
    } catch (error) {
      console.error('Device connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  async simulateDeviceConnection(deviceType) {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (deviceType === 'webcam_stress') {
      // Start webcam for stress detection
      await this.startWebcamStressDetection();
    }
    
    // For other devices, simulate Bluetooth/USB connection
    if (deviceType !== 'webcam_stress') {
      console.log(`📡 Establishing ${deviceType === 'neuralink' ? 'neural' : 'bluetooth'} connection...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // === WEBCAM STRESS DETECTION ===

  async initializeWebcamStressDetection() {
    try {
      // Create video element for webcam
      this.videoElement = document.createElement('video');
      this.videoElement.width = 320;
      this.videoElement.height = 240;
      this.videoElement.style.display = 'none';
      document.body.appendChild(this.videoElement);

      // Create canvas for face analysis
      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 240;
      this.canvas.style.display = 'none';
      document.body.appendChild(this.canvas);

      console.log('📷 Webcam stress detection initialized');
      
    } catch (error) {
      console.error('Webcam initialization failed:', error);
    }
  }

  async startWebcamStressDetection() {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      
      this.videoElement.srcObject = stream;
      this.videoElement.play();
      this.webcamActive = true;
      
      // Start facial analysis
      this.startFacialAnalysis();
      
      console.log('📷 Webcam stress detection started');
      
    } catch (error) {
      console.error('Webcam access denied:', error);
      // Fallback to simulated stress detection
      this.startSimulatedStressDetection();
    }
  }

  startFacialAnalysis() {
    const analyzeFrame = () => {
      if (!this.webcamActive || !this.videoElement) return;

      try {
        // Draw current frame to canvas
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, 320, 240);
        
        // Analyze facial features for stress indicators
        const stressData = this.analyzeFacialStress(ctx);
        
        // Update emotional state
        this.updateEmotionalState(stressData);
        
        // Trigger emotional compiler if needed
        this.processEmotionalCompiler(stressData);
        
      } catch (error) {
        console.error('Facial analysis error:', error);
      }

      // Continue analysis
      if (this.webcamActive) {
        setTimeout(analyzeFrame, 100); // 10 FPS
      }
    };

    analyzeFrame();
  }

  analyzeFacialStress(ctx) {
    // Simulate facial stress analysis
    // In a real implementation, this would use ML models like TensorFlow.js
    
    const imageData = ctx.getImageData(0, 0, 320, 240);
    
    // Simulated stress indicators
    const stressIndicators = {
      browTension: Math.random() * 0.8 + 0.1,
      eyeStrain: Math.random() * 0.7 + 0.1, 
      jawTension: Math.random() * 0.6 + 0.1,
      blinkRate: 15 + Math.random() * 10, // blinks per minute
      headMovement: Math.random() * 0.5,
      facialSymmetry: 0.85 + Math.random() * 0.1
    };

    // Calculate overall stress level
    const stressLevel = (
      stressIndicators.browTension * 0.3 +
      stressIndicators.eyeStrain * 0.25 +
      stressIndicators.jawTension * 0.2 +
      (stressIndicators.blinkRate > 20 ? 0.8 : 0.3) * 0.15 +
      stressIndicators.headMovement * 0.1
    );

    return {
      stressLevel: Math.min(1.0, stressLevel),
      indicators: stressIndicators,
      timestamp: new Date()
    };
  }

  startSimulatedStressDetection() {
    console.log('📷 Starting simulated stress detection...');
    
    const simulateStress = () => {
      const stressData = {
        stressLevel: 0.3 + Math.sin(Date.now() / 10000) * 0.3 + Math.random() * 0.2,
        indicators: {
          browTension: Math.random() * 0.8,
          eyeStrain: Math.random() * 0.7,
          jawTension: Math.random() * 0.6,
          blinkRate: 12 + Math.random() * 15,
          headMovement: Math.random() * 0.4
        },
        timestamp: new Date()
      };

      this.updateEmotionalState(stressData);
      this.processEmotionalCompiler(stressData);

      if (this.activeSession) {
        setTimeout(simulateStress, 1000);
      }
    };

    simulateStress();
  }

  // === EEG PATTERN PROCESSING ===

  processEEGData(eegData) {
    if (!this.activeSession) return null;

    try {
      // Simulate EEG data processing
      const patterns = this.detectEEGPatterns(eegData);
      
      patterns.forEach(pattern => {
        if (pattern.confidence > pattern.threshold) {
          this.activeSession.patternsDetected.push(pattern);
          
          // Generate code optimization
          const optimization = this.generateCodeOptimization(pattern);
          if (optimization) {
            this.activeSession.optimizationsGenerated++;
            this.triggerCodeOptimization(optimization);
          }
        }
      });

      return {
        patternsDetected: patterns,
        sessionStats: {
          totalPatterns: this.activeSession.patternsDetected.length,
          optimizations: this.activeSession.optimizationsGenerated
        }
      };

    } catch (error) {
      console.error('EEG data processing failed:', error);
      return null;
    }
  }

  detectEEGPatterns(eegData) {
    // Simulate EEG pattern detection
    const patterns = [];
    
    Object.entries(this.eegPatterns).forEach(([patternName, config]) => {
      const confidence = 0.5 + Math.random() * 0.5; // Simulate confidence
      
      if (Math.random() < 0.3) { // 30% chance to detect pattern
        patterns.push({
          pattern: patternName,
          confidence,
          threshold: config.threshold,
          timestamp: new Date(),
          frequencyBands: config
        });
      }
    });

    return patterns;
  }

  generateCodeOptimization(pattern) {
    const optimizations = {
      focus: [
        'Reduce code complexity - break down large functions',
        'Add more descriptive variable names for clarity',
        'Improve code structure with better abstractions'
      ],
      frustration: [
        'Simplify current logic flow',
        'Add error handling to reduce debugging stress',
        'Break problem into smaller, manageable pieces',
        'Add console.log statements for visibility'
      ],
      flow: [
        'Maintain current coding pattern - you\'re in the zone!',
        'Consider refactoring similar patterns elsewhere',
        'Document this approach for future reference'
      ],
      creativity: [
        'Explore alternative implementation approaches',
        'Consider design patterns you haven\'t used recently',
        'Add innovative features or optimizations'
      ]
    };

    const suggestions = optimizations[pattern.pattern] || [];
    if (!suggestions.length) return null;

    return {
      patternDetected: pattern.pattern,
      confidence: pattern.confidence,
      optimizationType: 'cognitive_enhancement',
      suggestions: suggestions,
      priority: pattern.confidence > 0.8 ? 'high' : 'medium',
      timestamp: new Date()
    };
  }

  // === EMOTIONAL COMPILER ===

  updateEmotionalState(stressData) {
    this.stressLevel = stressData.stressLevel;
    
    // Determine emotional state
    if (this.stressLevel > 0.7) {
      this.emotionalState = 'high_stress';
    } else if (this.stressLevel > 0.5) {
      this.emotionalState = 'moderate_stress';
    } else if (this.stressLevel < 0.3) {
      this.emotionalState = 'relaxed';
    } else {
      this.emotionalState = 'focused';
    }
  }

  processEmotionalCompiler(stressData) {
    const compilerAction = this.determineCompilerAction(this.emotionalState, this.stressLevel);
    
    if (compilerAction && this.shouldTriggerCompiler()) {
      this.triggerEmotionalCompiler(compilerAction);
    }
  }

  determineCompilerAction(emotionalState, stressLevel) {
    const actions = {
      high_stress: {
        action: 'aggressive_refactoring',
        suggestions: [
          'Auto-simplify complex expressions',
          'Add calming comments and explanations',
          'Suggest taking a 5-minute break'
        ]
      },
      moderate_stress: {
        action: 'gentle_optimization',
        suggestions: [
          'Gentle refactoring suggestions',
          'Add helpful variable names',
          'Propose optional code improvements'
        ]
      },
      relaxed: {
        action: 'creative_enhancement',
        suggestions: [
          'Suggest creative enhancements',
          'Explore advanced patterns',
          'Propose innovative features'
        ]
      },
      focused: {
        action: 'maintain_flow',
        suggestions: [
          'Maintain current approach',
          'Document insights as you go',
          'Continue with current coding pattern'
        ]
      }
    };

    return actions[emotionalState];
  }

  shouldTriggerCompiler() {
    const now = new Date();
    const timeSinceLastOptimization = this.lastOptimization ? 
      now - this.lastOptimization : Infinity;
    
    // Trigger compiler at most every 30 seconds
    return timeSinceLastOptimization > 30000;
  }

  triggerEmotionalCompiler(compilerAction) {
    console.log(`🎭 Emotional Compiler: ${compilerAction.action}`);
    
    this.lastOptimization = new Date();
    
    // Dispatch event for IDE integration
    window.dispatchEvent(new CustomEvent('emotionalCompiler', {
      detail: {
        emotionalState: this.emotionalState,
        stressLevel: this.stressLevel,
        compilerAction: compilerAction,
        timestamp: new Date()
      }
    }));
  }

  triggerCodeOptimization(optimization) {
    console.log(`🧠 Code Optimization: ${optimization.patternDetected}`);
    
    // Dispatch event for IDE integration
    window.dispatchEvent(new CustomEvent('codeOptimization', {
      detail: optimization
    }));
  }

  // === HAPTIC FEEDBACK ===

  initializeHapticFeedback() {
    // Check for gamepad haptic support
    if ('getGamepads' in navigator) {
      this.hapticSupported = true;
      console.log('🎮 Haptic feedback initialized');
    } else if ('vibrate' in navigator) {
      this.hapticSupported = true;
      console.log('📱 Mobile vibration feedback initialized');
    } else {
      console.log('❌ Haptic feedback not supported');
      this.hapticSupported = false;
    }
  }

  async triggerHapticFeedback(feedbackType, intensity = 0.5, duration = 200) {
    if (!this.hapticSupported) return false;

    try {
      // Mobile vibration
      if ('vibrate' in navigator) {
        const vibrationPattern = this.getVibrationPattern(feedbackType, intensity, duration);
        navigator.vibrate(vibrationPattern);
        return true;
      }

      // Gamepad haptic
      const gamepads = navigator.getGamepads();
      for (const gamepad of gamepads) {
        if (gamepad && gamepad.vibrationActuator) {
          await gamepad.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: duration,
            weakMagnitude: intensity * 0.5,
            strongMagnitude: intensity
          });
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Haptic feedback failed:', error);
      return false;
    }
  }

  getVibrationPattern(feedbackType, intensity, baseDuration) {
    const patterns = {
      success: [baseDuration * intensity],
      error: [50, 50, 50],
      flow_state: [100, 50, 100, 50, 200],
      breakthrough: [200, 100, 100, 100, 300],
      focus_reminder: [baseDuration * 0.5]
    };

    return patterns[feedbackType] || [baseDuration];
  }

  // === REAL-TIME MONITORING ===

  startRealTimeMonitoring() {
    if (!this.activeSession) return;

    const monitoringInterval = setInterval(() => {
      if (!this.activeSession || !this.activeSession.connected) {
        clearInterval(monitoringInterval);
        return;
      }

      // Update signal quality (simulate fluctuation)
      this.activeSession.signalQuality = Math.max(0.3, 
        this.activeSession.signalQuality + (Math.random() - 0.5) * 0.1
      );

      // Dispatch monitoring event
      window.dispatchEvent(new CustomEvent('bciMonitoring', {
        detail: {
          sessionId: this.activeSession.sessionId,
          signalQuality: this.activeSession.signalQuality,
          emotionalState: this.emotionalState,
          stressLevel: this.stressLevel,
          patternsDetected: this.activeSession.patternsDetected.length,
          optimizationsGenerated: this.activeSession.optimizationsGenerated
        }
      }));

    }, 1000); // Update every second
  }

  // === UTILITY METHODS ===

  generateSessionId() {
    return 'bci_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  getSessionAnalytics() {
    if (!this.activeSession) return null;

    const sessionDuration = (new Date() - this.activeSession.startTime) / 1000;
    
    return {
      sessionId: this.activeSession.sessionId,
      deviceType: this.activeSession.deviceType,
      duration: sessionDuration,
      patternsDetected: this.activeSession.patternsDetected.length,
      optimizationsGenerated: this.activeSession.optimizationsGenerated,
      signalQuality: this.activeSession.signalQuality,
      emotionalState: this.emotionalState,
      stressLevel: this.stressLevel,
      efficiency: this.activeSession.optimizationsGenerated / Math.max(1, this.activeSession.patternsDetected.length)
    };
  }

  async disconnect() {
    if (!this.activeSession) return;

    console.log('🔌 Disconnecting BCI device...');

    // Stop webcam if active
    if (this.webcamActive && this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject;
      stream.getTracks().forEach(track => track.stop());
      this.webcamActive = false;
    }

    // Clear session
    const analytics = this.getSessionAnalytics();
    this.activeSession = null;

    return {
      success: true,
      message: 'BCI device disconnected',
      sessionAnalytics: analytics
    };
  }
}

// Export singleton instance
export default new BCIInterface();