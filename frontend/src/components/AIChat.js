import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Sparkles, Loader, Bug, FileText, Shield, Wrench, MessageSquare, Lightbulb } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIChat = ({ currentFile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [activeMode, setActiveMode] = useState('chat'); // chat, debug, document, security, refactor, nlp
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add enhanced welcome message
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: "🚀 **Advanced AI Coding Assistant Ready!**\n\nI can help you with:\n\n• 💬 **Smart Conversations** - Code questions & explanations\n• 🐛 **AI Debugging** - Find and fix errors automatically\n• 📚 **Auto Documentation** - Generate docs for your code\n• 🛡️ **Security Scanning** - Identify vulnerabilities\n• 🔧 **Code Refactoring** - Improve code quality\n• ✨ **Natural Language to Code** - Describe what you want, I'll code it!\n• ⚡ **Real-time Code Completion** - Smart suggestions as you type\n\nSwitch modes using the toolbar below. What would you like to work on?",
      timestamp: new Date()
    }]);
    
    // Load chat history
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API}/ai/chat/${sessionId}`);
      if (response.ok) {
        const history = await response.json();
        const formattedHistory = history.map(msg => [
          {
            id: `${msg.id}_user`,
            type: 'user',
            content: msg.message,
            timestamp: new Date(msg.timestamp)
          },
          {
            id: `${msg.id}_ai`,
            type: 'ai',
            content: msg.response,
            timestamp: new Date(msg.timestamp)
          }
        ]).flat();
        
        if (formattedHistory.length > 0) {
          setMessages(prev => [...prev, ...formattedHistory]);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = currentFile ? {
        current_file: `File: ${currentFile.name}\n\n${currentFile.content}`
      } : null;

      const response = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          context
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced AI Functions
  const debugCode = async () => {
    if (!currentFile?.content || isLoading) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: `Debug this ${getLanguageFromFilename(currentFile.name)} code`,
      timestamp: new Date(),
      mode: 'debug'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/ai/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          language: getLanguageFromFilename(currentFile.name),
          filename: currentFile.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: formatDebugResponse(data),
          timestamp: new Date(),
          mode: 'debug'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to debug code');
      }
    } catch (error) {
      console.error('Debug error:', error);
      addErrorMessage('Sorry, debugging service is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDocumentation = async () => {
    if (!currentFile?.content || isLoading) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: `Generate documentation for ${currentFile.name}`,
      timestamp: new Date(),
      mode: 'documentation'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/ai/documentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          language: getLanguageFromFilename(currentFile.name)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: `## 📚 Generated Documentation\n\n${data.documentation}`,
          timestamp: new Date(),
          mode: 'documentation'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to generate documentation');
      }
    } catch (error) {
      console.error('Documentation error:', error);
      addErrorMessage('Sorry, documentation service is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const scanSecurity = async () => {
    if (!currentFile?.content || isLoading) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: `Scan ${currentFile.name} for security vulnerabilities`,
      timestamp: new Date(),
      mode: 'security'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/ai/security-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          language: getLanguageFromFilename(currentFile.name),
          filename: currentFile.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: formatSecurityResponse(data),
          timestamp: new Date(),
          mode: 'security'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to scan security');
      }
    } catch (error) {
      console.error('Security scan error:', error);
      addErrorMessage('Sorry, security scanning service is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const refactorCode = async (focusArea = 'readability') => {
    if (!currentFile?.content || isLoading) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: `Refactor code for better ${focusArea}`,
      timestamp: new Date(),
      mode: 'refactor'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/ai/refactor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          language: getLanguageFromFilename(currentFile.name),
          focus_area: focusArea
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: formatRefactorResponse(data),
          timestamp: new Date(),
          mode: 'refactor'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to refactor code');
      }
    } catch (error) {
      console.error('Refactor error:', error);
      addErrorMessage('Sorry, code refactoring service is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const naturalLanguageToCode = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      mode: 'nlp'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = currentFile ? {
        current_file: currentFile.content,
        project_structure: currentFile.name
      } : null;

      const response = await fetch(`${API}/ai/natural-language-to-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: userMessage.content,
          language: currentFile ? getLanguageFromFilename(currentFile.name) : 'javascript',
          context
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: `## ✨ Generated Code\n\n\`\`\`${data.language}\n${data.code}\n\`\`\`\n\n*Generated from: "${data.description}"*`,
          timestamp: new Date(),
          mode: 'nlp'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to generate code from description');
      }
    } catch (error) {
      console.error('Natural language to code error:', error);
      addErrorMessage('Sorry, natural language to code service is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown'
    };
    return langMap[ext] || 'plaintext';
  };

  const formatDebugResponse = (data) => {
    let response = "## 🐛 Debug Analysis\n\n";
    if (data.analysis) {
      response += `**Analysis:**\n${data.analysis}\n\n`;
    }
    if (data.fixes && data.fixes.length > 0) {
      response += "**Suggested Fixes:**\n";
      data.fixes.forEach((fix, index) => {
        response += `\n${index + 1}. ${fix.description}\n\`\`\`\n${fix.code}\n\`\`\`\n`;
      });
    }
    return response;
  };

  const formatSecurityResponse = (data) => {
    let response = "## 🛡️ Security Analysis\n\n";
    if (data.risk_score !== undefined) {
      response += `**Risk Score:** ${data.risk_score}/100\n\n`;
    }
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
      response += "**Vulnerabilities Found:**\n";
      data.vulnerabilities.forEach((vuln, index) => {
        response += `\n${index + 1}. **${vuln.type}** (${vuln.severity})\n   ${vuln.description}\n`;
      });
    } else {
      response += "✅ No security vulnerabilities detected!";
    }
    return response;
  };

  const formatRefactorResponse = (data) => {
    let response = "## 🔧 Refactoring Suggestions\n\n";
    if (data.refactored_code) {
      response += `**Refactored Code:**\n\`\`\`\n${data.refactored_code}\n\`\`\`\n\n`;
    }
    if (data.explanation) {
      response += `**Explanation:**\n${data.explanation}`;
    }
    return response;
  };

  const addErrorMessage = (content) => {
    const errorMessage = {
      id: `error_${Date.now()}`,
      type: 'ai',
      content,
      timestamp: new Date(),
      isError: true
    };
    setMessages(prev => [...prev, errorMessage]);
  };
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      isCodeGen: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/ai/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: data.generated_code,
          timestamp: new Date(),
          isCodeGen: true
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "Sorry, I couldn't generate code right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    // Basic markdown-like formatting for code blocks
    if (content.includes('```')) {
      const parts = content.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-900 p-3 rounded mt-2 mb-2 text-sm overflow-x-auto">
              <code className="text-green-400">{part}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    
    // Format inline code
    return content.split('`').map((part, index) => {
      if (index % 2 === 1) {
        return (
          <code key={index} className="bg-gray-700 px-1 py-0.5 rounded text-sm text-green-400">
            {part}
          </code>
        );
      }
      return part;
    });
  };

  const quickPrompts = [
    "Explain this code",
    "Find bugs in my code",
    "Optimize this function",
    "Add error handling",
    "Write unit tests",
    "Convert to TypeScript"
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot size={18} className="text-purple-400" />
          <h3 className="font-medium text-white">AI Assistant</h3>
        </div>
        {currentFile && (
          <p className="text-xs text-gray-400 mt-1">
            Context: {currentFile.name}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-500 ml-2' 
                  : message.isError 
                    ? 'bg-red-500 mr-2'
                    : 'bg-purple-500 mr-2'
              }`}>
                {message.type === 'user' ? (
                  <User size={16} className="text-white" />
                ) : message.isCodeGen ? (
                  <Code size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              
              <div className={`rounded-lg px-3 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                    ? 'bg-red-900 text-red-100'
                    : 'bg-gray-700 text-gray-100'
              }`}>
                <div className="text-sm">
                  {typeof message.content === 'string' 
                    ? formatMessage(message.content)
                    : message.content
                  }
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
              <Loader size={16} className="animate-spin text-purple-400" />
              <span className="text-sm text-gray-300">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {currentFile && (
        <div className="px-3 py-2 border-t border-gray-700">
          <div className="flex flex-wrap gap-1">
            {quickPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about coding..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
              title="Send message"
            >
              <Send size={16} />
            </button>
            <button
              onClick={generateCode}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
              title="Generate code"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;