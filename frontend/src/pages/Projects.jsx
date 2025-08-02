import React from 'react'
import AIProjectManager from '../components/AIProjectManager'

const Projects = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <AIProjectManager />
    </div>
  )
}

export default Projects
  }

  const handleDeployProject = async (projectId, projectName) => {
    try {
      await deployProject(projectId)
      toast.success(`${projectName} deployed successfully!`)
    } catch (error) {
      toast.error('Failed to deploy project')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Your Projects</h3>
          <p className="text-gray-600 mb-4">Please login to view and manage your projects</p>
          <Link to="/login" className="btn-primary">
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">
                Manage and deploy your AI-generated applications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/templates"
                className="btn-secondary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>From Template</span>
              </Link>
              <Link
                to="/chat"
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Project</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="deployed">Deployed</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filter'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'Start building your first AI-powered application'
                : 'Try adjusting your filters or create a new project'
              }
            </p>
            <div className="flex justify-center space-x-3">
              <Link to="/chat" className="btn-primary">
                Start with AI Chat
              </Link>
              <Link to="/templates" className="btn-secondary">
                Browse Templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const StatusIcon = statusConfig[project.status]?.icon || FolderIcon
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  {/* Project Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[project.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="w-3 h-3" />
                          <span className="capitalize">{project.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                      {project.template && (
                        <div className="flex items-center space-x-1">
                          <CodeBracketIcon className="w-4 h-4" />
                          <span>Template</span>
                        </div>
                      )}
                    </div>

                    {/* Tech Stack */}
                    {project.template?.techStack && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {project.template.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.template.techStack.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{project.template.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex-1 btn-primary text-center text-sm py-2 flex items-center justify-center space-x-1"
                        onClick={() => selectProject(project.id)}
                      >
                        <CodeBracketIcon className="w-4 h-4" />
                        <span>Open</span>
                      </Link>
                      
                      {project.status === 'ready' && (
                        <button
                          onClick={() => handleDeployProject(project.id, project.name)}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          title="Deploy"
                        >
                          <RocketLaunchIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects