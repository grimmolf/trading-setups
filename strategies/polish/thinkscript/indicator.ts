# Polish Setup - ThinkScript Indicator
# This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
# © trading-setups

# ═══════════════════════════════════════════════════════════════════════════════════════════
# INPUT PARAMETERS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Smoothed Moving Average Settings
input smma_fast_period = 21;
input smma_medium_period = 50;
input smma_slow_period = 200;

# Pattern Recognition Settings
input pattern_lookback = 7;
input pattern_similarity = 2.0;
input require_volume_confirmation = yes;

# RSI Settings
input rsi_period = 14;
input rsi_midline = 50;

# Extension Levels
input extension_primary = 4.669;
input extension_secondary = 2.618;

# Trading Session
input session_start_hour = 8;
input session_start_minute = 30;
input session_end_hour = 12;
input session_end_minute = 0;

# Visual Settings
input show_ma_stack = yes;
input show_patterns = yes;
input show_signals = yes;
input show_targets = yes;
input show_session = yes;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SMOOTHED MOVING AVERAGE CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Smoothed Moving Average (SMMA) calculation
script SMMA {
    input price = close;
    input length = 14;
    
    def sma_init = Average(price, length);
    def smma;
    smma = if IsNaN(smma[1]) then sma_init else (smma[1] * (length - 1) + price) / length;
    
    plot result = smma;
}

# Calculate smoothed moving averages
def smma_fast = SMMA(close, smma_fast_period);
def smma_medium = SMMA(close, smma_medium_period);
def smma_slow = SMMA(close, smma_slow_period);

# Moving average stack conditions
def bullish_stack = smma_fast > smma_medium and smma_medium > smma_slow;
def bearish_stack = smma_fast < smma_medium and smma_medium < smma_slow;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# TRADING SESSION DETECTION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Convert session times to seconds
def session_start_seconds = session_start_hour * 3600 + session_start_minute * 60;
def session_end_seconds = session_end_hour * 3600 + session_end_minute * 60;

# Get current time in seconds
def current_seconds = SecondsFromTime(0);

# Check if within trading session
def in_session = current_seconds >= session_start_seconds and current_seconds <= session_end_seconds;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PATTERN DETECTION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# W Pattern Detection (Simplified for ThinkScript)
script DetectWPattern {
    input src = close;
    input lookback = 7;
    input similarity = 2.0;
    
    def low1 = Lowest(src, lookback);
    def low2 = Lowest(src, lookback / 2);
    def high_between = Highest(src, lookback);
    
    # Check similarity between lows
    def similarity_check = AbsValue(low1 - low2) / low1 * 100 <= similarity;
    
    # Check if middle is higher than lows
    def middle_higher = high_between > Max(low1, low2);
    
    # Check for breakout
    def breakout = src > high_between;
    
    plot pattern = similarity_check and middle_higher and breakout;
}

# M Pattern Detection (Simplified for ThinkScript)
script DetectMPattern {
    input src = close;
    input lookback = 7;
    input similarity = 2.0;
    
    def high1 = Highest(src, lookback);
    def high2 = Highest(src, lookback / 2);
    def low_between = Lowest(src, lookback);
    
    # Check similarity between highs
    def similarity_check = AbsValue(high1 - high2) / high1 * 100 <= similarity;
    
    # Check if middle is lower than highs
    def middle_lower = low_between < Min(high1, high2);
    
    # Check for breakdown
    def breakdown = src < low_between;
    
    plot pattern = similarity_check and middle_lower and breakdown;
}

# ═══════════════════════════════════════════════════════════════════════════════════════════
# MOMENTUM ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# RSI calculation
def rsi_value = RSI(close, rsi_period);

# Momentum conditions
def bullish_momentum = rsi_value >= rsi_midline;
def bearish_momentum = rsi_value <= rsi_midline;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STRUCTURE ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Pattern detection
def w_pattern_detected = DetectWPattern(close, pattern_lookback, pattern_similarity);
def m_pattern_detected = DetectMPattern(close, pattern_lookback, pattern_similarity);

# Volume confirmation
def avg_volume = Average(volume, 20);
def volume_confirmed = if require_volume_confirmation then volume > avg_volume else yes;

# Apply volume confirmation to patterns
def w_pattern_confirmed = w_pattern_detected and volume_confirmed;
def m_pattern_confirmed = m_pattern_detected and volume_confirmed;

# Pullback conditions
def bullish_pullback = close > smma_slow and (low <= smma_medium or low[1] <= smma_medium[1]);
def bearish_pullback = close < smma_slow and (high >= smma_medium or high[1] >= smma_medium[1]);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ENTRY SIGNAL GENERATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Bullish Polish Setup
def bullish_setup = in_session and bullish_stack and (w_pattern_confirmed or bullish_momentum) and bullish_pullback;

# Bearish Polish Setup
def bearish_setup = in_session and bearish_stack and (m_pattern_confirmed or bearish_momentum) and bearish_pullback;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PROFIT TARGET CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate ATR for targets
def atr_value = Average(TrueRange(high, close, low), 14);

# Calculate extension targets (simplified)
def pattern_height = if bullish_setup then atr_value * 2 else if bearish_setup then atr_value * 2 else 0;

def bull_secondary_target = if bullish_setup then close + (pattern_height * extension_secondary) else Double.NaN;
def bull_primary_target = if bullish_setup then close + (pattern_height * extension_primary) else Double.NaN;

def bear_secondary_target = if bearish_setup then close - (pattern_height * extension_secondary) else Double.NaN;
def bear_primary_target = if bearish_setup then close - (pattern_height * extension_primary) else Double.NaN;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STOP LOSS CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate stop losses
def bull_stop_loss = if bullish_setup then Lowest(low, 3) - (atr_value * 0.5) else Double.NaN;
def bear_stop_loss = if bearish_setup then Highest(high, 3) + (atr_value * 0.5) else Double.NaN;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# VISUAL ELEMENTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Plot smoothed moving averages
plot fast_ma = if show_ma_stack then smma_fast else Double.NaN;
plot medium_ma = if show_ma_stack then smma_medium else Double.NaN;
plot slow_ma = if show_ma_stack then smma_slow else Double.NaN;

fast_ma.SetDefaultColor(Color.GREEN);
fast_ma.SetLineWeight(2);
medium_ma.SetDefaultColor(Color.YELLOW);
medium_ma.SetLineWeight(2);
slow_ma.SetDefaultColor(Color.RED);
slow_ma.SetLineWeight(2);

# Moving average stack background
DefineGlobalColor("BullStack", Color.GREEN);
DefineGlobalColor("BearStack", Color.RED);

AddCloud(if show_ma_stack and bullish_stack then smma_fast else Double.NaN, 
         if show_ma_stack and bullish_stack then smma_slow else Double.NaN, 
         GlobalColor("BullStack"), Color.CURRENT, yes);

AddCloud(if show_ma_stack and bearish_stack then smma_fast else Double.NaN, 
         if show_ma_stack and bearish_stack then smma_slow else Double.NaN, 
         GlobalColor("BearStack"), Color.CURRENT, yes);

# Trading session background
AddCloud(if show_session and in_session then high else Double.NaN, 
         if show_session and in_session then low else Double.NaN, 
         Color.BLUE, Color.CURRENT, yes);

# Pattern signals
plot w_signal = if show_patterns and w_pattern_confirmed then low - (high - low) * 0.05 else Double.NaN;
plot m_signal = if show_patterns and m_pattern_confirmed then high + (high - low) * 0.05 else Double.NaN;

w_signal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
w_signal.SetDefaultColor(Color.GREEN);
w_signal.SetLineWeight(3);

m_signal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
m_signal.SetDefaultColor(Color.RED);
m_signal.SetLineWeight(3);

# Entry signals
plot bull_entry = if show_signals and bullish_setup then low - (high - low) * 0.1 else Double.NaN;
plot bear_entry = if show_signals and bearish_setup then high + (high - low) * 0.1 else Double.NaN;

bull_entry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
bull_entry.SetDefaultColor(Color.LIME);
bull_entry.SetLineWeight(4);

bear_entry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
bear_entry.SetDefaultColor(Color.RED);
bear_entry.SetLineWeight(4);

# Extension targets
plot bull_target_1 = if show_targets then bull_secondary_target else Double.NaN;
plot bull_target_2 = if show_targets then bull_primary_target else Double.NaN;
plot bear_target_1 = if show_targets then bear_secondary_target else Double.NaN;
plot bear_target_2 = if show_targets then bear_primary_target else Double.NaN;

bull_target_1.SetDefaultColor(Color.LIME);
bull_target_1.SetLineWeight(1);
bull_target_1.SetStyle(Curve.POINTS);

bull_target_2.SetDefaultColor(Color.GREEN);
bull_target_2.SetLineWeight(2);
bull_target_2.SetStyle(Curve.POINTS);

bear_target_1.SetDefaultColor(Color.ORANGE);
bear_target_1.SetLineWeight(1);
bear_target_1.SetStyle(Curve.POINTS);

bear_target_2.SetDefaultColor(Color.RED);
bear_target_2.SetLineWeight(2);
bear_target_2.SetStyle(Curve.POINTS);

# Stop loss levels
plot bull_stop = if show_targets then bull_stop_loss else Double.NaN;
plot bear_stop = if show_targets then bear_stop_loss else Double.NaN;

bull_stop.SetDefaultColor(Color.RED);
bull_stop.SetLineWeight(1);
bull_stop.SetStyle(Curve.LONG_DASH);

bear_stop.SetDefaultColor(Color.RED);
bear_stop.SetLineWeight(1);
bear_stop.SetStyle(Curve.LONG_DASH);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Setup alerts
Alert(bullish_setup, "Bullish Polish Setup", Alert.BAR, Sound.Chimes);
Alert(bearish_setup, "Bearish Polish Setup", Alert.BAR, Sound.Chimes);

# Component alerts
Alert(w_pattern_confirmed, "W Pattern Confirmed", Alert.BAR, Sound.Bell);
Alert(m_pattern_confirmed, "M Pattern Confirmed", Alert.BAR, Sound.Bell);
Alert(bullish_stack, "Bullish MA Stack", Alert.BAR, Sound.Ding);
Alert(bearish_stack, "Bearish MA Stack", Alert.BAR, Sound.Ding);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND STATUS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Current stack status
def stack_text = if bullish_stack then "BULL STACK" else if bearish_stack then "BEAR STACK" else "NEUTRAL";
def stack_color = if bullish_stack then Color.GREEN else if bearish_stack then Color.RED else Color.GRAY;

# Session status
def session_text = if in_session then "IN SESSION" else "OUT OF SESSION";
def session_color = if in_session then Color.YELLOW else Color.GRAY;

# RSI status
def rsi_text = "RSI: " + Round(rsi_value, 1);
def rsi_color = if bullish_momentum then Color.GREEN else if bearish_momentum then Color.RED else Color.GRAY;

# Add labels
AddLabel(yes, stack_text, stack_color);
AddLabel(yes, session_text, session_color);
AddLabel(yes, rsi_text, rsi_color);

# Pattern status
AddLabel(w_pattern_confirmed, "W PATTERN", Color.GREEN);
AddLabel(m_pattern_confirmed, "M PATTERN", Color.RED);

# Setup status
AddLabel(bullish_setup, "BULLISH POLISH SETUP", Color.LIME);
AddLabel(bearish_setup, "BEARISH POLISH SETUP", Color.RED);

# Target levels
AddLabel(bullish_setup, "Bull Target 1: " + Round(bull_secondary_target, 2), Color.LIME);
AddLabel(bullish_setup, "Bull Target 2: " + Round(bull_primary_target, 2), Color.GREEN);
AddLabel(bearish_setup, "Bear Target 1: " + Round(bear_secondary_target, 2), Color.ORANGE);
AddLabel(bearish_setup, "Bear Target 2: " + Round(bear_primary_target, 2), Color.RED);

# Stop loss levels
AddLabel(bullish_setup, "Bull Stop: " + Round(bull_stop_loss, 2), Color.RED);
AddLabel(bearish_setup, "Bear Stop: " + Round(bear_stop_loss, 2), Color.RED);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Scan for complete setups
def scan_bullish_setup = bullish_setup;
def scan_bearish_setup = bearish_setup;

# Scan for individual components
def scan_bullish_stack = bullish_stack;
def scan_bearish_stack = bearish_stack;
def scan_in_session = in_session;
def scan_w_pattern = w_pattern_confirmed;
def scan_m_pattern = m_pattern_confirmed;
def scan_bullish_momentum = bullish_momentum;
def scan_bearish_momentum = bearish_momentum;

# Export scan conditions for ThinkOrSwim scanner
# Example usage: scan_bullish_setup for finding bullish Polish setups
# Example usage: scan_w_pattern for finding W patterns
# Example usage: scan_bullish_stack for finding bullish moving average stacks