// The value for API_KEY will be injected at runtime via a <script> tag in index.html
// or by a build-time replacement. Ensure a global `const API_KEY = '...';` is defined
// before the Angular bundle executes.
declare const API_KEY: string;

export const environment = {
  production: true,
  apiUrl: API_KEY, // dynamically provided at runtime

};