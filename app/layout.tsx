import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Pages CMS",
    default: "Pages CMS",
  },
  description: "The No-Hassle CMS for GitHub",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
	return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handler - catches all runtime errors
              window.addEventListener('error', function(event) {
                console.error('🔴 GLOBAL ERROR CAUGHT:', {
                  message: event.message,
                  filename: event.filename,
                  lineno: event.lineno,
                  colno: event.colno,
                  error: event.error,
                  stack: event.error?.stack
                });
              });
              
              // Catch unhandled promise rejections
              window.addEventListener('unhandledrejection', function(event) {
                console.error('🔴 UNHANDLED PROMISE REJECTION:', {
                  reason: event.reason,
                  promise: event.promise
                });
              });
            `,
          }}
        />
        {children}
        <Toaster/>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize error logger
              if (typeof window !== 'undefined') {
                window.__errorLoggerReady = true;
              }
            `,
          }}
        />
      </body>
    </html>
  );
}