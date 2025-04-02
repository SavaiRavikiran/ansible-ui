
import { toast } from "sonner";

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'general';
  title: string;
  description: string;
  screenshotUrl?: string;
  status: 'new' | 'in-review' | 'planned' | 'in-progress' | 'completed' | 'declined';
  createdAt: string;
  updatedAt: string;
  userId?: string;
  userEmail?: string;
}

// Submit feedback
export async function submitFeedback(
  type: 'bug' | 'feature' | 'general',
  title: string,
  description: string,
  screenshotUrl?: string,
  userId?: string,
  userEmail?: string
): Promise<FeedbackItem> {
  try {
    // In production, this would call your feedback API
    // For now, we simulate the API call
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    const now = new Date().toISOString();
    
    // Create a feedback item
    const feedback: FeedbackItem = {
      id: `feedback-${Math.random().toString(36).substring(2, 10)}`,
      type,
      title,
      description,
      screenshotUrl,
      status: 'new',
      createdAt: now,
      updatedAt: now,
      userId,
      userEmail,
    };
    
    // Store in localStorage for persistence (in a real app, this would be sent to a server)
    const storedFeedback = localStorage.getItem('ansible_ui_feedback') || '[]';
    const feedbackItems = JSON.parse(storedFeedback) as FeedbackItem[];
    feedbackItems.push(feedback);
    localStorage.setItem('ansible_ui_feedback', JSON.stringify(feedbackItems));
    
    toast.success('Thank you for your feedback!');
    return feedback;
  } catch (error) {
    console.error('Feedback submission failed:', error);
    toast.error(`Feedback submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Get user feedback
export function getUserFeedback(userId?: string): FeedbackItem[] {
  try {
    const storedFeedback = localStorage.getItem('ansible_ui_feedback') || '[]';
    const feedbackItems = JSON.parse(storedFeedback) as FeedbackItem[];
    
    if (!userId) {
      return feedbackItems;
    }
    
    return feedbackItems.filter(item => item.userId === userId);
  } catch (error) {
    console.error('Failed to get feedback:', error);
    return [];
  }
}

// Check if user can submit feedback (rate limiting)
export function canSubmitFeedback(userId?: string): boolean {
  if (!userId) {
    return true;
  }
  
  try {
    const userFeedback = getUserFeedback(userId);
    if (userFeedback.length === 0) {
      return true;
    }
    
    // Get the most recent feedback
    const latestFeedback = userFeedback.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    // Check if it's been at least 1 hour since the last feedback
    const lastSubmissionTime = new Date(latestFeedback.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    return (currentTime - lastSubmissionTime) >= oneHourInMs;
  } catch (error) {
    console.error('Failed to check feedback eligibility:', error);
    return true;
  }
}
