import React, { useState, useEffect } from 'react';
import { Play, Code, Sparkles, Zap } from 'lucide-react';

const LiveCodeDemo = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const demos = [
    {
      title: 'AI-Powered Code Generation',
      language: 'javascript',
      prompt: 'Create a responsive navbar component',
      code: `// AI Generated Component
const Navbar = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="hidden md:flex space-x-8">
            {items.map(item => (
              <NavItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};`,
      output: 'Professional responsive navbar component generated with TypeScript support and accessibility features.'
    },
    {
      title: 'Real-time Collaboration',
      language: 'python',
      prompt: 'Build a real-time chat API',
      code: `# AI Generated API
from fastapi import FastAPI, WebSocket
from typing import List

app = FastAPI()
active_connections: List[WebSocket] = []

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast to all connected clients
            for connection in active_connections:
                await connection.send_text(f"Client {client_id}: {data}")
    except:
        active_connections.remove(websocket)`,
      output: 'Real-time WebSocket API with FastAPI, supporting multiple concurrent connections and message broadcasting.'
    },
    {
      title: 'Quantum Debugging',
      language: 'typescript',
      prompt: 'Debug across parallel realities',
      code: `// Quantum Reality Debugger
interface QuantumState {
  reality: string;
  variables: Record<string, any>;
  errors: Error[];
}

class QuantumDebugger {
  private realities: Map<string, QuantumState> = new Map();
  
  async debugAcrossRealities(code: string): Promise<QuantumState[]> {
    const realities = ['prime', 'beta', 'gamma'];
    const results = await Promise.all(
      realities.map(async (reality) => {
        try {
          const result = await this.executeInReality(code, reality);
          return { reality, variables: result, errors: [] };
        } catch (error) {
          return { reality, variables: {}, errors: [error] };
        }
      })
    );
    
    return results;
  }
}`,
      output: 'Quantum debugging system that tests code across multiple parallel execution contexts, identifying reality-specific bugs.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [demos.length]);

  const runDemo = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const currentDemo = demos[activeDemo];

  return (
    <div className="live-code-demo">
      <div className="demo-header">
        <div className="demo-tabs">
          {demos.map((demo, index) => (
            <button
              key={index}
              onClick={() => setActiveDemo(index)}
              className={`demo-tab ${index === activeDemo ? 'active' : ''}`}
            >
              <Code className="w-4 h-4" />
              {demo.title}
            </button>
          ))}
        </div>
        <button 
          onClick={runDemo}
          className={`run-btn ${isRunning ? 'running' : ''}`}
          disabled={isRunning}
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Demo'}
        </button>
      </div>

      <div className="demo-content">
        <div className="demo-input">
          <div className="input-header">
            <Sparkles className="w-4 h-4" />
            <span>AI Prompt</span>
          </div>
          <div className="prompt-text">
            "{currentDemo.prompt}"
          </div>
        </div>

        <div className="demo-code">
          <div className="code-header">
            <Zap className="w-4 h-4" />
            <span>{currentDemo.language.toUpperCase()}</span>
          </div>
          <pre className="code-content">
            <code className={`language-${currentDemo.language}`}>
              {currentDemo.code}
            </code>
          </pre>
        </div>

        <div className="demo-output">
          <div className="output-header">
            <div className="status-indicator running" />
            <span>Output</span>
          </div>
          <div className="output-content">
            {currentDemo.output}
          </div>
        </div>
      </div>

      <div className="demo-metrics">
        <div className="metric">
          <span className="metric-value">2.3s</span>
          <span className="metric-label">Generation Time</span>
        </div>
        <div className="metric">
          <span className="metric-value">99.8%</span>
          <span className="metric-label">Accuracy</span>
        </div>
        <div className="metric">
          <span className="metric-value">0</span>
          <span className="metric-label">Errors</span>
        </div>
      </div>
    </div>
  );
};

export default LiveCodeDemo;