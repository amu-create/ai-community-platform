import * as React from "react"
import { toast, ToastOptions } from "sonner"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const showToast = React.useCallback((props: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
    action?: React.ReactNode
  }) => {
    const options: ToastOptions = {
      description: props.description,
    }

    if (props.variant === "destructive") {
      toast.error(props.title || "Error", options)
    } else {
      toast.success(props.title || "Success", options)
    }
  }, [])

  return {
    toast: showToast,
  }
}
