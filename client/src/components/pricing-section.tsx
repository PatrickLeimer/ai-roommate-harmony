import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type PricingPlan = {
  _id: string;  // MongoDB ObjectId as string
  id?: number;  // Legacy id (optional)
  name: string;
  price: number;
  interval: string;
  features: string[];
  stripePriceId: string;
};

export default function PricingSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery<PricingPlan[]>({
    queryKey: ["/api/subscription-plans"],
    enabled: true,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { planId });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout for paid plans
        window.location.href = data.url;
      } else {
        // For free plans, just show success message
        toast({
          title: "Subscription activated",
          description: "Your free trial has been activated",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in or register to subscribe",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate(planId);
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-16 bg-white overflow-hidden">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Process API plans or use fallback static plans
  const pricingPlans = plans ? plans.map(plan => ({
    ...plan,
    // Parse features from JSON string if needed
    features: typeof plan.features === 'string' ? 
      JSON.parse(plan.features) : 
      (Array.isArray(plan.features) ? plan.features : [])
  })) : [
    {
      _id: "67e6ec96370d4e5cf2fdc85e",  // Using actual MongoDB IDs
      id: 1,
      name: "Free Trial",
      price: 0,
      interval: "monthly",
      features: [
        "3 property searches per week",
        "1 scheduled viewing",
        "Basic AI chat assistance"
      ],
      stripePriceId: "price_free"
    },
    {
      _id: "67e6ec96370d4e5cf2fdc85f", 
      id: 2,
      name: "Monthly",
      price: 1900,
      interval: "monthly",
      features: [
        "Unlimited property searches",
        "10 scheduled viewings",
        "Full AI chat assistance",
        "Lease contract analysis"
      ],
      stripePriceId: "price_1R59GJCkzXLayljknE1GHw3R"
    },
    {
      _id: "67e6ec96370d4e5cf2fdc860",
      id: 3,
      name: "Annual",
      price: 16900,
      interval: "yearly",
      features: [
        "Unlimited property searches",
        "Unlimited scheduled viewings",
        "Premium AI chat assistance",
        "Advanced lease contract analysis",
        "Priority results & early access"
      ],
      stripePriceId: "price_1R59HPCkzXLayljkKrZvvldx"
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-base font-semibold text-primary tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Pricing
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Plans for every housing journey
          </motion.p>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Choose the plan that works best for your housing search needs.
          </motion.p>
        </div>

        <motion.div 
          className="mt-16 grid gap-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          {/* Free Trial */}
          <motion.div 
            className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Free Trial</h3>
              <p className="mt-2 text-sm text-gray-500">Perfect for testing the waters</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">€0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button 
                onClick={() => handleSubscribe(plans?.[0]?._id?.toString() || "1")} 
                variant="outline" 
                className="mt-8 w-full"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start your trial"
                )}
              </Button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                {pricingPlans[0].features.map((feature: string, index: number) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
                <li className="flex space-x-3 opacity-50">
                  <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Lease contract analysis</span>
                </li>
                <li className="flex space-x-3 opacity-50">
                  <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Priority results</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Monthly Plan */}
          <motion.div 
            className="bg-white border-2 border-primary rounded-lg shadow-md divide-y divide-gray-200"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Monthly</h3>
              <p className="mt-2 text-sm text-gray-500">Best for short-term searches</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">€19</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <Button 
                onClick={() => handleSubscribe(plans?.[1]?._id?.toString() || "2")} 
                className="mt-8 w-full"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe monthly"
                )}
              </Button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                {pricingPlans[1].features.map((feature: string, index: number) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
                <li className="flex space-x-3 opacity-50">
                  <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Priority results</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Annual Plan */}
          <motion.div 
            className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <Badge className="bg-green-100 text-green-800 mb-2">Save 25%</Badge>
              <h3 className="text-lg font-medium text-gray-900">Annual</h3>
              <p className="mt-2 text-sm text-gray-500">For serious property hunters</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">€169</span>
                <span className="text-base font-medium text-gray-500">/year</span>
              </p>
              <Button 
                onClick={() => handleSubscribe(plans?.[2]?._id?.toString() || "3")} 
                variant="secondary" 
                className="mt-8 w-full"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe annually"
                )}
              </Button>
            </div>
            <div className="px-6 pt-6 pb-8">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                {pricingPlans[2].features.map((feature: string, index: number) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
