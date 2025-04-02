
import { toast } from "sonner";
import { validateLicense, getCurrentLicense, clearLicense } from "./license-service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

// In-memory cache for current user
let currentUser: User | null = null;

// Login with email/password
export async function login(email: string, password: string): Promise<User> {
  try {
    // In production, this would call your authentication server
    // For now, we simulate the API call
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Simple validation logic for demo
    if (password.length < 6) {
      throw new Error('Invalid password');
    }
    
    // Set a fake user for the demo
    const user: User = {
      id: `user-${Math.random().toString(36).substring(2, 10)}`,
      name: email.split('@')[0],
      email,
      role: email.includes('admin') ? 'admin' : (email.includes('edit') ? 'editor' : 'viewer'),
    };
    
    // Cache the user
    currentUser = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('ansible_ui_user', JSON.stringify(user));
    
    toast.success(`Welcome back, ${user.name}!`);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Register a new user
export async function register(name: string, email: string, password: string): Promise<User> {
  try {
    // In production, this would call your registration server
    // For now, we simulate the API call
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    
    // Simple validation logic for demo
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // Set a new user for the demo
    const user: User = {
      id: `user-${Math.random().toString(36).substring(2, 10)}`,
      name,
      email,
      role: 'viewer', // Default role for new users
    };
    
    // Cache the user
    currentUser = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('ansible_ui_user', JSON.stringify(user));
    
    toast.success(`Welcome to Ansible UI, ${name}!`);
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Get the current user
export function getCurrentUser(): User | null {
  // Try to get from cache first
  if (currentUser) {
    return currentUser;
  }
  
  // Try to get from localStorage
  const storedUser = localStorage.getItem('ansible_ui_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as User;
      currentUser = user;
      return user;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
  }
  
  return null;
}

// Logout the current user
export function logout(): void {
  currentUser = null;
  clearLicense();
  localStorage.removeItem('ansible_ui_user');
  toast.success('You have been logged out');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Check if user has a specific role
export function hasRole(role: 'admin' | 'editor' | 'viewer'): boolean {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  // Admin has all roles
  if (user.role === 'admin') {
    return true;
  }
  
  // Editor has editor and viewer roles
  if (user.role === 'editor' && (role === 'editor' || role === 'viewer')) {
    return true;
  }
  
  // Viewer only has viewer role
  return user.role === role;
}
