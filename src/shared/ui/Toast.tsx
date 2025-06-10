import React, { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastMessage = {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

type ToastProps = {
  toast: ToastMessage
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, title, message, duration = 5000 } = toast

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getTypeStyles = (type: ToastType) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    }
    return styles[type]
  }

  const getIcon = (type: ToastType) => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    }
    return icons[type]
  }

  return (
    <div
      className={`
        relative flex items-start p-4 mb-3 border rounded-lg shadow-md
        animate-in slide-in-from-right-full duration-300
        ${getTypeStyles(type)}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        <span className="text-lg font-bold">{getIcon(type)}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{title}</h4>
        {message && (
          <p className="mt-1 text-sm opacity-90">{message}</p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-3 text-lg font-bold opacity-60 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

export default Toast