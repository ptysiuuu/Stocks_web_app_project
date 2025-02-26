import React, { useState } from "react";
import styles from "../styles/Wallet.module.css";
import Overlay from "../components/Overlay";
import { useAlerts } from "../context/AlertsContext";
import { AiFillCloseCircle } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Skeleton from "../components/Skeleton";

const Wallet = () => {
  const { lightTheme } = useAlerts();
  const [stockSearch, setStockSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState("");
  const { assets, history, wallet, depositFunds, withdrawFunds, loading } =
    useAuth();
  return (
    <Overlay>
      {modalOpen && (
        <div className={styles.modal} onClick={() => setModalOpen(false)}>
          <div
            className={`${styles.modal__container} ${
              lightTheme ? "" : styles.dark
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modal__title}>
              {modalOpen === "deposit" ? "Deposit funds" : "Withdraw funds"}
            </h3>
            <form className={styles.modal__form}>
              <label htmlFor="amount" className={styles.modal__label}>
                Enter amount
              </label>
              <input
                type="text"
                id="amount"
                className={`${styles.modal__input} ${
                  lightTheme ? "" : styles.dark
                }`}
                onChange={(e) => setModalAmount(e.target.value)}
                value={modalAmount}
              />
              <button
                className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
                onClick={
                  modalOpen && modalOpen === "deposit"
                    ? () => depositFunds(modalAmount)
                    : () => withdrawFunds(modalAmount)
                }
              >
                {modalOpen === "deposit" ? "Deposit" : "Withdraw"}
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
      <div
        className={`${styles.title__container} ${
          lightTheme ? "" : styles.dark
        }`}
      >
        {loading ? (
          <Skeleton width={10} height={1.5} darker={true} />
        ) : (
          <h2 className={`${styles.profit} ${lightTheme ? "" : styles.dark}`}>
            Wallet: {wallet.free_funds?.toFixed(2)}$
          </h2>
        )}
        {loading ? (
          <Skeleton width={10} height={1.5} darker={true} />
        ) : (
          <h1 className={`${styles.title} ${lightTheme ? "" : styles.dark}`}>
            Account Value: {wallet.balance?.toFixed(2)}$
          </h1>
        )}
        {loading ? (
          <Skeleton width={10} height={1.5} darker={true} />
        ) : (
          <h2 className={`${styles.profit} ${lightTheme ? "" : styles.dark}`}>
            Profit:{" "}
            <span
              className={`${
                wallet.profit >= 0 ? styles.positive : styles.negative
              } ${lightTheme ? "" : styles.dark}`}
            >
              {wallet.profit?.toFixed(2)}$
            </span>
          </h2>
        )}
        <button
          className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
          onClick={() => setModalOpen("deposit")}
        >
          Deposit
        </button>
        <button
          className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
          onClick={() => setModalOpen("withdraw")}
        >
          Withdraw
        </button>
      </div>
      <div
        className={`${styles.info__container} ${lightTheme ? "" : styles.dark}`}
      >
        <div
          className={`${styles.shares__container} ${
            lightTheme ? "" : styles.dark
          }`}
        >
          <h2
            className={`${styles.container__title} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            Assets
          </h2>
          <form
            className={`${styles.search__container} ${
              lightTheme ? "" : styles.dark
            }`}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Search for Stock"
              className={`${styles.search__input} ${
                lightTheme ? "" : styles.dark
              }`}
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
            />
            {stockSearch && (
              <AiFillCloseCircle
                className={`${styles.search__icon} ${
                  lightTheme ? "" : styles.dark
                }`}
                onClick={() => setStockSearch("")}
              />
            )}
          </form>
          {loading ? (
            <div className={styles.spinner}>
              <Spinner width={20} height={20} />
            </div>
          ) : (
            <ul
              className={`${styles.stocks__list} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              {assets.length > 0 ? (
                assets
                  .filter((stock) =>
                    stock.symbol
                      .toLowerCase()
                      .includes(stockSearch.toLowerCase())
                  )
                  .map((stock, index) => (
                    <li
                      className={`${styles.stocks__item} ${
                        lightTheme ? "" : styles.dark
                      }`}
                      key={index}
                    >
                      <h4
                        className={`${styles.stock__subtitle} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {stock.symbol}
                        <span
                          className={`${styles.stock__title} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {stock.name}
                        </span>
                      </h4>
                      <h3
                        className={`${styles.stock__stock} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {stock.quantity}
                        <span
                          className={`${styles.stock__price} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          ~{(stock.quantity * stock.current_price).toFixed(2)}$
                        </span>
                      </h3>
                      <Link
                        to={`/chart/${stock.symbol.toLowerCase()}`}
                        className={`${styles.btn} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        Chart
                      </Link>
                    </li>
                  ))
              ) : (
                <h5 className={styles.empty}>No assets found!</h5>
              )}
            </ul>
          )}
        </div>
        <div
          className={`${styles.history__container} ${
            lightTheme ? "" : styles.dark
          }`}
        >
          <h2
            className={`${styles.container__title} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            History
          </h2>
          <form
            className={`${styles.search__container} ${
              lightTheme ? "" : styles.dark
            }`}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Search for History"
              className={`${styles.search__input} ${
                lightTheme ? "" : styles.dark
              }`}
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
            {historySearch && (
              <AiFillCloseCircle
                className={`${styles.search__icon} ${
                  lightTheme ? "" : styles.dark
                }`}
                onClick={() => setHistorySearch("")}
              />
            )}
          </form>
          <div
            className={`${styles.history__title} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <h5
              className={`${styles["history__title--text"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Symbol
            </h5>
            <h5
              className={`${styles["history__title--text"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Volume
            </h5>
            <h5
              className={`${styles["history__title--text"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Close price
            </h5>
            <h5
              className={`${styles["history__title--text"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Open price
            </h5>
            <h5
              className={`${styles["history__title--text"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Net profit
            </h5>
          </div>
          {loading ? (
            <div className={styles.spinner}>
              <Spinner width={20} height={20} />
            </div>
          ) : (
            <ul
              className={`${styles.history__list} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              {history.length > 0 ? (
                history
                  .filter((stock) =>
                    stock.symbol
                      .toLowerCase()
                      .includes(historySearch.toLowerCase())
                  )
                  .map((item, index) => (
                    <li
                      className={`${styles.history__item} ${
                        lightTheme ? "" : styles.dark
                      }`}
                      key={index}
                    >
                      <h5
                        className={`${styles.history__text} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {item.symbol}
                      </h5>
                      <h5
                        className={`${styles.history__text} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {item.quantity}
                      </h5>
                      <h5
                        className={`${styles.history__text} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {item.close_price}$
                      </h5>
                      <h5
                        className={`${styles.history__text} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {item.open_price}$
                      </h5>
                      <h5
                        className={`${styles.history__text} ${
                          lightTheme ? "" : styles.dark
                        } ${
                          (item.close_price - item.open_price) * item.quantity >
                          0
                            ? styles.positive
                            : styles.negative
                        }`}
                      >
                        {(
                          (item.close_price - item.open_price) *
                          item.quantity
                        ).toFixed(2)}
                        $
                      </h5>
                    </li>
                  ))
              ) : (
                <h5 className={styles.empty__history}>No history found!</h5>
              )}
            </ul>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default Wallet;
