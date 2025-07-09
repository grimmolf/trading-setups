# Reload Ranger - Pseudocode Implementation

## Algorithm Overview

**Purpose**: Identify market reversal setups in ranging markets using 3-step confirmation system
**Input**: OHLC data, multiple timeframes, momentum indicators (Willy, MACD, RSI, OBV)
**Output**: Entry/exit signals, stop management, profit targets

## Strategy Concept Analysis

The Reload Ranger is a **reversal trading strategy** designed for **ranging markets**. It uses a 3-step confirmation system:

1. **Location**: Higher timeframe RLZ (Resistance/Support Level Zone) with 61.8%-78.6% retracement
2. **Price Structure**: Double bottom (bullish) or double top (bearish) patterns
3. **Momentum**: Confluence of at least 2 indicators (Willy, MACD, RSI, OBV)

## Variable Definitions

### Input Parameters
```
// Timeframe settings
input_higher_timeframe = "15m"        // Higher timeframe for RLZ analysis
input_entry_timeframe = "5m"          // Entry timeframe for patterns

// Fibonacci retracement levels
input_fib_min = 61.8                  // Minimum retracement level
input_fib_max = 78.6                  // Maximum retracement level
input_sweet_spot = 70.2               // Optimal entry level

// Momentum indicator settings
input_williams_period = 14            // Williams %R period
input_macd_fast = 12                  // MACD fast period
input_macd_slow = 26                  // MACD slow period
input_macd_signal = 9                 // MACD signal period
input_rsi_period = 14                 // RSI period
input_obv_ema_period = 20             // OBV EMA period

// Risk management
input_risk_base = 1.0                 // Base risk percentage
input_risk_increment = 1.0            // Risk increment for additional factors
```

### Internal Variables
```
// Higher timeframe analysis
higher_tf_high = 0.0                  // Higher timeframe swing high
higher_tf_low = 0.0                   // Higher timeframe swing low
higher_tf_move_size = 0.0             // Size of higher timeframe move
retracement_61_8 = 0.0                // 61.8% retracement level
retracement_78_6 = 0.0                // 78.6% retracement level

// Price structure variables
double_bottom_detected = false        // Double bottom pattern found
double_top_detected = false           // Double top pattern found
head_shoulders_detected = false       // H&S pattern found
triangle_breakout_detected = false    // Triangle breakout found

// Momentum confirmation counters
momentum_confirmations = 0            // Number of momentum confirmations
williams_confirmed = false            // Williams %R confirmation
macd_confirmed = false                // MACD confirmation
rsi_confirmed = false                 // RSI confirmation
obv_confirmed = false                 // OBV confirmation
```

### State Management
```
// Setup state
location_confirmed = false            // Higher TF location confirmed
structure_confirmed = false           // Price structure confirmed
momentum_confirmed = false            // Momentum confirmed
setup_valid = false                   // Complete setup validation

// Position management
position_open = false                 // Position status
entry_price = 0.0                     // Entry price level
stop_loss = 0.0                       // Stop loss level
profit_target = 0.0                   // Profit target level
current_risk_percent = 0.0            // Calculated risk percentage

// Stop management levels
stop_25_percent = 0.0                 // 25% stop level
stop_50_percent = 0.0                 // 50% stop level
stop_66_percent = 0.0                 // 66% stop level
trailing_stop_active = false          // Trailing stop status
```

## Higher Timeframe Analysis

### RLZ (Resistance/Support Level Zone) Detection
```
FUNCTION detect_higher_tf_rlz():
    // Get higher timeframe data
    htf_data = get_timeframe_data(input_higher_timeframe)
    
    // Find recent significant swing high and low
    recent_high = find_recent_swing_high(htf_data, 20)
    recent_low = find_recent_swing_low(htf_data, 20)
    
    // Determine if we're in a retracement setup
    IF (current_trend == "BEARISH"):
        // Looking for bullish reversal
        higher_tf_high = recent_high
        higher_tf_low = recent_low
        higher_tf_move_size = higher_tf_high - higher_tf_low
        
        // Calculate retracement levels
        retracement_61_8 = higher_tf_low + (higher_tf_move_size * 0.618)
        retracement_78_6 = higher_tf_low + (higher_tf_move_size * 0.786)
        
    ELSE IF (current_trend == "BULLISH"):
        // Looking for bearish reversal
        higher_tf_high = recent_high
        higher_tf_low = recent_low
        higher_tf_move_size = higher_tf_high - higher_tf_low
        
        // Calculate retracement levels
        retracement_61_8 = higher_tf_high - (higher_tf_move_size * 0.618)
        retracement_78_6 = higher_tf_high - (higher_tf_move_size * 0.786)
```

### Location Confirmation
```
FUNCTION check_location_confirmation():
    current_price = close
    
    IF (current_trend == "BEARISH"):
        // Price should be in 61.8%-78.6% retracement zone
        location_confirmed = (current_price >= retracement_61_8 AND current_price <= retracement_78_6)
        
        // Check if below sweet spot (increases risk)
        sweet_spot_level = higher_tf_low + (higher_tf_move_size * 0.702)
        below_sweet_spot = current_price < sweet_spot_level
        
    ELSE IF (current_trend == "BULLISH"):
        // Price should be in 61.8%-78.6% retracement zone
        location_confirmed = (current_price <= retracement_61_8 AND current_price >= retracement_78_6)
        
        // Check if above sweet spot (increases risk)
        sweet_spot_level = higher_tf_high - (higher_tf_move_size * 0.702)
        above_sweet_spot = current_price > sweet_spot_level
    
    RETURN location_confirmed
```

## Price Structure Analysis

### Double Bottom/Top Detection
```
FUNCTION detect_double_bottom():
    // Look for two similar lows with a higher low in between
    lookback_period = 20
    tolerance = 0.5  // 0.5% tolerance for "similar" lows
    
    FOR i = lookback_period TO 3:
        low1 = low[i]
        
        // Find next significant low
        FOR j = i-1 TO 1:
            low2 = low[j]
            
            // Check if lows are similar
            IF (abs(low1 - low2) / low1 <= tolerance / 100):
                // Check if there's a higher low in between
                middle_low = find_lowest_between(i, j)
                
                IF (middle_low > min(low1, low2)):
                    // Confirm double bottom pattern
                    double_bottom_detected = true
                    RETURN true
    
    RETURN false
```

### Head and Shoulders Detection
```
FUNCTION detect_head_shoulders():
    // More complex pattern recognition
    lookback_period = 30
    
    // Find three peaks with specific characteristics
    peaks = find_peaks(lookback_period)
    
    IF (length(peaks) >= 3):
        left_shoulder = peaks[0]
        head = peaks[1]
        right_shoulder = peaks[2]
        
        // Head should be higher than shoulders
        IF (head.high > left_shoulder.high AND head.high > right_shoulder.high):
            // Shoulders should be roughly equal
            shoulder_tolerance = 2.0  // 2% tolerance
            IF (abs(left_shoulder.high - right_shoulder.high) / left_shoulder.high <= shoulder_tolerance / 100):
                head_shoulders_detected = true
                RETURN true
    
    RETURN false
```

### Triangle Breakout Detection
```
FUNCTION detect_triangle_breakout():
    // Look for converging trendlines
    lookback_period = 50
    
    resistance_line = calculate_resistance_trendline(lookback_period)
    support_line = calculate_support_trendline(lookback_period)
    
    // Check if lines are converging
    IF (resistance_line.slope < 0 AND support_line.slope > 0):
        convergence_point = find_intersection(resistance_line, support_line)
        
        // Check for breakout
        IF (close > resistance_line.value OR close < support_line.value):
            triangle_breakout_detected = true
            RETURN true
    
    RETURN false
```

### Structure Confirmation
```
FUNCTION check_structure_confirmation():
    structure_confirmed = false
    
    // Check for any valid pattern
    IF (detect_double_bottom() OR detect_double_top() OR detect_head_shoulders() OR detect_triangle_breakout()):
        structure_confirmed = true
    
    RETURN structure_confirmed
```

## Momentum Analysis

### Williams %R Analysis
```
FUNCTION analyze_williams_r():
    williams_r = calculate_williams_r(input_williams_period)
    williams_ema = calculate_ema(williams_r, 14)
    
    IF (current_trend == "BEARISH"):
        // Looking for bullish divergence
        // Double bottom in Williams while in oversold area
        IF (williams_r < -80):  // Oversold
            williams_double_bottom = detect_indicator_double_bottom(williams_r, 20)
            williams_crossing_up = williams_r > williams_ema AND williams_r[1] <= williams_ema[1]
            
            williams_confirmed = williams_double_bottom AND williams_crossing_up
    
    ELSE IF (current_trend == "BULLISH"):
        // Looking for bearish divergence
        // Double top in Williams while in overbought area
        IF (williams_r > -20):  // Overbought
            williams_double_top = detect_indicator_double_top(williams_r, 20)
            williams_crossing_down = williams_r < williams_ema AND williams_r[1] >= williams_ema[1]
            
            williams_confirmed = williams_double_top AND williams_crossing_down
    
    RETURN williams_confirmed
```

### MACD Analysis
```
FUNCTION analyze_macd():
    macd_line = calculate_macd_line(input_macd_fast, input_macd_slow)
    macd_signal = calculate_macd_signal(macd_line, input_macd_signal)
    macd_histogram = macd_line - macd_signal
    
    IF (current_trend == "BEARISH"):
        // Looking for bullish MACD divergence
        macd_double_bottom = detect_indicator_double_bottom(macd_line, 20)
        macd_confirmed = macd_double_bottom
    
    ELSE IF (current_trend == "BULLISH"):
        // Looking for bearish MACD divergence
        macd_double_top = detect_indicator_double_top(macd_line, 20)
        macd_confirmed = macd_double_top
    
    RETURN macd_confirmed
```

### RSI Analysis
```
FUNCTION analyze_rsi():
    rsi = calculate_rsi(input_rsi_period)
    
    IF (current_trend == "BEARISH"):
        // RSI double bottom while oversold
        IF (rsi < 30):  // Oversold
            rsi_double_bottom = detect_indicator_double_bottom(rsi, 20)
            rsi_confirmed = rsi_double_bottom
    
    ELSE IF (current_trend == "BULLISH"):
        // RSI double top while overbought
        IF (rsi > 70):  // Overbought
            rsi_double_top = detect_indicator_double_top(rsi, 20)
            rsi_confirmed = rsi_double_top
    
    RETURN rsi_confirmed
```

### OBV (On-Balance Volume) Analysis
```
FUNCTION analyze_obv():
    obv = calculate_obv()
    obv_ema = calculate_ema(obv, input_obv_ema_period)
    
    // Check for volume impetus (3 successive bars)
    volume_impetus = false
    
    IF (current_trend == "BEARISH"):
        // 3 successively higher bullish volume bars
        volume_impetus = (volume > volume[1] AND volume[1] > volume[2] AND 
                         close > close[1] AND close[1] > close[2])
    
    ELSE IF (current_trend == "BULLISH"):
        // 3 successively higher bearish volume bars
        volume_impetus = (volume > volume[1] AND volume[1] > volume[2] AND 
                         close < close[1] AND close[1] < close[2])
    
    // OBV double bottom/top with EMA crossover
    IF (current_trend == "BEARISH"):
        obv_double_bottom = detect_indicator_double_bottom(obv, 20)
        obv_crossing_up = obv > obv_ema AND obv[1] <= obv_ema[1]
        obv_confirmed = obv_double_bottom AND obv_crossing_up AND volume_impetus
    
    ELSE IF (current_trend == "BULLISH"):
        obv_double_top = detect_indicator_double_top(obv, 20)
        obv_crossing_down = obv < obv_ema AND obv[1] >= obv_ema[1]
        obv_confirmed = obv_double_top AND obv_crossing_down AND volume_impetus
    
    RETURN obv_confirmed
```

### Momentum Confirmation
```
FUNCTION check_momentum_confirmation():
    momentum_confirmations = 0
    
    // Check each indicator
    IF (analyze_williams_r()):
        momentum_confirmations += 1
    
    IF (analyze_macd()):
        momentum_confirmations += 1
    
    IF (analyze_rsi()):
        momentum_confirmations += 1
    
    IF (analyze_obv()):
        momentum_confirmations += 1
    
    // Need at least 2 confirmations
    momentum_confirmed = momentum_confirmations >= 2
    
    RETURN momentum_confirmed
```

## Risk Calculation

### Dynamic Risk Assessment
```
FUNCTION calculate_trade_risk():
    base_risk = input_risk_base
    additional_risk = 0
    
    // Add 1% risk for each additional factor
    
    // Check if below/above sweet spot
    IF (current_trend == "BEARISH"):
        sweet_spot_level = higher_tf_low + (higher_tf_move_size * 0.702)
        IF (close < sweet_spot_level):
            additional_risk += input_risk_increment
    
    ELSE IF (current_trend == "BULLISH"):
        sweet_spot_level = higher_tf_high - (higher_tf_move_size * 0.702)
        IF (close > sweet_spot_level):
            additional_risk += input_risk_increment
    
    // Add risk for head and shoulders pattern
    IF (head_shoulders_detected):
        additional_risk += input_risk_increment
    
    // Add risk for excessive confirmations (more than 3)
    IF (momentum_confirmations > 3):
        additional_risk += input_risk_increment
    
    current_risk_percent = base_risk + additional_risk
    
    RETURN current_risk_percent
```

## Entry Logic

### Complete Setup Validation
```
FUNCTION validate_complete_setup():
    // Check all 3 components
    location_ok = check_location_confirmation()
    structure_ok = check_structure_confirmation()
    momentum_ok = check_momentum_confirmation()
    
    setup_valid = location_ok AND structure_ok AND momentum_ok
    
    RETURN setup_valid
```

### Entry Execution
```
FUNCTION execute_entry():
    IF (validate_complete_setup() AND NOT position_open):
        entry_price = close
        
        // Calculate stop loss
        IF (current_trend == "BEARISH"):
            // Bullish entry - stop below recent low
            stop_loss = find_recent_swing_low(20) - (atr(14) * 0.5)
        
        ELSE IF (current_trend == "BULLISH"):
            // Bearish entry - stop above recent high
            stop_loss = find_recent_swing_high(20) + (atr(14) * 0.5)
        
        // Calculate profit target (50% retracement of latest move)
        profit_target = calculate_profit_target()
        
        // Calculate position size based on risk
        risk_amount = account_balance * (current_risk_percent / 100)
        stop_distance = abs(entry_price - stop_loss)
        position_size = risk_amount / stop_distance
        
        // Execute trade
        place_order(entry_price, position_size, stop_loss, profit_target)
        position_open = true
        
        // Calculate stop management levels
        range_size = abs(profit_target - stop_loss)
        stop_25_percent = stop_loss + (range_size * 0.25)
        stop_50_percent = stop_loss + (range_size * 0.50)
        stop_66_percent = stop_loss + (range_size * 0.66)
```

## Profit Target Calculation

### 50% Retracement Target
```
FUNCTION calculate_profit_target():
    // Find the latest significant move
    latest_move_high = find_recent_swing_high(50)
    latest_move_low = find_recent_swing_low(50)
    
    IF (current_trend == "BEARISH"):
        // Bullish reversal - target 50% retracement to recent high
        profit_target = latest_move_low + ((latest_move_high - latest_move_low) * 0.5)
    
    ELSE IF (current_trend == "BULLISH"):
        // Bearish reversal - target 50% retracement to recent low
        profit_target = latest_move_high - ((latest_move_high - latest_move_low) * 0.5)
    
    RETURN profit_target
```

## Stop Management

### Dynamic Stop Management
```
FUNCTION manage_stops():
    IF (NOT position_open):
        RETURN
    
    current_price = close
    price_progress = 0
    
    // Calculate progress toward target
    IF (current_trend == "BEARISH"):
        // Long position
        total_range = profit_target - stop_loss
        current_progress = current_price - stop_loss
        price_progress = current_progress / total_range
    
    ELSE IF (current_trend == "BULLISH"):
        // Short position
        total_range = stop_loss - profit_target
        current_progress = stop_loss - current_price
        price_progress = current_progress / total_range
    
    // Move stop to 25% level when price reaches 50% of range
    IF (price_progress >= 0.5 AND NOT stop_moved_to_25):
        update_stop_loss(stop_25_percent)
        stop_moved_to_25 = true
    
    // Trail stop 3 bars behind when price reaches 66% of range
    IF (price_progress >= 0.66 AND NOT trailing_stop_active):
        trailing_stop_active = true
        
        IF (current_trend == "BEARISH"):
            // Trail 3 lows behind
            trailing_stop = find_lowest_in_last_n_bars(3) - (atr(14) * 0.5)
        
        ELSE IF (current_trend == "BULLISH"):
            // Trail 3 highs behind
            trailing_stop = find_highest_in_last_n_bars(3) + (atr(14) * 0.5)
        
        update_stop_loss(trailing_stop)
```

## Exit Conditions

### Trade Invalidation
```
FUNCTION check_trade_invalidation():
    IF (NOT position_open):
        RETURN false
    
    invalidated = false
    
    IF (current_trend == "BEARISH"):
        // Bullish trade invalidated by break of lows
        recent_low = find_recent_swing_low(20)
        IF (close < recent_low):
            invalidated = true
    
    ELSE IF (current_trend == "BULLISH"):
        // Bearish trade invalidated by break of highs
        recent_high = find_recent_swing_high(20)
        IF (close > recent_high):
            invalidated = true
    
    IF (invalidated):
        close_position("INVALIDATED")
        position_open = false
    
    RETURN invalidated
```

## Main Algorithm Logic

### Main Trading Loop
```
FOR each new bar:
    
    // Update higher timeframe analysis
    detect_higher_tf_rlz()
    
    // Check for setup conditions
    IF (NOT position_open):
        // Look for new entry opportunities
        IF (validate_complete_setup()):
            execute_entry()
    
    ELSE:
        // Manage existing position
        manage_stops()
        check_trade_invalidation()
        
        // Check for profit target hit
        IF (target_hit()):
            close_position("TARGET_HIT")
            position_open = false
        
        // Check for stop loss hit
        IF (stop_hit()):
            close_position("STOP_HIT")
            position_open = false
```

## Helper Functions

### Pattern Recognition Utilities
```
FUNCTION detect_indicator_double_bottom(indicator_values, lookback):
    // Find two similar lows in indicator
    // Implementation similar to price double bottom detection
    
FUNCTION detect_indicator_double_top(indicator_values, lookback):
    // Find two similar highs in indicator
    // Implementation similar to price double top detection

FUNCTION find_recent_swing_high(lookback):
    // Find highest high in recent bars
    
FUNCTION find_recent_swing_low(lookback):
    // Find lowest low in recent bars
```

## Error Handling

### Input Validation
```
FUNCTION validate_inputs():
    IF (input_fib_min >= input_fib_max):
        THROW "Invalid Fibonacci levels"
    
    IF (input_higher_timeframe <= input_entry_timeframe):
        THROW "Higher timeframe must be greater than entry timeframe"
    
    IF (input_risk_base <= 0 OR input_risk_base > 10):
        THROW "Base risk must be between 0 and 10 percent"
```

### Runtime Safety
```
FUNCTION safe_indicator_calculation(calculation_func):
    TRY:
        result = calculation_func()
        RETURN result
    CATCH (error):
        log_error("Indicator calculation failed: " + error)
        RETURN previous_valid_value
```

---

**Algorithm Complexity**: O(n) per bar with additional O(m) for higher timeframe analysis
**Memory Usage**: O(n) for storing indicator values and pattern history
**Last Updated**: July 2025

## Key Implementation Notes

1. **Higher Timeframe Analysis**: Requires security() function in Pine Script
2. **Pattern Recognition**: Complex algorithms for double tops/bottoms and H&S
3. **Multi-Indicator Confluence**: Requires careful synchronization
4. **Dynamic Risk Management**: Risk adjusts based on setup quality
5. **Progressive Stop Management**: Stops move at specific profit levels

This is a significantly more complex strategy than the Silver setup, requiring sophisticated pattern recognition and multi-timeframe analysis.