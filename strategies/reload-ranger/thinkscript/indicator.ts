# Reload Ranger - ThinkScript Indicator
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

# Visual settings
input show_fib_levels = yes;
input show_pattern_signals = yes;
input show_momentum_signals = yes;
input show_setup_signals = yes;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# HIGHER TIMEFRAME ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate recent swing highs and lows
def swing_high = Highest(high, 20);
def swing_low = Lowest(low, 20);

# Determine trend direction (simplified for ThinkScript)
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

# W Pattern Detection (Double Bottom) - Simplified for ThinkScript
script DetectWPattern {
    input src = close;
    input range_bars = 7;
    input offset_bars = 2;
    input strict = yes;
    
    def low1 = Lowest(src, range_bars);
    def low1_bar = if src == low1 then 0 else Double.NaN;
    def low2 = Lowest(src, range_bars / 2);
    def low2_bar = if src == low2 and !IsNaN(low1_bar[range_bars/2]) then 0 else Double.NaN;
    
    # Check if we have two similar lows with higher low in between
    def similarity_threshold = 0.02; # 2% similarity
    def similar_lows = if !IsNaN(low1_bar) and !IsNaN(low2_bar) then AbsValue(low1 - low2) / low1 < similarity_threshold else no;
    
    # Check for higher low in between
    def middle_section_low = Lowest(src, range_bars / 4);
    def higher_middle = middle_section_low > Min(low1, low2);
    
    # Current price should be higher than pattern (breakout)
    def breakout_condition = src > Max(low1, low2) * 1.02; # 2% above pattern
    
    plot w_found = similar_lows and higher_middle and breakout_condition;
}

# M Pattern Detection (Double Top) - Simplified for ThinkScript
script DetectMPattern {
    input src = close;
    input range_bars = 7;
    input offset_bars = 2;
    input strict = yes;
    
    def high1 = Highest(src, range_bars);
    def high1_bar = if src == high1 then 0 else Double.NaN;
    def high2 = Highest(src, range_bars / 2);
    def high2_bar = if src == high2 and !IsNaN(high1_bar[range_bars/2]) then 0 else Double.NaN;
    
    # Check if we have two similar highs with lower high in between
    def similarity_threshold = 0.02; # 2% similarity
    def similar_highs = if !IsNaN(high1_bar) and !IsNaN(high2_bar) then AbsValue(high1 - high2) / high1 < similarity_threshold else no;
    
    # Check for lower high in between
    def middle_section_high = Highest(src, range_bars / 4);
    def lower_middle = middle_section_high < Max(high1, high2);
    
    # Current price should be lower than pattern (breakdown)
    def breakdown_condition = src < Min(high1, high2) * 0.98; # 2% below pattern
    
    plot m_found = similar_highs and lower_middle and breakdown_condition;
}

# Head and Shoulders Detection (Simplified)
script DetectHeadShoulders {
    input src = close;
    input range_bars = 15;
    
    def peak1 = Highest(src, range_bars);
    def peak2 = Highest(src, range_bars / 2);
    def peak3 = Highest(src, range_bars / 3);
    
    # Head should be higher than shoulders
    def head_higher = peak2 > peak1 and peak2 > peak3;
    
    # Shoulders should be roughly equal (within 3%)
    def shoulders_equal = AbsValue(peak1 - peak3) / peak1 < 0.03;
    
    # Neckline break
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
def macd_diff = MACD(close, macd_fast_period, macd_slow_period, macd_signal_period).Diff;

# RSI
def rsi = RSI(close, rsi_period);

# OBV (On-Balance Volume)
def obv_value = TotalSum(if close > close[1] then volume else if close < close[1] then -volume else 0);
def obv_ema = ExpAverage(obv_value, obv_ema_period);

# Volume Impetus (3 successive bars)
def volume_impetus_bull = volume > volume[1] and volume[1] > volume[2] and 
                         close > close[1] and close[1] > close[2];
def volume_impetus_bear = volume > volume[1] and volume[1] > volume[2] and 
                         close < close[1] and close[1] < close[2];

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PATTERN DETECTION CALLS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Price patterns
def price_w_found = DetectWPattern(close, pattern_range, pattern_offset, strict_patterns);
def price_m_found = DetectMPattern(close, pattern_range, pattern_offset, strict_patterns);
def hs_found = DetectHeadShoulders(close, pattern_range);

# MACD patterns
def macd_w_found = DetectWPattern(macd_value, pattern_range, pattern_offset, strict_patterns);
def macd_m_found = DetectMPattern(macd_value, pattern_range, pattern_offset, strict_patterns);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# MOMENTUM CONFIRMATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Williams %R confirmation
def williams_confirmed_bull = williams_r < -80 and williams_r > williams_ema and williams_r[1] <= williams_ema[1];
def williams_confirmed_bear = williams_r > -20 and williams_r < williams_ema and williams_r[1] >= williams_ema[1];

# MACD confirmation
def macd_confirmed_bull = macd_w_found;
def macd_confirmed_bear = macd_m_found;

# RSI confirmation
def rsi_confirmed_bull = rsi < 30; # Oversold
def rsi_confirmed_bear = rsi > 70; # Overbought

# OBV confirmation
def obv_confirmed_bull = obv_value > obv_ema and obv_value[1] <= obv_ema[1] and volume_impetus_bull;
def obv_confirmed_bear = obv_value < obv_ema and obv_value[1] >= obv_ema[1] and volume_impetus_bear;

# Count momentum confirmations
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

def current_risk_bull = base_risk + additional_risk_bull;
def current_risk_bear = base_risk + additional_risk_bear;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# COMPLETE SETUP VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Bullish Reload Ranger Setup
def bullish_setup = trend_direction == -1 and                    # Bearish higher timeframe trend
                   location_confirmed and                        # In Fibonacci retracement zone
                   structure_confirmed_bull and                  # W pattern in price
                   momentum_confirmed_bull;                      # At least 2 momentum confirmations

# Bearish Reload Ranger Setup
def bearish_setup = trend_direction == 1 and                     # Bullish higher timeframe trend
                   location_confirmed and                        # In Fibonacci retracement zone
                   structure_confirmed_bear and                  # M or H&S pattern in price
                   momentum_confirmed_bear;                      # At least 2 momentum confirmations

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PROFIT TARGET AND STOP LOSS CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate 50% retracement target
def latest_high = Highest(high, 50);
def latest_low = Lowest(low, 50);

def profit_target_bull = latest_low + ((latest_high - latest_low) * 0.5);
def profit_target_bear = latest_high - ((latest_high - latest_low) * 0.5);

# Calculate stop loss
def atr_value = Average(TrueRange(high, close, low), 14);
def stop_loss_bull = Lowest(low, 20) - (atr_value * 0.5);
def stop_loss_bear = Highest(high, 20) + (atr_value * 0.5);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# VISUAL ELEMENTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Plot Fibonacci levels
plot fib_61_8_line = if show_fib_levels then fib_61_8 else Double.NaN;
plot fib_78_6_line = if show_fib_levels then fib_78_6 else Double.NaN;
plot fib_sweet_line = if show_fib_levels then fib_sweet else Double.NaN;

fib_61_8_line.SetDefaultColor(Color.YELLOW);
fib_61_8_line.SetLineWeight(1);
fib_61_8_line.SetStyle(Curve.LONG_DASH);

fib_78_6_line.SetDefaultColor(Color.ORANGE);
fib_78_6_line.SetLineWeight(1);
fib_78_6_line.SetStyle(Curve.LONG_DASH);

fib_sweet_line.SetDefaultColor(Color.BLUE);
fib_sweet_line.SetLineWeight(2);
fib_sweet_line.SetStyle(Curve.FIRM);

# Plot pattern signals
plot w_pattern_signal = if show_pattern_signals and price_w_found then low - (high - low) * 0.05 else Double.NaN;
plot m_pattern_signal = if show_pattern_signals and price_m_found then high + (high - low) * 0.05 else Double.NaN;
plot hs_pattern_signal = if show_pattern_signals and hs_found then high + (high - low) * 0.05 else Double.NaN;

w_pattern_signal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
w_pattern_signal.SetDefaultColor(Color.GREEN);
w_pattern_signal.SetLineWeight(2);

m_pattern_signal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
m_pattern_signal.SetDefaultColor(Color.RED);
m_pattern_signal.SetLineWeight(2);

hs_pattern_signal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
hs_pattern_signal.SetDefaultColor(Color.MAGENTA);
hs_pattern_signal.SetLineWeight(2);

# Plot momentum signals
plot momentum_bull_signal = if show_momentum_signals and momentum_confirmed_bull then low - (high - low) * 0.1 else Double.NaN;
plot momentum_bear_signal = if show_momentum_signals and momentum_confirmed_bear then high + (high - low) * 0.1 else Double.NaN;

momentum_bull_signal.SetPaintingStrategy(PaintingStrategy.DIAMOND);
momentum_bull_signal.SetDefaultColor(Color.CYAN);
momentum_bull_signal.SetLineWeight(3);

momentum_bear_signal.SetPaintingStrategy(PaintingStrategy.DIAMOND);
momentum_bear_signal.SetDefaultColor(Color.PINK);
momentum_bear_signal.SetLineWeight(3);

# Plot complete setup signals
plot bullish_setup_signal = if show_setup_signals and bullish_setup then low - (high - low) * 0.15 else Double.NaN;
plot bearish_setup_signal = if show_setup_signals and bearish_setup then high + (high - low) * 0.15 else Double.NaN;

bullish_setup_signal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
bullish_setup_signal.SetDefaultColor(Color.LIME);
bullish_setup_signal.SetLineWeight(4);

bearish_setup_signal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
bearish_setup_signal.SetDefaultColor(Color.RED);
bearish_setup_signal.SetLineWeight(4);

# Plot profit targets and stops
plot bull_target_line = if bullish_setup then profit_target_bull else Double.NaN;
plot bear_target_line = if bearish_setup then profit_target_bear else Double.NaN;
plot bull_stop_line = if bullish_setup then stop_loss_bull else Double.NaN;
plot bear_stop_line = if bearish_setup then stop_loss_bear else Double.NaN;

bull_target_line.SetDefaultColor(Color.GREEN);
bull_target_line.SetLineWeight(2);
bull_target_line.SetStyle(Curve.POINTS);

bear_target_line.SetDefaultColor(Color.RED);
bear_target_line.SetLineWeight(2);
bear_target_line.SetStyle(Curve.POINTS);

bull_stop_line.SetDefaultColor(Color.RED);
bull_stop_line.SetLineWeight(2);
bull_stop_line.SetStyle(Curve.POINTS);

bear_stop_line.SetDefaultColor(Color.RED);
bear_stop_line.SetLineWeight(2);
bear_stop_line.SetStyle(Curve.POINTS);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Setup alerts
Alert(bullish_setup, "Bullish Reload Ranger Setup", Alert.BAR, Sound.Chimes);
Alert(bearish_setup, "Bearish Reload Ranger Setup", Alert.BAR, Sound.Chimes);

# Component alerts
Alert(location_confirmed, "Location Confirmed - In Fibonacci Zone", Alert.BAR, Sound.Ding);
Alert(structure_confirmed_bull, "Bullish Structure - W Pattern", Alert.BAR, Sound.Ding);
Alert(structure_confirmed_bear, "Bearish Structure - M/H&S Pattern", Alert.BAR, Sound.Ding);
Alert(momentum_confirmed_bull, "Bullish Momentum Confluence", Alert.BAR, Sound.Bell);
Alert(momentum_confirmed_bear, "Bearish Momentum Confluence", Alert.BAR, Sound.Bell);

# Pattern alerts
Alert(price_w_found, "W Pattern Detected", Alert.BAR, Sound.Ring);
Alert(price_m_found, "M Pattern Detected", Alert.BAR, Sound.Ring);
Alert(hs_found, "Head and Shoulders Pattern Detected", Alert.BAR, Sound.Ring);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND STATUS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Current trend status
def trend_text = if trend_direction == 1 then "BULLISH" else if trend_direction == -1 then "BEARISH" else "SIDEWAYS";
AddLabel(yes, "HTF Trend: " + trend_text, if trend_direction == 1 then Color.GREEN else if trend_direction == -1 then Color.RED else Color.GRAY);

# Location status
AddLabel(location_confirmed, "LOCATION CONFIRMED", Color.YELLOW);

# Structure status
AddLabel(structure_confirmed_bull, "BULL STRUCTURE", Color.GREEN);
AddLabel(structure_confirmed_bear, "BEAR STRUCTURE", Color.RED);

# Momentum status
AddLabel(momentum_confirmed_bull, "BULL MOMENTUM (" + momentum_count_bull + "/4)", Color.CYAN);
AddLabel(momentum_confirmed_bear, "BEAR MOMENTUM (" + momentum_count_bear + "/4)", Color.PINK);

# Complete setup status
AddLabel(bullish_setup, "BULLISH RELOAD RANGER SETUP", Color.LIME);
AddLabel(bearish_setup, "BEARISH RELOAD RANGER SETUP", Color.RED);

# Risk levels
AddLabel(bullish_setup, "Bull Risk: " + current_risk_bull + "%", Color.WHITE);
AddLabel(bearish_setup, "Bear Risk: " + current_risk_bear + "%", Color.WHITE);

# Current price vs levels
AddLabel(yes, "Price: " + close, Color.WHITE);
AddLabel(show_fib_levels, "Sweet Spot: " + Round(fib_sweet, 2), Color.BLUE);

# Fibonacci zone status
def in_fib_zone = location_confirmed;
AddLabel(in_fib_zone, "IN FIBONACCI ZONE", Color.ORANGE);

# Pattern detection status
AddLabel(price_w_found, "W PATTERN", Color.GREEN);
AddLabel(price_m_found, "M PATTERN", Color.RED);
AddLabel(hs_found, "H&S PATTERN", Color.MAGENTA);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Scan for complete setups
def scan_bullish_setup = bullish_setup;
def scan_bearish_setup = bearish_setup;

# Scan for individual components
def scan_location_confirmed = location_confirmed;
def scan_bull_structure = structure_confirmed_bull;
def scan_bear_structure = structure_confirmed_bear;
def scan_bull_momentum = momentum_confirmed_bull;
def scan_bear_momentum = momentum_confirmed_bear;

# Scan for patterns
def scan_w_pattern = price_w_found;
def scan_m_pattern = price_m_found;
def scan_hs_pattern = hs_found;

# Scan for Fibonacci zone
def scan_in_fib_zone = location_confirmed;
def scan_below_sweet_spot = below_sweet_spot;

# Export scan conditions for ThinkOrSwim scanner
# Use these variables in custom scan conditions
# Example: scan_bullish_setup for finding bullish Reload Ranger setups