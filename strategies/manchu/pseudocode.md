# Manchu Strategy - Pseudocode Implementation

## Core Algorithm Structure

### 1. Input Parameters
```
// Session Configuration
timezone = "America/Chicago"
session_start_hour = 8
session_start_minute = 30
session_end_hour = 12
session_end_minute = 0
weekdays_only = true

// SMMA Configuration
smma_periods = [21, 50, 100, 200]
smma_source = close

// Donchian Channel
donchian_length = 5

// Risk Management
risk_per_trade = 1.0  // USD
leverage = 1
commission = 0.20
risk_reward_ratio = 3.0

// VuManChu Integration (optional)
wavetrend_enabled = true
divergence_detection = true
```

### 2. Indicator Calculations

#### A. Smoothed Moving Averages
```
FUNCTION calculate_smma(source, length):
    smma = 0.0
    sma_initial = simple_moving_average(source, length)
    
    IF first_bar:
        smma = sma_initial
    ELSE:
        smma = (previous_smma * (length - 1) + current_source) / length
    
    RETURN smma

// Calculate all SMAs
smma21 = calculate_smma(close, 21)
smma50 = calculate_smma(close, 50)
smma100 = calculate_smma(close, 100)
smma200 = calculate_smma(close, 200)
```

#### B. Donchian Channel
```
FUNCTION calculate_donchian(length):
    upper_channel = highest_high(length)
    lower_channel = lowest_low(length)
    middle_channel = (upper_channel + lower_channel) / 2
    
    RETURN upper_channel, lower_channel, middle_channel
```

#### C. Session Filter
```
FUNCTION is_trading_session():
    current_time = current_bar_time
    session_start = timestamp(timezone, year, month, day, session_start_hour, session_start_minute)
    session_end = timestamp(timezone, year, month, day, session_end_hour, session_end_minute)
    
    day_of_week = dayofweek(current_time)
    
    is_weekday = day_of_week >= monday AND day_of_week <= friday
    is_session_time = current_time >= session_start AND current_time <= session_end
    
    RETURN is_weekday AND is_session_time
```

### 3. Signal Generation

#### A. Long Signal Logic
```
FUNCTION generate_long_signal():
    // Trend Alignment
    trend_aligned = smma50 > smma200
    price_above_trend = close > smma200
    
    // Entry Triggers
    cross_above_21 = crossover(close, smma21)
    cross_above_50 = crossover(close, smma50)
    cross_above_100 = crossover(close, smma100)
    
    entry_trigger = cross_above_21 OR cross_above_50 OR cross_above_100
    
    // Session Filter
    valid_session = is_trading_session()
    
    // Risk Filter
    no_active_trades = NOT trade_active
    
    long_signal = trend_aligned AND price_above_trend AND entry_trigger AND valid_session AND no_active_trades
    
    RETURN long_signal
```

#### B. Short Signal Logic
```
FUNCTION generate_short_signal():
    // Trend Reversal
    trend_bearish = smma50 < smma200
    price_below_trend = close < smma200
    
    // Entry Triggers
    cross_below_21 = crossunder(close, smma21)
    cross_below_50 = crossunder(close, smma50)
    cross_below_100 = crossunder(close, smma100)
    
    entry_trigger = cross_below_21 OR cross_below_50 OR cross_below_100
    
    // Session Filter
    valid_session = is_trading_session()
    
    // Risk Filter
    no_active_trades = NOT trade_active
    
    short_signal = trend_bearish AND price_below_trend AND entry_trigger AND valid_session AND no_active_trades
    
    RETURN short_signal
```

### 4. Trade Management

#### A. Position Sizing
```
FUNCTION calculate_position_size(entry_price, stop_loss_price):
    stop_distance = abs(entry_price - stop_loss_price)
    position_size = risk_per_trade / stop_distance
    
    // Apply leverage
    leveraged_size = position_size * leverage
    
    RETURN leveraged_size
```

#### B. Long Trade Entry
```
FUNCTION execute_long_trade():
    entry_price = close
    stop_loss = lower_donchian_channel
    take_profit = entry_price + (entry_price - stop_loss) * risk_reward_ratio
    
    position_size = calculate_position_size(entry_price, stop_loss)
    
    // Set trade levels
    entry_level = entry_price
    stop_level = stop_loss
    tp_level = take_profit
    
    // Activate trade
    trade_active = true
    long_trade_active = true
    
    // Log trade details
    log_trade_entry("LONG", entry_price, stop_loss, take_profit, position_size)
```

#### C. Short Trade Entry
```
FUNCTION execute_short_trade():
    entry_price = close
    stop_loss = upper_donchian_channel
    take_profit = entry_price - (stop_loss - entry_price) * risk_reward_ratio
    
    position_size = calculate_position_size(entry_price, stop_loss)
    
    // Set trade levels
    entry_level = entry_price
    stop_level = stop_loss
    tp_level = take_profit
    
    // Activate trade
    trade_active = true
    short_trade_active = true
    
    // Log trade details
    log_trade_entry("SHORT", entry_price, stop_loss, take_profit, position_size)
```

### 5. Trade Exit Logic

#### A. Stop Loss Hit
```
FUNCTION check_stop_loss():
    IF long_trade_active AND low <= stop_level:
        close_trade("STOP_LOSS", stop_level)
        increment_loss_counter()
        RETURN true
    
    IF short_trade_active AND high >= stop_level:
        close_trade("STOP_LOSS", stop_level)
        increment_loss_counter()
        RETURN true
    
    RETURN false
```

#### B. Take Profit Hit
```
FUNCTION check_take_profit():
    IF long_trade_active AND high >= tp_level:
        close_trade("TAKE_PROFIT", tp_level)
        increment_win_counter()
        RETURN true
    
    IF short_trade_active AND low <= tp_level:
        close_trade("TAKE_PROFIT", tp_level)
        increment_win_counter()
        RETURN true
    
    RETURN false
```

#### C. Trade Closure
```
FUNCTION close_trade(reason, exit_price):
    // Reset trade state
    trade_active = false
    long_trade_active = false
    short_trade_active = false
    
    // Calculate P&L
    calculate_pnl(entry_level, exit_price, position_size)
    
    // Log closure
    log_trade_exit(reason, exit_price)
    
    // Update statistics
    update_performance_metrics()
```

### 6. Performance Tracking

#### A. Trade Statistics
```
FUNCTION update_performance_metrics():
    total_trades = win_count + loss_count + breakeven_count
    win_rate = (win_count / total_trades) * 100
    
    profit_factor = total_profit / total_loss
    net_profit = total_profit - total_loss - (total_trades * commission)
    
    // Update equity curve
    equity_curve = win_count * (risk_per_trade * risk_reward_ratio) - 
                   loss_count * risk_per_trade - 
                   (total_trades * commission)
```

### 7. Alert System

#### A. Entry Alerts
```
FUNCTION generate_entry_alert(direction):
    IF direction == "LONG":
        alert_message = "{{ticker}} LONG"
    ELSE IF direction == "SHORT":
        alert_message = "{{ticker}} SHORT"
    
    send_alert(alert_message)
```

#### B. Exit Alerts
```
FUNCTION generate_exit_alert(reason):
    IF reason == "TAKE_PROFIT":
        alert_message = "{{ticker}} Take Profit"
    ELSE:
        alert_message = "{{ticker}} Close"
    
    send_alert(alert_message)
```

### 8. Main Strategy Loop

```
FUNCTION main_strategy():
    // Calculate indicators
    update_smma_values()
    update_donchian_channels()
    
    // Check for new signals
    long_signal = generate_long_signal()
    short_signal = generate_short_signal()
    
    // Execute trades
    IF long_signal:
        execute_long_trade()
        generate_entry_alert("LONG")
    
    IF short_signal:
        execute_short_trade()
        generate_entry_alert("SHORT")
    
    // Manage existing trades
    IF trade_active:
        stop_hit = check_stop_loss()
        profit_hit = check_take_profit()
        
        IF stop_hit OR profit_hit:
            generate_exit_alert(exit_reason)
    
    // Update displays
    update_visual_elements()
    update_performance_display()
```

## Implementation Notes

### Error Handling
- Validate all input parameters
- Handle division by zero in position sizing
- Ensure proper session time calculations
- Check for minimum stop distances

### Optimization Considerations
- SMMA periods can be adjusted for different timeframes
- Risk/reward ratio should be tested across market conditions
- Session times may need adjustment for different instruments
- Donchian length affects stop placement sensitivity

### Performance Monitoring
- Track win rate, profit factor, and maximum drawdown
- Monitor trade frequency and signal quality
- Analyze performance across different market conditions
- Regular parameter optimization recommended