# Lemon Strategy - Pseudocode Logic

## Overview
This document outlines the step-by-step logic for the Lemon Strategy, breaking down the complex algorithm into manageable components.

## Input Parameters

### Global Settings
```
GLOBAL_WIDTH = 9           // Max width for W/M pattern detection
GLOBAL_OFFSET = 0          // Offset for W/M pattern search
RISK_PER_TRADE = 1         // USD risk amount per trade
RISK_REWARD_RATIO = 3.0    // Target profit multiplier
```

### TTM Squeeze Settings
```
BB_LENGTH = 20             // Bollinger Band period
BB_MULT = 2.0              // Bollinger Band standard deviation
KELTNER_LENGTH = 20        // Keltner Channel period
KELTNER_MULT = 2.0         // Keltner Channel multiplier
USE_TRUE_RANGE = true      // Use true range for Keltner calculation
```

### Indicator Settings
```
WILLIAMS_LENGTH = 21       // Williams %R period
WILLIAMS_EMA_LENGTH = 13   // Williams %R smoothing period
OBV_ENABLED = true         // Enable OBV confirmation
RSI_ENABLED = false        // Enable RSI confirmation (optional)
MFI_ENABLED = false        // Enable MFI confirmation (optional)
```

## Core Calculations

### 1. TTM Squeeze Detection
```
// Calculate Bollinger Bands
basis = SMA(close, BB_LENGTH)
deviation = BB_MULT * STDEV(close, BB_LENGTH)
upper_bb = basis + deviation
lower_bb = basis - deviation

// Calculate Keltner Channels
keltner_ma = EMA(close, KELTNER_LENGTH)
keltner_range = USE_TRUE_RANGE ? TRUE_RANGE : (high - low)
keltner_rangema = EMA(keltner_range, KELTNER_LENGTH)
upper_keltner = keltner_ma + (keltner_rangema * KELTNER_MULT)
lower_keltner = keltner_ma - (keltner_rangema * KELTNER_MULT)

// Squeeze Detection
squeeze_on = (upper_bb < upper_keltner) AND (lower_bb > lower_keltner)
squeeze_release = squeeze_on[1] AND NOT squeeze_on[0]
```

### 2. W/M Pattern Detection
```
FUNCTION detect_W_pattern(price_series, width, offset, strict_mode):
    FOR each_offset FROM 0 TO offset:
        Initialize points: a=0, b=0, c=0, d=0, e=0
        
        FOR i FROM 1 TO (width - 1):
            // Find point D (first decline)
            IF price_series[i + offset] < price_series[i + offset - 1] AND c_not_found:
                d = i + offset
                CONTINUE
            
            // Find point C (first recovery)
            IF price_series[i + offset] > price_series[i + offset - 1] AND b_not_found:
                c = i + offset
                CONTINUE
            
            // Find point B (second decline)
            IF price_series[i + offset] < price_series[i + offset - 1] AND a_not_found:
                b = i + offset
                CONTINUE
            
            // Find point A (final recovery)
            IF price_series[i + offset] > price_series[i + offset - 1]:
                a = i + offset
                BREAK
        
        // Validate W pattern
        pattern_valid = (a > 0) AND (a != b) AND (c != 0) AND (d != 0) AND
                       (price_series[e] > price_series[c]) AND
                       (price_series[d] < price_series[e]) AND
                       (price_series[d] < price_series[c]) AND
                       (price_series[b] <= price_series[d] OR NOT strict_mode) AND
                       (price_series[b] < price_series[a])
        
        IF pattern_valid:
            RETURN true, points
    
    RETURN false, null

FUNCTION detect_M_pattern(price_series, width, offset, strict_mode):
    // Similar logic but inverted for M pattern (double top)
    // Returns true if valid M pattern found with point coordinates
```

### 3. Indicator Confirmations
```
// On Balance Volume calculation
change_direction = CHANGE(close)
obv = CUMSUM(IF change_direction > 0 THEN volume 
             ELSE IF change_direction < 0 THEN -volume 
             ELSE 0)

// Williams %R calculation
williams_high = HIGHEST(high, WILLIAMS_LENGTH)
williams_low = LOWEST(low, WILLIAMS_LENGTH)
williams_r = 100 * (close - williams_high) / (williams_high - williams_low)
williams_ema = EMA(williams_r, WILLIAMS_EMA_LENGTH)

// VWAP calculation
vwap = VWAP(close)
```

## Entry Logic

### Long Entry Conditions
```
FUNCTION check_long_entry():
    // 1. Squeeze Release Check
    squeeze_fired = squeeze_release
    
    // 2. W Pattern Detection
    w_pattern_found = detect_W_pattern(close, GLOBAL_WIDTH, GLOBAL_OFFSET, false)
    
    // 3. OBV W Pattern (if enabled)
    obv_w_pattern = NOT OBV_ENABLED OR detect_W_pattern(obv, GLOBAL_WIDTH, GLOBAL_OFFSET, false)
    
    // 4. Williams %R Oversold
    williams_oversold = williams_ema < -80
    
    // 5. Price Above VWAP
    price_above_vwap = close > vwap
    
    // 6. Momentum Confirmation
    momentum_bullish = close > upper_keltner
    
    // 7. Not Already in Long Trade
    not_in_long_trade = NOT long_trade_active
    
    // Combine all conditions
    long_condition = squeeze_fired AND w_pattern_found AND obv_w_pattern AND 
                    williams_oversold AND price_above_vwap AND momentum_bullish AND 
                    not_in_long_trade
    
    RETURN long_condition
```

### Short Entry Conditions
```
FUNCTION check_short_entry():
    // 1. Squeeze Release Check
    squeeze_fired = squeeze_release
    
    // 2. M Pattern Detection
    m_pattern_found = detect_M_pattern(close, GLOBAL_WIDTH, GLOBAL_OFFSET, false)
    
    // 3. OBV M Pattern (if enabled)
    obv_m_pattern = NOT OBV_ENABLED OR detect_M_pattern(obv, GLOBAL_WIDTH, GLOBAL_OFFSET, false)
    
    // 4. Williams %R Overbought
    williams_overbought = williams_ema > -20
    
    // 5. Price Below VWAP
    price_below_vwap = close < vwap
    
    // 6. Momentum Confirmation
    momentum_bearish = close < lower_keltner
    
    // 7. Not Already in Short Trade
    not_in_short_trade = NOT short_trade_active
    
    // Combine all conditions
    short_condition = squeeze_fired AND m_pattern_found AND obv_m_pattern AND 
                     williams_overbought AND price_below_vwap AND momentum_bearish AND 
                     not_in_short_trade
    
    RETURN short_condition
```

## Trade Management

### Position Sizing
```
FUNCTION calculate_position_size(entry_price, stop_price):
    stop_distance = ABS(entry_price - stop_price)
    position_size_btc = RISK_PER_TRADE / stop_distance
    position_size_usd = ROUND(entry_price * position_size_btc)
    
    RETURN position_size_usd
```

### Long Trade Setup
```
FUNCTION setup_long_trade():
    // Entry and Stop Levels
    entry_level = close
    stop_level = lower_keltner  // or W pattern low point
    
    // Calculate Target
    risk_amount = entry_level - stop_level
    target_level = entry_level + (risk_amount * RISK_REWARD_RATIO)
    
    // Position Sizing
    position_size = calculate_position_size(entry_level, stop_level)
    
    // Set Trade State
    long_trade_active = true
    trade_entry_price = entry_level
    trade_stop_price = stop_level
    trade_target_price = target_level
    
    RETURN trade_setup_complete
```

### Short Trade Setup
```
FUNCTION setup_short_trade():
    // Entry and Stop Levels
    entry_level = close
    stop_level = upper_keltner  // or M pattern high point
    
    // Calculate Target
    risk_amount = stop_level - entry_level
    target_level = entry_level - (risk_amount * RISK_REWARD_RATIO)
    
    // Position Sizing
    position_size = calculate_position_size(entry_level, stop_level)
    
    // Set Trade State
    short_trade_active = true
    trade_entry_price = entry_level
    trade_stop_price = stop_level
    trade_target_price = target_level
    
    RETURN trade_setup_complete
```

## Exit Logic

### Trailing Stop Management
```
FUNCTION update_trailing_stops():
    IF long_trade_active:
        // Trail stop up with Keltner lower channel
        new_stop = MAX(trade_stop_price, lower_keltner)
        IF new_stop > trade_stop_price:
            trade_stop_price = new_stop
    
    IF short_trade_active:
        // Trail stop down with Keltner upper channel
        new_stop = MIN(trade_stop_price, upper_keltner)
        IF new_stop < trade_stop_price:
            trade_stop_price = new_stop
```

### Exit Conditions
```
FUNCTION check_exit_conditions():
    IF long_trade_active:
        // Stop Loss Hit
        IF low <= trade_stop_price:
            RETURN "STOP_LOSS"
        
        // Target Hit
        IF high >= trade_target_price:
            RETURN "TARGET_HIT"
    
    IF short_trade_active:
        // Stop Loss Hit
        IF high >= trade_stop_price:
            RETURN "STOP_LOSS"
        
        // Target Hit
        IF low <= trade_target_price:
            RETURN "TARGET_HIT"
    
    RETURN "CONTINUE"
```

## Main Strategy Loop

### Primary Execution Flow
```
FUNCTION main_strategy_loop():
    // Update all indicators
    update_indicators()
    
    // Update trailing stops if in trade
    IF long_trade_active OR short_trade_active:
        update_trailing_stops()
        
        // Check for exit conditions
        exit_signal = check_exit_conditions()
        IF exit_signal != "CONTINUE":
            close_trade(exit_signal)
            RETURN
    
    // Check for new entry signals
    IF NOT long_trade_active AND NOT short_trade_active:
        // Check long entry
        IF check_long_entry():
            setup_long_trade()
            send_entry_alert("LONG")
        
        // Check short entry
        ELSE IF check_short_entry():
            setup_short_trade()
            send_entry_alert("SHORT")
    
    // Update visualizations
    update_plots()
    update_statistics()
```

## Alert Generation

### Entry Alerts
```
FUNCTION send_entry_alert(direction):
    IF direction == "LONG":
        alert_message = "{{ticker}} LONG"
    ELSE IF direction == "SHORT":
        alert_message = "{{ticker}} SHORT"
    
    SEND_ALERT(alert_message)
```

### Exit Alerts
```
FUNCTION send_exit_alert(exit_type):
    IF exit_type == "TARGET_HIT":
        alert_message = "{{ticker}} Take Profit"
    ELSE IF exit_type == "STOP_LOSS":
        alert_message = "{{ticker}} Close"
    
    SEND_ALERT(alert_message)
```

## Performance Tracking

### Statistics Calculation
```
FUNCTION update_statistics():
    win_percentage = (win_count / total_trades) * 100
    loss_percentage = (loss_count / total_trades) * 100
    profit_factor = (total_wins * avg_win) / (total_losses * avg_loss)
    
    equity_curve = (win_count * avg_win * RISK_PER_TRADE) - 
                   (loss_count * RISK_PER_TRADE) - 
                   (total_trades * commission)
    
    DISPLAY_STATISTICS(win_percentage, loss_percentage, profit_factor, equity_curve)
```

---

**Implementation Notes:**
- All price comparisons should include proper bar indexing
- State variables must persist between bars using appropriate syntax
- Alert conditions should prevent duplicate signals
- Position sizing should include maximum risk controls
- Commission costs should be factored into performance calculations