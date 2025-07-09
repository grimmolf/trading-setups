# Silver Setup - Pseudocode Implementation

## Algorithm Overview

**Purpose**: Identify paint bar patterns and trade re-entries with fixed risk/reward ratios
**Input**: OHLC price data, time session filters, risk multiplier settings
**Output**: Entry/exit signals, stop/target levels, position management alerts

## Variable Definitions

### Input Parameters
```
// Time session filters
input_time_session_1 = "0700-0900"    // Morning session (7-9 AM PT)
input_time_session_2 = "1000-1200"    // Mid-day session (10 AM-12 PM PT)
input_time_session_3 = ""             // Optional third session
input_risk_multiplier = 4.6           // Take profit multiplier
input_timezone = "America/Los_Angeles"  // Pacific timezone
```

### Internal Variables
```
// Paint bar detection
bull_paint_detected = false           // Bullish paint bar found
bear_paint_detected = false           // Bearish paint bar found

// Paint bar levels
bull_paint_high = 0.0                 // High of bullish paint bar
bull_paint_low = 0.0                  // Low of bullish paint bar
bear_paint_high = 0.0                 // High of bearish paint bar
bear_paint_low = 0.0                  // Low of bearish paint bar

// Stop levels
bull_stop_level = 0.0                 // Stop for long positions
bear_stop_level = 0.0                 // Stop for short positions

// Take profit levels
bull_target_level = 0.0               // Target for long positions
bear_target_level = 0.0               // Target for short positions
```

### State Management
```
// Position state
bull_paint_active = false             // Paint bar waiting for entry
bear_paint_active = false             // Paint bar waiting for entry
bull_position_open = false            // Long position active
bear_position_open = false            // Short position active

// Entry/exit triggers
long_entry_triggered = false          // Long entry signal fired
short_entry_triggered = false         // Short entry signal fired
long_exit_triggered = false           // Long exit signal fired
short_exit_triggered = false          // Short exit signal fired
```

## Paint Bar Detection Logic

### Bullish Paint Bar
```
FUNCTION detect_bull_paint():
    // Paint condition: current low > high from 2 bars ago
    paint_condition = (current_low > high[2])
    
    IF (paint_condition AND NOT bull_paint_active):
        bull_paint_high = current_high
        bull_paint_low = current_low
        bull_stop_level = low[3]  // Low from 2 bars before paint bar
        bull_paint_active = true
        bear_paint_active = false  // Cancel opposing paint
        
        // Calculate take profit level
        risk_distance = bull_paint_low - bull_stop_level
        bull_target_level = bull_paint_low + (risk_distance * input_risk_multiplier)
        
        RETURN true
    RETURN false
```

### Bearish Paint Bar
```
FUNCTION detect_bear_paint():
    // Paint condition: current high < low from 2 bars ago
    paint_condition = (current_high < low[2])
    
    IF (paint_condition AND NOT bear_paint_active):
        bear_paint_high = current_high
        bear_paint_low = current_low
        bear_stop_level = high[3]  // High from 2 bars before paint bar
        bear_paint_active = true
        bull_paint_active = false  // Cancel opposing paint
        
        // Calculate take profit level
        risk_distance = bear_stop_level - bear_paint_high
        bear_target_level = bear_paint_high - (risk_distance * input_risk_multiplier)
        
        RETURN true
    RETURN false
```

## Time Session Management

### Session Detection
```
FUNCTION is_in_trading_session():
    current_time = get_current_time(input_timezone)
    
    // Check if current time is within any active session
    session_1_active = is_time_in_session(current_time, input_time_session_1)
    session_2_active = is_time_in_session(current_time, input_time_session_2)
    session_3_active = is_time_in_session(current_time, input_time_session_3)
    
    // Exclude weekends
    is_weekday = (day_of_week != SATURDAY AND day_of_week != SUNDAY)
    
    RETURN (session_1_active OR session_2_active OR session_3_active) AND is_weekday
```

### Daily Close Detection
```
FUNCTION is_daily_close_time():
    current_time = get_current_time(input_timezone)
    close_session = "1300-1301"  // 1:00-1:01 PM PT
    
    is_close_time = is_time_in_session(current_time, close_session)
    is_weekday = (day_of_week != SATURDAY AND day_of_week != SUNDAY)
    
    RETURN is_close_time AND is_weekday
```

## Entry Logic

### Long Entry Conditions
```
FUNCTION check_long_entry():
    // Reason 1: Location - Within trading session (time window)
    location_condition = is_in_trading_session()
    
    // Reason 2: Momentum - Bull paint bar active (directional bias)
    momentum_condition = bull_paint_active
    
    // Reason 3: Structure - Price re-enters paint bar range from below
    structure_condition = (current_close > bull_paint_low AND 
                          current_close < bull_paint_high AND 
                          current_low <= bull_paint_low)
    
    // Additional filters
    no_position_conflict = (NOT bull_position_open AND NOT bear_position_open)
    
    RETURN (location_condition AND momentum_condition AND structure_condition AND no_position_conflict)
```

### Short Entry Conditions
```
FUNCTION check_short_entry():
    // Reason 1: Location - Within trading session (time window)
    location_condition = is_in_trading_session()
    
    // Reason 2: Momentum - Bear paint bar active (directional bias)
    momentum_condition = bear_paint_active
    
    // Reason 3: Structure - Price re-enters paint bar range from above
    structure_condition = (current_close < bear_paint_high AND 
                          current_close > bear_paint_low AND 
                          current_high >= bear_paint_high)
    
    // Additional filters
    no_position_conflict = (NOT bear_position_open AND NOT bull_position_open)
    
    RETURN (location_condition AND momentum_condition AND structure_condition AND no_position_conflict)
```

## Exit Logic

### Long Position Exits
```
FUNCTION check_long_exit():
    IF (NOT bull_position_open):
        RETURN false
    
    // Stop loss hit
    stop_hit = (current_low <= bull_stop_level)
    
    // Take profit hit
    target_hit = (current_high >= bull_target_level)
    
    // Daily close time
    daily_close = is_daily_close_time()
    
    RETURN (stop_hit OR target_hit OR daily_close)
```

### Short Position Exits
```
FUNCTION check_short_exit():
    IF (NOT bear_position_open):
        RETURN false
    
    // Stop loss hit
    stop_hit = (current_high >= bear_stop_level)
    
    // Take profit hit
    target_hit = (current_low <= bear_target_level)
    
    // Daily close time
    daily_close = is_daily_close_time()
    
    RETURN (stop_hit OR target_hit OR daily_close)
```

## Main Algorithm Logic

### Main Trading Loop
```
FOR each new bar:
    
    // Reset previous bar triggers
    IF (long_entry_triggered[1]):
        long_entry_triggered = false
    IF (short_entry_triggered[1]):
        short_entry_triggered = false
    IF (long_exit_triggered[1]):
        long_exit_triggered = false
    IF (short_exit_triggered[1]):
        short_exit_triggered = false
    
    // Detect new paint bars
    detect_bull_paint()
    detect_bear_paint()
    
    // Check for entry conditions
    IF (check_long_entry() AND NOT long_entry_triggered):
        long_entry_triggered = true
        bull_position_open = true
        bull_paint_active = false
        
        // Generate entry alert
        generate_entry_alert("LONG", current_close, bull_stop_level, bull_target_level)
    
    IF (check_short_entry() AND NOT short_entry_triggered):
        short_entry_triggered = true
        bear_position_open = true
        bear_paint_active = false
        
        // Generate entry alert
        generate_entry_alert("SHORT", current_close, bear_stop_level, bear_target_level)
    
    // Check for exit conditions
    IF (check_long_exit() AND NOT long_exit_triggered):
        long_exit_triggered = true
        bull_position_open = false
        
        // Generate exit alert
        exit_reason = get_exit_reason("LONG")
        generate_exit_alert("LONG", current_close, exit_reason)
    
    IF (check_short_exit() AND NOT short_exit_triggered):
        short_exit_triggered = true
        bear_position_open = false
        
        // Generate exit alert
        exit_reason = get_exit_reason("SHORT")
        generate_exit_alert("SHORT", current_close, exit_reason)
    
    // Clean up stale paint bars
    cleanup_stale_paint_bars()
```

## Helper Functions

### Paint Bar Cleanup
```
FUNCTION cleanup_stale_paint_bars():
    // Cancel bull paint if price moves too far away
    IF (bull_paint_active):
        price_too_high = (current_high > bull_paint_high * 1.1)
        hit_stop_level = (current_low < bull_stop_level)
        
        IF (price_too_high OR hit_stop_level):
            bull_paint_active = false
    
    // Cancel bear paint if price moves too far away
    IF (bear_paint_active):
        price_too_low = (current_low < bear_paint_low * 0.9)
        hit_stop_level = (current_high > bear_stop_level)
        
        IF (price_too_low OR hit_stop_level):
            bear_paint_active = false
```

### Exit Reason Detection
```
FUNCTION get_exit_reason(direction):
    IF (direction == "LONG"):
        IF (current_low <= bull_stop_level):
            RETURN "STOP_LOSS"
        ELSE IF (current_high >= bull_target_level):
            RETURN "TAKE_PROFIT"
        ELSE IF (is_daily_close_time()):
            RETURN "DAILY_CLOSE"
    
    IF (direction == "SHORT"):
        IF (current_high >= bear_stop_level):
            RETURN "STOP_LOSS"
        ELSE IF (current_low <= bear_target_level):
            RETURN "TAKE_PROFIT"
        ELSE IF (is_daily_close_time()):
            RETURN "DAILY_CLOSE"
    
    RETURN "UNKNOWN"
```

## Alert Generation

### Entry Alerts
```
FUNCTION generate_entry_alert(direction, entry_price, stop_level, target_level):
    message = format_string(
        "{{ticker}} - %s Entry at %f, Stop: %f, Target: %f",
        direction, entry_price, stop_level, target_level
    )
    
    send_alert(message)
```

### Exit Alerts
```
FUNCTION generate_exit_alert(direction, exit_price, reason):
    message = format_string(
        "{{ticker}} - %s Exit at %f, Reason: %s",
        direction, exit_price, reason
    )
    
    send_alert(message)
```

### Daily Close Alert
```
FUNCTION generate_daily_close_alert():
    IF (is_daily_close_time()):
        message = "{{ticker}} - Daily Close 1pm PT at {{close}}"
        send_alert(message)
```

## Risk Management

### Position Size Calculation
```
FUNCTION calculate_position_size(entry_price, stop_level, account_risk_percent):
    account_balance = get_account_balance()
    risk_amount = account_balance * (account_risk_percent / 100)
    
    stop_distance = abs(entry_price - stop_level)
    position_size = risk_amount / stop_distance
    
    // Apply maximum position limits
    max_position_value = account_balance * 0.1  // 10% max position
    max_shares = max_position_value / entry_price
    
    RETURN min(position_size, max_shares)
```

### Risk Validation
```
FUNCTION validate_risk_parameters():
    // Ensure stop level is reasonable
    IF (direction == "LONG"):
        max_stop_distance = bull_paint_low * 0.05  // 5% max stop
        actual_stop_distance = bull_paint_low - bull_stop_level
        
        IF (actual_stop_distance > max_stop_distance):
            RETURN false
    
    // Similar validation for shorts
    RETURN true
```

## Error Handling

### Input Validation
```
FUNCTION validate_inputs():
    // Check time session format
    IF (NOT is_valid_time_format(input_time_session_1)):
        THROW "Invalid time session 1 format"
    
    // Check risk multiplier range
    IF (input_risk_multiplier < 1.0 OR input_risk_multiplier > 10.0):
        THROW "Risk multiplier must be between 1.0 and 10.0"
    
    // Check timezone
    IF (NOT is_valid_timezone(input_timezone)):
        THROW "Invalid timezone specified"
```

### Runtime Error Handling
```
FUNCTION safe_price_calculation(calculation_type):
    TRY:
        result = perform_calculation(calculation_type)
        
        // Validate result is reasonable
        IF (result <= 0 OR result > max_reasonable_price):
            RETURN previous_valid_value
        
        RETURN result
    CATCH (calculation_error):
        log_error("Price calculation failed: " + calculation_error)
        RETURN previous_valid_value
```

## Performance Optimization

### Calculation Efficiency
```
// Cache expensive lookback calculations
IF (bar_index_changed):
    cached_high_2_bars_ago = high[2]
    cached_low_2_bars_ago = low[2]
    cached_high_3_bars_ago = high[3]
    cached_low_3_bars_ago = low[3]

// Use cached values in paint detection
paint_condition = (current_low > cached_high_2_bars_ago)
```

### Memory Management
```
// Limit historical data retention
max_history_bars = 500
IF (bar_count > max_history_bars):
    trim_historical_data(bar_count - max_history_bars)
```

## Testing Hooks

### Debug Output
```
FUNCTION debug_output():
    IF (debug_mode_enabled):
        print("Paint Status - Bull Active: " + bull_paint_active + ", Bear Active: " + bear_paint_active)
        print("Position Status - Long: " + bull_position_open + ", Short: " + bear_position_open)
        print("Levels - Bull Stop: " + bull_stop_level + ", Bull Target: " + bull_target_level)
        print("Time Filter: " + is_in_trading_session())
```

### Backtesting Support
```
FUNCTION backtest_statistics():
    // Track performance metrics
    total_trades = count_completed_trades()
    win_rate = calculate_win_rate()
    average_win = calculate_average_win()
    average_loss = calculate_average_loss()
    profit_factor = calculate_profit_factor()
    
    // Generate performance report
    generate_backtest_report(total_trades, win_rate, average_win, average_loss, profit_factor)
```

---

**Algorithm Complexity**: O(1) per bar (constant time operations)
**Memory Usage**: O(1) space (fixed number of variables)
**Last Updated**: July 2025