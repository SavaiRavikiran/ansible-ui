
import { toast } from "sonner";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

// Available plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'For small teams getting started with Ansible',
    price: 19.99,
    billingCycle: 'monthly',
    features: [
      'Up to 5 users',
      'Playbook management',
      'Inventory management',
      'Role management',
      'Basic support',
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams with advanced needs',
    price: 49.99,
    billingCycle: 'monthly',
    features: [
      'Up to 20 users',
      'All Basic features',
      'Job scheduler',
      'Cloud inventory integration',
      'Priority support',
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations with complex infrastructure',
    price: 99.99,
    billingCycle: 'monthly',
    features: [
      'Unlimited users',
      'All Professional features',
      'Multi-cluster management',
      'Advanced security',
      'Dedicated support',
      'Custom deployment options',
    ]
  },
];

// Get plan details
export function getPlanDetails(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId);
}

// Get current subscription (simulated)
export function getCurrentSubscription(): Subscription | null {
  // Try to get from localStorage
  const storedSubscription = localStorage.getItem('ansible_ui_subscription');
  if (storedSubscription) {
    try {
      return JSON.parse(storedSubscription) as Subscription;
    } catch (error) {
      console.error('Failed to parse stored subscription:', error);
    }
  }
  
  return null;
}

// Subscribe to a plan (simulated)
export async function subscribeToPlan(planId: string): Promise<Subscription> {
  try {
    // In production, this would call your payment processing service
    // For now, we simulate the API call
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plan = getPlanDetails(planId);
    if (!plan) {
      throw new Error('Invalid plan selected');
    }
    
    // Create a new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    
    const subscription: Subscription = {
      id: `sub-${Math.random().toString(36).substring(2, 10)}`,
      planId,
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('ansible_ui_subscription', JSON.stringify(subscription));
    
    toast.success(`Successfully subscribed to ${plan.name} plan!`);
    return subscription;
  } catch (error) {
    console.error('Subscription failed:', error);
    toast.error(`Subscription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Cancel subscription (simulated)
export async function cancelSubscription(): Promise<void> {
  try {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const subscription = getCurrentSubscription();
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    // Update subscription status
    const updatedSubscription: Subscription = {
      ...subscription,
      status: 'canceled',
      autoRenew: false,
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('ansible_ui_subscription', JSON.stringify(updatedSubscription));
    
    toast.success('Subscription canceled successfully');
  } catch (error) {
    console.error('Cancellation failed:', error);
    toast.error(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
