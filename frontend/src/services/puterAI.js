/**
 * Puter.js AI Service - Free Unlimited AI Access
 * Provides access to 400+ AI models without API keys
 */

class PuterAIService {
  constructor() {
    this.initialized = false;
    this.isAvailable = false;
    this.models = [
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        provider: 'OpenAI',
        description: 'FREE unlimited access to OpenAI GPT-4.1 Nano',
        capabilities: ['code', 'analysis', 'creative', 'voice', 'multimodal'],
        speed: 'fast',
        quality: 'highest',
        cost: 'FREE ✨',
        enhanced_2025: true,
        puter_model: 'gpt-4.1-nano'
      },
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        provider: 'Anthropic',
        description: 'FREE unlimited access to Anthropic Claude Sonnet 4',
        capabilities: ['code', 'analysis', 'reasoning', 'creative', 'voice'],
        speed: 'medium',
        quality: 'highest',
        cost: 'FREE ✨',
        enhanced_2025: true,
        puter_model: 'claude-sonnet-4'
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        description: 'FREE unlimited access to Google Gemini 2.5 Flash',
        capabilities: ['code', 'analysis', 'multimodal', 'voice', 'vision'],
        speed: 'fastest',
        quality: 'high',
        cost: 'FREE ✨',
        enhanced_2025: true,
        puter_model: 'google/gemini-2.5-flash'
      },
      {
        id: 'llama-3.2-90b',
        name: 'Llama 3.2 90B',
        provider: 'Meta',
        description: 'FREE unlimited access to Meta Llama 3.2 90B',
        capabilities: ['code', 'analysis', 'reasoning', 'open-source'],
        speed: 'medium',
        quality: 'high',
        cost: 'FREE ✨',
        enhanced_2025: true,
        puter_model: 'meta/llama-3.2-90b'
      }
    ];
  }

  async initialize() {
    try {
      // Check if Puter.js is loaded
      if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
        this.isAvailable = true;
        this.initialized = true;
        console.log('🎉 Puter.js AI Service initialized - FREE unlimited AI access available!');
        return true;
      } else {
        console.warn('⚠️ Puter.js not loaded - loading dynamically...');
        await this.loadPuterScript();
        return this.initialize(); // Retry after loading
      }
    } catch (error) {
      console.error('❌ Failed to initialize Puter.js AI Service:', error);
      this.isAvailable = false;
      return false;
    }
  }

  async loadPuterScript() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not in browser environment'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = () => {
        console.log('✅ Puter.js script loaded successfully');
        // Wait a bit for puter to initialize
        setTimeout(() => {
          if (window.puter && window.puter.ai) {
            this.isAvailable = true;
            resolve();
          } else {
            reject(new Error('Puter.js failed to initialize properly'));
          }
        }, 1000);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Puter.js script'));
      };
      document.head.appendChild(script);
    });
  }

  async chat(message, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Puter.js AI Service not available');
    }

    const {
      model = 'gpt-4.1-nano',
      temperature = 0.7,
      maxTokens = 4000,
      systemPrompt = '',
      context = []
    } = options;

    try {
      // Find the model configuration
      const modelConfig = this.models.find(m => m.id === model);
      const puterModel = modelConfig ? modelConfig.puter_model : 'gpt-4.1-nano';

      // Prepare messages
      let messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      // Add context
      if (context && context.length > 0) {
        messages = [...messages, ...context.slice(-5)]; // Last 5 messages
      }
      
      messages.push({ role: 'user', content: message });

      console.log('🚀 Sending message to Puter.js AI:', { model: puterModel, message: message.substring(0, 100) + '...' });

      // Call Puter.js AI
      const response = await window.puter.ai.chat(message, { 
        model: puterModel,
        temperature,
        max_tokens: maxTokens
      });

      let content = '';
      
      // Handle different response formats
      if (typeof response === 'string') {
        content = response;
      } else if (response && response.message) {
        if (typeof response.message === 'string') {
          content = response.message;
        } else if (response.message.content) {
          if (Array.isArray(response.message.content)) {
            content = response.message.content[0]?.text || response.message.content[0] || '';
          } else {
            content = response.message.content;
          }
        }
      } else if (response && response.content) {
        if (Array.isArray(response.content)) {
          content = response.content[0]?.text || response.content[0] || '';
        } else {
          content = response.content;
        }
      } else if (response && response.choices && response.choices[0]) {
        content = response.choices[0].message?.content || '';
      }

      console.log('✅ Received response from Puter.js AI:', content.substring(0, 100) + '...');

      return {
        response: content,
        model_used: puterModel,
        confidence: 0.98, // High confidence for real AI
        provider: 'puter-js-free',
        unlimited: true,
        cost: 'FREE',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Puter.js AI chat error:', error);
      throw new Error(`Puter.js AI error: ${error.message}`);
    }
  }

  getAvailableModels() {
    return this.models;
  }

  isModelAvailable(modelId) {
    return this.models.some(m => m.id === modelId);
  }

  getModelInfo(modelId) {
    return this.models.find(m => m.id === modelId);
  }

  async generateCode(requirements, language = 'python', options = {}) {
    const prompt = `Generate ${language} code for the following requirements: ${requirements}

Please provide:
1. Clean, well-commented code
2. Best practices for 2025
3. Error handling
4. Usage examples

Requirements: ${requirements}`;

    try {
      const result = await this.chat(prompt, {
        model: options.model || 'gpt-4.1-nano',
        systemPrompt: 'You are an expert software developer with knowledge of the latest 2025 programming practices and patterns.'
      });

      return {
        code: result.response,
        explanation: 'Code generated using FREE unlimited AI via Puter.js',
        model_used: result.model_used,
        provider: 'puter-js-free'
      };
    } catch (error) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  async analyzeCode(code, language = 'auto', options = {}) {
    const prompt = `Analyze this ${language} code and provide:
1. Code quality assessment
2. Potential improvements
3. Security considerations
4. Performance optimization suggestions
5. Best practices recommendations

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

    try {
      const result = await this.chat(prompt, {
        model: options.model || 'claude-sonnet-4',
        systemPrompt: 'You are an expert code reviewer with extensive knowledge of security, performance, and best practices.'
      });

      return {
        analysis: result.response,
        model_used: result.model_used,
        provider: 'puter-js-free'
      };
    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const puterAI = new PuterAIService();

export default puterAI;