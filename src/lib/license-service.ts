
// License validation service
import { toast } from "sonner";

export interface LicenseInfo {
  key: string;
  status: 'active' | 'expired' | 'invalid' | 'trial';
  expiresAt: string | null;
  features: string[];
  type: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

// In-memory cache for license validation
let cachedLicense: LicenseInfo | null = null;

// Function to validate a license key against our server
export async function validateLicense(licenseKey: string): Promise<LicenseInfo> {
  try {
    // In production, this would call your license validation server
    // For now, we simulate the API call with a fake license validation
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!licenseKey || licenseKey.length < 10) {
      throw new Error('Invalid license key format');
    }
    
    // Simple validation logic for demo
    const isValidFormat = /^ANSIBLE-UI-\w{8}-\w{4}-\w{4}-\w{12}$/i.test(licenseKey);
    
    if (!isValidFormat) {
      throw new Error('License key format is invalid');
    }
    
    // Demo license validation logic
    const isTrial = licenseKey.includes('TRIAL');
    const isPro = licenseKey.includes('PRO');
    const isEnterprise = licenseKey.includes('ENT');
    
    const expiryDate = new Date();
    // Set expiry 30 days in the future for demo
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const license: LicenseInfo = {
      key: licenseKey,
      status: isTrial ? 'trial' : 'active',
      expiresAt: expiryDate.toISOString(),
      features: [
        'core',
        'playbooks',
        'inventories',
        'roles',
        ...(isPro || isEnterprise ? ['job-scheduler', 'cloud-inventory'] : []),
        ...(isEnterprise ? ['multi-cluster', 'enterprise-support', 'audit-logs'] : [])
      ],
      type: isEnterprise ? 'enterprise' : (isPro ? 'professional' : 'basic'),
      maxUsers: isEnterprise ? 100 : (isPro ? 20 : 5),
      customer: {
        id: `cust-${Math.random().toString(36).substring(2, 10)}`,
        name: 'Demo Customer',
        email: 'demo@example.com'
      }
    };
    
    // Cache the license
    cachedLicense = license;
    
    // Store in localStorage for persistence
    localStorage.setItem('ansible_ui_license', JSON.stringify(license));
    
    return license;
  } catch (error) {
    console.error('License validation failed:', error);
    toast.error(`License validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Function to get the current license
export function getCurrentLicense(): LicenseInfo | null {
  // Try to get from cache first
  if (cachedLicense) {
    return cachedLicense;
  }
  
  // Try to get from localStorage
  const storedLicense = localStorage.getItem('ansible_ui_license');
  if (storedLicense) {
    try {
      const license = JSON.parse(storedLicense) as LicenseInfo;
      cachedLicense = license;
      return license;
    } catch (error) {
      console.error('Failed to parse stored license:', error);
    }
  }
  
  return null;
}

// Check if a specific feature is available in current license
export function hasLicenseFeature(feature: string): boolean {
  const license = getCurrentLicense();
  if (!license || license.status !== 'active') {
    return false;
  }
  
  return license.features.includes(feature);
}

// Clear the current license (logout)
export function clearLicense(): void {
  cachedLicense = null;
  localStorage.removeItem('ansible_ui_license');
}

// Get trial license
export async function getTrialLicense(email: string): Promise<LicenseInfo> {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const trialKey = `ANSIBLE-UI-TRIAL${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  return validateLicense(trialKey);
}
