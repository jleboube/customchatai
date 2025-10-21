'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Model {
  name: string
  size: number
  digest: string
  modified_at: string
}

const POPULAR_MODELS = [
  { name: 'llama3.2:3b', description: 'Llama 3.2 3B - Fast, efficient model (2GB)' },
  { name: 'llama3.2', description: 'Llama 3.2 8B - Balanced performance (4.7GB)' },
  { name: 'llama3.1', description: 'Llama 3.1 8B - Latest Llama model (4.7GB)' },
  { name: 'mistral', description: 'Mistral 7B - High quality responses (4.1GB)' },
  { name: 'codellama', description: 'Code Llama - Optimized for code (3.8GB)' },
  { name: 'phi3', description: 'Phi-3 Mini - Small but capable (2.3GB)' },
]

interface DownloadProgress {
  modelName: string
  status: string
  completed?: number
  total?: number
  percent?: number
}

export default function ModelsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [pulling, setPulling] = useState(false)
  const [customModelName, setCustomModelName] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchModels()
    }
  }, [status, session])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePullModel = async (modelName: string) => {
    setPulling(true)
    setMessage(null)
    setDownloadProgress({ modelName, status: 'starting', percent: 0 })

    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName }),
      })

      if (!response.ok) {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to pull model' })
        setDownloadProgress(null)
        setPulling(false)
        return
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const data = JSON.parse(line)

            // Update progress based on Ollama's response format
            if (data.status) {
              const progress: DownloadProgress = {
                modelName,
                status: data.status,
              }

              // Calculate percentage if we have completed and total
              if (data.completed && data.total) {
                progress.completed = data.completed
                progress.total = data.total
                progress.percent = Math.round((data.completed / data.total) * 100)
              }

              setDownloadProgress(progress)
            }
          } catch (e) {
            console.error('Error parsing progress:', e)
          }
        }
      }

      // Download complete
      setMessage({ type: 'success', text: `Model ${modelName} downloaded successfully!` })
      setCustomModelName('')
      setDownloadProgress(null)
      fetchModels()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to pull model' })
      console.error('Failed to pull model:', error)
      setDownloadProgress(null)
    } finally {
      setPulling(false)
    }
  }

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/models/${encodeURIComponent(modelName)}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchModels()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete model' })
      console.error('Failed to delete model:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Check if a model is installed (handles tags like :latest, :3b, etc.)
  const isModelInstalled = (modelName: string) => {
    return models.some((m) => {
      // Check exact match or match with tag (e.g., "phi3" matches "phi3:latest")
      return m.name === modelName || m.name.startsWith(`${modelName}:`)
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Model Management
            </h1>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Admin
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Chat
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Download Progress */}
        {downloadProgress && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Downloading {downloadProgress.modelName}
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-300">
                {downloadProgress.status}
              </span>
            </div>
            {downloadProgress.percent !== undefined && (
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2.5">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
            )}
            {downloadProgress.percent !== undefined && (
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                {downloadProgress.percent}%
                {downloadProgress.completed && downloadProgress.total && (
                  <span className="ml-2">
                    ({(downloadProgress.completed / (1024 * 1024 * 1024)).toFixed(2)} GB / {(downloadProgress.total / (1024 * 1024 * 1024)).toFixed(2)} GB)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pull Model Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Download Models
            </h2>
          </div>

          <div className="p-6">
            {/* Popular Models */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Popular Models
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {POPULAR_MODELS.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {model.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePullModel(model.name)}
                      disabled={
                        pulling ||
                        isModelInstalled(model.name)
                      }
                      className="ml-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isModelInstalled(model.name)
                        ? 'Installed'
                        : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Model */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Download Custom Model
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., llama3.2:1b or mistral:7b-instruct"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={pulling}
                />
                <button
                  onClick={() => handlePullModel(customModelName)}
                  disabled={pulling || !customModelName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {pulling ? 'Downloading...' : 'Download'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Find more models at{' '}
                <a
                  href="https://ollama.com/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ollama.com/library
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Installed Models */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Installed Models ({models.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {models.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      <p className="text-sm">No models installed yet.</p>
                      <p className="text-xs mt-1">
                        Download a model from the section above to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  models.map((model) => (
                    <tr key={model.name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatBytes(model.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(model.modified_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteModel(model.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Model Download Information
          </h3>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>
              • Model downloads can take several minutes depending on the model
              size and your internet connection
            </li>
            <li>
              • Downloaded models are stored persistently in the Docker volume
            </li>
            <li>
              • Users will only see installed models in the model selector
            </li>
            <li>
              • Refresh this page after downloading to see newly installed
              models
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
