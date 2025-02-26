import styles from "../styles/Overlay.module.css";
import logo from "../images/logo.svg";
import { CgProfile } from "react-icons/cg";
import { MdOutlineWbSunny } from "react-icons/md";
import { FaRegMoon, FaRegBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { BiHome } from "react-icons/bi";
import { LuWallet } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAlerts } from "../context/AlertsContext";
import { useState } from "react";
import { BsDatabase } from "react-icons/bs";
import { CiRead, CiUnread } from "react-icons/ci";
import { IoTrashBinOutline } from "react-icons/io5";

const Overlay = ({ children }) => {
  const {
    logout,
    user,
    notifications,
    changeUser,
    readNotification,
    deleteNotification,
  } = useAuth();
  const { lightTheme, setLightTheme } = useAlerts();
  const navigation = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const { pathname } = useLocation();
  const handleChangeUser = async (e) => {
    e.preventDefault();
    if (modalOpen === "login") {
      await changeUser({
        usernames: [user.username, usernameInput],
        passwords: [passwordInput, passwordInput],
      });
    } else {
      await changeUser({
        usernames: [user.username, usernameInput],
        passwords: [passwordInput, newPasswordInput],
      });
    }
    setModalOpen(false);
  };
  return (
    <>
      {modalOpen && (
        <div className={styles.modal} onClick={() => setModalOpen(false)}>
          <div
            className={`${styles.modal__container} ${
              lightTheme ? "" : styles.dark
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modal__title}>
              {modalOpen === "login" ? "Change Login" : "Change Password"}
            </h3>
            <form className={styles.modal__form}>
              <label htmlFor="username" className={styles.modal__label}>
                Username
              </label>
              <input
                type="text"
                id="username"
                className={`${styles.modal__input} ${
                  lightTheme ? "" : styles.dark
                }`}
                onChange={(e) => setUsernameInput(e.target.value)}
                value={usernameInput}
              />
              <label htmlFor="password" className={styles.modal__label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`${styles.modal__input} ${
                  lightTheme ? "" : styles.dark
                }`}
                onChange={(e) => setPasswordInput(e.target.value)}
                value={passwordInput}
              />
              {modalOpen === "password" && (
                <>
                  <label htmlFor="newPassword" className={styles.modal__label}>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className={`${styles.modal__input} ${
                      lightTheme ? "" : styles.dark
                    }`}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    value={newPasswordInput}
                  />
                </>
              )}
              <button
                className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
                onClick={handleChangeUser}
              >
                Submit
              </button>
            </form>
            <button
              className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <header className={`${styles.header} ${lightTheme ? "" : styles.dark}`}>
        <div
          className={`${styles.profile} ${lightTheme ? "" : styles.dark} ${
            profileOpen ? styles.show : ""
          }`}
        >
          <h3
            className={`${styles.profile__title} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            Welcome, {user.username}
          </h3>
          <div className={styles.profile__btns}>
            <button
              className={`${styles.btn} ${lightTheme ? "" : styles.dark} ${
                styles.profile__btn
              }`}
              onClick={() => setModalOpen("login")}
            >
              Change Login
            </button>
            <button
              className={`${styles.btn} ${lightTheme ? "" : styles.dark} ${
                styles.profile__btn
              }`}
              onClick={() => setModalOpen("password")}
            >
              Change Password
            </button>
          </div>
        </div>
        <div
          className={`${styles.notifications} ${
            lightTheme ? "" : styles.dark
          } ${notificationsOpen ? styles.show : ""}`}
        >
          <h3
            className={`${styles.profile__title} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            Notifications
          </h3>
          <div className={styles.notification__box}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`${styles.notification} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  <p
                    className={`${styles.notification__text} ${
                      !notification.is_read ? styles.bold : ""
                    }`}
                  >
                    {notification.message}
                  </p>
                  {notification.is_read ? (
                    <CiUnread
                      className={styles.notification__read}
                      onClick={async () =>
                        await readNotification(notification.notification_id)
                      }
                    />
                  ) : (
                    <CiRead
                      className={styles.notification__read}
                      onClick={async () =>
                        await readNotification(notification.notification_id)
                      }
                    />
                  )}
                  <IoTrashBinOutline
                    className={styles.notification__delete}
                    onClick={async () =>
                      await deleteNotification(notification.notification_id)
                    }
                  />
                </div>
              ))
            ) : (
              <p className={styles.notification__text}>No notifications</p>
            )}
          </div>
        </div>
        <Link
          to="/"
          className={`${styles.logo__box} ${lightTheme ? "" : styles.dark}`}
        >
          <figure
            className={`${styles.logo__container} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              className={`${styles.logo} ${lightTheme ? "" : styles.dark}`}
            />
          </figure>
          <h2 className={`${styles.name} ${lightTheme ? "" : styles.dark}`}>
            Stocks
          </h2>
        </Link>
        <div
          className={`${styles.nav__header} ${lightTheme ? "" : styles.dark}`}
        >
          <Link
            to="/dashboard"
            className={`${styles.header__link} ${
              lightTheme ? "" : styles.dark
            } ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            <BiHome
              className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
            />
          </Link>
          <Link
            to="/wallet"
            className={`${styles.header__link} ${
              lightTheme ? "" : styles.dark
            } ${pathname === "/wallet" ? styles.active : ""}`}
          >
            <LuWallet
              className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
            />
          </Link>
          <Link
            to="/stocks"
            className={`${styles.header__link} ${
              lightTheme ? "" : styles.dark
            } ${pathname === "/stocks" ? styles.active : ""}`}
          >
            <BsDatabase
              className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
            />
          </Link>
        </div>
        <div
          className={`${styles.profile__box} ${lightTheme ? "" : styles.dark}`}
        >
          {lightTheme ? (
            <MdOutlineWbSunny
              className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
              onClick={() => setLightTheme(false)}
            />
          ) : (
            <FaRegMoon
              className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
              onClick={() => setLightTheme(true)}
            />
          )}
          <FaRegBell
            className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
            onClick={() =>
              setNotificationsOpen((prev) => {
                setProfileOpen(false);
                return !prev;
              })
            }
          />
          <CgProfile
            className={`${styles.icon} ${lightTheme ? "" : styles.dark}`}
            onClick={() =>
              setProfileOpen((prev) => {
                setNotificationsOpen(false);
                return !prev;
              })
            }
          />
          <button
            onClick={logout}
            className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
          >
            Logout
          </button>
        </div>
      </header>
      <div
        className={`${styles.main__container} ${lightTheme ? "" : styles.dark}`}
      >
        <nav className={`${styles.nav} ${lightTheme ? "" : styles.dark}`}>
          <ul className={`${styles.list} ${lightTheme ? "" : styles.dark}`}>
            <Link
              to="/dashboard"
              className={`${styles.item} ${lightTheme ? "" : styles.dark}`}
            >
              <BiHome
                className={`${styles.item__icon} ${
                  lightTheme ? "" : styles.dark
                }`}
              />
              <h4
                className={`${styles.item__text} ${
                  lightTheme ? "" : styles.dark
                }`}
              >
                Dashboard
              </h4>
            </Link>
            <Link
              to="/wallet"
              className={`${styles.item} ${lightTheme ? "" : styles.dark}`}
            >
              <LuWallet
                className={`${styles.item__icon} ${
                  lightTheme ? "" : styles.dark
                }`}
                onClick={() => navigation("/wallet")}
              />
              <h4
                className={`${styles.item__text} ${
                  lightTheme ? "" : styles.dark
                }`}
              >
                Wallet
              </h4>
            </Link>
            <Link
              to="/stocks"
              className={`${styles.item} ${lightTheme ? "" : styles.dark}`}
            >
              <BsDatabase
                className={`${styles.item__icon} ${
                  lightTheme ? "" : styles.dark
                }`}
                onClick={() => navigation("/stocks")}
              />
              <h4
                className={`${styles.item__text} ${
                  lightTheme ? "" : styles.dark
                }`}
              >
                Stocks
              </h4>
            </Link>
          </ul>
        </nav>
        <div className={`${styles.children} ${lightTheme ? "" : styles.dark}`}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Overlay;
