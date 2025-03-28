import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      setLocation("/auth");
      return;
    }
    
    async function verifySubscription() {
      try {
        const url = new URL(window.location.href);
        const sessionId = url.searchParams.get("session_id");
        
        if (!sessionId) {
          throw new Error("No session ID found in URL");
        }
        
        // Verify the subscription with the backend
        const response = await apiRequest("POST", "/api/verify-subscription", { sessionId });
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to verify subscription");
        }
        
        toast({
          title: "Subscription Activated",
          description: "Thank you! Your subscription has been successfully activated.",
        });
      } catch (error: any) {
        console.error("Error verifying subscription:", error);
        toast({
          title: "Verification Error",
          description: error.message || "There was an error verifying your subscription. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifySubscription();
  }, [user, setLocation, toast]);
  
  if (!user) {
    return null; // Will redirect to auth page
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-card">
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Subscription Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for subscribing to FlatMate AI. Your subscription has been activated and you now have access to all premium features.
          </p>
          
          {isVerifying ? (
            <div className="flex flex-col items-center my-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-muted-foreground">Verifying your subscription...</p>
            </div>
          ) : (
            <div className="space-y-2 w-full">
              <Button className="w-full" asChild>
                <Link href="/">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View My Subscription</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}