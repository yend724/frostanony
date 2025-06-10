import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('初期状態では空のtoasts配列を返す', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toasts).toEqual([])
  })

  it('showSuccessで成功トーストを追加する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showSuccess('成功メッセージ', '詳細メッセージ')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: '成功メッセージ',
      message: '詳細メッセージ',
      duration: 5000,
    })
    expect(result.current.toasts[0].id).toBeDefined()
  })

  it('showErrorでエラートーストを追加する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showError('エラーメッセージ')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      title: 'エラーメッセージ',
      duration: 5000,
    })
  })

  it('showWarningで警告トーストを追加する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showWarning('警告メッセージ')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      title: '警告メッセージ',
      duration: 5000,
    })
  })

  it('showInfoで情報トーストを追加する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showInfo('情報メッセージ')
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: '情報メッセージ',
      duration: 5000,
    })
  })

  it('複数のトーストを追加できる', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showSuccess('成功1')
      result.current.showError('エラー1')
      result.current.showWarning('警告1')
    })
    
    expect(result.current.toasts).toHaveLength(3)
    expect(result.current.toasts[0].title).toBe('成功1')
    expect(result.current.toasts[1].title).toBe('エラー1')
    expect(result.current.toasts[2].title).toBe('警告1')
  })

  it('removeToastで指定したトーストを削除する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showSuccess('メッセージ1')
      result.current.showError('メッセージ2')
    })
    
    const toastId = result.current.toasts[0].id
    
    act(() => {
      result.current.removeToast(toastId)
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('メッセージ2')
  })

  it('clearAllToastsで全てのトーストを削除する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showSuccess('メッセージ1')
      result.current.showError('メッセージ2')
      result.current.showWarning('メッセージ3')
    })
    
    expect(result.current.toasts).toHaveLength(3)
    
    act(() => {
      result.current.clearAllToasts()
    })
    
    expect(result.current.toasts).toHaveLength(0)
  })

  it('カスタムdurationでトーストを追加する', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showToast('success', 'メッセージ', '詳細', 10000)
    })
    
    expect(result.current.toasts[0].duration).toBe(10000)
  })

  it('各トーストは一意のIDを持つ', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.showSuccess('メッセージ1')
      result.current.showSuccess('メッセージ2')
    })
    
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id)
  })
})