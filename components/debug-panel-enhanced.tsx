"use client";

import { useState, useEffect } from "react";
import { enhancedErrorTracker, DetailedErrorLog } from "@/lib/error-tracker";
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
import { Bug, Copy, Trash2, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EnhancedDebugPanel() {
  const [logs, setLogs] = useState<DetailedErrorLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateLogs = () => {
      setLogs(enhancedErrorTracker.getErrors());
    };
    
    enhancedErrorTracker.subscribe(updateLogs);
    updateLogs();
    
    return () => enhancedErrorTracker.unsubscribe(updateLogs);
  }, []);

  useEffect(() => {
    if (isOpen) {
      enhancedErrorTracker.markAllAsSeen();
    }
  }, [isOpen]);

  const copyAllLogs = () => {
    const logsText = enhancedErrorTracker.exportLogs();
    navigator.clipboard.writeText(logsText);
    toast.success("All logs copied to clipboard!");
  };

  const downloadLogs = () => {
    const exportData = enhancedErrorTracker.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs downloaded!");
  };

  const clearLogs = () => {
    enhancedErrorTracker.clearErrors();
    setLogs([]);
    toast.success("Logs cleared");
  };

  const substringErrors = logs.filter(log => 
    log.message.toLowerCase().includes('substring') || 
    log.stack?.toLowerCase().includes('substring')
  );

  const toastErrors = logs.filter(log => log.toastContext);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 shadow-lg hover:shadow-xl transition-shadow"
          title="Enhanced Debug Panel - Click to view detailed error logs"
        >
          <Bug className="h-4 w-4" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {logs.length}
            </span>
          )}
          {substringErrors.length > 0 && (
            <span className="absolute -bottom-1 -left-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Enhanced Error Debug Panel
            {substringErrors.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                {substringErrors.length} substring errors!
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Comprehensive client-side error tracking with detailed context
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button onClick={copyAllLogs} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button onClick={clearLogs} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Errors ({logs.length})</TabsTrigger>
            <TabsTrigger value="substring">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Substring ({substringErrors.length})
            </TabsTrigger>
            <TabsTrigger value="toast">Toast Calls ({toastErrors.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <div className="p-4">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No errors logged yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <ErrorLogCard key={index} log={log} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="substring">
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <div className="p-4">
                {substringErrors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No substring errors found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {substringErrors.map((log, index) => (
                      <ErrorLogCard key={index} log={log} index={index} highlight />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="toast">
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <div className="p-4">
                {toastErrors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No toast calls logged yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {toastErrors.map((log, index) => (
                      <ErrorLogCard key={index} log={log} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ErrorLogCard({ log, index, highlight }: { log: DetailedErrorLog; index: number; highlight?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 space-y-2 ${highlight ? 'border-red-500 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {log.errorType.toUpperCase()} ERROR #{index + 1}
          </span>
          {log.toastContext && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
              Toast: {log.toastContext.method}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      </div>
      
      <p className="text-sm font-mono bg-muted p-2 rounded break-all">
        {log.message}
      </p>
      
      {log.toastContext && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-semibold">
            Toast Context
          </summary>
          <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(log.toastContext, null, 2)}
          </pre>
        </details>
      )}
      
      {log.stack && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-semibold">
            Stack Trace
          </summary>
          <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-60 whitespace-pre-wrap break-all">
            {log.stack}
          </pre>
        </details>
      )}
      
      {log.componentStack && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-semibold">
            Component Stack
          </summary>
          <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
            {log.componentStack}
          </pre>
        </details>
      )}
      
      {log.localContext && Object.keys(log.localContext).length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-semibold">
            Local Context
          </summary>
          <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(log.localContext, null, 2)}
          </pre>
        </details>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p><span className="font-semibold">URL:</span> {log.url}</p>
        {log.fileName && <p><span className="font-semibold">File:</span> {log.fileName}:{log.lineNumber}:{log.columnNumber}</p>}
      </div>
    </div>
  );
}

