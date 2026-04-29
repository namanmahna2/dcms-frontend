import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const queryClient = new QueryClient()

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00bcd4" },
    background: {
      default: "#081421",
      paper: "#0e1b29",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <App />
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0b0f19",
              color: "#fff",
              border: "1px solid #00eaff",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#00eaff",
                secondary: "#0b0f19",
              },
            },
            error: {
              style: { borderColor: "#ff5555" },
            },
          }}
        />
      </QueryClientProvider>
    </Router>
  // </React.StrictMode>
);

