import React from "react";
import styles from "../styles/Company.module.css";
import menuImage from "../images/menu.png";
import greenHeart from "../images/green_heart.png";
import arrow from "../images/arrow.png";

const Company = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles["menu-icon"]}>
          <img src={menuImage} alt="Menu" />
        </div>
        <div className={styles.titles}>
          <h1 className={styles["stock-title"]}>NVIDIA</h1>
          <p className={styles["stock-symbol"]}>NVD.US</p>
        </div>
        <div className={styles["favorite-icon"]}>
          <img src={greenHeart} alt="Favorite" />
        </div>
      </div>
      <div className={styles["main-content"]}>
        <div className={styles["chart-container"]}>
          <div className={styles["chart-controls"]}>
            <button className={styles["time-range"]}>1D</button>
            <button className={styles["time-range"]}>5D</button>
            <button className={styles["time-range"]}>1M</button>
            <button className={styles["time-range"]}>6M</button>
            <button className={styles["time-range"]}>1Y</button>
            <button className={styles["time-range"]}>5Y</button>
            <button className={styles["time-range"]}>Max</button>
          </div>
          <canvas id="price-chart" className={styles.canvas}></canvas>
        </div>
        <div className={styles["tabele_button_container"]}>
          <div className={styles.table}>
            <h2>Open Positions</h2>
            <table className={styles["positions-table"]}>
              <thead>
                <tr>
                  <th>Volume</th>
                  <th>Open Price</th>
                  <th>Market Price</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3</td>
                  <td>100</td>
                  <td>146.61</td>
                  <td className={styles.profit}>139.23</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>100</td>
                  <td>146.61</td>
                  <td className={styles.profit}>139.23</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>100</td>
                  <td>146.61</td>
                  <td className={styles.profit}>139.23</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>100</td>
                  <td>146.61</td>
                  <td className={styles.profit}>139.23</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>100</td>
                  <td>146.61</td>
                  <td className={styles.profit}>139.23</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles["value-control"]}>
            <div className={styles.labels}>
              <p className={styles["value-label"]}>VALUE</p>
              <button className={styles["toggle-arrow"]}>
                <img src={arrow} alt="Toggle" />
              </button>
              <p className={styles["volume-label"]}>VOLUME</p>
            </div>
            <div className={styles.controls}>
              <div className={styles.selected}>
                <button className={styles.decrease}>-</button>
                <p className={styles["total-value"]}>880 $</p>
                <button className={styles.increase}>+</button>
              </div>
              <div className={styles.unselected}>
                <p className={styles.volume}>≈ 3,202</p>
              </div>
            </div>
          </div>
          <div className={styles["action-buttons"]}>
            <button className={styles["sell-btn"]}>
              Sell
              <br />
              439.95$
            </button>
            <button className={styles["buy-btn"]}>
              Buy
              <br />
              440.05$
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;
