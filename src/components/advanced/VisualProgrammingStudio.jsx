import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useEnterpriseStore } from '../../store/enterpriseStore'
import toast from 'react-hot-toast'

// Custom Node Types
const CustomNode = ({ id, data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [nodeData, setNodeData] = useState(data)

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg min-w-48 ${
      data.type === 'input' ? 'border-green-400' :
      data.type === 'output' ? 'border-red-400' :
      data.type === 'ai' ? 'border-purple-400' :
      'border-blue-400'
    }`}>
      {/* Node Header */}
      <div className={`px-3 py-2 rounded-t-lg text-white font-medium text-sm ${
        data.type === 'input' ? 'bg-green-500' :
        data.type === 'output' ? 'bg-red-500' :
        data.type === 'ai' ? 'bg-purple-500' :
        'bg-blue-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {data.icon && <data.icon className="w-4 h-4" />}
            <span>{data.label || 'Node'}</span>
          </div>
          {data.status && (
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'running' ? 'bg-green-300 animate-pulse' :
              data.status === 'error' ? 'bg-red-300' :
              'bg-gray-300'
            }`}></div>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={nodeData.description || ''}
            onChange={(e) => setNodeData({...nodeData, description: e.target.value})}
            onBlur={() => setIsEditing(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <div 
            className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {nodeData.description || 'Click to add description'}
          </div>
        )}

        {/* Node Properties */}
        {data.properties && (
          <div className="mt-2 space-y-1">
            {Object.entries(data.properties).map(([key, value]) => (
              <div key={key} className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        )}

        {/* Node Actions */}
        {data.actions && (
          <div className="mt-2 flex space-x-1">
            {data.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Connection Handles */}
      <div className="flex justify-between px-3 pb-2">
        {data.inputs && data.inputs.map((input, index) => (
          <div
            key={`input-${index}`}
            className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white cursor-pointer"
            title={input.label}
          />
        ))}
        {data.outputs && data.outputs.map((output, index) => (
          <div
            key={`output-${index}`}
            className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white cursor-pointer ml-auto"
            title={output.label}
          />
        ))}
      </div>
    </div>
  )
}

// Node Templates
const nodeTemplates = [
  {
    id: 'input',
    type: 'input',
    label: 'Data Input',
    icon: DocumentTextIcon,
    description: 'Input data source',
    properties: { format: 'JSON', source: 'API' },
    outputs: [{ label: 'data', type: 'object' }]
  },
  {
    id: 'ai_process',
    type: 'ai',
    label: 'AI Processor',
    icon: SparklesIcon,
    description: 'Process data with AI',
    properties: { model: 'CodeLlama 13B', task: 'analysis' },
    inputs: [{ label: 'data', type: 'object' }],
    outputs: [{ label: 'result', type: 'object' }]
  },
  {
    id: 'transform',
    type: 'process',
    label: 'Data Transform',
    icon: CogIcon,
    description: 'Transform data format',
    properties: { operation: 'map', format: 'JSON' },
    inputs: [{ label: 'input', type: 'object' }],
    outputs: [{ label: 'output', type: 'object' }]
  },
  {
    id: 'api_call',
    type: 'process',
    label: 'API Call',
    icon: CodeBracketIcon,
    description: 'Make HTTP API request',
    properties: { method: 'POST', endpoint: '/api/process' },
    inputs: [{ label: 'data', type: 'object' }],
    outputs: [{ label: 'response', type: 'object' }]
  },
  {
    id: 'output',
    type: 'output',
    label: 'Data Output',
    icon: CloudArrowUpIcon,
    description: 'Output processed data',
    properties: { destination: 'Database', format: 'JSON' },
    inputs: [{ label: 'data', type: 'object' }]
  }
]

const VisualProgrammingStudio = ({ projectId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLog, setExecutionLog] = useState([])
  const [showCode, setShowCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const reactFlowWrapper = useRef(null)
  const { trackEvent } = useEnterpriseStore()

  // Initialize with sample workflow
  useEffect(() => {
    const initialNodes = [
      {
        id: '1',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          ...nodeTemplates[0],
          actions: [
            { label: 'Configure', onClick: () => configureNode('1') },
            { label: 'Test', onClick: () => testNode('1') }
          ]
        }
      },
      {
        id: '2',
        type: 'default',
        position: { x: 400, y: 100 },
        data: {
          ...nodeTemplates[1],
          actions: [
            { label: 'Configure', onClick: () => configureNode('2') },
            { label: 'Train', onClick: () => trainAIModel('2') }
          ]
        }
      },
      {
        id: '3',
        type: 'default',
        position: { x: 700, y: 100 },
        data: {
          ...nodeTemplates[4],
          actions: [
            { label: 'Configure', onClick: () => configureNode('3') },
            { label: 'Deploy', onClick: () => deployOutput('3') }
          ]
        }
      }
    ]

    const initialEdges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3B82F6' }
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#8B5CF6' }
      }
    ]

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [])

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10B981' }
      }
      setEdges((eds) => addEdge(newEdge, eds))
      
      trackEvent('visual_programming_connection', { 
        source: params.source, 
        target: params.target 
      })
    },
    [setEdges, trackEvent]
  )

  const addNode = (template) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'default',
      position: { 
        x: Math.random() * 500 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        ...template,
        actions: [
          { label: 'Configure', onClick: () => configureNode(newNode.id) },
          { label: 'Remove', onClick: () => removeNode(newNode.id) }
        ]
      }
    }

    setNodes((nds) => nds.concat(newNode))
    setShowTemplates(false)
    
    toast.success(`Added ${template.label} node`, { icon: '🔧' })
  }

  const removeNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }

  const configureNode = (nodeId) => {
    toast.info(`Configuring node ${nodeId}`, { icon: '⚙️' })
    // This would open a configuration modal
  }

  const testNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId)
    toast.loading(`Testing ${node.data.label}...`, { duration: 2000 })
    
    // Simulate node test
    setTimeout(() => {
      toast.success(`${node.data.label} test passed!`, { icon: '✅' })
      
      // Update node status
      setNodes((nds) => nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, status: 'tested' } }
          : node
      ))
    }, 2000)
  }

  const trainAIModel = (nodeId) => {
    toast.loading('Training AI model...', { duration: 5000 })
    
    setNodes((nds) => nds.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, status: 'training' } }
        : node
    ))

    // Simulate AI model training
    setTimeout(() => {
      toast.success('AI model trained successfully!', { icon: '🧠' })
      
      setNodes((nds) => nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, status: 'trained', properties: { ...node.data.properties, accuracy: '94.2%' } } }
          : node
      ))
    }, 5000)
  }

  const deployOutput = (nodeId) => {
    toast.loading('Deploying output...', { duration: 3000 })
    
    setTimeout(() => {
      toast.success('Output deployed successfully!', { icon: '🚀' })
      
      setNodes((nds) => nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, status: 'deployed' } }
          : node
      ))
    }, 3000)
  }

  const executeWorkflow = async () => {
    setIsExecuting(true)
    setExecutionLog([])
    
    const logs = []
    
    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      
      logs.push({
        id: Date.now() + i,
        timestamp: new Date(),
        message: `Executing ${node.data.label}...`,
        type: 'info',
        nodeId: node.id
      })
      
      setExecutionLog([...logs])
      
      // Update node status to running
      setNodes((nds) => nds.map((n) => 
        n.id === node.id 
          ? { ...n, data: { ...n.data, status: 'running' } }
          : n
      ))
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Complete node execution
      logs.push({
        id: Date.now() + i + 1000,
        timestamp: new Date(),
        message: `${node.data.label} completed successfully`,
        type: 'success',
        nodeId: node.id
      })
      
      setExecutionLog([...logs])
      
      // Update node status to completed
      setNodes((nds) => nds.map((n) => 
        n.id === node.id 
          ? { ...n, data: { ...n.data, status: 'completed' } }
          : n
      ))
    }
    
    setIsExecuting(false)
    toast.success('Workflow executed successfully!', { icon: '🎉' })
    
    trackEvent('visual_programming_execution', { 
      nodeCount: nodes.length,
      edgeCount: edges.length,
      duration: nodes.length * 1500
    })
  }

  const generateCode = () => {
    const code = `
# Generated Code from Visual Programming Studio
import asyncio
import json
from datetime import datetime

class WorkflowEngine:
    def __init__(self):
        self.nodes = ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.data.type, label: n.data.label })), null, 8)}
        self.edges = ${JSON.stringify(edges.map(e => ({ from: e.source, to: e.target })), null, 8)}
    
    async def execute_workflow(self):
        """Execute the visual programming workflow"""
        print("🚀 Starting workflow execution...")
        
        for node in self.nodes:
            await self.execute_node(node)
        
        print("✅ Workflow completed successfully!")
    
    async def execute_node(self, node):
        """Execute a single node in the workflow"""
        print(f"⚙️  Executing {node['label']}...")
        
        if node['type'] == 'input':
            return await self.handle_input_node(node)
        elif node['type'] == 'ai':
            return await self.handle_ai_node(node)
        elif node['type'] == 'process':
            return await self.handle_process_node(node)
        elif node['type'] == 'output':
            return await self.handle_output_node(node)
    
    async def handle_input_node(self, node):
        # Input node implementation
        data = {"status": "input_processed", "timestamp": datetime.now().isoformat()}
        return data
    
    async def handle_ai_node(self, node):
        # AI processing node implementation
        print("🧠 Processing with AI...")
        await asyncio.sleep(1)  # Simulate AI processing
        return {"ai_result": "processed", "confidence": 0.95}
    
    async def handle_process_node(self, node):
        # Data processing node implementation
        print("🔄 Transforming data...")
        return {"transformed": True}
    
    async def handle_output_node(self, node):
        # Output node implementation
        print("💾 Saving output...")
        return {"saved": True}

# Run the workflow
if __name__ == "__main__":
    engine = WorkflowEngine()
    asyncio.run(engine.execute_workflow())
    `
    
    setGeneratedCode(code)
    setShowCode(true)
    
    trackEvent('visual_programming_code_generation', { 
      nodeCount: nodes.length,
      complexity: edges.length
    })
    
    toast.success('Code generated successfully!', { icon: '💻' })
  }

  const nodeTypes = {
    default: CustomNode
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <CodeBracketIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Visual Programming Studio
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Design and execute workflows visually
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Add Node Button */}
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Node</span>
            </button>

            {/* Generate Code Button */}
            <button
              onClick={generateCode}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CodeBracketIcon className="w-4 h-4" />
              <span>Generate Code</span>
            </button>

            {/* Execute Button */}
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              className="bg-gray-50 dark:bg-gray-900"
              attributionPosition="bottom-left"
            >
              <Background />
              <MiniMap 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                maskColor="rgba(0,0,0,0.1)"
              />
              <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
              
              {/* Custom Panel */}
              <Panel position="top-right" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Nodes: {nodes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">Edges: {edges.length}</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Execution Log Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Execution Log
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {executionLog.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No execution logs yet</p>
                <p className="text-sm">Run your workflow to see logs</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executionLog.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg text-sm ${
                      log.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                      log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                      'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className={`${
                          log.type === 'success' ? 'text-green-800 dark:text-green-200' :
                          log.type === 'error' ? 'text-red-800 dark:text-red-200' :
                          'text-blue-800 dark:text-blue-200'
                        }`}>
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Node
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodeTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addNode(template)}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-400 cursor-pointer transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          template.type === 'input' ? 'bg-green-100 dark:bg-green-900/20' :
                          template.type === 'output' ? 'bg-red-100 dark:bg-red-900/20' :
                          template.type === 'ai' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          'bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            template.type === 'input' ? 'text-green-600 dark:text-green-400' :
                            template.type === 'output' ? 'text-red-600 dark:text-red-400' :
                            template.type === 'ai' ? 'text-purple-600 dark:text-purple-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {template.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Template Properties */}
                      <div className="space-y-1">
                        {Object.entries(template.properties || {}).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>

                      {/* Input/Output Indicators */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-2">
                          {template.inputs && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              {template.inputs.length} input{template.inputs.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {template.outputs && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              {template.outputs.length} output{template.outputs.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <PlusIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Code Modal */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Generated Code
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode)
                      toast.success('Code copied to clipboard!', { icon: '📋' })
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => setShowCode(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VisualProgrammingStudio