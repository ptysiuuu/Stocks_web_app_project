import { useEffect, useState } from "react";
import Overlay from "../components/Overlay";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/StocksPage.module.css";
import { useAlerts } from "../context/AlertsContext";
import { Link } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Spinner from "../components/Spinner";

const StocksPage = () => {
  const [markets, setMarkets] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [marketsShown, setMarketsShown] = useState(true);
  const [assets, setAssets] = useState([]);
  const [currentMarket, setCurrentMarket] = useState("");
  const [page, setPage] = useState(1);
  const { loading, getMarkets, getAssets } = useAuth();
  const { lightTheme } = useAlerts();
  useEffect(() => {
    const fetchMarkets = async () => {
      setMarkets(await getMarkets());
    };
    fetchMarkets();
  }, [getMarkets]);
  const viewAssets = async (page, market) => {
    if (!market) {
      market = { mic: currentMarket };
    }
    const assets = await getAssets(market, page);
    setMarketsShown(false);
    setCurrentMarket(market.mic);
    setAssets(assets);
  };
  useEffect(() => {
    if (!marketsShown) {
      const handler = setTimeout(() => {
        viewAssets(page);
        console.log("Page changed to:", page);
      }, 1000);
      return () => {
        clearTimeout(handler);
      };
    }
  }, [page]);
  return (
    <Overlay>
      <h1 className={`${styles.title} ${lightTheme ? "" : styles.dark}`}>
        All Markets
      </h1>
      <div className={`${styles.options} ${lightTheme ? "" : styles.dark}`}>
        {marketsShown && (
          <div className={styles.sort__by}>
            <h4 className={styles.sort__title}>Sort by:</h4>
            <select
              className={`${styles.sort} ${lightTheme ? "" : styles.dark}`}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="country">Country</option>
              <option value="name">Name</option>
            </select>
          </div>
        )}
        {!marketsShown && (
          <>
            <button
              className={`${styles.btn} ${lightTheme ? "" : styles.dark}`}
              onClick={() => {
                setMarketsShown(true);
                setCurrentMarket("");
              }}
            >
              Go Back
            </button>
            <div className={styles.pages__container}>
              <IoIosArrowBack
                className={`${styles.arrow} ${lightTheme ? "" : styles.dark}`}
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1);
                  }
                }}
              />
              <h4 className={styles.pages}>
                Page: {page} / {assets[0].pages}
              </h4>
              <IoIosArrowForward
                className={`${styles.arrow} ${lightTheme ? "" : styles.dark}`}
                onClick={() => {
                  if (page < assets[0].pages) {
                    setPage(page + 1);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
      {loading ? (
        <div className={styles.spinner}>
          <Spinner width={20} height={20} />
        </div>
      ) : (
        <ul className={`${styles.list} ${lightTheme ? "" : styles.dark}`}>
          {marketsShown
            ? markets
                .sort((a, b) => {
                  if (sortBy === "country") {
                    return a.country.localeCompare(b.country);
                  } else if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                  } else {
                    return 0;
                  }
                })
                .map((market, index) => (
                  <li
                    className={`${styles.market} ${
                      lightTheme ? "" : styles.dark
                    }`}
                    key={index}
                  >
                    <h3 className={styles.market__title}>{market.name}</h3>
                    <div className={styles.details}>
                      <h4
                        className={`${styles.market__country} ${
                          lightTheme ? "" : styles.dark
                        }`}
                      >
                        {market.country}
                      </h4>
                      <button
                        className={`${styles.btn} ${
                          lightTheme ? "" : styles.dark
                        }`}
                        onClick={() => {
                          viewAssets(1, market);
                          setPage(1);
                        }}
                      >
                        View Assets
                      </button>
                    </div>
                  </li>
                ))
            : assets.map((asset, index) => (
                <li
                  className={`${styles.market} ${
                    lightTheme ? "" : styles.dark
                  }`}
                  key={index}
                >
                  <h3 className={styles.market__title}>{asset.name}</h3>
                  <div className={styles.details}>
                    <h4
                      className={`${styles.market__country} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      {asset.symbol}
                    </h4>
                    <Link
                      to={`/chart/${asset.symbol.toLowerCase()}`}
                      className={`${styles.btn} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      Chart
                    </Link>
                  </div>
                </li>
              ))}
        </ul>
      )}
    </Overlay>
  );
};

export default StocksPage;
