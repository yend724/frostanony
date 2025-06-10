'use client'

import { EffectType, EffectStrength } from './image-effects'

type EffectControlsProps = {
  selectedEffect: EffectType
  selectedStrength: EffectStrength
  onEffectChange: (effect: EffectType) => void
  onStrengthChange: (strength: EffectStrength) => void
  disabled?: boolean
}

const strengthLabels: Record<EffectStrength, string> = {
  [EffectStrength.WEAK]: '弱い',
  [EffectStrength.LIGHT]: 'やや弱い',
  [EffectStrength.MEDIUM]: '中程度',
  [EffectStrength.STRONG]: 'やや強い',
  [EffectStrength.VERY_STRONG]: 'とても強い',
}

export const EffectControls: React.FC<EffectControlsProps> = ({
  selectedEffect,
  selectedStrength,
  onEffectChange,
  onStrengthChange,
  disabled = false,
}) => {
  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStrengthChange(Number(e.target.value) as EffectStrength)
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <p className="font-medium mb-3 text-gray-800 text-sm sm:text-base">エフェクトの種類</p>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:space-x-6 sm:gap-0">
          <label className="flex items-center justify-center text-gray-700 cursor-pointer p-3 sm:p-2 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-none transition-colors hover:bg-gray-100 sm:hover:bg-transparent touch-manipulation">
            <input
              type="radio"
              name="effect"
              value={EffectType.BLUR}
              checked={selectedEffect === EffectType.BLUR}
              onChange={() => onEffectChange(EffectType.BLUR)}
              disabled={disabled}
              className="mr-2 text-orange-500 focus:ring-orange-500 w-4 h-4 sm:w-auto sm:h-auto"
            />
            <span className="text-sm sm:text-base">🌫️ ぼかし</span>
          </label>
          <label className="flex items-center justify-center text-gray-700 cursor-pointer p-3 sm:p-2 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-none transition-colors hover:bg-gray-100 sm:hover:bg-transparent touch-manipulation">
            <input
              type="radio"
              name="effect"
              value={EffectType.MOSAIC}
              checked={selectedEffect === EffectType.MOSAIC}
              onChange={() => onEffectChange(EffectType.MOSAIC)}
              disabled={disabled}
              className="mr-2 text-orange-500 focus:ring-orange-500 w-4 h-4 sm:w-auto sm:h-auto"
            />
            <span className="text-sm sm:text-base">🧩 モザイク</span>
          </label>
        </div>
      </div>

      <div>
        <p className="font-medium mb-3 text-gray-800 text-sm sm:text-base">強度</p>
        <div className="px-2">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={selectedStrength}
            onChange={handleStrengthChange}
            disabled={disabled}
            className="w-full h-3 sm:h-auto accent-orange-500 cursor-pointer touch-manipulation bg-orange-100 rounded-lg appearance-none 
                     hover:accent-orange-600 focus:accent-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="強度"
            style={{ 
              touchAction: 'pan-x',
              background: `linear-gradient(to right, #fb923c 0%, #fb923c ${((selectedStrength - 1) / 4) * 100}%, #fed7aa ${((selectedStrength - 1) / 4) * 100}%, #fed7aa 100%)`
            }}
          />
          <div className="flex justify-between text-xs sm:text-sm text-gray-800 mt-2 font-medium">
            <span>弱</span>
            <span>強</span>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className="text-sm sm:text-base text-gray-600 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full font-medium">
            {strengthLabels[selectedStrength]}
          </span>
        </div>
      </div>
    </div>
  )
}