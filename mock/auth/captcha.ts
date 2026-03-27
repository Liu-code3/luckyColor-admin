import type { MockMethod } from 'vite-plugin-mock';

interface CaptchaState {
  answer: string;
  expiresAt: string;
}

const captchaStore = new Map<string, CaptchaState>();

function createCaptchaSvg(expression: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="56" viewBox="0 0 220 56" role="img" aria-label="captcha">
      <defs>
        <linearGradient id="captcha-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f766e" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#f97316" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="218" height="54" rx="18" fill="url(#captcha-bg)" stroke="rgba(15,118,110,0.22)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" fill="#0f172a" font-weight="700">${expression}</text>
    </svg>
  `.trim();
}

function createChallenge() {
  const left = Math.floor(Math.random() * 9) + 1;
  const right = Math.floor(Math.random() * 9) + 1;
  const operators = [ '+', '-' ] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const answer = operator === '+' ? left + right : left - right;
  const captchaId = `mock-captcha-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  captchaStore.set(captchaId, {
    answer: String(answer),
    expiresAt
  });

  return {
    code: 200,
    msg: '验证码已生成',
    data: {
      captchaId,
      captchaSvg: createCaptchaSvg(`${left} ${operator} ${right} = ?`),
      prompt: '请输入算式结果',
      expiresAt
    }
  };
}

const captchaMocks: MockMethod[] = [
  {
    url: '/api/auth/captcha/challenge',
    method: 'get',
    response: () => createChallenge()
  },
  {
    url: '/api/auth/captcha/verify',
    method: 'post',
    response: ({ body }) => {
      const captchaId = body?.captchaId;
      const answer = String(body?.answer ?? '').trim();
      const current = captchaStore.get(captchaId);

      if (!captchaId || !current) {
        return {
          code: 400,
          msg: '验证码不存在或已失效',
          data: null
        };
      }

      if (new Date(current.expiresAt).getTime() <= Date.now()) {
        captchaStore.delete(captchaId);
        return {
          code: 400,
          msg: '验证码已过期，请刷新后重试',
          data: null
        };
      }

      if (answer !== current.answer) {
        return {
          code: 400,
          msg: '验证码结果不正确',
          data: null
        };
      }

      captchaStore.delete(captchaId);
      return {
        code: 200,
        msg: '验证码校验成功',
        data: {
          captchaToken: `mock-captcha-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
      };
    }
  }
];

export default captchaMocks;
