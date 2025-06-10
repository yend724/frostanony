'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

type ImageUploadProps = {
  onFileSelect: (file: File) => void
  isUploading?: boolean
  error?: string | null
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileSelect, 
  isUploading = false,
  error 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">
        📸 画像をアップロード
      </h2>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors touch-manipulation
          ${isDragOver 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-orange-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-700 font-medium text-sm sm:text-base">処理中...</p>
          </div>
        ) : (
          <div>
            <div className="mb-3 sm:mb-4">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-700 mb-2 font-medium text-sm sm:text-base">
              <span className="hidden sm:inline">ここに画像をドラッグ&ドロップ</span>
              <span className="sm:hidden">画像を選択してください</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 sm:block hidden">または</p>
            <button 
              type="button"
              className="px-4 sm:px-6 py-3 sm:py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 active:bg-orange-700 transition-colors text-sm sm:text-base font-medium touch-manipulation"
            >
              📁 ファイルを選択
            </button>
            <p className="text-xs sm:text-xs text-gray-600 mt-3 px-2">
              対応形式: JPEG, PNG, WebP (最大10MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload