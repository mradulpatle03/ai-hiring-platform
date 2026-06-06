import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:                1,
      refetchOnWindowFocus: false,
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Something went wrong'
        // dynamically import to avoid circular deps
        import('react-hot-toast').then(({ default: toast }) => toast.error(msg))
      },
    },
    mutations: {
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Action failed'
        import('react-hot-toast').then(({ default: toast }) => toast.error(msg))
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
