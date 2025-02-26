import { useParams } from "react-router-dom";
import Overlay from "../components/Overlay";
import styles from "../styles/ChartPage.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdOutlineCompareArrows } from "react-icons/md";
import { HiOutlineMinusCircle, HiOutlinePlusCircle } from "react-icons/hi2";
import { useAlerts } from "../context/AlertsContext";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Spinner from "../components/Spinner";
import Skeleton from "../components/Skeleton";

const ChartPage = () => {
  const { lightTheme } = useAlerts();
  const { symbol } = useParams();
  const [selected, setSelected] = useState("value");
  const [money, setMoney] = useState("0.00");
  const [amount, setAmount] = useState("0.000000");
  const [assetData, setAssetData] = useState({});
  const {
    buyAsset,
    sellAsset,
    positions,
    switchFavorite,
    favorites,
    loading,
    setLoading,
  } = useAuth();
  const [favorite, setFavorite] = useState(
    favorites.find((stock) => stock.subtitle.toLowerCase() === symbol)
  );
  const [timeRange, setTimeRange] = useState("1Y");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const changeAmount = (change) => {
    if (selected === "value") {
      let newMoney = +money + change;
      if (newMoney < 0) newMoney = 0;
      setMoney(newMoney.toFixed(2));
      setAmount((newMoney / assetData.buyPrice).toFixed(6));
    } else if (selected === "volume") {
      let newAmount = +amount + change;
      if (newAmount < 0) newAmount = 0;
      setAmount(newAmount.toFixed(6));
      setMoney((newAmount * assetData.buyPrice).toFixed(2));
    }
  };
  useEffect(() => {
    const getAssetData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/markets/Asset/${symbol}`
        );
        setAssetData(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getAssetData();
  }, [positions, symbol, setLoading]);
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    switch (timeRange) {
      case "1D":
        return `${date.getHours()}:${date.getMinutes()}`;
      case "5D":
      case "1M":
      case "6M":
      case "1Y":
      case "5Y":
      case "Max":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      default:
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  };
  const filterDataByTimeRange = useCallback(() => {
    if (!assetData.data) return [];
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case "1D":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "5D":
        startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "6M":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "5Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case "Max":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(0);
    }
    return assetData.data.filter((item) => new Date(item.date) >= startDate);
  }, [assetData.data, timeRange]);
  const downsampleData = (data, maxPoints = 500) => {
    if (data.length <= maxPoints) return data;
    const sampled = [];
    const step = Math.ceil(data.length / maxPoints);
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    return sampled;
  };
  const filteredAndDownsampledData = useMemo(() => {
    const data = filterDataByTimeRange();
    const result = downsampleData(data);
    setChartData(
      result.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    setChartLoading(false);
    return result;
  }, [filterDataByTimeRange]);
  return (
    <Overlay>
      <div className={`${styles.container} ${lightTheme ? "" : styles.dark}`}>
        <div className={styles.info__container}>
          {favorite ? (
            <IoMdHeart
              className={`${styles.favorite__icon} ${
                favorite ? styles.favorite : ""
              } ${lightTheme ? "" : styles.dark}`}
              onClick={async () => {
                await switchFavorite(assetData.symbol, true);
                setFavorite(false);
              }}
            />
          ) : (
            <IoMdHeartEmpty
              className={`${styles.favorite__icon} ${
                favorite ? styles.favorite : ""
              } ${lightTheme ? "" : styles.dark}`}
              onClick={async () => {
                await switchFavorite(assetData.symbol, false);
                setFavorite(true);
              }}
            />
          )}
          <h1 className={styles.info__title}>
            {loading ? (
              <Skeleton width={40} height={3} />
            ) : (
              <>
                {assetData.companyName}
                <span
                  className={`${styles.info__subtitle} ${
                    lightTheme ? "" : styles.dark
                  }`}
                >
                  {assetData.symbol}
                </span>
              </>
            )}
          </h1>
          <div
            className={`${styles.chart__container} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <div className={styles.chart__header}>
              {["5D", "1M", "6M", "1Y", "5Y", "Max"].map((range) => (
                <h5
                  key={range}
                  className={`${styles.chart__text} ${
                    lightTheme ? "" : styles.dark
                  } ${timeRange === range ? styles.selected__chart : ""}`}
                  onClick={() => {
                    setChartLoading(true);
                    setTimeRange(range);
                  }}
                >
                  {range}
                </h5>
              ))}
            </div>
            <div
              className={`${styles.chart__box} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              <div className={styles.chart__yaxis}>PRICE</div>
              {loading || chartLoading ? (
                <div className={styles.spinner}>
                  <Spinner width={15} height={15} />
                </div>
              ) : chartData.length === 0 ? (
                <h2 className={styles.chart__error}>
                  No data in this timeframe!
                </h2>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      stroke={lightTheme ? "#5e5e5e" : "#9b9b9b"}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      minTickGap={20}
                      stroke={lightTheme ? "#1a1a1a" : "#e5e5e5"}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      stroke={lightTheme ? "#1a1a1a" : "#e5e5e5"}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Price USD"]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleString();
                      }}
                      contentStyle={
                        lightTheme
                          ? { backgroundColor: "#d3d3d3", color: "#1a1a1a" }
                          : { backgroundColor: "#535353", color: "#e5e5e5" }
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="price_usd"
                      stroke={lightTheme ? "#804cfc" : "#231448"}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className={styles.chart__xaxis}>DATE</div>
          </div>
          <div
            className={`${styles.info__details} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <div
              className={`${styles["info__header--box"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              <h5 className={styles.info__header}>Date</h5>
              <h5 className={styles.info__header}>Price</h5>
              <h5 className={styles.info__header}>Change</h5>
            </div>
            {loading ? (
              <div className={styles.spinner}>
                <Spinner width={15} height={15} />
              </div>
            ) : filteredAndDownsampledData.length > 0 ? (
              filteredAndDownsampledData
                .slice(0, 100)
                .map((item, index, arr) => (
                  <div className={styles.info__box} key={index}>
                    <h5 className={styles.info__item}>
                      {formatDate(item.date)}
                    </h5>
                    <h5 className={styles.info__item}>
                      {item.price_usd.toFixed(2)}$
                    </h5>
                    <h5
                      className={`${styles.info__item} ${
                        arr[index + 1] &&
                        item.price_usd - arr[index + 1]?.price_usd > 0
                          ? styles.positive
                          : styles.negative
                      }`}
                    >
                      {arr[index + 1]
                        ? `${(
                            item.price_usd - arr[index + 1]?.price_usd
                          ).toFixed(2)}$`
                        : ""}
                    </h5>
                  </div>
                ))
            ) : (
              <h5 className={styles.chart__error}>
                No data in this timeframe!
              </h5>
            )}
          </div>
        </div>
        <div className={styles.stats__container}>
          <div
            className={`${styles.positions__container} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <div
              className={`${styles["positions__header--box"]} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              <h5 className={styles.positions__header}>Volume</h5>
              <h5 className={styles.positions__header}>Open price</h5>
              <h5 className={styles.positions__header}>Net profit</h5>
            </div>
            <ul
              className={`${styles.positions__list} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              {loading ? (
                <div className={styles.spinner}>
                  <Spinner width={10} height={10} />
                </div>
              ) : assetData.openPositions?.length > 0 ? (
                assetData.openPositions?.map((position, index) => (
                  <li
                    className={`${styles.position__item} ${
                      lightTheme ? "" : styles.dark
                    }`}
                    key={index}
                  >
                    <h5
                      className={`${styles["position__item--text"]} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      {position.quantity}
                    </h5>
                    <h5
                      className={`${styles["position__item--text"]} ${
                        lightTheme ? "" : styles.dark
                      }`}
                    >
                      {position.price}$
                    </h5>
                    <h5
                      className={`${styles["position__item--text"]} ${
                        lightTheme ? "" : styles.dark
                      } ${
                        (assetData.data && assetData.data[0].price_usd) -
                          position.price >
                        0
                          ? styles.positive
                          : styles.negative
                      }`}
                    >
                      {(
                        ((assetData.data && assetData.data[0].price_usd) -
                          position.price) *
                        position.quantity
                      ).toFixed(2)}
                      $
                    </h5>
                  </li>
                ))
              ) : (
                <h5 className={styles.chart__error}>No open positions!</h5>
              )}
            </ul>
          </div>
          <div
            className={`${styles.select__container} ${
              lightTheme ? "" : styles.dark
            }`}
          >
            <div
              className={`${styles.switch__container} ${
                lightTheme ? "" : styles.dark
              }`}
            >
              <h6
                className={`${styles.switch__text} ${
                  selected === "value" ? styles.selected : ""
                }`}
                onClick={() => setSelected("value")}
              >
                VALUE
              </h6>
              <MdOutlineCompareArrows
                className={styles.switch__icon}
                onClick={() =>
                  setSelected((prev) => (prev === "value" ? "volume" : "value"))
                }
              />
              <h6
                className={`${styles.switch__text} ${
                  selected === "volume" ? styles.selected : ""
                }`}
                onClick={() => setSelected("volume")}
              >
                VOLUME
              </h6>
            </div>
            <div className={styles.display__container}>
              <HiOutlineMinusCircle
                className={styles.display__icon}
                onClick={() =>
                  selected === "value" ? changeAmount(-10) : changeAmount(-0.1)
                }
              />
              <div className={styles.display__details}>
                <h6
                  className={`${styles.display__text} ${
                    selected === "value" ? styles.selected : ""
                  }`}
                >
                  {loading ? (
                    <Skeleton height={1} width={4} />
                  ) : (
                    `${(assetData.buyPrice * amount).toFixed(2)}$`
                  )}
                </h6>
                <h6
                  className={`${styles.display__text} ${
                    selected === "volume" ? styles.selected : ""
                  }`}
                >
                  {loading ? <Skeleton height={1} width={6} /> : amount}
                </h6>
              </div>
              <HiOutlinePlusCircle
                className={styles.display__icon}
                onClick={() =>
                  selected === "value" ? changeAmount(10) : changeAmount(0.1)
                }
              />
            </div>
          </div>
          <div className={styles.btn__container}>
            <button
              className={`${styles.btn} ${styles.sell} ${
                lightTheme ? "" : styles.dark
              }`}
              onClick={async () => await sellAsset(assetData.symbol, amount)}
            >
              Sell
              <span className={styles.action__price}>
                {loading ? (
                  <Skeleton height={1} width={3} />
                ) : (
                  `${(
                    assetData.data && assetData.data[0].price_usd * amount
                  )?.toFixed(2)}$`
                )}
              </span>
            </button>
            <button
              className={`${styles.btn} ${styles.buy} ${
                lightTheme ? "" : styles.dark
              }`}
              onClick={async () => await buyAsset(assetData.symbol, amount)}
            >
              Buy
              <span className={styles.action__price}>
                {loading ? (
                  <Skeleton height={1} width={3} />
                ) : (
                  `${(assetData.buyPrice * amount).toFixed(2)}$`
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default ChartPage;
