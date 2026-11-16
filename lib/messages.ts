const ACTION_PHRASES: Record<string, string> = {
  paused: 'is on hold by administrator',
  removed: 'has been removed by administrator',
};

export const EMAIL_VERIFICATION_MESSAGES = {
  SIGNUP_FAILED: 'Registration failed',
  CHECK_EMAIL_TITLE: 'Check your email',
  CHECK_EMAIL_BODY: (email: string, minutes: number): string =>
    `We have sent a verification link to ${email}. Open it within ${minutes} minutes to set up your institute and log in.`,
  MAIL_NOT_SENT_BODY: (email: string): string =>
    `We created your account but could not send the verification email to ${email}. Please resend it below.`,
  RESEND_BUTTON: 'Resend verification email',
  RESEND_SENDING: 'Sending...',
  RESEND_COOLDOWN: (seconds: number): string => `Resend in ${seconds}s`,
  RESEND_SUCCESS: 'If the account exists, a new link has been sent. It is valid for 2 minutes.',
  RESEND_FAILED: 'Could not resend the email. Please try again.',
  RESEND_PAGE_TITLE: 'Resend verification email',
  RESEND_PAGE_BODY: 'Enter the email you signed up with and we will send you a new verification link.',
  RESEND_EXPIRED: 'Your verification link has expired. Request a new one below.',
  RESEND_INVALID: 'This verification link is not valid. Request a new one below.',
  EMAIL_LABEL: 'Email address',
  EMAIL_PLACEHOLDER: 'you@example.com',
  EMAIL_REQUIRED: 'Please enter a valid email address',
  VERIFYING: 'Verifying your email...',
  VERIFIED_TITLE: 'Email verified',
  VERIFIED_BODY: 'Your email has been verified. Please log in to continue.',
  ALREADY_VERIFIED_TITLE: 'Already verified',
  ALREADY_VERIFIED_BODY: 'This email was already verified. Please log in to continue.',
  SETTING_UP: 'Email verified. Taking you to your dashboard...',
  VERIFY_FAILED_TITLE: 'We could not verify your email',
  VERIFY_FAILED_FALLBACK: 'Something went wrong while verifying your email. Please try again.',
  GO_TO_LOGIN: 'Go to login',
  GO_TO_REGISTER: 'Register again',
  BACK_TO_LOGIN: 'Back to login',
  LOGIN_RESEND_LINK: 'Resend verification email',
};

export const MESSAGES = {
  businessSuspended: (action?: string | null, reason?: string | null): string => {
    const phrase = (action && ACTION_PHRASES[action]) || ACTION_PHRASES.paused;
    const trimmedReason = reason?.trim();
    return trimmedReason
      ? `This business access ${phrase} with reason: ${trimmedReason}`
      : `This business access ${phrase}.`;
  },
};
