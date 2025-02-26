import { useAlerts } from "../context/AlertsContext";
import styles from "../styles/Skeleton.module.css";

const Skeleton = ({ width, height, darker = false }) => {
  const { lightTheme } = useAlerts();
  return (
    <div
      className={`${styles.skeleton} ${lightTheme ? "" : styles.dark} ${
        darker ? styles.darker : ""
      }`}
      style={{ width: `${width}rem`, height: `${height}rem` }}
    ></div>
  );
};

export default Skeleton;
