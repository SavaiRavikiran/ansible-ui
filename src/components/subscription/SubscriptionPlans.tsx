
import React, { useState } from "react";
import { toast } from "sonner";
import { subscriptionPlans, subscribeToPlan } from "@/lib/subscription-service";
import { getCurrentUser } from "@/lib/auth-service";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShieldCheck, Check } from "lucide-react";

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const user = getCurrentUser();

  const yearlyDiscount = 0.2; // 20% discount for yearly billing
  
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Please log in to subscribe to a plan");
      return;
    }
    
    try {
      setIsProcessing(true);
      await subscribeToPlan(planId);
      setSelectedPlanId(null);
    } catch (error) {
      console.error("Subscription failed:", error);
      // Error is already handled in the subscribeToPlan function
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your team's needs
        </p>
        
        <div className="flex justify-center mt-6">
          <Tabs defaultValue="monthly" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>Monthly</TabsTrigger>
              <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>Yearly (20% off)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const price = billingCycle === "yearly" 
            ? plan.price * 12 * (1 - yearlyDiscount) 
            : plan.price;
            
          const isPopular = plan.id === "professional";
          
          return (
            <Card key={plan.id} className={`flex flex-col ${isPopular ? 'border-primary shadow-md' : ''}`}>
              <CardHeader>
                {isPopular && (
                  <Badge className="self-start mb-2">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      {isPopular ? 'Subscribe Now' : 'Choose Plan'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                        Confirm Subscription
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        You're about to subscribe to the <strong>{plan.name} Plan</strong> on a {billingCycle} basis for <strong>${price.toFixed(2)}/{billingCycle === "yearly" ? "year" : "month"}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        disabled={isProcessing} 
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isProcessing ? 'Processing...' : 'Confirm Subscription'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          All plans come with a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
