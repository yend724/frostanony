'use client'

import Image from 'next/image'

type ImagePreviewProps = {
  imageUrl: string | null
  processedImageUrl?: string | null
  onClear?: () => void
  isProcessing?: boolean
  statusMessage?: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  processedImageUrl,
  onClear,
  isProcessing = false,
  statusMessage
}) => {
  const displayUrl = processedImageUrl || imageUrl

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">プレビュー</h2>
        {imageUrl && onClear && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-red-500 transition-colors font-medium"
          >
            クリア
          </button>
        )}
      </div>
      
      <div className="relative border-2 border-gray-200 rounded-lg h-96 overflow-hidden bg-gray-50">
        {displayUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={displayUrl}
              alt="プレビュー画像"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  <span className="text-sm text-gray-700 font-medium">処理中...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 font-medium">画像をアップロードしてください</p>
          </div>
        )}
      </div>
      
      {statusMessage && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">{statusMessage}</p>
        </div>
      )}
      
      <button 
        className={`
          w-full mt-4 py-2 rounded-md transition-colors
          ${processedImageUrl
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }
        `}
        disabled={!processedImageUrl}
      >
        ダウンロード
      </button>
    </div>
  )
}

export default ImagePreview