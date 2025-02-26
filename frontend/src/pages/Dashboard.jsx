import React, { useState } from "react";
import styles from "../styles/Dashboard.module.css";
import Overlay from "../components/Overlay";
import { CiHeart } from "react-icons/ci";
import { AiFillCloseCircle } from "react-icons/ai";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAlerts } from "../context/AlertsContext";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Skeleton from "../components/Skeleton";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [positionsShown, setPositionsShown] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { lightTheme } = useAlerts();
  const { favorites, positions, wallet, loading } = useAuth();

  const handleSearch = async (e) => {
    e.preventDefault();
    setPositionsShown(false);
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/markets/SearchAsset/${search}`
      );
      const data = response.data.data
        .filter((item) => item.has_intraday || item.has_eod)
        .map((item) => ({ company: item.name, symbol: item.symbol }));
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };
  return (
    <Overlay>
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
      </div>
      <div
        className={`${styles.info__container} ${lightTheme ? "" : styles.dark}`}
      >
        <div
          className={`${styles.favorites__container} ${
            lightTheme ? "" : styles.dark
          }`}
        >
          <div
            className={`${styles["favorites__title--container"]} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <h2
              className={`${styles.favorites__title} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Favorites
            </h2>
            <CiHeart
              className={`${styles.favorites__icon} ${
                lightTheme ? "" : styles.dark
              }`}
            />
          </div>
          <div
            className={`${styles["favorites__list--title"]} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <h5
              className={`${styles["favorites__list--title-item"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Symbol
            </h5>
            <h5
              className={`${styles["favorites__list--title-item"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Change{" "}
              <span
                className={`${styles.span} ${lightTheme ? "" : styles.dark}`}
              >
                (1D)
              </span>
            </h5>
            <h5
              className={`${styles["favorites__list--title-item"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Buy
            </h5>
            <h5
              className={`${styles["favorites__list--title-item"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              Sell
            </h5>
          </div>
          {loading ? (
            <div className={styles.spinner}>
              <Spinner width={15} height={15} />
            </div>
          ) : (
            <ul
              className={`${styles.favorites__list} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              {favorites.length > 0 ? (
                favorites.map((favorite, index) => (
                  <li
                    className={`${styles["favorites__list--item"]} ${
                      lightTheme ? "" : styles.dark
                    }`}
                    key={index}
                  >
                    <div
                      className={`${styles["favorites__list--item-details"]} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      <h4
                        className={`${styles["favorites__list--item-title"]} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {favorite.title}
                      </h4>
                      <h6
                        className={`${
                          styles["favorites__list--item-subtitle"]
                        } ${lightTheme ? "" : styles.dark}`}
                      >
                        {favorite.subtitle}
                      </h6>
                      <Link
                        to={`/chart/${favorite.subtitle.toLowerCase()}`}
                        className={`${styles.btn} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        Enter
                      </Link>
                    </div>
                    <h5
                      className={`${styles["favorites__list--detail"]} ${
                        favorite.change > 0 ? styles.positive : styles.negative
                      } ${lightTheme ? "" : styles.dark}`}
                    >
                      {favorite.change}%
                    </h5>
                    <h5
                      className={`${styles["favorites__list--detail"]} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      {favorite.buy?.toFixed(2)}
                    </h5>
                    <h5
                      className={`${styles["favorites__list--detail"]} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      {favorite.sell}
                    </h5>
                  </li>
                ))
              ) : (
                <h5 className={styles.empty}>No favorites yet!</h5>
              )}
            </ul>
          )}
        </div>
        <div
          className={`${styles.positions__container} ${
            lightTheme ? "" : styles.dark
          }`}
        >
          <form
            className={`${styles.search__container} ${
              lightTheme ? "" : styles.dark
            }`}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Enter company name or symbol..."
              className={`${styles.search__input} ${
                lightTheme ? "" : styles.dark
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AiFillCloseCircle
              className={`${styles.search__icon} ${
                lightTheme ? "" : styles.dark
              }`}
              onClick={() => setSearch("")}
            />
            <HiMagnifyingGlass
              className={`${styles.search__icon} ${styles.glass} ${
                lightTheme ? "" : styles.dark
              }`}
              onClick={handleSearch}
            />
          </form>
          <h2 className={`${styles.subtitle} ${lightTheme ? "" : styles.dark}`}>
            {positionsShown ? (
              "Open positions"
            ) : (
              <>
                Search results
                <span
                  className={`${styles.btn} ${lightTheme ? "" : styles.dark} ${
                    styles.btn__title
                  }`}
                  onClick={() => setPositionsShown(true)}
                >
                  Go back
                </span>
              </>
            )}
          </h2>
          {positionsShown ? (
            <>
              <div
                className={`${styles.positions__title} ${
                  lightTheme ? "" : styles.dark
                }`}
              >
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Position
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Volume
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Market value
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Open price
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Market price
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Net profit
                </h5>
                <h5
                  className={`${styles["positions__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Net P/L%
                </h5>
              </div>
              {loading ? (
                <div className={styles.spinner}>
                  <Spinner width={20} height={20} />
                </div>
              ) : (
                <ul
                  className={`${styles.positions__list} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  {positions.length > 0 ? (
                    positions.map((position, index) => (
                      <li
                        className={`${styles["positions__list--item"]} ${
                          lightTheme ? "" : styles.dark
                        }`}
                        key={index}
                      >
                        <div
                          className={`${
                            styles["positions__list--item-details"]
                          } ${lightTheme ? "" : styles.dark}`}
                        >
                          <h4
                            className={`${
                              styles["positions__list--item-title"]
                            } ${lightTheme ? "" : styles.dark}`}
                          >
                            {position.name}
                          </h4>
                          <h6
                            className={`${
                              styles["positions__list--item-subtitle"]
                            } ${lightTheme ? "" : styles.dark}`}
                          >
                            {position.symbol}
                          </h6>
                          <Link
                            to={`/chart/${position.symbol.toLowerCase()}`}
                            className={`${styles.btn} ${
                              lightTheme ? "" : styles.dark
                            }`}
                          >
                            Enter
                          </Link>
                        </div>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {position.quantity}
                        </h5>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {(position.market_price * position.quantity).toFixed(
                            2
                          )}
                          $
                        </h5>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {position.open_price}$
                        </h5>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            position.market_price > position.open_price
                              ? styles.positive
                              : styles.negative
                          } ${lightTheme ? "" : styles.dark}`}
                        >
                          {position.market_price}$
                        </h5>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            position.market_price - position.open_price > 0
                              ? styles.positive
                              : styles.negative
                          } ${lightTheme ? "" : styles.dark}`}
                        >
                          {(
                            (position.market_price - position.open_price) *
                            position.quantity
                          ).toFixed(2)}
                          $
                        </h5>
                        <h5
                          className={`${styles["positions__list--detail"]} ${
                            position.market_price - position.open_price > 0
                              ? styles.positive
                              : styles.negative
                          } ${lightTheme ? "" : styles.dark}`}
                        >
                          {(
                            ((position.market_price - position.open_price) /
                              position.market_price) *
                            100
                          ).toFixed(2)}
                          %
                        </h5>
                      </li>
                    ))
                  ) : (
                    <h5 className={styles.empty}>No positions yet!</h5>
                  )}
                </ul>
              )}
            </>
          ) : (
            <>
              <div
                className={`${styles.search__title} ${
                  lightTheme ? "" : styles.dark
                }`}
              >
                <h5
                  className={`${styles["search__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Company
                </h5>
                <h5
                  className={`${styles["search__title--item"]} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  Symbol
                </h5>
              </div>
              {searchLoading ? (
                <div className={styles.spinner}>
                  <Spinner width={20} height={20} />
                </div>
              ) : (
                <ul
                  className={`${styles.search__list} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => (
                      <li
                        className={`${styles.search__item} ${
                          lightTheme ? "" : styles.dark
                        }`}
                        key={index}
                      >
                        <h5
                          className={`${styles["search__item--item"]} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {item.company}
                        </h5>
                        <h5
                          className={`${styles["search__item--item"]} ${
                            lightTheme ? "" : styles.dark
                          }`}
                        >
                          {item.symbol}
                        </h5>
                        <Link
                          to={`/chart/${item.symbol.toLowerCase()}`}
                          className={`${styles.btn} ${
                            lightTheme ? "" : styles.dark
                          } ${styles.btn__search}`}
                        >
                          Enter
                        </Link>
                      </li>
                    ))
                  ) : (
                    <h5 className={styles.empty}>No results found!</h5>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default Dashboard;
