import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Alert from "./components/Alert";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Wallet from "./pages/Wallet";
import Dashboard from "./pages/Dashboard";
import ChartPage from "./pages/ChartPage";
import StocksPage from "./pages/StocksPage";
import { useAlerts } from "./context/AlertsContext";

const App = () => {
  const { user } = useAuth();
  const { lightTheme } = useAlerts();
  return (
    <div className={lightTheme ? "" : "dark"}>
      <Router>
        <Alert />
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="/chart/:symbol" element={<ChartPage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
