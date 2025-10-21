'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function APIDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Documentation
            </h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to the Home Chat Server API documentation. Our API provides programmatic access to chat with AI models, manage conversations, and integrate AI capabilities into your applications.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The API follows OpenAI-compatible standards, making it easy to switch between providers or use existing OpenAI client libraries.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Base URL
            </h3>
            <code className="text-sm text-blue-800 dark:text-blue-300">
              https://your-domain.com/api/v1
            </code>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All API requests require authentication using an API key. You can generate an API key from your dashboard under{' '}
            <Link href="/dashboard/keys" className="text-blue-600 hover:underline">
              API Keys
            </Link>
            .
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Include your API key in the Authorization header:
            </p>
            <div className="relative">
              <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`Authorization: Bearer YOUR_API_KEY`}</pre>
              <button
                onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
              >
                {copiedEndpoint === 'auth' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Security:</strong> Never share your API keys or commit them to version control. Treat them like passwords.
            </p>
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Rate Limiting
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            API requests are rate-limited to ensure fair usage. Rate limit information is included in response headers:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li><code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">X-RateLimit-Limit</code> - Maximum requests allowed per window</li>
            <li><code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">X-RateLimit-Remaining</code> - Requests remaining in current window</li>
          </ul>
        </section>

        {/* Endpoints */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Endpoints
          </h2>

          {/* List Models */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  List Models
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold rounded">
                    GET
                  </span>
                  <code className="text-sm text-gray-700 dark:text-gray-300">
                    /api/v1/models
                  </code>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Returns a list of available AI models that can be used for chat completions.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request Example
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`curl https://your-domain.com/api/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                  <button
                    onClick={() => copyToClipboard('curl https://your-domain.com/api/v1/models \\\n  -H "Authorization: Bearer YOUR_API_KEY"', 'models-req')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'models-req' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response Example
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`{
  "object": "list",
  "data": [
    {
      "id": "llama3.2:3b",
      "object": "model",
      "created": 1729536000,
      "owned_by": "ollama"
    },
    {
      "id": "phi3:latest",
      "object": "model",
      "created": 1729536100,
      "owned_by": "ollama"
    }
  ]
}`}</pre>
                  <button
                    onClick={() => copyToClipboard('{\n  "object": "list",\n  "data": [\n    {\n      "id": "llama3.2:3b",\n      "object": "model",\n      "created": 1729536000,\n      "owned_by": "ollama"\n    }\n  ]\n}', 'models-res')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'models-res' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Completions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Chat Completion
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold rounded">
                    POST
                  </span>
                  <code className="text-sm text-gray-700 dark:text-gray-300">
                    /api/v1/chat/completions
                  </code>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Creates a chat completion for the provided messages and model. Compatible with OpenAI&apos;s chat completions API.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request Body
                </h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-2 text-gray-700 dark:text-gray-300">Parameter</th>
                      <th className="text-left p-2 text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left p-2 text-gray-700 dark:text-gray-300">Required</th>
                      <th className="text-left p-2 text-gray-700 dark:text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr>
                      <td className="p-2 text-gray-900 dark:text-white font-mono">model</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">string</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">Yes</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">Model ID from /models</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-900 dark:text-white font-mono">messages</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">array</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">Yes</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">Array of message objects</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-gray-900 dark:text-white font-mono">stream</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">boolean</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">No</td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">Enable streaming responses</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Request Example
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`curl https://your-domain.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you?"
      }
    ]
  }'`}</pre>
                  <button
                    onClick={() => copyToClipboard('curl https://your-domain.com/api/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d \'{\n    "model": "llama3.2:3b",\n    "messages": [\n      {\n        "role": "user",\n        "content": "Hello! How are you?"\n      }\n    ]\n  }\'', 'chat-req')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'chat-req' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Response Example
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`{
  "id": "chatcmpl-1729536000000",
  "object": "chat.completion",
  "created": 1729536000,
  "model": "llama3.2:3b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}`}</pre>
                  <button
                    onClick={() => copyToClipboard('{\n  "id": "chatcmpl-1729536000000",\n  "object": "chat.completion",\n  "created": 1729536000,\n  "model": "llama3.2:3b",\n  "choices": [\n    {\n      "index": 0,\n      "message": {\n        "role": "assistant",\n        "content": "Hello! I\'m doing well!"\n      },\n      "finish_reason": "stop"\n    }\n  ]\n}', 'chat-res')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'chat-res' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Code Examples
            </h3>

            <div className="space-y-6">
              {/* Python Example */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Python (OpenAI Library)
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://your-domain.com/api/v1"
)

response = client.chat.completions.create(
    model="llama3.2:3b",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`}</pre>
                  <button
                    onClick={() => copyToClipboard('from openai import OpenAI\n\nclient = OpenAI(\n    api_key="YOUR_API_KEY",\n    base_url="https://your-domain.com/api/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="llama3.2:3b",\n    messages=[\n        {"role": "user", "content": "Hello!"}\n    ]\n)\n\nprint(response.choices[0].message.content)', 'python')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'python' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Node.js Example */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Node.js
                </h4>
                <div className="relative">
                  <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`const response = await fetch('https://your-domain.com/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'llama3.2:3b',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}</pre>
                  <button
                    onClick={() => copyToClipboard('const response = await fetch(\'https://your-domain.com/api/v1/chat/completions\', {\n  method: \'POST\',\n  headers: {\n    \'Content-Type\': \'application/json\',\n    \'Authorization\': \'Bearer YOUR_API_KEY\'\n  },\n  body: JSON.stringify({\n    model: \'llama3.2:3b\',\n    messages: [\n      { role: \'user\', content: \'Hello!\' }\n    ]\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.choices[0].message.content);', 'nodejs')}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                  >
                    {copiedEndpoint === 'nodejs' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Responses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Error Responses
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The API uses standard HTTP status codes to indicate success or failure.
            </p>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Status Code</th>
                  <th className="text-left p-2 text-gray-700 dark:text-gray-300">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="p-2 text-gray-900 dark:text-white font-mono">200</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">Success</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-900 dark:text-white font-mono">400</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">Bad Request - Invalid parameters</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-900 dark:text-white font-mono">401</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">Unauthorized - Invalid or missing API key</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-900 dark:text-white font-mono">429</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">Too Many Requests - Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-900 dark:text-white font-mono">500</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">Internal Server Error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4">
            Getting Started
          </h3>
          <ol className="list-decimal list-inside text-blue-800 dark:text-blue-300 space-y-2">
            <li>
              <Link href="/dashboard/keys" className="underline hover:no-underline">
                Generate an API key
              </Link>
              {' '}from your dashboard
            </li>
            <li>Use the API key in your Authorization header</li>
            <li>Call the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/api/v1/models</code> endpoint to see available models</li>
            <li>Start making chat completion requests!</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
