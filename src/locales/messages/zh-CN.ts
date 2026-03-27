const zhCN = {
  app: {
    name: 'LuckyColor Admin',
    sessionExpired: '\u767b\u5f55\u72b6\u6001\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55'
  },
  locale: {
    label: '\u8bed\u8a00',
    switch: '\u5207\u6362\u8bed\u8a00',
    options: {
      zhCN: '\u7b80\u4f53\u4e2d\u6587',
      enUS: 'English'
    }
  },
  common: {
    actions: {
      confirm: '\u786e\u8ba4',
      cancel: '\u53d6\u6d88',
      refresh: '\u5237\u65b0',
      submit: '\u63d0\u4ea4',
      search: '\u641c\u7d22',
      reset: '\u91cd\u7f6e',
      add: '\u65b0\u589e',
      edit: '\u7f16\u8f91',
      delete: '\u5220\u9664',
      save: '\u4fdd\u5b58',
      viewAll: '\u67e5\u770b\u5168\u90e8'
    },
    state: {
      loading: '\u52a0\u8f7d\u4e2d...',
      empty: '\u6682\u65e0\u6570\u636e'
    },
    yes: '\u662f',
    no: '\u5426'
  },
  layout: {
    userbar: {
      userProfile: '\u7528\u6237\u8d44\u6599',
      signOut: '\u9000\u51fa\u767b\u5f55',
      signOutSuccess: '\u9000\u51fa\u767b\u5f55\u6210\u529f'
    },
    tenant: {
      current: '\u5f53\u524d\u79df\u6237',
      unidentified: '\u672a\u8bc6\u522b\u79df\u6237',
      switchAction: '\u5207\u6362\u79df\u6237',
      switchTitle: '\u79df\u6237\u5207\u6362',
      refreshList: '\u5237\u65b0\u5217\u8868',
      searchPlaceholder: '\u641c\u7d22\u79df\u6237\u540d\u79f0\u3001\u7f16\u7801\u6216 ID',
      loading: '\u79df\u6237\u5217\u8868\u52a0\u8f7d\u4e2d...',
      empty: '\u6682\u65e0\u53ef\u5207\u6362\u79df\u6237',
      target: '\u76ee\u6807\u79df\u6237',
      confirm: '\u5207\u6362\u5e76\u91cd\u65b0\u767b\u5f55'
    }
  },
  login: {
    eyebrow: 'Secure Access',
    themeLabel: '\u4e3b\u9898\u8272',
    secureAccess: 'Sign In',
    badges: {
      captchaEnabled: '\u670d\u52a1\u7aef\u7b97\u672f\u6821\u9a8c',
      captchaDisabled: '\u5feb\u901f\u767b\u5f55\u6a21\u5f0f',
      tenantEnabled: '\u591a\u79df\u6237\u4e0a\u4e0b\u6587',
      tenantDisabled: '\u5355\u79df\u6237\u6a21\u5f0f'
    },
    hero: {
      title: '\u6b22\u8fce\u56de\u6765',
      description: '\u8bf7\u8f93\u5165\u767b\u5f55\u4fe1\u606f\u540e\u8fdb\u5165\u5de5\u4f5c\u53f0\u3002'
    },
    demo: {
      label: '\u6f14\u793a\u8d26\u53f7',
      defaultPassword: '\u9ed8\u8ba4\u5bc6\u7801 {password}'
    },
    form: {
      headline: '\u586b\u5199\u5fc5\u8981\u4fe1\u606f\u540e\u5373\u53ef\u8fdb\u5165\u540e\u53f0',
      refreshCaptcha: '\u5237\u65b0\u7b97\u9898',
      username: '\u767b\u5f55\u8d26\u53f7',
      password: '\u767b\u5f55\u5bc6\u7801',
      captcha: '\u7b97\u672f\u6821\u9a8c',
      usernamePlaceholder: '\u8bf7\u8f93\u5165\u767b\u5f55\u8d26\u53f7',
      passwordPlaceholder: '\u8bf7\u8f93\u5165\u767b\u5f55\u5bc6\u7801'
    },
    actions: {
      enterWorkspace: '\u8fdb\u5165\u5de5\u4f5c\u53f0',
      verifying: '\u6821\u9a8c\u4e2d...',
      signingIn: '\u767b\u5f55\u4e2d...'
    },
    tips: {
      captchaEnabled: '\u7b97\u672f\u9a8c\u8bc1\u901a\u8fc7\u540e\u4f1a\u6362\u53d6\u4e00\u6b21\u6027 captchaToken\uff0c\u518d\u7ee7\u7eed\u6267\u884c\u767b\u5f55\u8bf7\u6c42\u3002',
      captchaDisabled: '\u5f53\u524d\u73af\u5883\u5df2\u8df3\u8fc7\u9a8c\u8bc1\u7801\u6d41\u7a0b\uff0c\u66f4\u9002\u5408\u672c\u5730\u5f00\u53d1\u548c\u8054\u8c03\u9a8c\u8bc1\u3002'
    },
    brand: {
      badge: 'System Brief',
      title: '\u7cfb\u7edf\u7b80\u4ecb\u9000\u5c45\u8f85\u52a9\u4f4d\uff0c\u767b\u5f55\u4fe1\u606f\u624d\u662f\u8fd9\u9875\u7684\u4e3b\u89d2\u3002',
      description: '\u8fd9\u91cc\u53ea\u4fdd\u7559\u5c11\u91cf\u80cc\u666f\u8bf4\u660e\u548c\u73af\u5883\u63d0\u793a\uff0c\u5e2e\u52a9\u7406\u89e3\uff0c\u4f46\u4e0d\u4f1a\u518d\u628a\u767b\u5f55\u5361\u7247\u6324\u5f97\u8fc7\u9ad8\u3002'
    },
    notes: {
      focus: {
        title: '\u767b\u5f55\u4f18\u5148',
        description: '\u9996\u5c4f\u628a\u6ce8\u610f\u529b\u96c6\u4e2d\u5728\u767b\u5f55\u52a8\u4f5c\u672c\u8eab\uff0c\u51cf\u5c11\u9605\u8bfb\u6210\u672c\u548c\u6eda\u52a8\u8d1f\u62c5\u3002'
      },
      palette: {
        title: '\u914d\u8272\u547c\u5e94\u7cfb\u7edf',
        description: '\u9875\u9762\u4e3b\u8272\u6062\u590d\u4e3a\u540e\u53f0\u7edf\u4e00\u7684\u9752\u7eff\u8272\u7cfb\uff0c\u54c1\u724c\u611f\u66f4\u4e00\u81f4\u3002'
      },
      tenant: {
        title: '\u73af\u5883\u4fe1\u606f\u6536\u655b',
        enabled: '\u4fdd\u7559\u5fc5\u8981\u7684\u79df\u6237\u4e0e\u9a8c\u8bc1\u63d0\u793a\uff0c\u4f46\u4e0d\u518d\u8ba9\u8bf4\u660e\u4fe1\u606f\u5360\u636e\u4e3b\u5361\u7247\u4e3b\u4f53\u3002',
        disabled: '\u5f53\u524d\u4e3a\u5355\u79df\u6237\u6a21\u5f0f\uff0c\u767b\u5f55\u8def\u5f84\u66f4\u7b80\u6d01\uff0c\u9002\u5408\u672c\u5730\u8054\u8c03\u4e0e\u6f14\u793a\u3002'
      }
    },
    validation: {
      usernameRequired: '\u8bf7\u8f93\u5165\u767b\u5f55\u8d26\u53f7',
      passwordRequired: '\u8bf7\u8f93\u5165\u767b\u5f55\u5bc6\u7801',
      captchaRequired: '\u8bf7\u8f93\u5165\u7b97\u672f\u6821\u9a8c\u7ed3\u679c',
      captchaMustInteger: '\u6821\u9a8c\u7ed3\u679c\u9700\u4e3a\u6574\u6570'
    },
    messages: {
      captchaRefreshed: '\u5df2\u5237\u65b0\u7b97\u672f\u9898\u9762',
      captchaLoadFailed: '\u7b97\u672f\u9898\u9762\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5',
      captchaNotReady: '\u7b97\u672f\u9898\u9762\u5c1a\u672a\u51c6\u5907\u5b8c\u6210\uff0c\u8bf7\u5237\u65b0\u540e\u518d\u8bd5',
      captchaTokenMissing: '\u7b97\u672f\u6821\u9a8c\u672a\u8fd4\u56de\u653e\u884c\u4ee4\u724c\uff0c\u8bf7\u68c0\u67e5\u540e\u7aef\u63a5\u53e3'
    },
    captcha: {
      inputPlaceholder: '\u8bf7\u8f93\u5165\u7ed3\u679c',
      empty: '\u70b9\u51fb\u5237\u65b0',
      defaultPrompt: '\u5b8c\u6210\u53f3\u4fa7\u7b97\u5f0f\u540e\u8f93\u5165\u7ed3\u679c',
      refreshHint: '\u70b9\u51fb\u53f3\u4fa7\u9898\u9762\u53ef\u5237\u65b0',
      expiresSoon: '\u9898\u9762\u5373\u5c06\u8fc7\u671f\uff0c\u8bf7\u5c3d\u5feb\u5b8c\u6210\u6821\u9a8c',
      expiresAt: '\u8bf7\u5728 {time} \u524d\u5b8c\u6210\u8f93\u5165'
    }
  },
  dashboard: {
    greeting: {
      night: '\u591c\u6df1\u4e86',
      morning: '\u65e9\u4e0a\u597d',
      noon: '\u4e2d\u5348\u597d',
      afternoon: '\u4e0b\u5348\u597d',
      evening: '\u665a\u4e0a\u597d'
    },
    hero: {
      description: '\u5f53\u524d\u8d26\u53f7 {username}\uff0c\u8fd9\u91cc\u6c47\u603b\u4e86\u4eca\u5929\u7684\u8bbf\u95ee\u6982\u51b5\u3001\u6700\u8fd1\u8bbf\u95ee\u548c\u901a\u77e5\u516c\u544a\uff0c\u6240\u6709\u6838\u5fc3\u6570\u5b57\u5747\u6765\u81ea\u540e\u7aef\u5b9e\u65f6\u7edf\u8ba1\u63a5\u53e3\u3002',
      tags: {
        tenant: '\u79df\u6237\u540e\u53f0',
        data: '\u771f\u5b9e\u6570\u636e'
      }
    },
    stats: {
      onlineUsers: {
        title: '\u5728\u7ebf\u7528\u6237',
        helper: '\u6700\u8fd1 {minutes} \u5206\u949f\u6d3b\u8dc3\u4f1a\u8bdd',
        footer: '{count} \u4eba\u5728\u7ebf',
        unit: '\u4eba'
      },
      visitorUv: {
        title: '\u8bbf\u5ba2\u6570 UV',
        helper: '\u4eca\u65e5\u72ec\u7acb\u8bbf\u5ba2\u6570',
        footer: '{count} \u4f4d\u8bbf\u5ba2'
      },
      pageViews: {
        title: '\u6d4f\u89c8\u91cf PV',
        helper: '\u4eca\u65e5\u9875\u9762\u8bbf\u95ee\u91cf',
        footer: '{count} \u6b21\u6d4f\u89c8'
      },
      todos: {
        title: '\u5f85\u529e\u4e8b\u9879',
        helper: '\u5f53\u524d\u5de5\u4f5c\u53f0\u5efa\u8bae\u4f18\u5148\u5904\u7406\u7684\u8fd0\u8425\u52a8\u4f5c',
        footer: '{count} \u9879\u5f85\u8ddf\u8fdb',
        unit: '\u9879'
      }
    },
    sections: {
      quickActions: 'Quick Actions',
      quickActionsTitle: '\u5feb\u6377\u5165\u53e3',
      todoBoard: 'Todo Board',
      todoBoardTitle: '\u5f85\u529e\u4e8b\u9879',
      systemSnapshot: 'System Snapshot',
      systemSnapshotTitle: '\u7cfb\u7edf\u6982\u89c8',
      platformNotice: 'Platform Notice',
      platformNoticeTitle: '\u5e73\u53f0\u516c\u544a',
      accessTrend: 'Access Trend',
      accessTrendTitle: '\u8bbf\u95ee\u8d8b\u52bf',
      recentVisit: 'Recent Visit',
      recentVisitTitle: '\u6700\u8fd1\u8bbf\u95ee'
    },
    quickEntries: {
      userManagement: {
        title: '\u7528\u6237\u7ba1\u7406',
        description: '\u5904\u7406\u8d26\u53f7\u65b0\u589e\u3001\u89d2\u8272\u5206\u914d\u4e0e\u6210\u5458\u7ef4\u62a4\u3002',
        tag: '\u8d26\u53f7'
      },
      rolePermission: {
        title: '\u89d2\u8272\u6743\u9650',
        description: '\u7edf\u4e00\u7ba1\u7406\u83dc\u5355\u3001\u6309\u94ae\u4e0e\u6570\u636e\u6743\u9650\u7b56\u7565\u3002',
        tag: '\u6743\u9650'
      },
      menuManagement: {
        title: '\u83dc\u5355\u7ba1\u7406',
        description: '\u7ef4\u62a4\u52a8\u6001\u83dc\u5355\u7ed3\u6784\u4e0e\u53ef\u89c1\u6027\u914d\u7f6e\u3002',
        tag: '\u5bfc\u822a'
      },
      dictManagement: {
        title: '\u5b57\u5178\u7ba1\u7406',
        description: '\u7edf\u4e00\u7ef4\u62a4\u4e1a\u52a1\u5b57\u5178\u4e0e\u57fa\u7840\u9009\u9879\u96c6\u3002',
        tag: '\u57fa\u7840\u6570\u636e'
      },
      tenantManagement: {
        title: '\u79df\u6237\u7ba1\u7406',
        description: '\u67e5\u770b\u79df\u6237\u72b6\u6001\u3001\u5230\u671f\u4fe1\u606f\u4e0e\u521d\u59cb\u5316\u7ed3\u679c\u3002',
        tag: 'SaaS'
      },
      tenantPackage: {
        title: '\u79df\u6237\u5957\u9910',
        description: '\u6536\u655b\u5957\u9910\u80fd\u529b\u3001\u5f00\u5173\u4e0e\u53ef\u7528\u8303\u56f4\u3002',
        tag: '\u5957\u9910'
      },
      metrics: {
        recentVisits: '{count} \u6761\u8bbf\u95ee',
        notices: '{count} \u6761\u516c\u544a\u5173\u8054',
        trendDays: '{count} \u5929\u8d8b\u52bf',
        pageViews: '{count} \u6b21\u6d4f\u89c8',
        onlineUsers: '{count} \u4eba\u5728\u7ebf',
        visitorUv: '{count} UV'
      }
    },
    todos: {
      noticeReview: '\u590d\u6838\u5e73\u53f0\u516c\u544a\u5185\u5bb9',
      noticeCreate: '\u8865\u5145\u5e73\u53f0\u516c\u544a',
      noticeReviewSummary: '\u6700\u8fd1\u4e00\u6761\u516c\u544a\u4e3a\u300c{title}\u300d\uff0c\u5efa\u8bae\u68c0\u67e5\u53d1\u5e03\u65f6\u95f4\u4e0e\u5185\u5bb9\u662f\u5426\u4ecd\u7136\u6709\u6548\u3002',
      noticeCreateSummary: '\u5f53\u524d\u6682\u65e0\u53ef\u5c55\u793a\u516c\u544a\uff0c\u5efa\u8bae\u8865\u5145\u7cfb\u7edf\u901a\u77e5\u6216\u5e73\u53f0\u516c\u544a\u3002',
      noticeReviewTag: '\u516c\u544a\u5de1\u68c0',
      noticeCreateTag: '\u5f85\u53d1\u5e03',
      noticeReviewAction: '\u67e5\u770b\u516c\u544a',
      noticeCreateAction: '\u524d\u5f80\u53d1\u5e03',
      roleAuditTitle: '\u5de1\u68c0\u89d2\u8272\u6388\u6743\u7b56\u7565',
      roleAuditSummary: '\u91cd\u70b9\u6821\u5bf9\u6838\u5fc3\u89d2\u8272\u7684\u83dc\u5355\u6743\u9650\u3001\u6309\u94ae\u6743\u9650\u4e0e\u6570\u636e\u6743\u9650\u662f\u5426\u5339\u914d\u5f53\u524d\u4e1a\u52a1\u8fb9\u754c\u3002',
      roleAuditTag: '\u6743\u9650\u6cbb\u7406',
      roleAuditAction: '\u68c0\u67e5\u6743\u9650',
      visitFollowTitle: '\u8ddf\u8fdb\u9ad8\u9891\u8bbf\u95ee\u5165\u53e3',
      visitFollowSummary: '\u6700\u8fd1\u8bbf\u95ee\u6700\u9ad8\u9891\u5165\u53e3\u53ef\u4ece\u300c{title}\u300d\u5f00\u59cb\u590d\u67e5\uff0c\u786e\u8ba4\u9875\u9762\u6570\u636e\u4e0e\u64cd\u4f5c\u94fe\u8def\u662f\u5426\u6b63\u5e38\u3002',
      visitFollowEmptySummary: '\u5f53\u524d\u6682\u65e0\u6700\u8fd1\u8bbf\u95ee\u8bb0\u5f55\uff0c\u53ef\u4ece\u7528\u6237\u7ba1\u7406\u6216\u79df\u6237\u7ba1\u7406\u5f00\u59cb\u5de1\u68c0\u3002',
      visitFollowTag: '\u6d3b\u8dc3\u5165\u53e3',
      visitFollowAction: '\u6253\u5f00\u9875\u9762',
      tenantFocusTitle: '\u5173\u6ce8\u79df\u6237\u6d3b\u8dc3\u4e0e\u5bb9\u91cf',
      tenantFocusSummary: '\u5f53\u524d {onlineUsers} \u4f4d\u5728\u7ebf\u7528\u6237\u3001{visitorUv} \u4f4d\u8bbf\u5ba2\uff0c\u5efa\u8bae\u540c\u6b65\u68c0\u67e5\u79df\u6237\u4f7f\u7528\u60c5\u51b5\u4e0e\u5957\u9910\u5bb9\u91cf\u3002',
      tenantFocusTag: '\u79df\u6237\u8fd0\u8425',
      tenantFocusAction: '\u67e5\u770b\u79df\u6237'
    },
    overview: {
      currentAccount: '\u5f53\u524d\u8d26\u53f7',
      recentVisits: '\u6700\u8fd1\u8bbf\u95ee',
      notices: '\u516c\u544a\u6761\u6570',
      trendRange: '\u8d8b\u52bf\u5468\u671f',
      pages: '{count} \u9875',
      items: '{count} \u6761',
      days: '\u6700\u8fd1 {count} \u5929'
    },
    notices: {
      viewAll: '\u67e5\u770b\u5168\u90e8',
      empty: '\u6682\u65e0\u516c\u544a\u5185\u5bb9',
      systemPublisher: '\u7cfb\u7edf\u53d1\u5e03',
      types: {
        notice: '\u901a\u77e5',
        announcement: '\u516c\u544a',
        system: '\u7cfb\u7edf'
      }
    },
    trend: {
      last7Days: '\u6700\u8fd1 7 \u5929',
      last30Days: '\u6700\u8fd1 30 \u5929',
      ariaLabel: '\u8bbf\u95ee\u8d8b\u52bf\u56fe',
      pv: '\u6d4f\u89c8\u91cf PV',
      uv: '\u8bbf\u5ba2\u6570 UV'
    },
    recentVisit: {
      empty: '\u6682\u65e0\u6700\u8fd1\u8bbf\u95ee\u8bb0\u5f55',
      label: '\u6700\u8fd1\u8bbf\u95ee'
    }
  }
};

export default zhCN;
