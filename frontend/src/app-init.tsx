import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Header } from "./components/header";
import { ThemeProvider } from "./providers/theme-provider";
import { ClerkProviderWrapper } from "./providers/clerk-provider";
import { QueryProvider } from "./providers/query-provider";
import { FileManager } from "./components/file-manager";
import { Toaster } from "sonner";
import { useMemo } from "react";
import { ExampleService } from "./services/example.service";

function AppInit() {
  const exampleService = useMemo(function initExampleService() {
    return new ExampleService();
  }, []);

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

          {/* Demo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Demo API Call
                <Badge variant="secondary">Available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test the backend connection with this demo API call.
              </p>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const { message } = await exampleService.getMessage();
                    alert(message);
                  } catch (error) {
                    alert(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                Test Backend Connection
              </Button>
            </CardContent>
          </Card>
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
