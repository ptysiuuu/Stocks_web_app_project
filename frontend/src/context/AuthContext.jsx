import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useAlerts } from "./AlertsContext";

const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { showAlert } = useAlerts();
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem("token");
    return token || null;
  });
  const [user, setUser] = useState(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        return decoded;
      } catch (error) {
        console.error("Invalid token:", error);
        return null;
      }
    }
    return null;
  });
  const [wallet, setWallet] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [positions, setPositions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);
  const updateWallet = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/account/portfolio"
      );
      setWallet(response.data);
      console.log("Wallet: ", response.data);
    } catch (error) {
      console.error("Error updating wallet:", error);
      //showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updateFavorites = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/favorites");
      setFavorites(response.data);
      console.log("Favorites: ", response.data);
    } catch (error) {
      console.error("Error updating favorites:", error);
      showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updateHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/account/transactions"
      );
      setHistory(response.data);
      console.log("History: ", response.data);
    } catch (error) {
      console.error("Error updating history:", error);
      showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updatePositions = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/account/positions"
      );
      setPositions(response.data);
      console.log("Positions: ", response.data);
    } catch (error) {
      console.error("Error updating positions:", error);
      showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updateNotifications = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications"
      );
      setNotifications(response.data);
      console.log("Notifications: ", response.data);
    } catch (error) {
      console.error("Error updating notifications:", error);
      showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updateAssets = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/account/userAssets"
      );
      setAssets(response.data);
      console.log("Assets: ", response.data);
    } catch (error) {
      console.error("Error updating assets:", error);
      showAlert(error.response.data.message, "error");
    }
  }, [showAlert]);
  const updateUserData = useCallback(async () => {
    await updateWallet();
    await updateFavorites();
    await updateHistory();
    await updatePositions();
    await updateNotifications();
    await updateAssets();
  }, [
    updateWallet,
    updateFavorites,
    updateHistory,
    updatePositions,
    updateNotifications,
    updateAssets,
  ]);
  const login = async (body) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setUser(jwtDecode(token));
      await updateUserData();
      showAlert("Logged in successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error logging in:", error);
    }
  };
  const register = async (body) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setUser(jwtDecode(token));
      await updateUserData();
      showAlert("Registered successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error registering:", error);
    }
  };
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setAssets([]);
    setFavorites([]);
    setHistory([]);
    setNotifications([]);
    setPositions([]);
    setWallet([]);
    showAlert("Logged out successfully", "success");
  }, [showAlert]);
  useEffect(() => {
    const updateState = async () => {
      if (authToken) {
        try {
          const decoded = jwtDecode(authToken);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            logout();
          } else {
            setUser(decoded);
            await updateUserData();
          }
        } catch (error) {
          showAlert(error.message, "error");
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    updateState();
  }, [authToken, logout, updateUserData, showAlert]);
  useEffect(() => {
    setInterval(async () => {
      await updateUserData();
    }, 900000);
  }, [updateUserData]);
  const isAuthenticated = () => {
    return !!authToken && !!user;
  };
  const depositFunds = async (amount) => {
    try {
      if (amount <= 0) {
        showAlert("Amount must be greater than 0", "error");
        return;
      }
      setLoading(true);
      await axios.put("http://localhost:5000/api/account/addFunds", { amount });
      await updateWallet();
      setLoading(false);
      showAlert("Funds added successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error depositing funds:", error);
    }
  };
  const withdrawFunds = async (amount) => {
    try {
      if (amount <= 0) {
        showAlert("Amount must be greater than 0", "error");
        return;
      }
      setLoading(true);
      await axios.put("http://localhost:5000/api/account/withdrawFunds", {
        amount,
      });
      await updateWallet();
      setLoading(false);
      showAlert("Funds withdrawn successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error withdrawing funds:", error);
    }
  };
  const buyAsset = async (symbol, quantity) => {
    try {
      if (quantity <= 0) {
        showAlert("Quantity must be greater than 0", "error");
        return;
      }
      await axios.post("http://localhost:5000/api/order/buy", {
        symbol,
        quantity,
      });
      await updateWallet();
      await updatePositions();
      await updateAssets();
      showAlert("Asset bought successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error buying asset:", error);
    }
  };
  const sellAsset = async (symbol, quantity) => {
    try {
      if (quantity <= 0) {
        showAlert("Quantity must be greater than 0", "error");
        return;
      }
      await axios.post("http://localhost:5000/api/order/sell", {
        symbol,
        quantity,
      });
      await updateWallet();
      await updatePositions();
      await updateHistory();
      await updateAssets();
      showAlert("Asset sold successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error selling asset:", error);
    }
  };
  const switchFavorite = async (symbol, isFavorite) => {
    try {
      if (isFavorite) {
        await axios.delete("http://localhost:5000/api/favorites", {
          data: { symbol },
        });
        showAlert("Asset removed from favorites", "success");
      } else {
        await axios.post("http://localhost:5000/api/favorites", {
          symbol,
        });
        showAlert("Asset added to favorites", "success");
      }
      await updateFavorites();
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error switching favorite:", error);
    }
  };
  const getMarkets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/markets");
      setLoading(false);
      return response.data;
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error getting markets:", error);
      return [];
    }
  }, [showAlert]);
  const getAssets = async (market, page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/markets/AssetList?market_mic=${market.mic}&page=${page}`
      );
      setLoading(false);
      return response.data;
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error getting assets:", error);
      return [];
    }
  };
  const changeUser = async (body) => {
    try {
      setLoading(true);
      await axios.put("http://localhost:5000/api/user/profile", body);
      await updateUserData();
      setLoading(false);
      showAlert("Profile updated successfully", "success");
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error updating profile:", error);
    }
  };
  const readNotification = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`
      );
      await updateNotifications();
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error reading notification:", error);
    }
  };
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`
      );
      await updateNotifications();
    } catch (error) {
      showAlert(error.response.data.message, "error");
      console.error("Error deleting notification:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        setLoading,
        isAuthenticated,
        setAuthToken,
        updateWallet,
        updateFavorites,
        updateHistory,
        updatePositions,
        updateNotifications,
        updateAssets,
        wallet,
        favorites,
        history,
        positions,
        notifications,
        assets,
        depositFunds,
        withdrawFunds,
        buyAsset,
        sellAsset,
        switchFavorite,
        getMarkets,
        getAssets,
        changeUser,
        readNotification,
        deleteNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
