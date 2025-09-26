import { Card, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Header } from "./components/header";
import { ThemeProvider } from "./providers/theme-provider";
import { ClerkProviderWrapper } from "./providers/clerk-provider";
import { QueryProvider } from "./providers/query-provider";
import { FileManager } from "./components/file-manager";
import { Toaster } from "sonner";

function AppInit() {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-background">
          <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">File Management System</CardTitle>
              <CardDescription className="text-lg">
                Upload, manage, and organize your files with our secure file management system.
                Sign in to access all features.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* File Manager Component */}
          <FileManager />
        </div>
      </main>
        </div>
      </ThemeProvider>
  );
}

function App() {
  return (
    <ClerkProviderWrapper>
      <QueryProvider>
        <AppInit />
        <Toaster position="top-right" />
      </QueryProvider>
    </ClerkProviderWrapper>
  );
}

export default App;
