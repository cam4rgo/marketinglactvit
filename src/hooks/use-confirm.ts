import { useState, useCallback } from "react"

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

interface ConfirmState {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  variant: "default" | "destructive"
  resolve?: (value: boolean) => void
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: "Confirmar ação",
    description: "Tem certeza que deseja continuar?",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    variant: "default",
  })

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || "Confirmar ação",
        description: options.description || "Tem certeza que deseja continuar?",
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        variant: options.variant || "default",
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (state.resolve) {
      state.resolve(true)
    }
    setState(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    if (state.resolve) {
      state.resolve(false)
    }
    setState(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [state.resolve])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && state.resolve) {
      state.resolve(false)
    }
    setState(prev => ({ ...prev, isOpen: open, resolve: open ? prev.resolve : undefined }))
  }, [state.resolve])

  return {
    confirm,
    confirmState: {
      open: state.isOpen,
      title: state.title,
      description: state.description,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      variant: state.variant,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      onOpenChange: handleOpenChange,
    },
  }
}