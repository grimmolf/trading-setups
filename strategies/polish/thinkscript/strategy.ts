# Polish Setup - ThinkScript Strategy
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

# Risk Management
input base_risk_percent = 2.0;
input max_risk_percent = 5.0;
input enable_stop_management = yes;
input stop_trail_percent = 66.0;

# Strategy Controls
input allow_long = yes;
input allow_short = yes;
input close_at_session_end = yes;

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

# Session ending detection (30 minutes before close)
def session_ending = current_seconds >= (session_end_seconds - 1800);

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
def bullish_setup = in_session and bullish_stack and (w_pattern_confirmed or bullish_momentum) and bullish_pullback and allow_long and GetQuantity() == 0;

# Bearish Polish Setup
def bearish_setup = in_session and bearish_stack and (m_pattern_confirmed or bearish_momentum) and bearish_pullback and allow_short and GetQuantity() == 0;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PROFIT TARGET AND STOP LOSS CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate ATR for targets and stops
def atr_value = Average(TrueRange(high, close, low), 14);

# Calculate extension targets
def pattern_height = atr_value * 2;  # Simplified height calculation

def bull_secondary_target = close + (pattern_height * extension_secondary);
def bull_primary_target = close + (pattern_height * extension_primary);

def bear_secondary_target = close - (pattern_height * extension_secondary);
def bear_primary_target = close - (pattern_height * extension_primary);

# Calculate stop losses
def bull_stop_loss = Lowest(low, 3) - (atr_value * 0.5);
def bear_stop_loss = Highest(high, 3) + (atr_value * 0.5);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# RISK MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate risk percentage
def current_risk_percent = if (w_pattern_confirmed or m_pattern_confirmed) then base_risk_percent else Min(base_risk_percent + 1.0, max_risk_percent);

# Position sizing
def account_value = GetNetLiq();
def risk_amount_bull = account_value * (current_risk_percent / 100);
def risk_amount_bear = account_value * (current_risk_percent / 100);

def stop_distance_bull = AbsValue(close - bull_stop_loss);
def stop_distance_bear = AbsValue(close - bear_stop_loss);

def position_size_bull = if stop_distance_bull > 0 then Round(risk_amount_bull / stop_distance_bull, 0) else 0;
def position_size_bear = if stop_distance_bear > 0 then Round(risk_amount_bear / stop_distance_bear, 0) else 0;

# Maximum position size limit (10% of account)
def max_position_size = account_value * 0.1;
def final_position_size_bull = Min(position_size_bull, max_position_size);
def final_position_size_bear = Min(position_size_bear, max_position_size);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STRATEGY EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long entry
AddOrder(OrderType.BUY_TO_OPEN, bullish_setup, open[-1], final_position_size_bull, Color.GREEN, Color.GREEN, "Polish Long Entry");

# Short entry
AddOrder(OrderType.SELL_TO_OPEN, bearish_setup, open[-1], final_position_size_bear, Color.RED, Color.RED, "Polish Short Entry");

# ═══════════════════════════════════════════════════════════════════════════════════════════
# POSITION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate progress toward targets
def progress_bull = if GetQuantity() > 0 then (close - bull_stop_loss) / (bull_primary_target - bull_stop_loss) else 0;
def progress_bear = if GetQuantity() < 0 then (bear_stop_loss - close) / (bear_stop_loss - bear_primary_target) else 0;

# Progressive stop management
def move_stop_bull = enable_stop_management and GetQuantity() > 0 and progress_bull >= (stop_trail_percent / 100);
def move_stop_bear = enable_stop_management and GetQuantity() < 0 and progress_bear >= (stop_trail_percent / 100);

# Updated stop levels
def updated_stop_bull = if move_stop_bull then bull_secondary_target else bull_stop_loss;
def updated_stop_bear = if move_stop_bear then bear_secondary_target else bear_stop_loss;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# EXIT CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long exits
def long_stop_hit = GetQuantity() > 0 and low <= updated_stop_bull;
def long_target_hit = GetQuantity() > 0 and high >= bull_primary_target;

# Short exits
def short_stop_hit = GetQuantity() < 0 and high >= updated_stop_bear;
def short_target_hit = GetQuantity() < 0 and low <= bear_primary_target;

# Session end exits
def session_end_exit = close_at_session_end and session_ending and GetQuantity() != 0;

# Trade invalidation (stack breakdown)
def long_invalidated = GetQuantity() > 0 and not bullish_stack;
def short_invalidated = GetQuantity() < 0 and not bearish_stack;

# Exit orders
AddOrder(OrderType.SELL_TO_CLOSE, long_stop_hit, open[-1], GetQuantity(), Color.RED, Color.RED, "Long Stop");
AddOrder(OrderType.SELL_TO_CLOSE, long_target_hit, open[-1], GetQuantity(), Color.GREEN, Color.GREEN, "Long Target");
AddOrder(OrderType.SELL_TO_CLOSE, session_end_exit and GetQuantity() > 0, open[-1], GetQuantity(), Color.ORANGE, Color.ORANGE, "Long Session End");
AddOrder(OrderType.SELL_TO_CLOSE, long_invalidated, open[-1], GetQuantity(), Color.GRAY, Color.GRAY, "Long Invalid");

AddOrder(OrderType.BUY_TO_CLOSE, short_stop_hit, open[-1], AbsValue(GetQuantity()), Color.RED, Color.RED, "Short Stop");
AddOrder(OrderType.BUY_TO_CLOSE, short_target_hit, open[-1], AbsValue(GetQuantity()), Color.GREEN, Color.GREEN, "Short Target");
AddOrder(OrderType.BUY_TO_CLOSE, session_end_exit and GetQuantity() < 0, open[-1], AbsValue(GetQuantity()), Color.ORANGE, Color.ORANGE, "Short Session End");
AddOrder(OrderType.BUY_TO_CLOSE, short_invalidated, open[-1], AbsValue(GetQuantity()), Color.GRAY, Color.GRAY, "Short Invalid");

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

# Active position targets and stops
plot active_bull_target_1 = if show_targets and GetQuantity() > 0 then bull_secondary_target else Double.NaN;
plot active_bull_target_2 = if show_targets and GetQuantity() > 0 then bull_primary_target else Double.NaN;
plot active_bear_target_1 = if show_targets and GetQuantity() < 0 then bear_secondary_target else Double.NaN;
plot active_bear_target_2 = if show_targets and GetQuantity() < 0 then bear_primary_target else Double.NaN;

active_bull_target_1.SetDefaultColor(Color.LIME);
active_bull_target_1.SetLineWeight(1);
active_bull_target_1.SetStyle(Curve.POINTS);

active_bull_target_2.SetDefaultColor(Color.GREEN);
active_bull_target_2.SetLineWeight(2);
active_bull_target_2.SetStyle(Curve.POINTS);

active_bear_target_1.SetDefaultColor(Color.ORANGE);
active_bear_target_1.SetLineWeight(1);
active_bear_target_1.SetStyle(Curve.POINTS);

active_bear_target_2.SetDefaultColor(Color.RED);
active_bear_target_2.SetLineWeight(2);
active_bear_target_2.SetStyle(Curve.POINTS);

# Active position stop losses
plot active_bull_stop = if show_targets and GetQuantity() > 0 then updated_stop_bull else Double.NaN;
plot active_bear_stop = if show_targets and GetQuantity() < 0 then updated_stop_bear else Double.NaN;

active_bull_stop.SetDefaultColor(Color.RED);
active_bull_stop.SetLineWeight(2);
active_bull_stop.SetStyle(Curve.LONG_DASH);

active_bear_stop.SetDefaultColor(Color.RED);
active_bear_stop.SetLineWeight(2);
active_bear_stop.SetStyle(Curve.LONG_DASH);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Entry alerts
Alert(bullish_setup, "Polish Long Entry", Alert.BAR, Sound.Chimes);
Alert(bearish_setup, "Polish Short Entry", Alert.BAR, Sound.Chimes);

# Exit alerts
Alert(long_stop_hit, "Long Stop Hit", Alert.BAR, Sound.Ring);
Alert(long_target_hit, "Long Target Hit", Alert.BAR, Sound.Bell);
Alert(short_stop_hit, "Short Stop Hit", Alert.BAR, Sound.Ring);
Alert(short_target_hit, "Short Target Hit", Alert.BAR, Sound.Bell);

# Management alerts
Alert(move_stop_bull, "Long Stop Moved", Alert.BAR, Sound.Ding);
Alert(move_stop_bear, "Short Stop Moved", Alert.BAR, Sound.Ding);
Alert(session_end_exit, "Session End Exit", Alert.BAR, Sound.Ding);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND STATUS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Current position status
def current_position = if GetQuantity() > 0 then "LONG" else if GetQuantity() < 0 then "SHORT" else "FLAT";
def position_color = if GetQuantity() > 0 then Color.GREEN else if GetQuantity() < 0 then Color.RED else Color.GRAY;

# Stack status
def stack_status = if bullish_stack then "BULL STACK" else if bearish_stack then "BEAR STACK" else "NEUTRAL";
def stack_color = if bullish_stack then Color.GREEN else if bearish_stack then Color.RED else Color.GRAY;

# Session status
def session_status = if in_session then "IN SESSION" else "OUT OF SESSION";
def session_color = if in_session then Color.YELLOW else Color.GRAY;

# Progress status
def current_progress = if GetQuantity() > 0 then progress_bull else if GetQuantity() < 0 then progress_bear else 0;
def progress_text = "Progress: " + Round(current_progress * 100, 0) + "%";

# Add labels
AddLabel(yes, "Position: " + current_position, position_color);
AddLabel(yes, stack_status, stack_color);
AddLabel(yes, session_status, session_color);
AddLabel(yes, "RSI: " + Round(rsi_value, 1), if bullish_momentum then Color.GREEN else if bearish_momentum then Color.RED else Color.GRAY);

# Pattern status
AddLabel(w_pattern_confirmed, "W PATTERN", Color.GREEN);
AddLabel(m_pattern_confirmed, "M PATTERN", Color.RED);

# Setup status
AddLabel(bullish_setup, "BULLISH POLISH SETUP", Color.LIME);
AddLabel(bearish_setup, "BEARISH POLISH SETUP", Color.RED);

# Position details
AddLabel(GetQuantity() > 0, "Long Risk: " + Round(current_risk_percent, 1) + "%", Color.WHITE);
AddLabel(GetQuantity() < 0, "Short Risk: " + Round(current_risk_percent, 1) + "%", Color.WHITE);
AddLabel(GetQuantity() != 0, progress_text, Color.PURPLE);

# Performance metrics
def total_pnl = GetTotalTradingPnL();
def total_trades = GetTotalTrades();
def win_rate = if total_trades > 0 then Round((GetWinningTrades() / total_trades) * 100, 1) else 0;

AddLabel(yes, "P&L: $" + Round(total_pnl, 2), if total_pnl > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Trades: " + total_trades, Color.WHITE);
AddLabel(yes, "Win Rate: " + win_rate + "%", Color.WHITE);

# Current levels for active positions
AddLabel(GetQuantity() > 0, "Stop: " + Round(updated_stop_bull, 2), Color.RED);
AddLabel(GetQuantity() > 0, "Target 1: " + Round(bull_secondary_target, 2), Color.LIME);
AddLabel(GetQuantity() > 0, "Target 2: " + Round(bull_primary_target, 2), Color.GREEN);

AddLabel(GetQuantity() < 0, "Stop: " + Round(updated_stop_bear, 2), Color.RED);
AddLabel(GetQuantity() < 0, "Target 1: " + Round(bear_secondary_target, 2), Color.ORANGE);
AddLabel(GetQuantity() < 0, "Target 2: " + Round(bear_primary_target, 2), Color.RED);

# Stop management status
AddLabel(enable_stop_management and GetQuantity() > 0 and move_stop_bull, "STOP MOVED", Color.ORANGE);
AddLabel(enable_stop_management and GetQuantity() < 0 and move_stop_bear, "STOP MOVED", Color.ORANGE);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Scan for complete setups
def scan_bullish_setup = bullish_setup;
def scan_bearish_setup = bearish_setup;

# Scan for position management
def scan_active_long = GetQuantity() > 0;
def scan_active_short = GetQuantity() < 0;
def scan_stop_move_bull = move_stop_bull;
def scan_stop_move_bear = move_stop_bear;

# Scan for components
def scan_bullish_stack = bullish_stack;
def scan_bearish_stack = bearish_stack;
def scan_in_session = in_session;
def scan_w_pattern = w_pattern_confirmed;
def scan_m_pattern = m_pattern_confirmed;

# Export scan conditions for ThinkOrSwim scanner
# Use these variables in custom scan conditions
# Example: scan_bullish_setup for finding bullish Polish setups
# Example: scan_active_long for finding active long positions