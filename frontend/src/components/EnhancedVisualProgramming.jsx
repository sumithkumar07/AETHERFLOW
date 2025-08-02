import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  CodeBracketIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowsPointingOutIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  LinkIcon,
  BoltIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import realTimeAPI from '../services/realTimeAPI'

const EnhancedVisualProgramming = ({ className = '' }) => {
  const [canvas, setCanvas] = useState({ nodes: [], connections: [], zoom: 1, offset: { x: 0, y: 0 } })
  const [selectedNode, setSelectedNode] = useState(null)
  const [dragState, setDragState] = useState({ isDragging: false, node: null, offset: { x: 0, y: 0 } })
  const [connectionState, setConnectionState] = useState({ isConnecting: false, from: null, to: null })
  const [componentLibrary, setComponentLibrary] = useState([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState({})
  const [codeGeneration, setCodeGeneration] = useState({ enabled: false, language: 'javascript' })
  const canvasRef = useRef(null)
  const nodeIdCounter = useRef(0)

  useEffect(() => {
    loadVisualProgrammingTools()
  }, [])

  const loadVisualProgrammingTools = async () => {
    try {
      const tools = await realTimeAPI.getVisualProgrammingTools()
      setComponentLibrary(tools.components?.library || defaultComponentLibrary)
      setCodeGeneration({ 
        enabled: tools.codeGeneration?.enabled || false, 
        language: tools.codeGeneration?.language || 'javascript' 
      })
    } catch (error) {
      console.error('Failed to load visual programming tools:', error)
      setComponentLibrary(defaultComponentLibrary)
    }
  }

  const defaultComponentLibrary = [
    {
      id: 'input',
      name: 'Input',
      category: 'Basic',
      icon: '📝',
      color: 'from-blue-500 to-cyan-600',
      inputs: [],
      outputs: ['value'],
      properties: { placeholder: 'Enter value...', type: 'text' }
    },
    {
      id: 'output',
      name: 'Output',
      category: 'Basic',
      icon: '📤',
      color: 'from-green-500 to-emerald-600',
      inputs: ['value'],
      outputs: [],
      properties: { format: 'text' }
    },
    {
      id: 'function',
      name: 'Function',
      category: 'Logic',
      icon: '⚙️',
      color: 'from-purple-500 to-pink-600',
      inputs: ['input1', 'input2'],
      outputs: ['result'],
      properties: { operation: 'add', customCode: '' }
    },
    {
      id: 'condition',
      name: 'Condition',
      category: 'Logic',
      icon: '🔀',
      color: 'from-orange-500 to-red-600',
      inputs: ['condition', 'trueValue', 'falseValue'],
      outputs: ['result'],
      properties: { operator: 'equals', value: '' }
    },
    {
      id: 'loop',
      name: 'Loop',
      category: 'Control',
      icon: '🔄',
      color: 'from-indigo-500 to-purple-600',
      inputs: ['array', 'item'],
      outputs: ['result'],
      properties: { type: 'forEach', limit: 100 }
    },
    {
      id: 'api',
      name: 'API Call',
      category: 'Network',
      icon: '🌐',
      color: 'from-cyan-500 to-blue-600',
      inputs: ['url', 'method', 'data'],
      outputs: ['response', 'error'],
      properties: { url: '', method: 'GET', headers: {} }
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      category: 'AI',
      icon: '🤖',
      color: 'from-violet-500 to-purple-600',
      inputs: ['prompt', 'context'],
      outputs: ['response'],
      properties: { model: 'codellama:13b', temperature: 0.7 }
    }
  ]

  const createNode = useCallback((componentType, position) => {
    const component = componentLibrary.find(c => c.id === componentType)
    if (!component) return

    const newNode = {
      id: `node_${++nodeIdCounter.current}`,
      type: componentType,
      component,
      position,
      properties: { ...component.properties },
      inputs: component.inputs.reduce((acc, input) => ({ ...acc, [input]: null }), {}),
      outputs: component.outputs.reduce((acc, output) => ({ ...acc, [output]: null }), {}),
      state: 'idle'
    }

    setCanvas(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }, [componentLibrary])

  const deleteNode = useCallback((nodeId) => {
    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.from.nodeId !== nodeId && c.to.nodeId !== nodeId)
    }))
    setSelectedNode(null)
  }, [])

  const updateNodeProperties = useCallback((nodeId, properties) => {
    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, properties: { ...node.properties, ...properties } } : node
      )
    }))
  }, [])

  const handleNodeDragStart = useCallback((e, node) => {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    setDragState({
      isDragging: true,
      node,
      offset: {
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      }
    })
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newPosition = {
      x: e.clientX - rect.left - dragState.offset.x,
      y: e.clientY - rect.top - dragState.offset.y
    }

    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === dragState.node.id ? { ...node, position: newPosition } : node
      )
    }))
  }, [dragState])

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, node: null, offset: { x: 0, y: 0 } })
  }, [])

  const startConnection = useCallback((nodeId, output) => {
    setConnectionState({
      isConnecting: true,
      from: { nodeId, output },
      to: null
    })
  }, [])

  const completeConnection = useCallback((nodeId, input) => {
    if (!connectionState.isConnecting || !connectionState.from) return

    const newConnection = {
      id: `conn_${Date.now()}`,
      from: connectionState.from,
      to: { nodeId, input }
    }

    setCanvas(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }))

    setConnectionState({ isConnecting: false, from: null, to: null })
  }, [connectionState])

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    setExecutionResults({})

    try {
      // Simulate workflow execution
      const results = {}
      
      for (const node of canvas.nodes) {
        // Update node state
        setCanvas(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, state: 'executing' } : n)
        }))

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Generate mock result based on node type
        let result = null
        switch (node.type) {
          case 'input':
            result = node.properties.placeholder || 'input value'
            break
          case 'function':
            result = `function(${node.properties.operation})`
            break
          case 'ai':
            result = await simulateAIResponse(node.inputs.prompt || 'Hello AI')
            break
          case 'api':
            result = { status: 200, data: 'API response' }
            break
          default:
            result = `${node.type} result`
        }

        results[node.id] = result

        // Update node state to completed
        setCanvas(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, state: 'completed' } : n)
        }))
      }

      setExecutionResults(results)
      
    } catch (error) {
      console.error('Workflow execution failed:', error)
    } finally {
      setIsExecuting(false)
      
      // Reset node states after 2 seconds
      setTimeout(() => {
        setCanvas(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => ({ ...n, state: 'idle' }))
        }))
      }, 2000)
    }
  }, [canvas.nodes])

  const simulateAIResponse = async (prompt) => {
    try {
      // In a real implementation, this would call the AI service
      return `AI response to: "${prompt}"`
    } catch (error) {
      return 'AI service unavailable'
    }
  }

  const generateCode = useCallback(async () => {
    if (!codeGeneration.enabled) return

    try {
      // Generate code based on the visual workflow
      const code = generateWorkflowCode(canvas.nodes, canvas.connections, codeGeneration.language)
      
      // Create downloadable file
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `workflow.${codeGeneration.language === 'javascript' ? 'js' : 'py'}`
      link.click()
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Code generation failed:', error)
    }
  }, [canvas, codeGeneration])

  const generateWorkflowCode = (nodes, connections, language) => {
    // Simplified code generation
    if (language === 'javascript') {
      return `// Generated workflow code
${nodes.map(node => `// ${node.component.name}: ${node.id}`).join('\n')}

// Workflow execution
async function executeWorkflow() {
${nodes.map(node => `    // Execute ${node.id}`).join('\n')}
}

executeWorkflow();`
    } else {
      return `# Generated workflow code
${nodes.map(node => `# ${node.component.name}: ${node.id}`).join('\n')}

# Workflow execution
def execute_workflow():
${nodes.map(node => `    # Execute ${node.id}`).join('\n')}

if __name__ == "__main__":
    execute_workflow()`
    }
  }

  const ComponentPalette = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Components</h3>
      
      {['Basic', 'Logic', 'Control', 'Network', 'AI'].map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category}</h4>
          <div className="space-y-2">
            {componentLibrary
              .filter(comp => comp.category === category)
              .map(component => (
                <motion.button
                  key={component.id}
                  onClick={() => createNode(component.id, { x: 100, y: 100 })}
                  className="w-full p-3 text-left bg-white/60 dark:bg-gray-700/60 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${component.color} flex items-center justify-center`}>
                      <span className="text-white text-sm">{component.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {component.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {component.inputs.length} in, {component.outputs.length} out
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
          </div>
        </div>
      ))}
    </motion.div>
  )

  const WorkflowNode = ({ node }) => {
    const isSelected = selectedNode?.id === node.id
    const isExecuting = node.state === 'executing'
    const isCompleted = node.state === 'completed'
    
    return (
      <motion.div
        className={`absolute bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl border-2 shadow-lg cursor-move select-none ${
          isSelected 
            ? 'border-blue-500 shadow-blue-500/25' 
            : isExecuting 
              ? 'border-yellow-500 shadow-yellow-500/25' 
              : isCompleted 
                ? 'border-green-500 shadow-green-500/25' 
                : 'border-gray-200/50 dark:border-gray-600/50'
        }`}
        style={{ left: node.position.x, top: node.position.y }}
        onMouseDown={(e) => handleNodeDragStart(e, node)}
        onClick={() => setSelectedNode(node)}
        animate={{
          scale: isSelected ? 1.05 : 1,
          boxShadow: isExecuting ? '0 0 20px rgba(251, 191, 36, 0.5)' : undefined
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-4 min-w-48">
          {/* Node Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${node.component.color} flex items-center justify-center`}>
                <span className="text-white text-xs">{node.component.icon}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {node.component.name}
              </span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-1">
              {isExecuting && <BoltIcon className="w-4 h-4 text-yellow-500 animate-pulse" />}
              {isCompleted && <SparklesIcon className="w-4 h-4 text-green-500" />}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNode(node.id)
                }}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Inputs */}
          {node.component.inputs.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inputs</div>
              {node.component.inputs.map((input, index) => (
                <div
                  key={input}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400">{input}</span>
                  <div
                    className="w-3 h-3 rounded-full bg-blue-500 cursor-pointer hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      completeConnection(node.id, input)
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Outputs */}
          {node.component.outputs.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outputs</div>
              {node.component.outputs.map((output, index) => (
                <div
                  key={output}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400">{output}</span>
                  <div
                    className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      startConnection(node.id, output)
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Execution Result */}
          {executionResults[node.id] && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
              <div className="font-medium text-gray-600 dark:text-gray-400">Result:</div>
              <div className="text-gray-800 dark:text-gray-200 truncate">
                {JSON.stringify(executionResults[node.id])}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const ConnectionLine = ({ connection }) => {
    const fromNode = canvas.nodes.find(n => n.id === connection.from.nodeId)
    const toNode = canvas.nodes.find(n => n.id === connection.to.nodeId)
    
    if (!fromNode || !toNode) return null

    // Calculate connection points (simplified)
    const fromX = fromNode.position.x + 192 // node width
    const fromY = fromNode.position.y + 50
    const toX = toNode.position.x
    const toY = toNode.position.y + 50

    return (
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#3B82F6"
        strokeWidth={2}
        strokeOpacity={0.8}
        markerEnd="url(#arrowhead)"
      />
    )
  }

  const PropertiesPanel = () => {
    if (!selectedNode) return null

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Properties</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Node ID
            </label>
            <input
              type="text"
              value={selectedNode.id}
              disabled
              className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
            />
          </div>

          {Object.entries(selectedNode.properties).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => updateNodeProperties(selectedNode.id, { [key]: e.target.value })}
                className="w-full p-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 ${className}`}>
      {/* Component Palette */}
      <ComponentPalette />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Visual Programming Studio
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={executeWorkflow}
                disabled={isExecuting || canvas.nodes.length === 0}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <StopIcon className="w-4 h-4" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    <span>Execute</span>
                  </>
                )}
              </button>
              
              {codeGeneration.enabled && (
                <button
                  onClick={generateCode}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <CodeBracketIcon className="w-4 h-4" />
                  <span>Generate Code</span>
                </button>
              )}
              
              <select
                value={codeGeneration.language}
                onChange={(e) => setCodeGeneration(prev => ({ ...prev, language: e.target.value }))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#3B82F6"
                />
              </marker>
            </defs>
            {canvas.connections.map(connection => (
              <ConnectionLine key={connection.id} connection={connection} />
            ))}
          </svg>

          {/* Workflow Nodes */}
          <AnimatePresence>
            {canvas.nodes.map(node => (
              <WorkflowNode key={node.id} node={node} />
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {canvas.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <CpuChipIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Start Building Your Workflow
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Drag components from the palette to create your visual program
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel />
    </div>
  )
}

export default EnhancedVisualProgramming