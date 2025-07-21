import React, { useState, useEffect } from 'react';
import './App.css';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import AIChat from './components/AIChat';
import AppPreview from './components/AppPreview';
import ProjectManager from './components/ProjectManager';
import { Folder, MessageSquare, Settings, Play, Save, Eye, Code, Monitor, Bot } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentProject, setCurrentProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(true);
  const [layout, setLayout] = useState('code'); // 'code', 'split', 'preview'

  // Load projects on startup
  useEffect(() => {
    loadProjects();
  }, []);

  // Load files when project changes
  useEffect(() => {
    if (currentProject) {
      loadProjectFiles();
      setShowProjectManager(false);
    }
  }, [currentProject]);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadProjectFiles = async () => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`${API}/projects/${currentProject.id}/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const createProject = async (name, description) => {
    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const project = await response.json();
      setProjects([...projects, project]);
      setCurrentProject(project);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const openProject = (project) => {
    setCurrentProject(project);
    setCurrentFile(null);
  };

  const createFile = async (name, type, parentId = null) => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`${API}/projects/${currentProject.id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, parent_id: parentId, content: '' })
      });
      const file = await response.json();
      setFiles([...files, file]);
      if (type === 'file') {
        setCurrentFile(file);
      }
      return file;
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const openFile = async (file) => {
    if (file.type === 'file') {
      try {
        const response = await fetch(`${API}/files/${file.id}`);
        const fileData = await response.json();
        setCurrentFile(fileData);
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
  };

  const saveFile = async (content) => {
    if (!currentFile) return;
    
    try {
      await fetch(`${API}/files/${currentFile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      setCurrentFile({ ...currentFile, content });
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  if (showProjectManager) {
    return (
      <div className="min-h-screen bg-gray-900">
        <ProjectManager
          projects={projects}
          onCreateProject={createProject}
          onOpenProject={openProject}
          onClose={() => setShowProjectManager(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400">VibeCode</h1>
          <span className="text-sm text-gray-400">
            {currentProject ? currentProject.name : 'No project'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowProjectManager(true)}
            className="p-2 hover:bg-gray-700 rounded"
            title="Projects"
          >
            <Folder size={18} />
          </button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 hover:bg-gray-700 rounded ${showPreview ? 'text-green-400' : ''}`}
            title="Live Preview"
          >
            <Eye size={18} />
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 hover:bg-gray-700 rounded ${showChat ? 'text-purple-400' : ''}`}
            title="AI Assistant"
          >
            <Bot size={18} />
          </button>

          {/* Layout Toggle */}
          {showPreview && (
            <div className="flex bg-gray-700 rounded-lg p-1 ml-2">
              {[
                { id: 'code', label: 'Code', icon: Code },
                { id: 'split', label: 'Split', icon: Monitor },
                { id: 'preview', label: 'Preview', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setLayout(id)}
                  className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                    layout === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
          
          {currentFile && (
            <button 
              onClick={() => saveFile(currentFile.content)}
              className="p-2 hover:bg-gray-700 rounded text-green-400"
              title="Save File"
            >
              <Save size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-sm font-medium text-gray-300">Explorer</h2>
          </div>
          <div className="flex-1 overflow-auto">
            {currentProject && (
              <FileExplorer
                files={files}
                onCreateFile={createFile}
                onOpenFile={openFile}
                currentFile={currentFile}
              />
            )}
          </div>
        </div>

        {/* Editor and Preview Area */}
        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <div className="flex-1 flex">
              {/* Code Editor */}
              {(layout === 'code' || layout === 'split') && (
                <div className={layout === 'split' ? 'flex-1' : 'w-full'}>
                  <CodeEditor
                    file={currentFile}
                    onSave={saveFile}
                    onContentChange={(content) => 
                      setCurrentFile({ ...currentFile, content })
                    }
                  />
                </div>
              )}
              
              {/* Live Preview */}
              {showPreview && (layout === 'preview' || layout === 'split') && (
                <div className={layout === 'split' ? 'flex-1 border-l border-gray-700' : 'w-full'}>
                  <AppPreview
                    currentFile={currentFile}
                    files={files}
                    project={currentProject}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="text-6xl text-gray-600 mb-4">⚡</div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">Welcome to VibeCode</h2>
                <p className="text-gray-500 mb-4">
                  {currentProject 
                    ? 'Select a file from the explorer to start coding'
                    : 'Create or select a project to get started'
                  }
                </p>
                {currentProject && (
                  <div className="text-sm text-gray-600">
                    <p>✨ Features available:</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-center space-x-2">
                        <Bot size={16} className="text-purple-400" />
                        <span>meta-llama/llama-4-maverick AI Assistant</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Eye size={16} className="text-green-400" />
                        <span>Real-time Live Preview</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Code size={16} className="text-blue-400" />
                        <span>Advanced Code Completion</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <AIChat currentFile={currentFile} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;