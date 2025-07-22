import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Search, X, Replace, MoreVertical, ChevronRight, ChevronDown,
  File, Folder, Check, AlertCircle, RotateCcw, Filter, History,
  CaseSensitive, Regex, WholeWord, Eye, Copy, Info
} from 'lucide-react';

const GlobalSearchInterface = ({ 
  isVisible, 
  onClose, 
  files = [], 
  currentProject,
  onReplaceInFile,
  onOpenFile 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [selectedResults, setSelectedResults] = useState(new Set());
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Search options
  const [options, setOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    includeFiles: '**/*',
    excludeFiles: 'node_modules/**,*.min.js,*.map'
  });

  const searchInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Simulate search across files
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = [];
      const searchRegex = new RegExp(
        options.regex ? searchQuery : escapeRegExp(searchQuery),
        `g${options.caseSensitive ? '' : 'i'}`
      );
      
      files.forEach(file => {
        if (file.type !== 'file') return;
        
        // Apply file filters
        if (!matchesGlob(file.name, options.includeFiles)) return;
        if (matchesGlob(file.name, options.excludeFiles)) return;
        
        const content = file.content || '';
        const lines = content.split('\n');
        const matches = [];
        
        lines.forEach((line, lineIndex) => {
          const lineMatches = [];
          let match;
          
          while ((match = searchRegex.exec(line)) !== null) {
            if (options.wholeWord) {
              const before = line[match.index - 1];
              const after = line[match.index + match[0].length];
              const isWordBoundary = (!before || /\W/.test(before)) && (!after || /\W/.test(after));
              if (!isWordBoundary) continue;
            }
            
            lineMatches.push({
              text: match[0],
              index: match.index,
              length: match[0].length
            });
          }
          
          if (lineMatches.length > 0) {
            matches.push({
              lineIndex,
              lineNumber: lineIndex + 1,
              lineText: line,
              matches: lineMatches
            });
          }
        });
        
        if (matches.length > 0) {
          results.push({
            file,
            matches,
            totalMatches: matches.reduce((sum, m) => sum + m.matches.length, 0)
          });
        }
      });
      
      setSearchResults(results);
      
      // Add to search history
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== searchQuery);
        return [searchQuery, ...filtered].slice(0, 10);
      });
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, options, files]);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const matchesGlob = (filename, pattern) => {
    if (!pattern) return true;
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filename);
  };

  const handleReplace = useCallback(async (target, replaceText = replaceQuery) => {
    setIsReplacing(true);
    
    try {
      if (target.type === 'all') {
        // Replace all
        for (const result of searchResults) {
          await onReplaceInFile?.(result.file, searchQuery, replaceText, options);
        }
      } else if (target.type === 'file') {
        // Replace in specific file
        await onReplaceInFile?.(target.file, searchQuery, replaceText, options);
      } else if (target.type === 'match') {
        // Replace specific match
        await onReplaceInFile?.(target.file, searchQuery, replaceText, {
          ...options,
          lineNumber: target.lineNumber,
          matchIndex: target.matchIndex
        });
      }
      
      // Refresh search results
      await performSearch();
      
    } catch (error) {
      console.error('Replace error:', error);
    } finally {
      setIsReplacing(false);
    }
  }, [searchResults, searchQuery, replaceQuery, options, onReplaceInFile, performSearch]);

  const toggleFileExpansion = useCallback((fileId) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [performSearch, onClose]);

  const totalMatches = searchResults.reduce((sum, result) => sum + result.totalMatches, 0);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-5xl h-[80vh] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Search size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {showReplace ? 'Find and Replace' : 'Global Search'}
            </h2>
            {currentProject && (
              <span className="text-sm text-gray-400">in {currentProject.name}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="btn btn-ghost btn-sm"
              title="Toggle Replace Mode"
            >
              <Replace size={16} />
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-700">
          <div className="space-y-3">
            {/* Search Field */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search query..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 pr-32 focus:border-blue-500 focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={() => setOptions(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                  className={`p-1 rounded text-xs ${options.caseSensitive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  title="Case Sensitive"
                >
                  <CaseSensitive size={14} />
                </button>
                <button
                  onClick={() => setOptions(prev => ({ ...prev, wholeWord: !prev.wholeWord }))}
                  className={`p-1 rounded text-xs ${options.wholeWord ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  title="Whole Word"
                >
                  <WholeWord size={14} />
                </button>
                <button
                  onClick={() => setOptions(prev => ({ ...prev, regex: !prev.regex }))}
                  className={`p-1 rounded text-xs ${options.regex ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  title="Regular Expression"
                >
                  <Regex size={14} />
                </button>
              </div>
            </div>

            {/* Replace Field */}
            {showReplace && (
              <div className="relative">
                <input
                  ref={replaceInputRef}
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="Replace with..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={performSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="btn btn-primary btn-sm"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Search size={14} />
                  )}
                  Search
                </button>
                
                {showReplace && (
                  <button
                    onClick={() => handleReplace({ type: 'all' })}
                    disabled={!searchQuery.trim() || !replaceQuery.trim() || isReplacing || totalMatches === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    {isReplacing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Replace size={14} />
                    )}
                    Replace All ({totalMatches})
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                {searchResults.length > 0 && (
                  <span>
                    {totalMatches} matches in {searchResults.length} files
                  </span>
                )}
              </div>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="flex items-center space-x-2">
                <History size={14} className="text-gray-400" />
                <div className="flex space-x-1 overflow-x-auto">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(query)}
                      className="px-2 py-1 bg-slate-700 text-xs text-gray-300 rounded hover:bg-slate-600 whitespace-nowrap"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto">
          {searchResults.length > 0 ? (
            <div className="p-4">
              {searchResults.map((result, resultIndex) => (
                <div key={result.file.id} className="mb-4">
                  <div
                    className="flex items-center space-x-2 p-2 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50"
                    onClick={() => toggleFileExpansion(result.file.id)}
                  >
                    {expandedFiles.has(result.file.id) ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <File size={16} className="text-blue-400" />
                    <span className="font-medium text-white">{result.file.name}</span>
                    <span className="text-sm text-gray-400">
                      ({result.totalMatches} match{result.totalMatches !== 1 ? 'es' : ''})
                    </span>
                    
                    {showReplace && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplace({ type: 'file', file: result.file });
                        }}
                        className="ml-auto btn btn-ghost btn-xs"
                        disabled={isReplacing}
                        title="Replace in this file"
                      >
                        <Replace size={12} />
                      </button>
                    )}
                  </div>

                  {expandedFiles.has(result.file.id) && (
                    <div className="mt-2 ml-6 space-y-1">
                      {result.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="p-2 bg-slate-800/50 rounded border-l-4 border-blue-500/50 hover:bg-slate-800/70 cursor-pointer"
                          onClick={() => onOpenFile?.(result.file, match.lineNumber)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-400 mb-1">
                                Line {match.lineNumber}
                              </div>
                              <div className="text-sm font-mono text-white truncate">
                                {highlightMatches(match.lineText, match.matches, searchQuery)}
                              </div>
                            </div>
                            
                            {showReplace && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReplace({
                                      type: 'match',
                                      file: result.file,
                                      lineNumber: match.lineNumber,
                                      matchIndex
                                    });
                                  }}
                                  className="btn btn-ghost btn-xs"
                                  disabled={isReplacing}
                                  title="Replace this match"
                                >
                                  <Replace size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Search size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No results found</p>
              <p className="text-sm">Try adjusting your search query or options</p>
            </div>
          ) : !searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Search size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Enter a search query to begin</p>
              <p className="text-sm">Search across all files in your project</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-700/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Include: {options.includeFiles}</span>
              <span>Exclude: {options.excludeFiles}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Press Enter to search • Esc to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to highlight matches in text
const highlightMatches = (text, matches, searchQuery) => {
  if (!matches.length) return text;

  const parts = [];
  let lastIndex = 0;

  matches.forEach(match => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add highlighted match
    parts.push(
      <span key={match.index} className="bg-yellow-400/30 text-yellow-200 px-1 rounded">
        {text.slice(match.index, match.index + match.length)}
      </span>
    );
    
    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

export default GlobalSearchInterface;