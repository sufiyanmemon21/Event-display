import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./context/Themecontext.jsx";
import { store } from "./redux/store.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LiveUpdates from "./components/LiveUpdates";
import ScrollToTop from "./components/ScrollToTop";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Analytics />

    <BrowserRouter>
      <ScrollToTop />
      <Provider store={store}>
        <ThemeProvider>
          <TooltipProvider>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Zoom}
            />

            <ErrorBoundary>
              <LiveUpdates />
              <App />
            </ErrorBoundary>
          </TooltipProvider>
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
