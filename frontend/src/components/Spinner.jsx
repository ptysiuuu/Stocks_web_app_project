import { useAlerts } from "../context/AlertsContext";
import styles from "../styles/Spinner.module.css";

const Spinner = ({ width, height }) => {
  const { lightTheme } = useAlerts();
  return (
    <div
      className={styles.spinner}
      style={{ width: `${width}rem`, height: `${height}rem` }}
    >
      <div
        className={`${styles.spinner__dot} ${lightTheme ? "" : styles.dark}`}
        style={{ width: `${width / 5}rem`, height: `${height / 5}rem` }}
      ></div>
      <div
        className={`${styles.spinner__dot} ${lightTheme ? "" : styles.dark}`}
        style={{ width: `${width / 5}rem`, height: `${height / 5}rem` }}
      ></div>
      <div
        className={`${styles.spinner__dot} ${lightTheme ? "" : styles.dark}`}
        style={{ width: `${width / 5}rem`, height: `${height / 5}rem` }}
      ></div>
    </div>
  );
};

export default Spinner;
