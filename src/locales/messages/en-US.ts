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
  },
  dashboard: {
    greeting: {
      night: 'Late night',
      morning: 'Good morning',
      noon: 'Good noon',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    },
    hero: {
      description: "Current account {username}. This workspace summarizes today's traffic overview, recent visits, and platform notices, with the core figures coming from real-time backend APIs.",
      tags: {
        tenant: 'Tenant admin',
        data: 'Live data'
      }
    },
    stats: {
      onlineUsers: {
        title: 'Online users',
        helper: 'Active sessions in the last {minutes} minutes',
        footer: '{count} users online',
        unit: 'users'
      },
      visitorUv: {
        title: 'Visitor UV',
        helper: 'Unique visitors today',
        footer: '{count} visitors'
      },
      pageViews: {
        title: 'Page views PV',
        helper: 'Page visits today',
        footer: '{count} page views'
      },
      todos: {
        title: 'Todo items',
        helper: 'Operational actions currently recommended by the workspace',
        footer: '{count} items to follow up',
        unit: 'items'
      }
    },
    sections: {
      quickActions: 'Quick Actions',
      quickActionsTitle: 'Quick links',
      todoBoard: 'Todo Board',
      todoBoardTitle: 'Todo items',
      systemSnapshot: 'System Snapshot',
      systemSnapshotTitle: 'Overview',
      platformNotice: 'Platform Notice',
      platformNoticeTitle: 'Platform notices',
      accessTrend: 'Access Trend',
      accessTrendTitle: 'Traffic trend',
      recentVisit: 'Recent Visit',
      recentVisitTitle: 'Recent visits'
    },
    quickEntries: {
      userManagement: {
        title: 'User management',
        description: 'Handle account creation, role assignment, and member maintenance.',
        tag: 'Account'
      },
      rolePermission: {
        title: 'Role permissions',
        description: 'Manage menu, button, and data permission strategies in one place.',
        tag: 'Permission'
      },
      menuManagement: {
        title: 'Menu management',
        description: 'Maintain dynamic menu structure and visibility settings.',
        tag: 'Navigation'
      },
      dictManagement: {
        title: 'Dictionary management',
        description: 'Maintain business dictionaries and shared option sets.',
        tag: 'Base data'
      },
      tenantManagement: {
        title: 'Tenant management',
        description: 'Review tenant status, expiration, and initialization results.',
        tag: 'SaaS'
      },
      tenantPackage: {
        title: 'Tenant packages',
        description: 'Review package capabilities, switches, and available scopes.',
        tag: 'Package'
      },
      metrics: {
        recentVisits: '{count} visits',
        notices: '{count} linked notices',
        trendDays: '{count}-day trend',
        pageViews: '{count} page views',
        onlineUsers: '{count} online',
        visitorUv: '{count} UV'
      }
    },
    todos: {
      noticeReview: 'Review platform notice content',
      noticeCreate: 'Publish a platform notice',
      noticeReviewSummary: 'The latest notice is "{title}". It is worth reviewing whether the publish time and content are still valid.',
      noticeCreateSummary: 'There is no notice to display yet. Consider publishing a system or platform notice.',
      noticeReviewTag: 'Notice audit',
      noticeCreateTag: 'Pending publish',
      noticeReviewAction: 'View notice',
      noticeCreateAction: 'Go publish',
      roleAuditTitle: 'Audit role authorization strategy',
      roleAuditSummary: 'Focus on whether menu permissions, button permissions, and data permissions for core roles still match the current business boundary.',
      roleAuditTag: 'Permission governance',
      roleAuditAction: 'Check permissions',
      visitFollowTitle: 'Follow high-frequency entries',
      visitFollowSummary: 'The most recently visited high-frequency entry can be reviewed from "{title}" first to confirm that data and actions still behave normally.',
      visitFollowEmptySummary: 'There is no recent visit record yet. Start from user management or tenant management for a quick inspection.',
      visitFollowTag: 'Active entry',
      visitFollowAction: 'Open page',
      tenantFocusTitle: 'Watch tenant activity and capacity',
      tenantFocusSummary: 'There are currently {onlineUsers} online users and {visitorUv} visitors. It is worth checking tenant usage and package capacity together.',
      tenantFocusTag: 'Tenant ops',
      tenantFocusAction: 'View tenants'
    },
    overview: {
      currentAccount: 'Current account',
      recentVisits: 'Recent visits',
      notices: 'Notices',
      trendRange: 'Trend range',
      pages: '{count} pages',
      items: '{count} items',
      days: 'Last {count} days'
    },
    notices: {
      viewAll: 'View all',
      empty: 'No notices available',
      systemPublisher: 'System',
      types: {
        notice: 'Notice',
        announcement: 'Announcement',
        system: 'System'
      }
    },
    trend: {
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      ariaLabel: 'Access trend chart',
      pv: 'Page views PV',
      uv: 'Visitors UV'
    },
    recentVisit: {
      empty: 'No recent visit records',
      label: 'Recently visited'
    }
  }
};

export default enUS;
