import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    showSuccessMessage?: boolean | string;
    showErrorMessage?: boolean | string;
    skipAuthHeader?: boolean;
    skipAuthRefresh?: boolean;
    _authRetry?: boolean;
  }
}
