import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Shield, User, Users, Key, Settings } from "lucide-react";
import { toast } from "sonner";

import LicenseManager from "@/components/license/LicenseManager";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import DeploymentConfigurator from "@/components/deployment/DeploymentConfigurator";

import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth-service";
import { getCurrentLicense } from "@/lib/license-service";
import { getCurrentSubscription, getPlanDetails } from "@/lib/subscription-service";

const SecretsVault = () => {
  const [activeTab, setActiveTab] = useState<string>("license");
  const [authView, setAuthView] = useState<"login" | "register">("login");
  
  const isUserAuthenticated = isAuthenticated();
  const user = getCurrentUser();
  const license = getCurrentLicense();
  const subscription = getCurrentSubscription();
  const subscriptionPlan = subscription ? getPlanDetails(subscription.planId) : null;
  
  // User completed authentication
  const handleAuthSuccess = () => {
    toast.success("Authentication successful!");
    
    // If user is authenticated but doesn't have a license, switch to license tab
    if (!getCurrentLicense()) {
      setActiveTab("license");
    }
    // If user is authenticated and has a license but no subscription, switch to subscription tab
    else if (!getCurrentSubscription()) {
      setActiveTab("subscription");
    }
    // Otherwise go to the deployment tab
    else {
      setActiveTab("deployment");
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    setActiveTab("auth");
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Security & Licensing</h1>
          <p className="text-muted-foreground">
            Manage your license, authentication, and deployment settings
          </p>
        </div>
        
        {isUserAuthenticated && (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
      
      {/* User info panel if authenticated */}
      {isUserAuthenticated && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                {license && (
                  <div className="text-right">
                    <p className="text-sm font-medium">License Type</p>
                    <p className="text-sm">{license.type.charAt(0).toUpperCase() + license.type.slice(1)}</p>
                  </div>
                )}
                
                {subscriptionPlan && (
                  <div className="text-right">
                    <p className="text-sm font-medium">Subscription Plan</p>
                    <p className="text-sm">{subscriptionPlan.name}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="license" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>License</span>
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Authentication</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Deployment</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Feedback</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="license">
            <LicenseManager />
          </TabsContent>
          
          <TabsContent value="auth">
            <div className="max-w-md mx-auto">
              {authView === "login" ? (
                <LoginForm 
                  onSuccess={handleAuthSuccess} 
                  onRegister={() => setAuthView("register")} 
                />
              ) : (
                <RegisterForm 
                  onSuccess={handleAuthSuccess} 
                  onLogin={() => setAuthView("login")} 
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionPlans />
          </TabsContent>
          
          <TabsContent value="deployment">
            <DeploymentConfigurator />
          </TabsContent>
          
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback & Support</CardTitle>
                <CardDescription>
                  Share your thoughts, report bugs, or request new features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 items-center justify-center py-6">
                  <p className="text-center max-w-md">
                    Your feedback helps us improve Ansible UI. Let us know what you think!
                  </p>
                  <FeedbackForm trigger={
                    <Button className="mt-2">Submit Feedback</Button>
                  } />
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Support Options</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Email Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          Reach out to our support team directly via email.
                        </p>
                        <Button variant="outline" onClick={() => {
                          window.location.href = "mailto:support@example.com";
                        }}>
                          Contact Support
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Documentation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          Visit our documentation for guides and troubleshooting.
                        </p>
                        <Button variant="outline" onClick={() => {
                          window.open("https://example.com/docs", "_blank");
                        }}>
                          View Documentation
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SecretsVault;
