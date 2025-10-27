"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/user-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { EnhancedDebugPanel } from "@/components/debug-panel-enhanced";
import { ErrorLoggerScript } from "@/app/error-logger-script";
import { User } from "@/types/user";

export function Providers({ children, user }: { children: React.ReactNode, user: User | null }) {
  return (
    <ErrorBoundary>
      <ErrorLoggerScript />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider user={user}>
          <TooltipProvider>
            {children}
            <EnhancedDebugPanel />
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}