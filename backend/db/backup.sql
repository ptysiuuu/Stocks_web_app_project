CREATE TABLE "Assets" (
  "asset_id" int NOT NULL AUTO_INCREMENT,
  "symbol" varchar(30) NOT NULL,
  "name" varchar(100) NOT NULL,
  "market_id" int NOT NULL,
  "current_price" decimal(15,2) NOT NULL,
  PRIMARY KEY ("asset_id"),
  UNIQUE KEY "symbol" ("symbol"),
  KEY "market_id" ("market_id"),
  CONSTRAINT "Assets_ibfk_1" FOREIGN KEY ("market_id") REFERENCES "Markets" ("market_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "Favorites" (
  "favorite_id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "asset_id" int NOT NULL,
  "daily_change" decimal(10,2) NOT NULL DEFAULT '0.00',
  "updated_at" datetime DEFAULT NULL,
  "added_at" datetime DEFAULT NULL,
  PRIMARY KEY ("favorite_id"),
  KEY "favorites_asset_id" ("asset_id"),
  KEY "favorites_user_id" ("user_id"),
  CONSTRAINT "Favorites_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorites_ibfk_2" FOREIGN KEY ("asset_id") REFERENCES "Assets" ("asset_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "Markets" (
  "market_id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(100) NOT NULL,
  "country" varchar(50),
  "currency_code" varchar(10) NOT NULL,
  "conversion_rate" decimal(10,2) NOT NULL,
  "mic" varchar(10) NOT NULL,
  PRIMARY KEY ("market_id"),
  UNIQUE KEY "name" ("name"),
  UNIQUE KEY "mic" ("mic")
)

CREATE TABLE "Notifications" (
  "notification_id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "message" varchar(255) NOT NULL,
  "is_read" tinyint(1) DEFAULT '0',
  "created_at" datetime DEFAULT NULL,
  PRIMARY KEY ("notification_id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "Notifications_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "OpenPositions" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "asset_id" int NOT NULL,
  "quantity" decimal(10,2) NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "date_transaction" datetime DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "open_positions_user_id" ("user_id"),
  KEY "open_positions_asset_id" ("asset_id"),
  CONSTRAINT "OpenPositions_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OpenPositions_ibfk_2" FOREIGN KEY ("asset_id") REFERENCES "Assets" ("asset_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "Portfolios" (
  "user_id" int NOT NULL,
  "balance" decimal(15,2) DEFAULT '0.00',
  "created_at" datetime DEFAULT NULL,
  "free_funds" decimal(15,2) DEFAULT '0.00',
  "profit" decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY ("user_id"),
  CONSTRAINT "Portfolios_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "Transactions" (
  "transaction_id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "asset_id" int NOT NULL,
  "quantity" decimal(10,2) NOT NULL,
  "transaction_date" datetime DEFAULT NULL,
  "open_price" decimal(10,2) NOT NULL,
  "close_price" decimal(10,2) NOT NULL,
  PRIMARY KEY ("transaction_id"),
  KEY "user_id" ("user_id"),
  KEY "asset_id" ("asset_id"),
  CONSTRAINT "Transactions_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Transactions_ibfk_2" FOREIGN KEY ("asset_id") REFERENCES "Assets" ("asset_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "UserAssets" (
  "user_id" int NOT NULL,
  "asset_id" int NOT NULL,
  "quantity" decimal(15,2) NOT NULL,
  "profit" decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY ("user_id","asset_id"),
  UNIQUE KEY "user_assets_user_id_asset_id" ("user_id","asset_id"),
  KEY "asset_id" ("asset_id"),
  CONSTRAINT "UserAssets_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserAssets_ibfk_2" FOREIGN KEY ("asset_id") REFERENCES "Assets" ("asset_id") ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE "Users" (
  "user_id" int NOT NULL AUTO_INCREMENT,
  "username" varchar(50) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "created_at" datetime DEFAULT NULL,
  PRIMARY KEY ("user_id"),
  UNIQUE KEY "username" ("username")
)

create definer = avnadmin@`%` trigger after_transaction_insert
    after insert
    on Transactions
    for each row
BEGIN
    DECLARE open_quantity DECIMAL(10,2);
    DECLARE open_price DECIMAL(15,2);
    DECLARE open_date DATETIME;
    DECLARE total_value DECIMAL(15,2);
    DECLARE profit DECIMAL(15,2);
    DECLARE free_funds DECIMAL(15,2);
    DECLARE asset_profit DECIMAL(15,2);

    -- Remove the oldest OpenPosition entry
    SELECT quantity, price, date_transaction INTO open_quantity, open_price, open_date
    FROM OpenPositions
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id
    ORDER BY date_transaction ASC
    LIMIT 1;

    IF NEW.quantity = open_quantity THEN
        DELETE FROM OpenPositions
        WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id
          AND quantity = open_quantity AND price = open_price AND date_transaction = open_date;
    ELSE
        UPDATE OpenPositions
        SET quantity = open_quantity - NEW.quantity
        WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id
          AND quantity = open_quantity AND price = open_price AND date_transaction = open_date;
    END IF;

    -- Update UserAssets table
    UPDATE UserAssets
    SET quantity = quantity - NEW.quantity
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;

    DELETE FROM UserAssets
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id AND quantity <= 0;

    -- Calculate the total value of all assets in the user's portfolio
    SELECT IFNULL(SUM(ua.quantity * a.current_price), 0) INTO total_value
    FROM UserAssets ua
             JOIN Assets a ON ua.asset_id = a.asset_id
    WHERE ua.user_id = NEW.user_id;

    -- Calculate the profit
    SELECT IFNULL(SUM((a.current_price - op.price) * op.quantity), 0) INTO profit
    FROM OpenPositions op
             JOIN Assets a ON op.asset_id = a.asset_id
    WHERE op.user_id = NEW.user_id;

    SELECT IFNULL(SUM((a.current_price - op.price) * op.quantity), 0) INTO asset_profit
    FROM OpenPositions op
             JOIN Assets a ON op.asset_id = a.asset_id
    WHERE op.user_id = NEW.user_id AND op.asset_id = NEW.asset_id;

    -- Calculate the free funds
    SELECT IFNULL(p.free_funds + (NEW.quantity * NEW.close_price), 0) INTO free_funds
    FROM Portfolios p
    WHERE p.user_id = NEW.user_id;

    -- Update the user's portfolio
    UPDATE Portfolios
    SET balance = total_value, profit = profit, free_funds = free_funds
    WHERE user_id = NEW.user_id;

    UPDATE UserAssets
    SET profit = asset_profit
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;
END;

create definer = avnadmin@`%` trigger after_assets_update
    after update
    on Assets
    for each row
BEGIN
    DECLARE total_value DECIMAL(15,2);
    DECLARE profit_var DECIMAL(15,2);
    DECLARE asset_profit DECIMAL(15,2);
    DECLARE user_id_var INT;
    DECLARE done INT DEFAULT FALSE;

    -- Cursor to iterate over all users that have this asset
    DECLARE user_cursor CURSOR FOR
        SELECT user_id
        FROM UserAssets
        WHERE asset_id = NEW.asset_id;

    -- Handler to set done to true when cursor is done
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open the cursor
    OPEN user_cursor;

    -- Loop through each user associated with the asset
    read_loop: LOOP
        FETCH user_cursor INTO user_id_var;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Calculate the total value of all assets in the user's portfolio
        SELECT SUM(ua.quantity * a.current_price) INTO total_value
        FROM UserAssets ua
                 JOIN Assets a ON ua.asset_id = a.asset_id
        WHERE ua.user_id = user_id_var;

        -- Calculate the profit from open positions for the user's portfolio
        SELECT SUM((a.current_price - op.price) * op.quantity) INTO profit_var
        FROM OpenPositions op
                 JOIN Assets a ON op.asset_id = a.asset_id
        WHERE op.user_id = user_id_var;

        -- Update the user's portfolio with the total value and profit
        UPDATE Portfolios
        SET balance = total_value, profit = profit_var
        WHERE user_id = user_id_var;

        -- Calculate the profit for the specific asset owned by the user
        SELECT SUM((a.current_price - op.price) * op.quantity) INTO asset_profit
        FROM OpenPositions op
                 JOIN Assets a ON op.asset_id = a.asset_id
        WHERE op.user_id = user_id_var
          AND op.asset_id = NEW.asset_id;

        -- Update the profit for the specific asset in UserAssets table
        UPDATE UserAssets
        SET profit = asset_profit
        WHERE user_id = user_id_var
          AND asset_id = NEW.asset_id;

    END LOOP;

    -- Close the cursor
    CLOSE user_cursor;

END;


create definer = avnadmin@`%` trigger after_open_positions_insert
    after insert
    on OpenPositions
    for each row
BEGIN
    DECLARE total_value DECIMAL(15,2);
    DECLARE free_funds DECIMAL(15,2);
    DECLARE profit DECIMAL(15,2);
    DECLARE asset_profit DECIMAL(15,2);

    -- Update UserAssets table
    INSERT INTO UserAssets (user_id, asset_id, quantity, profit)
    VALUES (NEW.user_id, NEW.asset_id, NEW.quantity, 0)
    ON DUPLICATE KEY UPDATE quantity = quantity + NEW.quantity;

    -- Calculate the total value of all assets in the user's portfolio
    SELECT SUM(ua.quantity * a.current_price) INTO total_value
    FROM UserAssets ua
    JOIN Assets a ON ua.asset_id = a.asset_id
    WHERE ua.user_id = NEW.user_id;

    -- Calculate the free funds
    SELECT p.free_funds - NEW.price * NEW.quantity INTO free_funds
    FROM Portfolios p
    WHERE p.user_id = NEW.user_id;

    -- Calculate the profit
    SELECT SUM((a.current_price - op.price) * op.quantity) INTO profit
    FROM OpenPositions op
    JOIN Assets a ON op.asset_id = a.asset_id
    WHERE op.user_id = NEW.user_id;

    -- Calculate the profit for the specific asset
    SELECT SUM((a.current_price - op.price) * op.quantity) INTO asset_profit
    FROM OpenPositions op
    JOIN Assets a ON op.asset_id = a.asset_id
    WHERE op.user_id = NEW.user_id AND op.asset_id = NEW.asset_id;

    -- Update the user's portfolio
    UPDATE Portfolios
    SET balance = total_value, free_funds = free_funds, profit = profit
    WHERE user_id = NEW.user_id;

    -- Update the profit for the specific asset in UserAssets table
    UPDATE UserAssets
    SET profit = asset_profit
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;
END;

create definer = avnadmin@`%` trigger create_poortfolio
    after insert
    on Users
    for each row
BEGIN
    INSERT INTO Portfolios (user_id, created_at) VALUES (NEW.user_id, NOW());
END;

