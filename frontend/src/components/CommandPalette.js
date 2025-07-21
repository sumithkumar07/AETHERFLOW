import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Command, ChevronRight, Clock, Star, File, Folder,
  Terminal, Settings, GitBranch, Palette, Zap, Play, Bug,
  Upload, Download, Share2, Copy, Trash2, Edit
} from 'lucide-react';

const CommandPalette = ({ 
  isVisible, 
  onClose, 
  onCommand,
  recentCommands = [],
  currentProject = null,
  files = []
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [category, setCategory] = useState('all');

  // Command categories
  const commands = useMemo(() => ({
    file: [
      { id: 'file.new', label: 'New File', description: 'Create a new file', icon: File, shortcut: 'Ctrl+N' },
      { id: 'file.open', label: 'Open File', description: 'Open an existing file', icon: Folder, shortcut: 'Ctrl+O' },
      { id: 'file.save', label: 'Save File', description: 'Save current file', icon: Download, shortcut: 'Ctrl+S' },
      { id: 'file.saveAs', label: 'Save As...', description: 'Save file with new name', icon: Copy },
      { id: 'file.delete', label: 'Delete File', description: 'Delete current file', icon: Trash2 },
      { id: 'file.rename', label: 'Rename File', description: 'Rename current file', icon: Edit }
    ],
    edit: [
      { id: 'edit.copy', label: 'Copy', description: 'Copy selection', icon: Copy, shortcut: 'Ctrl+C' },
      { id: 'edit.paste', label: 'Paste', description: 'Paste from clipboard', icon: Upload, shortcut: 'Ctrl+V' },
      { id: 'edit.undo', label: 'Undo', description: 'Undo last action', icon: Clock, shortcut: 'Ctrl+Z' },
      { id: 'edit.find', label: 'Find in File', description: 'Search in current file', icon: Search, shortcut: 'Ctrl+F' },
      { id: 'edit.replace', label: 'Find and Replace', description: 'Find and replace text', icon: Edit, shortcut: 'Ctrl+H' }
    ],
    view: [
      { id: 'view.commandPalette', label: 'Command Palette', description: 'Open command palette', icon: Command, shortcut: 'Ctrl+Shift+P' },
      { id: 'view.quickOpen', label: 'Quick Open File', description: 'Quick file picker', icon: Search, shortcut: 'Ctrl+P' },
      { id: 'view.terminal', label: 'Toggle Terminal', description: 'Show/hide terminal', icon: Terminal, shortcut: 'Ctrl+`' },
      { id: 'view.sidebar', label: 'Toggle Sidebar', description: 'Show/hide sidebar', icon: Folder, shortcut: 'Ctrl+B' },
      { id: 'view.preview', label: 'Toggle Preview', description: 'Show/hide preview', icon: Play, shortcut: 'Ctrl+Shift+V' }
    ],
    git: [
      { id: 'git.status', label: 'Git Status', description: 'Show git status', icon: GitBranch },
      { id: 'git.commit', label: 'Commit Changes', description: 'Commit staged changes', icon: Upload },
      { id: 'git.push', label: 'Push', description: 'Push to remote', icon: Share2 },
      { id: 'git.pull', label: 'Pull', description: 'Pull from remote', icon: Download },
      { id: 'git.branch', label: 'Create Branch', description: 'Create new branch', icon: GitBranch }
    ],
    tools: [
      { id: 'tools.format', label: 'Format Document', description: 'Format current document', icon: Palette, shortcut: 'Shift+Alt+F' },
      { id: 'tools.lint', label: 'Lint File', description: 'Run linter on current file', icon: Bug },
      { id: 'tools.debug', label: 'Start Debugging', description: 'Start debug session', icon: Play, shortcut: 'F5' },
      { id: 'tools.settings', label: 'Open Settings', description: 'Open settings panel', icon: Settings, shortcut: 'Ctrl+,' },
      { id: 'tools.extensions', label: 'Manage Extensions', description: 'Open extensions panel', icon: Zap }
    ]
  }), []);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    const allCommands = category === 'all' 
      ? Object.values(commands).flat()
      : commands[category] || [];

    if (!query.trim()) {
      return allCommands.slice(0, 10);
    }

    return allCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, category, query]);

  // Add recent files to commands if in file mode
  const allItems = useMemo(() => {
    const items = [...filteredCommands];
    
    if ((category === 'all' || category === 'file') && query.trim()) {
      const matchingFiles = files
        .filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(file => ({
          id: `file.open.${file.id}`,
          label: file.name,
          description: `Open ${file.name}`,
          icon: File,
          type: 'file',
          file
        }));
      items.unshift(...matchingFiles);
    }

    return items;
  }, [filteredCommands, files, category, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allItems[selectedIndex]) {
            handleCommand(allItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, allItems, onClose]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems]);

  const handleCommand = useCallback((command) => {
    onCommand(command);
    onClose();
  }, [onCommand, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-slate-700">
          <Command size={20} className="text-blue-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-400"
            autoFocus
          />
          <div className="text-xs text-gray-500 ml-4">
            {allItems.length} results
          </div>
        </div>

        {/* Categories */}
        <div className="flex border-b border-slate-700 bg-slate-700/30">
          {[
            { id: 'all', label: 'All' },
            { id: 'file', label: 'File' },
            { id: 'edit', label: 'Edit' },
            { id: 'view', label: 'View' },
            { id: 'git', label: 'Git' },
            { id: 'tools', label: 'Tools' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                category === id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {allItems.length > 0 ? (
            allItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={item.id}
                  className={`flex items-center p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 border-l-4 border-blue-500'
                      : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleCommand(item)}
                >
                  <Icon size={16} className={`mr-3 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <ChevronRight size={16} className="text-blue-400 ml-2" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-700 bg-slate-700/30 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          {currentProject && (
            <div className="flex items-center space-x-1">
              <Folder size={12} />
              <span>{currentProject.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;