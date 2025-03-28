import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  if (!user) {
    return null; // Will redirect to auth page
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-card">
        <div className="flex flex-col items-center text-center">
          <XCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            You've cancelled the subscription process. If you encountered any issues or have questions, please don't hesitate to contact our support team.
          </p>
          
          <div className="space-y-2 w-full">
            <Button className="w-full" asChild>
              <Link href="/pricing">View Plans Again</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}