/**
 * Maps Firebase Auth, Firestore, and network error codes to user-friendly messages.
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || error.message || '';
  const codeStr = typeof code === 'string' ? code : '';

  // Auth Mappings
  if (codeStr.includes('auth/invalid-email') || codeStr.includes('invalid email')) {
    return 'The email address you entered is invalid. Please double-check.';
  }
  if (codeStr.includes('auth/user-disabled')) {
    return 'This administrator account has been disabled. Contact support.';
  }
  if (codeStr.includes('auth/user-not-found') || codeStr.includes('auth/invalid-credential')) {
    return 'Invalid email address or password. Please verify and try again.';
  }
  if (codeStr.includes('auth/wrong-password')) {
    return 'The password you entered is incorrect. Please verify.';
  }
  if (codeStr.includes('auth/email-already-in-use')) {
    return 'This email address is already registered to another account.';
  }
  if (codeStr.includes('auth/weak-password')) {
    return 'The password you selected is too weak. Choose at least 6 characters.';
  }
  if (codeStr.includes('auth/network-request-failed')) {
    return 'A network error occurred. Please check your internet connection and try again.';
  }

  // Firestore Mappings
  if (codeStr.includes('permission-denied')) {
    return 'Access Denied: You do not have the required administrative permissions for this operation.';
  }
  if (codeStr.includes('not-found')) {
    return 'The requested database record could not be found.';
  }
  if (codeStr.includes('already-exists')) {
    return 'This database record already exists. Cannot create duplicate.';
  }
  if (codeStr.includes('resource-exhausted')) {
    return 'The paint store server is busy. Please try again in a few seconds.';
  }

  // Generic Network Mappings
  if (codeStr.includes('Failed to fetch')) {
    return 'Failed to reach the paint shop server. Please check your network connection.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}
