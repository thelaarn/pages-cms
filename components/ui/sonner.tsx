"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { useEffect } from "react"
import { enhancedErrorTracker } from "@/lib/error-tracker"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Enhanced monkey-patch with detailed logging
  useEffect(() => {
    console.log('🔧 Setting up enhanced toast interceptors...');
    
    const originalError = toast.error;
    const originalSuccess = toast.success;
    const originalInfo = toast.info;
    const originalWarning = toast.warning;
    const originalMessage = toast.message;
    const originalPromise = toast.promise;

    // @ts-ignore
    toast.error = (message: any, data?: any) => {
      console.log('🔴 toast.error called:', { message, data, type: typeof message });
      enhancedErrorTracker.trackToastCall('error', [message, data], message);
      
      const safeMessage = message !== undefined && message !== null ? String(message) : "An error occurred";
      if (message !== safeMessage) {
        console.warn('⚠️ toast.error: Converted undefined/null to safe message');
      }
      return originalError(safeMessage, data);
    };

    // @ts-ignore
    toast.success = (message: any, data?: any) => {
      console.log('✅ toast.success called:', { message, data, type: typeof message });
      enhancedErrorTracker.trackToastCall('success', [message, data], message);
      
      const safeMessage = message !== undefined && message !== null ? String(message) : "Success";
      if (message !== safeMessage) {
        console.warn('⚠️ toast.success: Converted undefined/null to safe message');
      }
      return originalSuccess(safeMessage, data);
    };

    // @ts-ignore
    toast.info = (message: any, data?: any) => {
      console.log('ℹ️ toast.info called:', { message, data, type: typeof message });
      enhancedErrorTracker.trackToastCall('info', [message, data], message);
      
      const safeMessage = message !== undefined && message !== null ? String(message) : "Info";
      return originalInfo(safeMessage, data);
    };

    // @ts-ignore
    toast.warning = (message: any, data?: any) => {
      console.log('⚠️ toast.warning called:', { message, data, type: typeof message });
      enhancedErrorTracker.trackToastCall('warning', [message, data], message);
      
      const safeMessage = message !== undefined && message !== null ? String(message) : "Warning";
      return originalWarning(safeMessage, data);
    };

    // @ts-ignore
    toast.message = (message: any, data?: any) => {
      console.log('💬 toast.message called:', { message, data, type: typeof message });
      enhancedErrorTracker.trackToastCall('message', [message, data], message);
      
      const safeMessage = message !== undefined && message !== null ? String(message) : "Message";
      return originalMessage(safeMessage, data);
    };

    // @ts-ignore
    toast.promise = (promise: any, options?: any) => {
      console.log('⏳ toast.promise called:', { 
        hasOptions: !!options,
        successType: typeof options?.success,
        errorType: typeof options?.error,
        loadingType: typeof options?.loading
      });
      
      const safeOptions = options ? {
        ...options,
        success: typeof options.success === 'function' 
          ? (...args: any[]) => {
              console.log('✅ toast.promise success handler called:', { args });
              const result = options.success(...args);
              console.log('✅ toast.promise success result:', { result, type: typeof result });
              
              enhancedErrorTracker.trackToastCall('promise.success', args, result);
              
              const safeResult = result !== undefined && result !== null ? String(result) : "Success";
              if (result !== safeResult) {
                console.warn('⚠️ toast.promise success: Converted undefined/null to safe message');
              }
              return safeResult;
            }
          : (options.success !== undefined && options.success !== null ? String(options.success) : "Success"),
        error: typeof options.error === 'function'
          ? (...args: any[]) => {
              console.log('🔴 toast.promise error handler called:', { args });
              const result = options.error(...args);
              console.log('🔴 toast.promise error result:', { result, type: typeof result });
              
              enhancedErrorTracker.trackToastCall('promise.error', args, result);
              
              const safeResult = result !== undefined && result !== null ? String(result) : "An error occurred";
              if (result !== safeResult) {
                console.warn('⚠️ toast.promise error: Converted undefined/null to safe message');
              }
              return safeResult;
            }
          : (options.error !== undefined && options.error !== null ? String(options.error) : "An error occurred"),
        loading: options.loading !== undefined && options.loading !== null ? String(options.loading) : "Loading..."
      } : undefined;
      
      return originalPromise(promise, safeOptions);
    };

    console.log('✅ Enhanced toast interceptors installed');

    return () => {
      console.log('🔧 Cleaning up toast interceptors');
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
