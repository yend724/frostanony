import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast, { ToastMessage } from './Toast'

describe('Toast', () => {
  const mockOnClose = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const createToast = (overrides: Partial<ToastMessage> = {}): ToastMessage => ({
    id: 'test-toast',
    type: 'success',
    title: 'テストメッセージ',
    duration: 5000,
    ...overrides,
  })

  it('成功トーストを正しく表示する', () => {
    const toast = createToast()
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('エラートーストを正しく表示する', () => {
    const toast = createToast({ type: 'error', title: 'エラーメッセージ' })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('警告トーストを正しく表示する', () => {
    const toast = createToast({ type: 'warning', title: '警告メッセージ' })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(screen.getByText('警告メッセージ')).toBeInTheDocument()
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('情報トーストを正しく表示する', () => {
    const toast = createToast({ type: 'info', title: '情報メッセージ' })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(screen.getByText('情報メッセージ')).toBeInTheDocument()
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('サブメッセージを表示する', () => {
    const toast = createToast({
      title: 'メインメッセージ',
      message: 'サブメッセージ',
    })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(screen.getByText('メインメッセージ')).toBeInTheDocument()
    expect(screen.getByText('サブメッセージ')).toBeInTheDocument()
  })

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const toast = createToast()
    render(<Toast toast={toast} onClose={mockOnClose} />)

    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('指定された時間後に自動的に閉じる', () => {
    const toast = createToast({ duration: 1000 })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    expect(mockOnClose).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1000)
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('duration が 0 の場合は自動的に閉じない', () => {
    const toast = createToast({ duration: 0 })
    render(<Toast toast={toast} onClose={mockOnClose} />)

    vi.advanceTimersByTime(10000)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('各タイプに対応するCSSクラスが適用される', () => {
    const { rerender, container } = render(
      <Toast toast={createToast({ type: 'success' })} onClose={mockOnClose} />
    )
    expect(container.firstChild).toHaveClass('bg-green-50')

    rerender(<Toast toast={createToast({ type: 'error' })} onClose={mockOnClose} />)
    expect(container.firstChild).toHaveClass('bg-red-50')

    rerender(<Toast toast={createToast({ type: 'warning' })} onClose={mockOnClose} />)
    expect(container.firstChild).toHaveClass('bg-yellow-50')

    rerender(<Toast toast={createToast({ type: 'info' })} onClose={mockOnClose} />)
    expect(container.firstChild).toHaveClass('bg-blue-50')
  })
})