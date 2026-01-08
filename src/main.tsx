import React from "react";
import ReactDOM from "react-dom/client";
import TransformerDesignSoftware from "./TransformerDesignSoftware";
import "./index.css"; // 🔴 THIS IS CRITICAL

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TransformerDesignSoftware />
  </React.StrictMode>
);
