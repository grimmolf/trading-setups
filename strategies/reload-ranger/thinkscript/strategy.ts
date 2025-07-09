# Reload Ranger - ThinkScript Strategy
# This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
# © trading-setups

# ═══════════════════════════════════════════════════════════════════════════════════════════
# INPUT PARAMETERS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Fibonacci retracement settings
input fib_min = 61.8;
input fib_max = 78.6;
input sweet_spot = 70.2;

# Pattern recognition settings
input pattern_range = 7;
input pattern_offset = 2;
input strict_patterns = yes;

# Momentum indicator settings
input williams_period = 14;
input macd_fast_period = 12;
input macd_slow_period = 26;
input macd_signal_period = 9;
input rsi_period = 14;
input obv_ema_period = 20;

# Risk management
input base_risk = 2.0;
input risk_increment = 1.0;
input max_risk = 5.0;

# Strategy settings
input allow_long = yes;
input allow_short = yes;
input enable_stop_management = yes;
input trailing_bars = 3;

# Visual settings
input show_fib_levels = yes;
input show_entries = yes;
input show_stops_targets = yes;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# HIGHER TIMEFRAME ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate recent swing highs and lows
def swing_high = Highest(high, 20);
def swing_low = Lowest(low, 20);

# Determine trend direction
def trend_direction = if close > close[10] then 1 else if close < close[10] then -1 else 0;

# Calculate Fibonacci levels
def move_size = swing_high - swing_low;
def fib_61_8 = if trend_direction == -1 then swing_low + (move_size * fib_min / 100) else swing_high - (move_size * fib_min / 100);
def fib_78_6 = if trend_direction == -1 then swing_low + (move_size * fib_max / 100) else swing_high - (move_size * fib_max / 100);
def fib_sweet = if trend_direction == -1 then swing_low + (move_size * sweet_spot / 100) else swing_high - (move_size * sweet_spot / 100);

# Location confirmation
def location_confirmed = if trend_direction == -1 then (close >= fib_61_8 and close <= fib_78_6) else (close <= fib_61_8 and close >= fib_78_6);
def below_sweet_spot = if trend_direction == -1 then close < fib_sweet else close > fib_sweet;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PATTERN RECOGNITION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# W Pattern Detection (Simplified for ThinkScript)
script DetectWPattern {
    input src = close;
    input range_bars = 7;
    
    def low1 = Lowest(src, range_bars);
    def low2 = Lowest(src, range_bars / 2);
    
    # Check for double bottom pattern
    def similarity_threshold = 0.02;
    def similar_lows = AbsValue(low1 - low2) / low1 < similarity_threshold;
    
    # Check for breakout above pattern
    def breakout_level = Max(low1, low2) * 1.02;
    def breakout_condition = src > breakout_level;
    
    plot w_found = similar_lows and breakout_condition;
}

# M Pattern Detection (Simplified for ThinkScript)
script DetectMPattern {
    input src = close;
    input range_bars = 7;
    
    def high1 = Highest(src, range_bars);
    def high2 = Highest(src, range_bars / 2);
    
    # Check for double top pattern
    def similarity_threshold = 0.02;
    def similar_highs = AbsValue(high1 - high2) / high1 < similarity_threshold;
    
    # Check for breakdown below pattern
    def breakdown_level = Min(high1, high2) * 0.98;
    def breakdown_condition = src < breakdown_level;
    
    plot m_found = similar_highs and breakdown_condition;
}

# Head and Shoulders Detection (Simplified)
script DetectHeadShoulders {
    input src = close;
    input range_bars = 15;
    
    def peak1 = Highest(src, range_bars);
    def peak2 = Highest(src, range_bars / 2);
    def peak3 = Highest(src, range_bars / 3);
    
    def head_higher = peak2 > peak1 and peak2 > peak3;
    def shoulders_equal = AbsValue(peak1 - peak3) / peak1 < 0.03;
    
    def neckline = (peak1 + peak3) / 2;
    def neckline_break = src < neckline * 0.98;
    
    plot hs_found = head_higher and shoulders_equal and neckline_break;
}

# ═══════════════════════════════════════════════════════════════════════════════════════════
# MOMENTUM INDICATORS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Williams %R
def williams_r = -100 * (Highest(high, williams_period) - close) / (Highest(high, williams_period) - Lowest(low, williams_period));
def williams_ema = ExpAverage(williams_r, 14);

# MACD
def macd_value = MACD(close, macd_fast_period, macd_slow_period, macd_signal_period);
def macd_avg = MACD(close, macd_fast_period, macd_slow_period, macd_signal_period).Avg;

# RSI
def rsi = RSI(close, rsi_period);

# OBV
def obv_value = TotalSum(if close > close[1] then volume else if close < close[1] then -volume else 0);
def obv_ema = ExpAverage(obv_value, obv_ema_period);

# Volume Impetus
def volume_impetus_bull = volume > volume[1] and volume[1] > volume[2] and 
                         close > close[1] and close[1] > close[2];
def volume_impetus_bear = volume > volume[1] and volume[1] > volume[2] and 
                         close < close[1] and close[1] < close[2];

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PATTERN DETECTION CALLS
# ═══════════════════════════════════════════════════════════════════════════════════════════

def price_w_found = DetectWPattern(close, pattern_range);
def price_m_found = DetectMPattern(close, pattern_range);
def hs_found = DetectHeadShoulders(close, pattern_range);

def macd_w_found = DetectWPattern(macd_value, pattern_range);
def macd_m_found = DetectMPattern(macd_value, pattern_range);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# MOMENTUM CONFIRMATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

def williams_confirmed_bull = williams_r < -80 and williams_r > williams_ema and williams_r[1] <= williams_ema[1];
def williams_confirmed_bear = williams_r > -20 and williams_r < williams_ema and williams_r[1] >= williams_ema[1];

def macd_confirmed_bull = macd_w_found;
def macd_confirmed_bear = macd_m_found;

def rsi_confirmed_bull = rsi < 30;
def rsi_confirmed_bear = rsi > 70;

def obv_confirmed_bull = obv_value > obv_ema and obv_value[1] <= obv_ema[1] and volume_impetus_bull;
def obv_confirmed_bear = obv_value < obv_ema and obv_value[1] >= obv_ema[1] and volume_impetus_bear;

def momentum_count_bull = (if williams_confirmed_bull then 1 else 0) + 
                         (if macd_confirmed_bull then 1 else 0) + 
                         (if rsi_confirmed_bull then 1 else 0) + 
                         (if obv_confirmed_bull then 1 else 0);

def momentum_count_bear = (if williams_confirmed_bear then 1 else 0) + 
                         (if macd_confirmed_bear then 1 else 0) + 
                         (if rsi_confirmed_bear then 1 else 0) + 
                         (if obv_confirmed_bear then 1 else 0);

def momentum_confirmed_bull = momentum_count_bull >= 2;
def momentum_confirmed_bear = momentum_count_bear >= 2;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STRUCTURE CONFIRMATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

def structure_confirmed_bull = price_w_found;
def structure_confirmed_bear = price_m_found or hs_found;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# RISK CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

def additional_risk_bull = (if below_sweet_spot and trend_direction == -1 then risk_increment else 0) + 
                          (if hs_found then risk_increment else 0) + 
                          (if momentum_count_bull > 3 then risk_increment else 0);

def additional_risk_bear = (if below_sweet_spot and trend_direction == 1 then risk_increment else 0) + 
                          (if hs_found then risk_increment else 0) + 
                          (if momentum_count_bear > 3 then risk_increment else 0);

def current_risk_bull = Min(base_risk + additional_risk_bull, max_risk);
def current_risk_bear = Min(base_risk + additional_risk_bear, max_risk);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SETUP VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

def bullish_setup = trend_direction == -1 and location_confirmed and structure_confirmed_bull and momentum_confirmed_bull and allow_long and GetQuantity() == 0;
def bearish_setup = trend_direction == 1 and location_confirmed and structure_confirmed_bear and momentum_confirmed_bear and allow_short and GetQuantity() == 0;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PROFIT TARGET AND STOP LOSS CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

def latest_high = Highest(high, 50);
def latest_low = Lowest(low, 50);

def profit_target_bull = latest_low + ((latest_high - latest_low) * 0.5);
def profit_target_bear = latest_high - ((latest_high - latest_low) * 0.5);

def atr_value = Average(TrueRange(high, close, low), 14);
def stop_loss_bull = Lowest(low, 20) - (atr_value * 0.5);
def stop_loss_bear = Highest(high, 20) + (atr_value * 0.5);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# POSITION SIZING
# ═══════════════════════════════════════════════════════════════════════════════════════════

def account_value = GetNetLiq();
def risk_amount_bull = account_value * (current_risk_bull / 100);
def risk_amount_bear = account_value * (current_risk_bear / 100);

def stop_distance_bull = AbsValue(close - stop_loss_bull);
def stop_distance_bear = AbsValue(close - stop_loss_bear);

def position_size_bull = if stop_distance_bull > 0 then Round(risk_amount_bull / stop_distance_bull, 0) else 0;
def position_size_bear = if stop_distance_bear > 0 then Round(risk_amount_bear / stop_distance_bear, 0) else 0;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STRATEGY EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long entry
AddOrder(OrderType.BUY_TO_OPEN, bullish_setup, open[-1], position_size_bull, Color.GREEN, Color.GREEN, "RR Long Entry");

# Short entry
AddOrder(OrderType.SELL_TO_OPEN, bearish_setup, open[-1], position_size_bear, Color.RED, Color.RED, "RR Short Entry");

# ═══════════════════════════════════════════════════════════════════════════════════════════
# POSITION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate progress toward target
def progress_bull = if GetQuantity() > 0 then (close - stop_loss_bull) / (profit_target_bull - stop_loss_bull) else 0;
def progress_bear = if GetQuantity() < 0 then (stop_loss_bear - close) / (stop_loss_bear - profit_target_bear) else 0;

# Progressive stop management conditions
def move_stop_25_bull = enable_stop_management and GetQuantity() > 0 and progress_bull >= 0.5;
def move_stop_25_bear = enable_stop_management and GetQuantity() < 0 and progress_bear >= 0.5;

def trail_stop_bull = enable_stop_management and GetQuantity() > 0 and progress_bull >= 0.66;
def trail_stop_bear = enable_stop_management and GetQuantity() < 0 and progress_bear >= 0.66;

# Stop levels
def stop_25_bull = stop_loss_bull + ((profit_target_bull - stop_loss_bull) * 0.25);
def stop_25_bear = stop_loss_bear - ((stop_loss_bear - profit_target_bear) * 0.25);

def trailing_stop_bull = Lowest(low, trailing_bars) - (atr_value * 0.5);
def trailing_stop_bear = Highest(high, trailing_bars) + (atr_value * 0.5);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# EXIT CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long exits
def long_stop_hit = GetQuantity() > 0 and low <= stop_loss_bull;
def long_target_hit = GetQuantity() > 0 and high >= profit_target_bull;
def long_stop_25_hit = GetQuantity() > 0 and move_stop_25_bull and low <= stop_25_bull;
def long_trailing_hit = GetQuantity() > 0 and trail_stop_bull and low <= trailing_stop_bull;

# Short exits
def short_stop_hit = GetQuantity() < 0 and high >= stop_loss_bear;
def short_target_hit = GetQuantity() < 0 and low <= profit_target_bear;
def short_stop_25_hit = GetQuantity() < 0 and move_stop_25_bear and high >= stop_25_bear;
def short_trailing_hit = GetQuantity() < 0 and trail_stop_bear and high >= trailing_stop_bear;

# Trade invalidation
def long_invalidated = GetQuantity() > 0 and close < Lowest(low, 20);
def short_invalidated = GetQuantity() < 0 and close > Highest(high, 20);

# Exit orders
AddOrder(OrderType.SELL_TO_CLOSE, long_stop_hit, open[-1], GetQuantity(), Color.RED, Color.RED, "Long Stop");
AddOrder(OrderType.SELL_TO_CLOSE, long_target_hit, open[-1], GetQuantity(), Color.GREEN, Color.GREEN, "Long Target");
AddOrder(OrderType.SELL_TO_CLOSE, long_stop_25_hit, open[-1], GetQuantity(), Color.ORANGE, Color.ORANGE, "Long 25% Stop");
AddOrder(OrderType.SELL_TO_CLOSE, long_trailing_hit, open[-1], GetQuantity(), Color.BLUE, Color.BLUE, "Long Trailing");
AddOrder(OrderType.SELL_TO_CLOSE, long_invalidated, open[-1], GetQuantity(), Color.GRAY, Color.GRAY, "Long Invalid");

AddOrder(OrderType.BUY_TO_CLOSE, short_stop_hit, open[-1], AbsValue(GetQuantity()), Color.RED, Color.RED, "Short Stop");
AddOrder(OrderType.BUY_TO_CLOSE, short_target_hit, open[-1], AbsValue(GetQuantity()), Color.GREEN, Color.GREEN, "Short Target");
AddOrder(OrderType.BUY_TO_CLOSE, short_stop_25_hit, open[-1], AbsValue(GetQuantity()), Color.ORANGE, Color.ORANGE, "Short 25% Stop");
AddOrder(OrderType.BUY_TO_CLOSE, short_trailing_hit, open[-1], AbsValue(GetQuantity()), Color.BLUE, Color.BLUE, "Short Trailing");
AddOrder(OrderType.BUY_TO_CLOSE, short_invalidated, open[-1], AbsValue(GetQuantity()), Color.GRAY, Color.GRAY, "Short Invalid");

# ═══════════════════════════════════════════════════════════════════════════════════════════
# VISUAL ELEMENTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Plot Fibonacci levels
plot fib_61_8_line = if show_fib_levels then fib_61_8 else Double.NaN;
plot fib_78_6_line = if show_fib_levels then fib_78_6 else Double.NaN;
plot fib_sweet_line = if show_fib_levels then fib_sweet else Double.NaN;

fib_61_8_line.SetDefaultColor(Color.YELLOW);
fib_78_6_line.SetDefaultColor(Color.ORANGE);
fib_sweet_line.SetDefaultColor(Color.BLUE);
fib_sweet_line.SetLineWeight(2);

# Plot entry signals
plot bullish_entry = if show_entries and bullish_setup then low - (high - low) * 0.1 else Double.NaN;
plot bearish_entry = if show_entries and bearish_setup then high + (high - low) * 0.1 else Double.NaN;

bullish_entry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
bullish_entry.SetDefaultColor(Color.LIME);
bullish_entry.SetLineWeight(4);

bearish_entry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
bearish_entry.SetDefaultColor(Color.RED);
bearish_entry.SetLineWeight(4);

# Plot stops and targets for active positions
plot long_stop_line = if show_stops_targets and GetQuantity() > 0 then stop_loss_bull else Double.NaN;
plot long_target_line = if show_stops_targets and GetQuantity() > 0 then profit_target_bull else Double.NaN;
plot short_stop_line = if show_stops_targets and GetQuantity() < 0 then stop_loss_bear else Double.NaN;
plot short_target_line = if show_stops_targets and GetQuantity() < 0 then profit_target_bear else Double.NaN;

long_stop_line.SetDefaultColor(Color.RED);
long_stop_line.SetLineWeight(2);
long_target_line.SetDefaultColor(Color.GREEN);
long_target_line.SetLineWeight(2);
short_stop_line.SetDefaultColor(Color.RED);
short_stop_line.SetLineWeight(2);
short_target_line.SetDefaultColor(Color.GREEN);
short_target_line.SetLineWeight(2);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

Alert(bullish_setup, "Bullish Reload Ranger Setup", Alert.BAR, Sound.Chimes);
Alert(bearish_setup, "Bearish Reload Ranger Setup", Alert.BAR, Sound.Chimes);

Alert(long_stop_hit, "Long Stop Hit", Alert.BAR, Sound.Ring);
Alert(long_target_hit, "Long Target Hit", Alert.BAR, Sound.Bell);
Alert(short_stop_hit, "Short Stop Hit", Alert.BAR, Sound.Ring);
Alert(short_target_hit, "Short Target Hit", Alert.BAR, Sound.Bell);

Alert(long_invalidated, "Long Trade Invalidated", Alert.BAR, Sound.Ding);
Alert(short_invalidated, "Short Trade Invalidated", Alert.BAR, Sound.Ding);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND PERFORMANCE METRICS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Current position status
def current_position = if GetQuantity() > 0 then "LONG" else if GetQuantity() < 0 then "SHORT" else "FLAT";
def position_color = if GetQuantity() > 0 then Color.GREEN else if GetQuantity() < 0 then Color.RED else Color.GRAY;
AddLabel(yes, "Position: " + current_position, position_color);

# Setup component status
def trend_text = if trend_direction == 1 then "BULL" else if trend_direction == -1 then "BEAR" else "SIDE";
def trend_color = if trend_direction == 1 then Color.GREEN else if trend_direction == -1 then Color.RED else Color.GRAY;
AddLabel(yes, "HTF: " + trend_text, trend_color);

AddLabel(location_confirmed, "LOCATION ✓", Color.YELLOW);
AddLabel(structure_confirmed_bull, "BULL STRUCT ✓", Color.GREEN);
AddLabel(structure_confirmed_bear, "BEAR STRUCT ✓", Color.RED);

AddLabel(momentum_confirmed_bull, "BULL MOM (" + momentum_count_bull + "/4)", Color.CYAN);
AddLabel(momentum_confirmed_bear, "BEAR MOM (" + momentum_count_bear + "/4)", Color.PINK);

# Complete setup status
AddLabel(bullish_setup, "BULLISH RELOAD RANGER", Color.LIME);
AddLabel(bearish_setup, "BEARISH RELOAD RANGER", Color.RED);

# Risk and position information
AddLabel(GetQuantity() > 0, "Bull Risk: " + current_risk_bull + "%", Color.WHITE);
AddLabel(GetQuantity() < 0, "Bear Risk: " + current_risk_bear + "%", Color.WHITE);

def current_progress = if GetQuantity() > 0 then progress_bull else if GetQuantity() < 0 then progress_bear else 0;
AddLabel(GetQuantity() != 0, "Progress: " + Round(current_progress * 100, 0) + "%", Color.PURPLE);

# Performance metrics
def total_pnl = GetTotalTradingPnL();
def total_trades = GetTotalTrades();
def win_rate = if total_trades > 0 then Round((GetWinningTrades() / total_trades) * 100, 1) else 0;

AddLabel(yes, "P&L: $" + Round(total_pnl, 2), if total_pnl > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Trades: " + total_trades, Color.WHITE);
AddLabel(yes, "Win Rate: " + win_rate + "%", Color.WHITE);

# Current levels
AddLabel(GetQuantity() > 0, "Stop: " + Round(stop_loss_bull, 2), Color.RED);
AddLabel(GetQuantity() > 0, "Target: " + Round(profit_target_bull, 2), Color.GREEN);
AddLabel(GetQuantity() < 0, "Stop: " + Round(stop_loss_bear, 2), Color.RED);
AddLabel(GetQuantity() < 0, "Target: " + Round(profit_target_bear, 2), Color.GREEN);

# Fibonacci levels
AddLabel(show_fib_levels, "Fib Zone: " + Round(fib_61_8, 2) + " - " + Round(fib_78_6, 2), Color.ORANGE);
AddLabel(show_fib_levels, "Sweet: " + Round(fib_sweet, 2), Color.BLUE);

# Stop management status
AddLabel(enable_stop_management and GetQuantity() > 0 and move_stop_25_bull, "25% STOP ACTIVE", Color.ORANGE);
AddLabel(enable_stop_management and GetQuantity() < 0 and move_stop_25_bear, "25% STOP ACTIVE", Color.ORANGE);
AddLabel(enable_stop_management and GetQuantity() > 0 and trail_stop_bull, "TRAILING STOP", Color.BLUE);
AddLabel(enable_stop_management and GetQuantity() < 0 and trail_stop_bear, "TRAILING STOP", Color.BLUE);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

def scan_bullish_setup = bullish_setup;
def scan_bearish_setup = bearish_setup;
def scan_location_confirmed = location_confirmed;
def scan_bull_structure = structure_confirmed_bull;
def scan_bear_structure = structure_confirmed_bear;
def scan_bull_momentum = momentum_confirmed_bull;
def scan_bear_momentum = momentum_confirmed_bear;