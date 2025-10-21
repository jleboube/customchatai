'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  key: string
  isActive: boolean
  createdAt: string
  lastUsed: string | null
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApiKeys()
    }
  }, [status])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'API Key' }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedKey(data.apiKey.key)
        setApiKeys([data.apiKey, ...apiKeys])
        setNewKeyName('')
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId))
      }
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const handleToggleActive = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setApiKeys(
          apiKeys.map((k) =>
            k.id === keyId ? { ...k, isActive: !isActive } : k
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle API key:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Keys
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create New Key
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Chat
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Key Modal */}
        {showNewKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Create API Key
              </h2>

              {createdKey ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your API key has been created. Copy it now - you won&apos;t be
                    able to see it again!
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-4 break-all">
                    <code className="text-sm text-gray-900 dark:text-white">
                      {createdKey}
                    </code>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(createdKey)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false)
                        setCreatedKey(null)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Key name (optional)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateKey}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false)
                        setNewKeyName('')
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your API Keys
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No API keys yet. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {key.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {key.key.slice(0, 20)}...
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            key.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {key.lastUsed
                          ? formatDate(key.lastUsed)
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleToggleActive(key.id, key.isActive)
                          }
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"
                        >
                          {key.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
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

        {/* Usage Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Usage Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                1. Iframe Embedding
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`<iframe
  src="${window.location.origin}/embed/chat?userKey=YOUR_API_KEY&theme=dark"
  width="400"
  height="600"
  frameborder="0">
</iframe>`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                2. JavaScript Widget
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`<script
  src="${window.location.origin}/widget.js"
  data-customchatai-key="YOUR_API_KEY"
  data-customchatai-theme="dark">
</script>`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                3. API Request
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST ${window.location.origin}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
