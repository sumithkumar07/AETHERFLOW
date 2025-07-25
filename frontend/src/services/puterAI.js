/**
 * Puter.js AI Service - Unlimited Free AI for VibeCode IDE
 * 
 * This service provides all AI functionality using Puter.js:
 * - Real-time code completion
 * - AI code review & security analysis
 * - Smart debugging assistance
 * - Automated documentation generation
 * - Vulnerability scanning
 * - Code refactoring
 * - Natural language to code
 * - Advanced chat with context awareness
 */

class PuterAIService {
  constructor() {
    this.isInitialized = false;
    this.models = {
      codeCompletion: 'meta-llama/llama-4-maverick',
      codeGeneration: 'meta-llama/llama-4-maverick', 
      chat: 'meta-llama/llama-4-maverick',
      codeReview: 'meta-llama/llama-4-maverick',
      documentation: 'meta-llama/llama-4-maverick',
      security: 'meta-llama/llama-4-maverick',
      debugging: 'meta-llama/llama-4-maverick',
      refactoring: 'meta-llama/llama-4-maverick',
      // Fallback models for comparison/backup
      fallback: {
        codeCompletion: 'gpt-4o',
        codeGeneration: 'claude-3-5-sonnet-20241022', 
        chat: 'gpt-4o',
        codeReview: 'claude-3-5-sonnet-20241022',
        documentation: 'gpt-4o',
        security: 'claude-3-5-sonnet-20241022',
        debugging: 'gpt-4o',
        refactoring: 'claude-3-5-sonnet-20241022'
      }
    };
    this.currentModelSet = 'primary'; // 'primary' uses llama-4-maverick, 'fallback' uses gpt-4o/claude
    this.initializePuter();
  }

  async initializePuter() {
    try {
      // Wait for Puter.js to be loaded
      if (typeof window.puter === 'undefined') {
        await this.waitForPuter();
      }
      this.isInitialized = true;
      console.log('🚀 Puter.js AI Service initialized with unlimited free LLaMA-4-Maverick access!');
      console.log('💡 Primary model: meta-llama/llama-4-maverick (Free & Open Source)');
      console.log('🔄 Fallback models: GPT-4o & Claude 3.5 available if needed');
    } catch (error) {
      console.error('Failed to initialize Puter.js:', error);
      console.log('⚠️ Falling back to secondary models if needed');
    }
  }

  // Method to switch between model sets
  switchModelSet(modelSet = 'primary') {
    this.currentModelSet = modelSet;
    console.log(`🔄 Switched to ${modelSet} model set`);
    if (modelSet === 'primary') {
      console.log('Using meta-llama/llama-4-maverick for all AI tasks');
    } else {
      console.log('Using GPT-4o/Claude 3.5 fallback models');
    }
  }

  // Get current model for specific task
  getCurrentModel(task) {
    if (this.currentModelSet === 'fallback') {
      return this.models.fallback[task];
    }
    return this.models[task];
  }

  async waitForPuter() {
    return new Promise((resolve) => {
      const checkPuter = () => {
        if (window.puter && window.puter.ai) {
          resolve();
        } else {
          setTimeout(checkPuter, 100);
        }
      };
      checkPuter();
    });
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializePuter();
    }
  }

  /**
   * Real-time Code Completion (GitHub Copilot style)
   */
  async getCodeCompletion(code, language, position) {
    await this.ensureInitialized();
    
    try {
      const lines = code.split('\n');
      const currentLine = position.line || 0;
      const context = lines.slice(Math.max(0, currentLine - 5), currentLine + 1).join('\n');

      const prompt = `Complete this ${language} code with intelligent suggestions:

\`\`\`${language}
${context}
\`\`\`

Provide 3 different completion suggestions that would logically follow. Return only the code completions, one per line:`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('codeCompletion'),
        temperature: 0.3
      });

      const suggestions = response.split('\n')
        .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('//'))
        .slice(0, 3)
        .map((text, index) => ({
          text: text.trim(),
          type: 'code',
          confidence: 0.9 - (index * 0.1),
          source: 'puter-ai'
        }));

      return { suggestions };

    } catch (error) {
      console.error('Code completion error:', error);
      return { 
        suggestions: [], 
        error: 'Code completion temporarily unavailable'
      };
    }
  }

  /**
   * Comprehensive Code Review
   */
  async reviewCode(code, language, filename = null) {
    await this.ensureInitialized();

    try {
      const prompt = `Perform a comprehensive code review for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Analyze and provide JSON response with:
1. Security vulnerabilities
2. Performance issues
3. Code quality problems
4. Bug potential
5. Best practice violations

Return response in this JSON format:
{
  "overall_score": 85,
  "issues": [
    {
      "type": "security|performance|bug|style",
      "severity": "high|medium|low", 
      "message": "Detailed issue description",
      "line": null
    }
  ],
  "summary": "Overall assessment"
}`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('codeReview'),
        temperature: 0.2
      });

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch {
        // Fallback if not JSON
        const issues = this.parseCodeReviewText(response);
        return {
          issues,
          overall_score: this.calculateCodeScore(issues),
          summary: response.substring(0, 200) + '...'
        };
      }

    } catch (error) {
      console.error('Code review error:', error);
      return {
        issues: [],
        overall_score: 100,
        error: 'Code review temporarily unavailable'
      };
    }
  }

  /**
   * AI-Powered Debugging
   */
  async debugCode(code, errorMessage = null, language = 'javascript') {
    await this.ensureInitialized();

    try {
      const prompt = `Debug this ${language} code and provide solutions:

Code:
\`\`\`${language}
${code}
\`\`\`

${errorMessage ? `Error message: ${errorMessage}` : ''}

Provide:
1. Analysis of potential issues
2. Specific fixes with corrected code
3. Explanation of problems
4. Prevention tips

Format response as:
**Analysis:** 
[Your analysis here]

**Fixes:**
1. [Fix description]
\`\`\`${language}
[corrected code]
\`\`\`

**Prevention:**
[Prevention tips]`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('debugging'),
        temperature: 0.3
      });

      const fixes = this.extractCodeFixes(response, language);

      return {
        analysis: response,
        fixes,
        confidence: 0.85
      };

    } catch (error) {
      console.error('Debug error:', error);
      return {
        analysis: 'Debug analysis temporarily unavailable',
        fixes: [],
        error: error.message
      };
    }
  }

  /**
   * Generate Documentation
   */
  async generateDocumentation(code, language, functionName = null) {
    await this.ensureInitialized();

    try {
      const prompt = `Generate comprehensive documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Generate professional documentation including:
1. Function/class descriptions
2. Parameters with types
3. Return values
4. Usage examples
5. Important notes

Format as clean markdown:`;

      const documentation = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('documentation'),
        temperature: 0.2
      });

      return {
        documentation,
        format: 'markdown'
      };

    } catch (error) {
      console.error('Documentation error:', error);
      return {
        documentation: 'Documentation generation temporarily unavailable',
        error: error.message
      };
    }
  }

  /**
   * Security Vulnerability Scanning
   */
  async scanSecurity(code, language) {
    await this.ensureInitialized();

    try {
      const prompt = `Scan this ${language} code for security vulnerabilities:

\`\`\`${language}
${code}
\`\`\`

Identify:
1. SQL injection risks
2. XSS vulnerabilities  
3. Authentication issues
4. Input validation problems
5. Data exposure risks
6. Other security concerns

Return JSON format:
{
  "vulnerabilities": [
    {
      "type": "security_type",
      "description": "detailed description",
      "severity": "high|medium|low"
    }
  ],
  "risk_score": 25
}`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('security'),
        temperature: 0.1
      });

      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch {
        // Parse text response
        const vulnerabilities = this.parseSecurityIssues(response);
        return {
          vulnerabilities,
          risk_score: this.calculateRiskScore(vulnerabilities),
          analysis: response
        };
      }

    } catch (error) {
      console.error('Security scan error:', error);
      return {
        vulnerabilities: [],
        risk_score: 0,
        error: error.message
      };
    }
  }

  /**
   * Code Refactoring Suggestions
   */
  async refactorCode(code, language, focusArea = 'readability') {
    await this.ensureInitialized();

    try {
      const prompt = `Refactor this ${language} code focusing on ${focusArea}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Refactored code with improvements
2. Explanation of changes made
3. Benefits of refactoring
4. Trade-offs to consider

Format response with clear sections.`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('refactoring'),
        temperature: 0.3
      });

      const refactoredCode = this.extractRefactoredCode(response, language);

      return {
        refactored_code: refactoredCode,
        explanation: response,
        focus_area: focusArea
      };

    } catch (error) {
      console.error('Refactor error:', error);
      return {
        refactored_code: code,
        explanation: 'Refactoring temporarily unavailable',
        error: error.message
      };
    }
  }

  /**
   * Natural Language to Code
   */
  async naturalLanguageToCode(description, language, context = null) {
    await this.ensureInitialized();

    try {
      let contextInfo = '';
      if (context?.current_file) {
        contextInfo = `\n\nCurrent file context:\n\`\`\`${language}\n${context.current_file.substring(0, 500)}...\n\`\`\``;
      }

      const prompt = `Generate ${language} code based on this description:

**Description:** ${description}${contextInfo}

Requirements:
- Write clean, production-ready ${language} code
- Include error handling where appropriate
- Add helpful comments
- Follow ${language} best practices
- Make it functional and well-structured

Generate the complete code:`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('codeGeneration'),
        temperature: 0.4
      });

      // Extract code from response
      const codeBlocks = response.match(/```[\w]*\n([\s\S]*?)\n```/g);
      let generatedCode = response;
      
      if (codeBlocks && codeBlocks.length > 0) {
        generatedCode = codeBlocks[0].replace(/```[\w]*\n?|\n```/g, '').trim();
      }

      return {
        code: generatedCode,
        language,
        description
      };

    } catch (error) {
      console.error('Natural language to code error:', error);
      return {
        code: `// Error generating code: ${error.message}`,
        language,
        error: error.message
      };
    }
  }

  /**
   * Enhanced AI Chat with Context and Memory (Phase 3)
   */
  async chatWithAI(message, context = null) {
    await this.ensureInitialized();

    try {
      let contextInfo = '';
      if (context?.current_file) {
        contextInfo = `\n\nCurrent file context:\n\`\`\`\n${context.current_file.substring(0, 500)}...\n\`\`\``;
      }
      if (context?.recent_errors) {
        contextInfo += `\n\nRecent errors: ${context.recent_errors}`;
      }
      if (context?.project_structure) {
        contextInfo += `\n\nProject structure: ${context.project_structure}`;
      }
      if (context?.conversation_history) {
        contextInfo += `\n\nPrevious conversation: ${context.conversation_history.slice(-500)}`;
      }

      const systemPrompt = `You are an advanced programming assistant powered by meta-llama/llama-4-maverick. You have deep knowledge of multiple programming languages, frameworks, debugging, security, and modern development practices. 

Key capabilities:
- Contextual code generation based on entire project structure
- Advanced performance optimization analysis
- Multi-turn conversation with memory of previous interactions
- Real-time code completion and suggestions
- Comprehensive debugging and security analysis

Provide helpful, accurate, and practical responses with deep context awareness.${contextInfo}

User: ${message}`;

      const response = await window.puter.ai.chat(systemPrompt, {
        model: this.getCurrentModel('chat'),
        temperature: 0.7
      });

      return response;

    } catch (error) {
      console.error('AI chat error:', error);
      return `Sorry, I'm temporarily unavailable. Error: ${error.message}`;
    }
  }

  /**
   * Advanced Contextual Code Generation (Phase 3)
   */
  async generateContextualCode(description, language, projectContext = null) {
    await this.ensureInitialized();

    try {
      let contextInfo = '';
      if (projectContext?.current_file) {
        contextInfo = `\n\nCurrent file:\n\`\`\`${language}\n${projectContext.current_file.substring(0, 800)}\n\`\`\``;
      }
      if (projectContext?.related_files) {
        contextInfo += `\n\nRelated files structure:\n${projectContext.related_files}`;
      }
      if (projectContext?.dependencies) {
        contextInfo += `\n\nProject dependencies: ${projectContext.dependencies}`;
      }
      if (projectContext?.framework) {
        contextInfo += `\n\nFramework/Stack: ${projectContext.framework}`;
      }

      const prompt = `Generate ${language} code with full project context awareness:

**Task:** ${description}${contextInfo}

Requirements:
- Generate production-ready ${language} code
- Follow project patterns and conventions visible in context
- Include proper imports/dependencies based on project structure
- Add comprehensive error handling
- Include helpful comments explaining the logic
- Ensure compatibility with existing codebase
- Follow ${language} best practices and modern patterns
- Consider performance implications

Provide complete, contextually-aware code:`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('codeGeneration'),
        temperature: 0.4
      });

      // Extract code from response
      const codeBlocks = response.match(/```[\w]*\n([\s\S]*?)\n```/g);
      let generatedCode = response;
      
      if (codeBlocks && codeBlocks.length > 0) {
        generatedCode = codeBlocks[0].replace(/```[\w]*\n?|\n```/g, '').trim();
      }

      return {
        code: generatedCode,
        language,
        description,
        contextual: true,
        explanation: response
      };

    } catch (error) {
      console.error('Contextual code generation error:', error);
      return {
        code: `// Error generating contextual code: ${error.message}`,
        language,
        error: error.message
      };
    }
  }

  /**
   * Advanced Performance Optimization Analysis (Phase 3)
   */
  async analyzePerformance(code, language, analysisType = 'comprehensive') {
    await this.ensureInitialized();

    try {
      const prompt = `Perform comprehensive performance analysis for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Analysis Type: ${analysisType}

Provide detailed analysis including:

1. **Time Complexity Analysis**
   - Big O notation for all operations
   - Worst, average, and best case scenarios
   - Bottleneck identification

2. **Space Complexity Analysis**
   - Memory usage patterns
   - Memory leaks potential
   - Optimization opportunities

3. **Performance Bottlenecks**
   - Slow operations identification
   - Database query optimization
   - Algorithm inefficiencies
   - Resource-intensive operations

4. **Optimization Recommendations**
   - Specific code improvements
   - Algorithm replacements
   - Caching strategies
   - Parallel processing opportunities

5. **Benchmarking Suggestions**
   - Key metrics to measure
   - Performance testing strategies
   - Load testing considerations

Return detailed JSON analysis:
{
  "overall_score": 85,
  "time_complexity": "O(n²)",
  "space_complexity": "O(n)",
  "bottlenecks": [...],
  "optimizations": [...],
  "benchmark_suggestions": [...],
  "performance_improvements": [...]
}`;

      const response = await window.puter.ai.chat(prompt, {
        model: this.getCurrentModel('refactoring'),
        temperature: 0.2
      });

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch {
        // Fallback if not JSON
        return {
          analysis: response,
          overall_score: this.extractScoreFromText(response),
          type: analysisType,
          comprehensive: true
        };
      }

    } catch (error) {
      console.error('Performance analysis error:', error);
      return {
        analysis: 'Performance analysis temporarily unavailable',
        error: error.message,
        overall_score: 0
      };
    }
  }

  /**
   * Enhanced Multi-turn Conversation with Memory (Phase 3)
   */
  async continueConversation(message, conversationHistory = [], context = null) {
    await this.ensureInitialized();

    try {
      // Build conversation context from history
      let historyContext = '';
      if (conversationHistory.length > 0) {
        historyContext = '\n\nConversation History:\n';
        conversationHistory.slice(-5).forEach((turn, index) => {
          historyContext += `\nTurn ${index + 1}:\nUser: ${turn.user}\nAssistant: ${turn.assistant}\n`;
        });
      }

      let projectContext = '';
      if (context?.current_file) {
        projectContext = `\n\nCurrent File: ${context.current_file.name}\n\`\`\`\n${context.current_file.content.substring(0, 600)}...\n\`\`\``;
      }

      const systemPrompt = `You are an advanced AI programming assistant with conversation memory. You remember previous interactions and can build upon them contextually.

Key capabilities:
- Remember and reference previous parts of our conversation
- Build upon previous code suggestions and improvements
- Maintain context across multiple exchanges
- Provide evolving solutions based on conversation progression
- Learn from user feedback and preferences in this session

${historyContext}${projectContext}

Current user message: ${message}

Respond with context awareness of our previous conversation and current project state.`;

      const response = await window.puter.ai.chat(systemPrompt, {
        model: this.getCurrentModel('chat'),
        temperature: 0.6
      });

      return {
        response,
        context_used: true,
        conversation_turn: conversationHistory.length + 1,
        memory_items: this.extractMemoryItems(response)
      };

    } catch (error) {
      console.error('Multi-turn conversation error:', error);
      return {
        response: `Sorry, I'm having trouble with multi-turn conversation. Error: ${error.message}`,
        error: error.message
      };
    }
  }

  // Helper methods for parsing responses

  parseCodeReviewText(text) {
    const issues = [];
    const lines = text.split('\n');
    
    let currentIssue = null;
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.includes('security') || trimmed.includes('vulnerability')) {
        if (currentIssue) issues.push(currentIssue);
        currentIssue = { type: 'security', severity: 'high', message: line.trim() };
      } else if (trimmed.includes('performance') || trimmed.includes('slow')) {
        if (currentIssue) issues.push(currentIssue);
        currentIssue = { type: 'performance', severity: 'medium', message: line.trim() };
      } else if (trimmed.includes('bug') || trimmed.includes('error')) {
        if (currentIssue) issues.push(currentIssue);
        currentIssue = { type: 'bug', severity: 'high', message: line.trim() };
      } else if (currentIssue && line.trim()) {
        currentIssue.message += ' ' + line.trim();
      }
    }
    
    if (currentIssue) issues.push(currentIssue);
    return issues.slice(0, 10);
  }

  calculateCodeScore(issues) {
    if (!issues.length) return 95;
    
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'high') score -= 15;
      else if (issue.severity === 'medium') score -= 10;
      else score -= 5;
    }
    return Math.max(score, 0);
  }

  extractCodeFixes(text, language) {
    const fixes = [];
    const codeBlocks = text.match(/```[\w]*\n([\s\S]*?)\n```/g);
    
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const code = block.replace(/```[\w]*\n?|\n```/g, '').trim();
        fixes.push({
          description: `Fix #${index + 1}`,
          code,
          type: 'code_replacement'
        });
      });
    }
    
    return fixes;
  }

  parseSecurityIssues(text) {
    const vulnerabilities = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.includes('injection') || trimmed.includes('xss') || 
          trimmed.includes('security') || trimmed.includes('vulnerability')) {
        vulnerabilities.push({
          type: 'security',
          description: line.trim(),
          severity: trimmed.includes('critical') || trimmed.includes('high') ? 'high' : 'medium'
        });
      }
    }
    
    return vulnerabilities.slice(0, 5);
  }

  calculateRiskScore(vulnerabilities) {
    if (!vulnerabilities.length) return 0;
    
    let score = 0;
    for (const vuln of vulnerabilities) {
      if (vuln.severity === 'high') score += 25;
      else if (vuln.severity === 'medium') score += 15;
      else score += 10;
    }
    return Math.min(score, 100);
  }

  extractRefactoredCode(text, language) {
    const codeBlocks = text.match(/```[\w]*\n([\s\S]*?)\n```/g);
    
    if (codeBlocks && codeBlocks.length > 0) {
      return codeBlocks[0].replace(/```[\w]*\n?|\n```/g, '').trim();
    }
    
    return '';
  }

  // New helper methods for Phase 3 features
  extractScoreFromText(text) {
    const scoreMatch = text.match(/score[:\s]*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  }

  extractMemoryItems(response) {
    // Extract key concepts, variables, or important points for conversation memory
    const items = [];
    
    // Look for code blocks
    const codeBlocks = response.match(/```[\w]*\n([\s\S]*?)\n```/g);
    if (codeBlocks) {
      items.push({ type: 'code', content: codeBlocks[0] });
    }
    
    // Look for important concepts (words in bold or quotes)
    const concepts = response.match(/\*\*(.*?)\*\*/g);
    if (concepts) {
      concepts.forEach(concept => {
        items.push({ type: 'concept', content: concept.replace(/\*\*/g, '') });
      });
    }
    
    return items.slice(0, 5); // Keep only top 5 memory items
  }
}

// Export singleton instance
export const puterAI = new PuterAIService();
export default puterAI;