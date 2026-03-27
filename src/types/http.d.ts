import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    showSuccessMessage?: boolean | string;
    showErrorMessage?: boolean | string;
  }
}
