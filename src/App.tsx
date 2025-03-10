
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ClerkLoading, ClerkLoaded, SignedIn, SignedOut } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ClerkLoading>
          <div className="h-screen w-full flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <Routes>
            <Route path="/" element={
              <>
                <SignedIn>
                  <Index />
                </SignedIn>
                <SignedOut>
                  <Auth />
                </SignedOut>
              </>
            } />
            <Route path="/sign-in" element={<Auth />} />
            <Route path="/sign-up" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ClerkLoaded>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
