import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, GitCommit, GitMerge, GitPullRequest, Plus, MoreVertical,
  Check, X, Clock, AlertCircle, Upload, Download, RefreshCw,
  FileText, FilePlus, FileMinus, FileX, ChevronRight, ChevronDown,
  User, Calendar, Hash, Tag, Eye, Edit, Trash2
} from 'lucide-react';

const GitIntegrationPanel = ({
  isVisible,
  onToggle,
  currentProject = null,
  onCommand
}) => {
  const [activeTab, setActiveTab] = useState('changes');
  const [changes, setChanges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(['staged', 'unstaged']));

  // Mock data - in real app this would come from git API
  useEffect(() => {
    if (currentProject) {
      setChanges([
        { 
          id: 1, 
          file: 'src/App.js', 
          status: 'modified', 
          staged: false,
          additions: 15,
          deletions: 3,
          preview: '+  const [newFeature, setNewFeature] = useState(false);'
        },
        { 
          id: 2, 
          file: 'src/components/FileExplorer.js', 
          status: 'modified', 
          staged: true,
          additions: 8,
          deletions: 2,
          preview: '+  // Enhanced file explorer functionality'
        },
        { 
          id: 3, 
          file: 'src/styles/global.css', 
          status: 'new', 
          staged: false,
          additions: 42,
          deletions: 0,
          preview: '+  /* Professional design system */'
        },
        { 
          id: 4, 
          file: 'README.md', 
          status: 'deleted', 
          staged: false,
          additions: 0,
          deletions: 25,
          preview: '-  # Old documentation'
        }
      ]);

      setBranches([
        { name: 'main', current: true, ahead: 0, behind: 0, lastCommit: '2 hours ago' },
        { name: 'feature/ui-redesign', current: false, ahead: 5, behind: 2, lastCommit: '1 day ago' },
        { name: 'hotfix/bug-fixes', current: false, ahead: 1, behind: 0, lastCommit: '3 days ago' },
        { name: 'dev', current: false, ahead: 12, behind: 8, lastCommit: '1 week ago' }
      ]);

      setCommits([
        {
          id: 'a1b2c3d',
          message: 'feat: implement professional UI redesign',
          author: 'You',
          date: '2 hours ago',
          hash: 'a1b2c3d4e5f',
          changes: { files: 8, additions: 156, deletions: 42 }
        },
        {
          id: 'b2c3d4e',
          message: 'fix: resolve file explorer navigation issues',
          author: 'You',
          date: '1 day ago',
          hash: 'b2c3d4e5f6a',
          changes: { files: 3, additions: 24, deletions: 18 }
        },
        {
          id: 'c3d4e5f',
          message: 'docs: update README with new features',
          author: 'Collaborator',
          date: '2 days ago',
          hash: 'c3d4e5f6a7b',
          changes: { files: 1, additions: 45, deletions: 12 }
        }
      ]);
    }
  }, [currentProject]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'modified': return <FileText size={14} className="text-yellow-400" />;
      case 'new': return <FilePlus size={14} className="text-green-400" />;
      case 'deleted': return <FileMinus size={14} className="text-red-400" />;
      case 'renamed': return <FileX size={14} className="text-blue-400" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'modified': return 'M';
      case 'new': return 'A';
      case 'deleted': return 'D';
      case 'renamed': return 'R';
      default: return '?';
    }
  };

  const handleStageFile = useCallback((fileId) => {
    setChanges(prev => prev.map(change => 
      change.id === fileId ? { ...change, staged: true } : change
    ));
  }, []);

  const handleUnstageFile = useCallback((fileId) => {
    setChanges(prev => prev.map(change => 
      change.id === fileId ? { ...change, staged: false } : change
    ));
  }, []);

  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim()) return;
    
    setIsLoading(true);
    
    // Simulate commit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCommit = {
      id: Math.random().toString(36).substr(2, 7),
      message: commitMessage,
      author: 'You',
      date: 'Just now',
      hash: Math.random().toString(36).substr(2, 11),
      changes: { 
        files: changes.filter(c => c.staged).length,
        additions: changes.filter(c => c.staged).reduce((sum, c) => sum + c.additions, 0),
        deletions: changes.filter(c => c.staged).reduce((sum, c) => sum + c.deletions, 0)
      }
    };
    
    setCommits(prev => [newCommit, ...prev]);
    setChanges(prev => prev.filter(c => !c.staged));
    setCommitMessage('');
    setIsLoading(false);
    
    if (onCommand) {
      onCommand({ type: 'git.commit', message: commitMessage });
    }
  }, [commitMessage, changes, onCommand]);

  const handleBranchSwitch = useCallback((branchName) => {
    setBranches(prev => prev.map(branch => ({
      ...branch,
      current: branch.name === branchName
    })));
    setCurrentBranch(branchName);
    
    if (onCommand) {
      onCommand({ type: 'git.checkout', branch: branchName });
    }
  }, [onCommand]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const stagedChanges = changes.filter(c => c.staged);
  const unstagedChanges = changes.filter(c => !c.staged);

  if (!isVisible) return null;

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col git-panel">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <GitBranch size={16} className="text-purple-400" />
          <span className="font-semibold">Source Control</span>
        </div>
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-sm"
        >
          <X size={16} />
        </button>
      </div>

      {/* Current Branch */}
      {currentProject && (
        <div className="p-3 border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch size={14} className="text-purple-400" />
              <span className="font-medium text-white">{currentBranch}</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="btn btn-ghost btn-sm"
                title="Refresh"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 1000);
                }}
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button className="btn btn-ghost btn-sm" title="More actions">
                <MoreVertical size={12} />
              </button>
            </div>
          </div>
          
          {/* Branch status */}
          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
            {branches.find(b => b.current)?.ahead > 0 && (
              <div className="flex items-center space-x-1">
                <Upload size={10} />
                <span>{branches.find(b => b.current)?.ahead} ahead</span>
              </div>
            )}
            {branches.find(b => b.current)?.behind > 0 && (
              <div className="flex items-center space-x-1">
                <Download size={10} />
                <span>{branches.find(b => b.current)?.behind} behind</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {[
          { id: 'changes', label: 'Changes', count: changes.length },
          { id: 'branches', label: 'Branches', count: branches.length },
          { id: 'history', label: 'History', count: commits.length }
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-white border-b-2 border-purple-500 bg-slate-700/30'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-slate-600 rounded-full text-xs">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'changes' && (
          <div className="p-4 space-y-4">
            {/* Commit Message */}
            {stagedChanges.length > 0 && (
              <div className="space-y-2">
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Enter commit message..."
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                  rows={3}
                />
                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || isLoading}
                  className="w-full btn btn-primary btn-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin mr-2" />
                      Committing...
                    </>
                  ) : (
                    <>
                      <GitCommit size={14} />
                      Commit ({stagedChanges.length} files)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Staged Changes */}
            {stagedChanges.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('staged')}
                  className="flex items-center justify-between w-full text-sm font-medium text-green-400 hover:text-green-300"
                >
                  <div className="flex items-center space-x-2">
                    {expandedSections.has('staged') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>Staged Changes ({stagedChanges.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stagedChanges.forEach(change => handleUnstageFile(change.id));
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Unstage All
                  </button>
                </button>
                
                {expandedSections.has('staged') && (
                  <div className="space-y-1 ml-4">
                    {stagedChanges.map((change) => (
                      <div key={change.id} className="group flex items-center justify-between p-2 rounded hover:bg-slate-700/50">
                        <div className="flex items-center space-x-2 min-w-0">
                          {getStatusIcon(change.status)}
                          <span className="text-sm text-white truncate">{change.file}</span>
                          <span className="text-xs text-green-400 font-mono">
                            {getStatusText(change.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleUnstageFile(change.id)}
                            className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white"
                            title="Unstage"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Unstaged Changes */}
            {unstagedChanges.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('unstaged')}
                  className="flex items-center justify-between w-full text-sm font-medium text-yellow-400 hover:text-yellow-300"
                >
                  <div className="flex items-center space-x-2">
                    {expandedSections.has('unstaged') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>Changes ({unstagedChanges.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unstagedChanges.forEach(change => handleStageFile(change.id));
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Stage All
                  </button>
                </button>
                
                {expandedSections.has('unstaged') && (
                  <div className="space-y-1 ml-4">
                    {unstagedChanges.map((change) => (
                      <div key={change.id} className="group flex items-center justify-between p-2 rounded hover:bg-slate-700/50">
                        <div className="flex items-center space-x-2 min-w-0">
                          {getStatusIcon(change.status)}
                          <span className="text-sm text-white truncate">{change.file}</span>
                          <span className="text-xs text-yellow-400 font-mono">
                            {getStatusText(change.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleStageFile(change.id)}
                            className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white"
                            title="Stage"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white"
                            title="View diff"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {changes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Check size={32} className="mx-auto mb-2 opacity-50" />
                <p>No changes</p>
                <p className="text-sm mt-1">Working tree clean</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-4">
            <div className="space-y-1">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    branch.current 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'hover:bg-slate-700/50'
                  }`}
                  onClick={() => !branch.current && handleBranchSwitch(branch.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GitBranch size={14} className={branch.current ? 'text-purple-400' : 'text-gray-400'} />
                      <span className={`font-medium ${branch.current ? 'text-white' : 'text-gray-300'}`}>
                        {branch.name}
                      </span>
                      {branch.current && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                          current
                        </span>
                      )}
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded">
                      <MoreVertical size={12} />
                    </button>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-3 text-xs text-gray-400">
                    <span>Updated {branch.lastCommit}</span>
                    {branch.ahead > 0 && <span className="text-green-400">{branch.ahead} ahead</span>}
                    {branch.behind > 0 && <span className="text-yellow-400">{branch.behind} behind</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 btn btn-secondary btn-sm">
              <Plus size={14} />
              Create Branch
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <div className="space-y-3">
              {commits.map((commit) => (
                <div key={commit.id} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white mb-1">{commit.message}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User size={10} />
                          <span>{commit.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={10} />
                          <span>{commit.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Hash size={10} />
                          <span className="font-mono">{commit.hash.slice(0, 7)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="text-gray-400">{commit.changes.files} files</span>
                        <span className="text-green-400">+{commit.changes.additions}</span>
                        <span className="text-red-400">-{commit.changes.deletions}</span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white">
                      <MoreVertical size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitIntegrationPanel;