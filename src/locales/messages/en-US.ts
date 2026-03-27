const enUS = {
  app: {
    name: 'LuckyColor Admin',
    sessionExpired: 'Your login session has expired. Please sign in again.'
  },
  locale: {
    label: 'Language',
    switch: 'Switch language',
    options: {
      zhCN: 'Simplified Chinese',
      enUS: 'English'
    }
  },
  common: {
    actions: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      refresh: 'Refresh',
      submit: 'Submit',
      search: 'Search',
      reset: 'Reset',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      viewAll: 'View all'
    },
    state: {
      loading: 'Loading...',
      empty: 'No data'
    },
    yes: 'Yes',
    no: 'No'
  },
  layout: {
    userbar: {
      userProfile: 'User profile',
      signOut: 'Sign out',
      signOutSuccess: 'Signed out successfully'
    },
    tenant: {
      current: 'Current tenant',
      unidentified: 'Unknown tenant',
      switchAction: 'Switch tenant',
      switchTitle: 'Switch tenant',
      refreshList: 'Refresh list',
      searchPlaceholder: 'Search tenant name, code, or ID',
      loading: 'Loading tenant list...',
      empty: 'No tenant available to switch',
      target: 'Target tenant',
      confirm: 'Switch and sign in again'
    }
  },
  login: {
    eyebrow: 'Secure Access',
    themeLabel: 'Accent',
    secureAccess: 'Sign In',
    badges: {
      captchaEnabled: 'Server-side arithmetic captcha',
      captchaDisabled: 'Fast sign-in mode',
      tenantEnabled: 'Multi-tenant context',
      tenantDisabled: 'Single-tenant mode'
    },
    hero: {
      title: 'Welcome back',
      description: 'Enter your sign-in details to continue to the workspace.'
    },
    demo: {
      label: 'Demo account',
      defaultPassword: 'Default password {password}'
    },
    form: {
      headline: 'Fill in the required information to enter the admin workspace.',
      refreshCaptcha: 'Refresh challenge',
      username: 'Username',
      password: 'Password',
      captcha: 'Arithmetic captcha',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password'
    },
    actions: {
      enterWorkspace: 'Enter workspace',
      verifying: 'Verifying...',
      signingIn: 'Signing in...'
    },
    tips: {
      captchaEnabled: 'After the arithmetic challenge passes, the app exchanges a one-time captchaToken before continuing the sign-in request.',
      captchaDisabled: 'The captcha flow is skipped in the current environment, which is more convenient for local development and debugging.'
    },
    brand: {
      badge: 'System Brief',
      title: 'The system overview stays supportive, while the sign-in flow remains the real focus of this page.',
      description: 'Only a small amount of background context and environment guidance is kept here, so the sign-in card stays compact and clear.'
    },
    notes: {
      focus: {
        title: 'Sign-in first',
        description: 'The first screen keeps attention on the sign-in action itself, reducing reading cost and scroll burden.'
      },
      palette: {
        title: 'Palette aligned',
        description: 'The main accent returns to the unified teal family used across the admin system, keeping the brand feel consistent.'
      },
      tenant: {
        title: 'Context trimmed',
        enabled: 'Only the essential tenant and verification hints remain, without letting explanatory copy dominate the main card.',
        disabled: 'The current environment runs in single-tenant mode, so the sign-in path stays simpler for local demos and debugging.'
      }
    },
    validation: {
      usernameRequired: 'Please enter your username',
      passwordRequired: 'Please enter your password',
      captchaRequired: 'Please enter the captcha result',
      captchaMustInteger: 'The captcha result must be an integer'
    },
    messages: {
      captchaRefreshed: 'Arithmetic challenge refreshed',
      captchaLoadFailed: 'Failed to load the arithmetic challenge. Please try again later.',
      captchaNotReady: 'The arithmetic challenge is not ready yet. Please refresh and try again.',
      captchaTokenMissing: 'The captcha verification did not return a pass token. Please check the backend API.'
    },
    captcha: {
      inputPlaceholder: 'Enter result',
      empty: 'Click to refresh',
      defaultPrompt: 'Solve the expression on the right, then enter the result',
      refreshHint: 'Click the challenge card on the right to refresh it',
      expiresSoon: 'This challenge is about to expire. Please complete it soon.',
      expiresAt: 'Please complete the input before {time}'
    }
  }
};

export default enUS;
