import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // ✅ IMPORT THIS
import {AuthProvider} from "./components/AuthProvider"; // ✅ IF YOU USE IT
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ WRAP THE APP */}
      <AuthProvider> {/* ✅ IF you're using context */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
