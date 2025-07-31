import { create } from 'zustand'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  
  // Create project from template
  createProjectFromTemplate: async (templateId, projectData) => {
    set({ isLoading: true })
    
    try {
      // Simulate API call to create project from template
      const newProject = {
        id: Date.now().toString(),
        name: projectData.name,
        description: projectData.description,
        templateId: templateId,
        template: projectData.template,
        status: 'initializing',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Add project to store
      set(state => ({
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false
      }))
      
      // Simulate initialization process
      setTimeout(() => {
        get().updateProjectStatus(newProject.id, 'ready')
        get().initializeProjectFiles(newProject.id, projectData.template)
      }, 2000)
      
      return newProject
      
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  // Create new blank project
  createProject: async (projectData) => {
    set({ isLoading: true })
    
    try {
      const newProject = {
        id: Date.now().toString(),
        name: projectData.name,
        description: projectData.description,
        type: projectData.type || 'web-app',
        status: 'draft',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      set(state => ({
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false
      }))
      
      return newProject
      
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  // Update project status
  updateProjectStatus: (projectId, status) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, status, updatedAt: new Date().toISOString() }
          : project
      ),
      currentProject: state.currentProject?.id === projectId
        ? { ...state.currentProject, status, updatedAt: new Date().toISOString() }
        : state.currentProject
    }))
  },
  
  // Initialize project files from template
  initializeProjectFiles: (projectId, template) => {
    const templateFiles = get().generateTemplateFiles(template)
    
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, files: templateFiles, updatedAt: new Date().toISOString() }
          : project
      ),
      currentProject: state.currentProject?.id === projectId
        ? { ...state.currentProject, files: templateFiles, updatedAt: new Date().toISOString() }
        : state.currentProject
    }))
  },
  
  // Generate template files based on template type
  generateTemplateFiles: (template) => {
    const baseFiles = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: template.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          description: template.description,
          main: 'index.js',
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'react-scripts': '^5.0.1'
          }
        }, null, 2),
        language: 'json'
      },
      {
        path: 'README.md',
        content: `# ${template.name}\n\n${template.description}\n\n## Features\n\n${template.features.map(feature => `- ${feature}`).join('\n')}\n\n## Tech Stack\n\n${template.techStack.map(tech => `- ${tech}`).join('\n')}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\``,
        language: 'markdown'
      }
    ]
    
    // Add specific files based on template type
    switch (template.id) {
      case 'react-ecommerce':
        return [
          ...baseFiles,
          {
            path: 'src/App.js',
            content: `import React from 'react';\nimport { BrowserRouter as Router, Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport ProductList from './components/ProductList';\nimport Cart from './components/Cart';\nimport Checkout from './components/Checkout';\n\nfunction App() {\n  return (\n    <Router>\n      <div className="App">\n        <Header />\n        <Routes>\n          <Route path="/" element={<ProductList />} />\n          <Route path="/cart" element={<Cart />} />\n          <Route path="/checkout" element={<Checkout />} />\n        </Routes>\n      </div>\n    </Router>\n  );\n}\n\nexport default App;`,
            language: 'javascript'
          },
          {
            path: 'src/components/Header.js',
            content: `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nconst Header = () => {\n  return (\n    <header className="bg-blue-600 text-white p-4">\n      <div className="container mx-auto flex justify-between items-center">\n        <Link to="/" className="text-2xl font-bold">Store</Link>\n        <nav>\n          <Link to="/cart" className="hover:underline">Cart</Link>\n        </nav>\n      </div>\n    </header>\n  );\n};\n\nexport default Header;`,
            language: 'javascript'
          }
        ]
      
      case 'ai-chat-assistant':
        return [
          ...baseFiles,
          {
            path: 'src/App.js',
            content: `import React, { useState } from 'react';\nimport ChatInterface from './components/ChatInterface';\nimport ModelSelector from './components/ModelSelector';\n\nfunction App() {\n  const [selectedModel, setSelectedModel] = useState('gpt-4.1-nano');\n  \n  return (\n    <div className="App h-screen bg-gray-50">\n      <div className="container mx-auto h-full">\n        <ModelSelector \n          selectedModel={selectedModel} \n          onModelChange={setSelectedModel} \n        />\n        <ChatInterface model={selectedModel} />\n      </div>\n    </div>\n  );\n}\n\nexport default App;`,
            language: 'javascript'
          },
          {
            path: 'src/components/ChatInterface.js',
            content: `import React, { useState } from 'react';\n\nconst ChatInterface = ({ model }) => {\n  const [messages, setMessages] = useState([]);\n  const [input, setInput] = useState('');\n  const [isLoading, setIsLoading] = useState(false);\n  \n  const sendMessage = async () => {\n    if (!input.trim()) return;\n    \n    const userMessage = { role: 'user', content: input };\n    setMessages(prev => [...prev, userMessage]);\n    setInput('');\n    setIsLoading(true);\n    \n    try {\n      // Puter.js AI integration\n      const response = await window.puter.ai.chat(input, { model });\n      const aiMessage = { role: 'assistant', content: response.message.content };\n      setMessages(prev => [...prev, aiMessage]);\n    } catch (error) {\n      console.error('AI Error:', error);\n    }\n    \n    setIsLoading(false);\n  };\n  \n  return (\n    <div className="flex flex-col h-full">\n      <div className="flex-1 overflow-y-auto p-4">\n        {messages.map((message, index) => (\n          <div key={index} className={\`mb-4 \${message.role === 'user' ? 'text-right' : 'text-left'}\`}>\n            <div className={\`inline-block p-3 rounded-lg \${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'\`}>\n              {message.content}\n            </div>\n          </div>\n        ))}\n        {isLoading && <div className="text-center">AI is thinking...</div>}\n      </div>\n      <div className="p-4 border-t">\n        <div className="flex">\n          <input\n            type="text"\n            value={input}\n            onChange={(e) => setInput(e.target.value)}\n            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}\n            className="flex-1 border rounded-l-lg p-2"\n            placeholder="Type your message..."\n          />\n          <button\n            onClick={sendMessage}\n            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"\n          >\n            Send\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default ChatInterface;`,
            language: 'javascript'
          }
        ]
      
      default:
        return [
          ...baseFiles,
          {
            path: 'src/App.js',
            content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Welcome to ${template.name}</h1>\n        <p>${template.description}</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;`,
            language: 'javascript'
          }
        ]
    }
  },
  
  // Select project
  selectProject: (projectId) => {
    const project = get().projects.find(p => p.id === projectId)
    set({ currentProject: project })
  },
  
  // Update project file
  updateProjectFile: (projectId, filePath, content) => {
    set(state => {
      const updateFiles = (files) => {
        const existingFileIndex = files.findIndex(f => f.path === filePath)
        if (existingFileIndex >= 0) {
          files[existingFileIndex].content = content
        } else {
          files.push({ path: filePath, content, language: 'javascript' })
        }
        return [...files]
      }
      
      return {
        projects: state.projects.map(project =>
          project.id === projectId
            ? { ...project, files: updateFiles(project.files), updatedAt: new Date().toISOString() }
            : project
        ),
        currentProject: state.currentProject?.id === projectId
          ? { ...state.currentProject, files: updateFiles(state.currentProject.files), updatedAt: new Date().toISOString() }
          : state.currentProject
      }
    })
  },
  
  // Delete project
  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId),
      currentProject: state.currentProject?.id === projectId ? null : state.currentProject
    }))
  },
  
  // Deploy project
  deployProject: async (projectId) => {
    set({ isLoading: true })
    
    try {
      // Simulate deployment process
      get().updateProjectStatus(projectId, 'deploying')
      
      // Simulate deployment delay
      setTimeout(() => {
        get().updateProjectStatus(projectId, 'deployed')
        set({ isLoading: false })
      }, 3000)
      
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  }
}))