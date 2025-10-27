"use client";

import { useState, useEffect } from "react";
import { errorLogger } from "@/lib/error-logger";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DebugPanel() {
  const [logs, setLogs] = useState(errorLogger.getPersistedLogs());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Refresh logs when panel opens
      setLogs(errorLogger.getPersistedLogs());
    }
  }, [isOpen]);

  const copyAllLogs = () => {
    const logsText = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(logsText);
    toast.success("Logs copied to clipboard");
  };

  const clearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
    toast.success("Logs cleared");
  };

  // Only show in development or if there are errors
  if (process.env.NODE_ENV === 'production' && logs.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          title="Debug Panel"
        >
          <Bug className="h-4 w-4" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {logs.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Error Debug Panel</DialogTitle>
          <DialogDescription>
            View client-side errors that occurred in this session
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Button onClick={copyAllLogs} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors logged</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-sm">
                      {log.errorType.toUpperCase()} ERROR
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {log.message}
                  </p>
                  {log.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                  {log.componentStack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Component Stack
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {log.componentStack}
                      </pre>
                    </details>
                  )}
                  {log.additionalInfo && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Additional Info:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(log.additionalInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>URL:</strong> {log.url}</div>
                    <div><strong>User Agent:</strong> {log.userAgent}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

