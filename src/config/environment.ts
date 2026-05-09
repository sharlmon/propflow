type RuntimeEnvironment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  appName: string;
  appUrl: string;
  apiBaseUrl: string;
  environment: RuntimeEnvironment;
  geminiApiKey: string;
  mapProvider: 'mapbox' | 'google' | 'disabled';
  mapboxToken: string;
  sentryDsn: string;
}

const readEnv = (key: string, fallback = '') => import.meta.env[key] ?? fallback;

const normalizeEnvironment = (value: string): RuntimeEnvironment => {
  if (value === 'production' || value === 'staging') return value;
  return 'development';
};

export const env: EnvironmentConfig = {
  appName: readEnv('VITE_APP_NAME', 'PropFlow'),
  appUrl: readEnv('VITE_APP_URL', 'http://localhost:5173'),
  apiBaseUrl: readEnv('VITE_API_BASE_URL', '/api'),
  environment: normalizeEnvironment(readEnv('MODE', import.meta.env.MODE)),
  geminiApiKey: readEnv('VITE_GEMINI_API_KEY'),
  mapProvider:
    readEnv('VITE_MAP_PROVIDER', 'disabled') === 'mapbox'
      ? 'mapbox'
      : readEnv('VITE_MAP_PROVIDER') === 'google'
        ? 'google'
        : 'disabled',
  mapboxToken: readEnv('VITE_MAPBOX_TOKEN'),
  sentryDsn: readEnv('VITE_SENTRY_DSN'),
};

export const validateEnvironment = () => {
  const warnings: string[] = [];

  if (env.environment === 'production' && env.apiBaseUrl === '/api') {
    warnings.push('VITE_API_BASE_URL should point to the production API gateway.');
  }

  if (env.mapProvider === 'mapbox' && !env.mapboxToken) {
    warnings.push('VITE_MAPBOX_TOKEN is required when VITE_MAP_PROVIDER=mapbox.');
  }

  return warnings;
};
