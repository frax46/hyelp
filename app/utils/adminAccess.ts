/**
 * Admin access utility functions
 */

// Get admin emails from environment variable
export const getAdminEmails = (): string[] => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!adminEmails) {
    return [];
  }
  return adminEmails.split(",").map((email) => email.trim());
};

// Check if an email is in the admin list
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
};

// Check if the admin feature is properly configured
export const isAdminFeatureConfigured = (): boolean => {
  const adminEmails = getAdminEmails();
  return adminEmails.length > 0;
}; 