import { useState } from "react";
import styles from "../styles/Login.module.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useAlerts } from "../context/AlertsContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = ({ isRegister = false }) => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showAlert } = useAlerts();
  const navigate = useNavigate();
  const { login, register, setLoading, loading } = useAuth();
  const validateInputs = () => {
    if (!login || !password) {
      showAlert("Please fill in all fields", "error");
      return false;
    } else if (isRegister && password !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return false;
    }
    return true;
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const body = JSON.stringify({ username, password });
      await login(body);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const body = JSON.stringify({ username, password });
      await register(body);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Stocks</h1>
      <form
        className={styles.form}
        onSubmit={isRegister ? handleRegister : handleLogin}
      >
        <div
          className={`${styles.input__container} ${
            username ? styles.filled : ""
          }`}
          data-placeholder="Login"
        >
          <input
            type="text"
            id="login"
            name="login"
            className={styles.input}
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {username && (
            <AiFillCloseCircle
              className={styles.clear}
              onClick={() => setUsername("")}
              title="Clear"
            />
          )}
        </div>
        <div
          className={`${styles.input__container} ${
            password ? styles.filled : ""
          }`}
          data-placeholder="Password"
        >
          <input
            type={passwordShown ? "text" : "password"}
            id="password"
            name="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <AiFillCloseCircle
              className={styles.clear}
              onClick={() => setPassword("")}
              title="Clear"
            />
          )}
          <div
            className={styles.eye}
            onClick={() => setPasswordShown((prev) => !prev)}
            title={passwordShown ? "Hide Password" : "Show Password"}
          >
            {passwordShown ? <VscEyeClosed /> : <VscEye />}
          </div>
        </div>
        {isRegister && (
          <div
            className={`${styles.input__container} ${
              confirmPassword ? styles.filled : ""
            }`}
            data-placeholder="Confirm Password"
          >
            <input
              type={confirmPasswordShown ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && (
              <AiFillCloseCircle
                className={styles.clear}
                onClick={() => setConfirmPassword("")}
                title="Clear"
              />
            )}
            <div
              className={styles.eye}
              onClick={() => setConfirmPasswordShown((prev) => !prev)}
              title={confirmPasswordShown ? "Hide Password" : "Show Password"}
            >
              {confirmPasswordShown ? <VscEyeClosed /> : <VscEye />}
            </div>
          </div>
        )}
        {isRegister && (
          <button
            type="button"
            className={styles.btn__secondary}
            onClick={() => navigate("/login")}
          >
            Already have an Account
          </button>
        )}
        <div className={styles.btn__container}>
          {!isRegister && (
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Logging..." : "Login"}
            </button>
          )}
          <button
            type={register ? "submit" : "button"}
            className={styles.btn}
            onClick={
              isRegister
                ? null
                : (e) => {
                    e.preventDefault();
                    navigate("/register");
                  }
            }
            disabled={loading}
          >
            {loading && isRegister ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
