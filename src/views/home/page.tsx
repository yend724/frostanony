'use client'

import { useImageUpload, ImageUpload } from '@/features/image-upload'
import { ImagePreview } from '@/shared/ui'

const HomePage: React.FC = () => {
  const { 
    image, 
    imageUrl, 
    isUploading, 
    error, 
    handleFileSelect, 
    clearImage 
  } = useImageUpload()

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Frostanony
          </h1>
          <p className="text-lg text-gray-600">
            顔画像を自動で匿名化するプライバシー保護ツール
          </p>
        </header>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* アップロード・設定エリア */}
          <div className="space-y-6">
            <ImageUpload
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              error={error}
            />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">エフェクト設定</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2 text-gray-800">エフェクトの種類</p>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="effect" 
                        value="blur" 
                        defaultChecked 
                        className="mr-2 text-primary-500 focus:ring-primary-500"
                      />
                      ぼかし
                    </label>
                    <label className="flex items-center text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="effect" 
                        value="mosaic" 
                        className="mr-2 text-primary-500 focus:ring-primary-500"
                      />
                      モザイク
                    </label>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2 text-gray-800">強度</p>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    defaultValue="3" 
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-sm text-gray-800 mt-1 font-medium">
                    <span>弱</span>
                    <span>強</span>
                  </div>
                </div>
                
                <button 
                  className={`
                    w-full py-2 rounded-md transition-colors
                    ${image
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }
                  `}
                  disabled={!image}
                >
                  適用
                </button>
              </div>
            </div>
          </div>
          
          {/* プレビューエリア */}
          <ImagePreview
            imageUrl={imageUrl}
            onClear={clearImage}
          />
        </div>
      </div>
    </main>
  )
}

export default HomePage