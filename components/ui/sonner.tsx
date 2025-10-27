"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Monkey-patch toast methods to handle undefined messages
  useEffect(() => {
    const originalError = toast.error;
    const originalSuccess = toast.success;
    const originalInfo = toast.info;
    const originalWarning = toast.warning;
    const originalMessage = toast.message;
    const originalPromise = toast.promise;

    // @ts-ignore
    toast.error = (message: any, data?: any) => {
      const safeMessage = message !== undefined && message !== null ? String(message) : "An error occurred";
      return originalError(safeMessage, data);
    };

    // @ts-ignore
    toast.success = (message: any, data?: any) => {
      const safeMessage = message !== undefined && message !== null ? String(message) : "Success";
      return originalSuccess(safeMessage, data);
    };

    // @ts-ignore
    toast.info = (message: any, data?: any) => {
      const safeMessage = message !== undefined && message !== null ? String(message) : "Info";
      return originalInfo(safeMessage, data);
    };

    // @ts-ignore
    toast.warning = (message: any, data?: any) => {
      const safeMessage = message !== undefined && message !== null ? String(message) : "Warning";
      return originalWarning(safeMessage, data);
    };

    // @ts-ignore
    toast.message = (message: any, data?: any) => {
      const safeMessage = message !== undefined && message !== null ? String(message) : "Message";
      return originalMessage(safeMessage, data);
    };

    // @ts-ignore
    toast.promise = (promise: any, options?: any) => {
      const safeOptions = options ? {
        ...options,
        success: typeof options.success === 'function' 
          ? (...args: any[]) => {
              const result = options.success(...args);
              return result !== undefined && result !== null ? String(result) : "Success";
            }
          : (options.success !== undefined && options.success !== null ? String(options.success) : "Success"),
        error: typeof options.error === 'function'
          ? (...args: any[]) => {
              const result = options.error(...args);
              return result !== undefined && result !== null ? String(result) : "An error occurred";
            }
          : (options.error !== undefined && options.error !== null ? String(options.error) : "An error occurred"),
        loading: options.loading !== undefined && options.loading !== null ? String(options.loading) : "Loading..."
      } : undefined;
      return originalPromise(promise, safeOptions);
    };

    return () => {
      // Restore original methods on cleanup
      toast.error = originalError;
      toast.success = originalSuccess;
      toast.info = originalInfo;
      toast.warning = originalWarning;
      toast.message = originalMessage;
      toast.promise = originalPromise;
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
