
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  validateLicense, 
  getCurrentLicense, 
  getTrialLicense,
  LicenseInfo
} from "@/lib/license-service";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Key, ShieldCheck, AlertTriangle } from "lucide-react";

// Schema for license form
const licenseFormSchema = z.object({
  licenseKey: z.string().min(10, "License key is too short"),
});

// Schema for trial form
const trialFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;
type TrialFormValues = z.infer<typeof trialFormSchema>;

export function LicenseManager() {
  const [license, setLicense] = useState<LicenseInfo | null>(getCurrentLicense());
  const [isActivating, setIsActivating] = useState(false);
  const [isRequestingTrial, setIsRequestingTrial] = useState(false);

  // Form for license key
  const licenseForm = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      licenseKey: "",
    },
  });

  // Form for trial request
  const trialForm = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      email: "",
      company: "",
    },
  });

  // Handle license activation
  const handleActivateLicense = async (values: LicenseFormValues) => {
    try {
      setIsActivating(true);
      const activatedLicense = await validateLicense(values.licenseKey);
      setLicense(activatedLicense);
      licenseForm.reset();
      toast.success("License activated successfully!");
    } catch (error) {
      console.error("License activation failed:", error);
      toast.error(`License activation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsActivating(false);
    }
  };

  // Handle trial request
  const handleRequestTrial = async (values: TrialFormValues) => {
    try {
      setIsRequestingTrial(true);
      const trialLicense = await getTrialLicense(values.email);
      setLicense(trialLicense);
      trialForm.reset();
      toast.success("Trial license activated successfully!");
    } catch (error) {
      console.error("Trial activation failed:", error);
      toast.error(`Trial activation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRequestingTrial(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {license ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
              License Information
            </CardTitle>
            <CardDescription>
              Your current license details and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">License Type</p>
                <p className="text-lg font-semibold">{license.type.charAt(0).toUpperCase() + license.type.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusColor(license.status)}>
                  {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">License Key</p>
                <p className="text-sm font-mono">{license.key.substring(0, 10)}...{license.key.substring(license.key.length - 6)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expires</p>
                <p>{license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : "Never"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Licensed Features</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {license.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="justify-start">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Licensed To</p>
              <p>{license.customer.name} ({license.customer.email})</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setLicense(null)}>
              Change License
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Activate License
              </CardTitle>
              <CardDescription>
                Enter your license key to activate Ansible UI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...licenseForm}>
                <form onSubmit={licenseForm.handleSubmit(handleActivateLicense)} className="space-y-4">
                  <FormField
                    control={licenseForm.control}
                    name="licenseKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Key</FormLabel>
                        <FormControl>
                          <Input placeholder="ANSIBLE-UI-XXXXX-XXXX-XXXX-XXXXXXXXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the license key you received with your purchase
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isActivating}>
                    {isActivating ? "Activating..." : "Activate License"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Request Trial
              </CardTitle>
              <CardDescription>
                Try Ansible UI with a 14-day free trial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...trialForm}>
                <form onSubmit={trialForm.handleSubmit(handleRequestTrial)} className="space-y-4">
                  <FormField
                    control={trialForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trialForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="secondary" className="w-full" disabled={isRequestingTrial}>
                    {isRequestingTrial ? "Requesting Trial..." : "Start Free Trial"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Alert variant="default" className="mt-4">
                <AlertTitle>No credit card required</AlertTitle>
                <AlertDescription>
                  Try all features free for 14 days. Cancel anytime.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LicenseManager;
