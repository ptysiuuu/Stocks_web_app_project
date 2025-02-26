import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

const AlertsContext = createContext();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isPopupShown, setIsPopupShown] = useState(false);
  const [lightTheme, setLightTheme] = useState(true);

  useEffect(() => {
    const processAlerts = async () => {
      if (!currentAlert && alerts.length > 0) {
        setCurrentAlert(alerts[0]);
        setAlerts((prev) => prev.slice(1));
        setIsPopupShown(true);
        await delay(5000);
        setIsPopupShown(false);
        await delay(1000);
        setCurrentAlert(null);
      }
    };
    processAlerts();
  }, [alerts, currentAlert]);

  const showAlert = useCallback((message, type = "success") => {
    setAlerts((prev) => [...prev, { message, type }]);
  }, []);

  const hideAlert = () => {
    setIsPopupShown(false);
  };

  return (
    <AlertsContext.Provider
      value={{
        isPopupShown,
        popupMessage: currentAlert?.message,
        popupType: currentAlert?.type,
        showAlert,
        hideAlert,
        lightTheme,
        setLightTheme,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  return useContext(AlertsContext);
};
