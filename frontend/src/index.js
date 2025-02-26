import ReactDOM from "react-dom/client";
import React from "react";
import "./styles/globals.css";
import App from "./App";
import { AlertsProvider } from "./context/AlertsContext";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AlertsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AlertsProvider>
  </React.StrictMode>
);
