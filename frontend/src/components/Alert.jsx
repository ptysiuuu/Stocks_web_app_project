import { useAlerts } from "../context/AlertsContext";
import styles from "../styles/Alert.module.css";

const Alert = () => {
  const { popupMessage, popupType, isPopupShown, lightTheme } = useAlerts();
  return (
    <div
      className={`${styles.alert} ${popupType ? styles[popupType] : ""} ${
        isPopupShown ? styles.show : ""
      } ${!lightTheme ? styles.dark : ""}`}
    >
      {popupMessage}
    </div>
  );
};

export default Alert;
