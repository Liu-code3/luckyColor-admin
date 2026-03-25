import { request } from '@/utils/http';

export interface LoginCaptchaChallengePayload {
  captchaId: string;
  captchaSvg: string;
  prompt: string;
  expiresAt?: string | null;
}

export interface VerifyLoginCaptchaRequestPayload {
  captchaId: string;
  answer: string;
}

export interface VerifyLoginCaptchaResponsePayload {
  captchaToken: string;
  expiresAt?: string | null;
}

export function getLoginCaptchaChallengeApi() {
  return request<never, LoginCaptchaChallengePayload>({
    url: '/auth/captcha/challenge',
    method: 'get',
    headers: {
      'x-silent-request': 'true'
    }
  });
}

export function verifyLoginCaptchaApi(data: VerifyLoginCaptchaRequestPayload) {
  return request<VerifyLoginCaptchaRequestPayload, VerifyLoginCaptchaResponsePayload>({
    url: '/auth/captcha/verify',
    method: 'post',
    data,
    headers: {
      'x-silent-request': 'true'
    }
  });
}
