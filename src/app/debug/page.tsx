'use client'

import { useState, useEffect } from 'react'
import { useFaceDetection } from '@/features/face-detection'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const {
    isInitialized,
    error,
    initialize,
  } = useFaceDetection()

  // カスタムコンソールログキャプチャ
  useEffect(() => {
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`])
      originalLog(...args)
    }

    console.warn = (...args) => {
      setLogs(prev => [...prev, `[WARN] ${args.join(' ')}`])
      originalWarn(...args)
    }

    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`])
      originalError(...args)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  const handleInitialize = async () => {
    setLogs(prev => [...prev, '[DEBUG] Starting face detection initialization...'])
    try {
      await initialize()
      setLogs(prev => [...prev, '[DEBUG] Face detection initialization completed'])
    } catch (err) {
      setLogs(prev => [...prev, `[DEBUG] Face detection initialization failed: ${err}`])
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Face Detection Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Initialized:</span> {isInitialized ? 'Yes' : 'No'}</p>
            <p className={`font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
              <span className="font-medium">Error:</span> {error || 'None'}
            </p>
          </div>
          
          <div className="mt-4 space-x-4">
            <button
              onClick={handleInitialize}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Initialize Face Detection
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Browser Environment Info</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">User Agent:</span> {navigator.userAgent}</p>
            <p><span className="font-medium">WebGL Support:</span> {(() => {
              try {
                const canvas = document.createElement('canvas')
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
                return gl ? 'Yes' : 'No'
              } catch {
                return 'No'
              }
            })()}</p>
            <p><span className="font-medium">Hardware Concurrency:</span> {navigator.hardwareConcurrency}</p>
            <p><span className="font-medium">Memory:</span> {(navigator as any).deviceMemory || 'Unknown'} GB</p>
          </div>
        </div>
      </div>
    </div>
  )
}