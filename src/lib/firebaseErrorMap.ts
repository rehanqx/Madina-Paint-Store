export function mapFirebaseError(errorCode: string): string {
  const errorMap: { [key: string]: string } = {
    'auth/user-not-found': 'Email not registered',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many login attempts. Try again later.',
    'auth/operation-not-allowed': 'Email/password login is disabled',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'default': 'Login failed. Please try again.',
  };
  
  return errorMap[errorCode] || errorMap['default'];
}
