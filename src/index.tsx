import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material';
import { HumsaferThemeProvider } from './contexts/HumsaferThemeContext';
import { Config } from './utils/Config';
import { CompanyDataProvider } from './contexts/CompanyDataContext';
import { GoogleMapsProvider } from "./utils/GoogleMapsSingleton";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

Sentry.init({
  dsn: "https://92441b8131c740972efa8470ac78f57f@o945826.ingest.sentry.io/4506121197060096",
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["host", Config.getInstance().getFEHost()],
    }),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.REACT_APP_ENV,
});

function ErrorFallback() {
  return <div>An error has occurred. Please try again later.</div>;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme({
  palette: {
    primary: {
      main: `${Config.getInstance().themeConfig().primaryColor}`,
      contrastText: "#fff"
    }
  },
  typography: {
    fontFamily: [
      "Source Sans Pro",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ].join(","),
    button: {
      textTransform: "none"
    },
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <HumsaferThemeProvider>
            <CompanyDataProvider>
              <GoogleMapsProvider>
                <App />
              </GoogleMapsProvider>
            </CompanyDataProvider>
          </HumsaferThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
