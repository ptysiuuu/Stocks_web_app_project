import React from "react";
import styles from "../styles/LoginPage.module.css";
import Login from "../components/Login";
import Alert from "../components/Alert";

const LoginPage = () => {
  return (
    <main className={styles.main}>
      <Alert />
      <Login />
    </main>
  );
};

export default LoginPage;
