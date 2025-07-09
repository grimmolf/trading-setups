# Silver Setup - ThinkScript Indicator
# This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
# © trading-setups

# ═══════════════════════════════════════════════════════════════════════════════════════════
# INPUT PARAMETERS
# ═══════════════════════════════════════════════════════════════════════════════════════════

input time_session_1_start = 0700;
input time_session_1_end = 0900;
input time_session_2_start = 1000;
input time_session_2_end = 1200;
input time_session_3_start = 1400;
input time_session_3_end = 1600;
input enable_session_3 = no;

input risk_multiplier = 4.6;
input stop_offset = 3;

input show_paint_levels = yes;
input show_stop_target = yes;
input show_entry_signals = yes;
input show_paint_bars = yes;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# TIME SESSION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Convert time to minutes for easier comparison
def current_time = SecondsFromTime(0) / 60;
def session_1_start_min = time_session_1_start / 100 * 60 + time_session_1_start % 100;
def session_1_end_min = time_session_1_end / 100 * 60 + time_session_1_end % 100;
def session_2_start_min = time_session_2_start / 100 * 60 + time_session_2_start % 100;
def session_2_end_min = time_session_2_end / 100 * 60 + time_session_2_end % 100;
def session_3_start_min = time_session_3_start / 100 * 60 + time_session_3_start % 100;
def session_3_end_min = time_session_3_end / 100 * 60 + time_session_3_end % 100;

# Check if current time is within trading sessions
def in_session_1 = current_time >= session_1_start_min and current_time <= session_1_end_min;
def in_session_2 = current_time >= session_2_start_min and current_time <= session_2_end_min;
def in_session_3 = enable_session_3 and current_time >= session_3_start_min and current_time <= session_3_end_min;

# Combined time window filter (exclude weekends)
def in_time_window = (in_session_1 or in_session_2 or in_session_3) and GetDayOfWeek(GetYYYYMMDD()) < 6;

# Daily close time (1 PM PT = 1300 hours)
def daily_close_time = 1300;
def daily_close_min = daily_close_time / 100 * 60 + daily_close_time % 100;
def should_close = current_time >= daily_close_min and current_time <= daily_close_min + 1 and GetDayOfWeek(GetYYYYMMDD()) < 6;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# PAINT BAR DETECTION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Paint bar conditions
def bull_paint_condition = low > high[2];
def bear_paint_condition = high < low[2];

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STATE MANAGEMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Bull paint state variables
def bull_paint_high = if bull_paint_condition and !bull_paint_active[1] then high else bull_paint_high[1];
def bull_paint_low = if bull_paint_condition and !bull_paint_active[1] then low else bull_paint_low[1];
def bull_stop_level = if bull_paint_condition and !bull_paint_active[1] then low[stop_offset] else bull_stop_level[1];
def bull_target_level = if bull_paint_condition and !bull_paint_active[1] then bull_paint_low + (bull_paint_low - bull_stop_level) * risk_multiplier else bull_target_level[1];

# Bear paint state variables  
def bear_paint_high = if bear_paint_condition and !bear_paint_active[1] then high else bear_paint_high[1];
def bear_paint_low = if bear_paint_condition and !bear_paint_active[1] then low else bear_paint_low[1];
def bear_stop_level = if bear_paint_condition and !bear_paint_active[1] then high[stop_offset] else bear_stop_level[1];
def bear_target_level = if bear_paint_condition and !bear_paint_active[1] then bear_paint_high - (bear_stop_level - bear_paint_high) * risk_multiplier else bear_target_level[1];

# Paint active status
def bull_paint_active = if bull_paint_condition and !bull_paint_active[1] then yes 
                       else if bull_paint_active[1] and (high > bull_paint_high * 1.1 or low < bull_stop_level) then no
                       else if bull_paint_active[1] and bear_paint_condition then no
                       else bull_paint_active[1];

def bear_paint_active = if bear_paint_condition and !bear_paint_active[1] then yes
                       else if bear_paint_active[1] and (low < bear_paint_low * 0.9 or high > bear_stop_level) then no
                       else if bear_paint_active[1] and bull_paint_condition then no
                       else bear_paint_active[1];

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ENTRY CONDITIONS (3 REASONS: LOCATION, MOMENTUM, STRUCTURE)
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long entry conditions
def long_location = in_time_window;  # Reason 1: Location (time window)
def long_momentum = bull_paint_active;  # Reason 2: Momentum (paint bar directional bias)
def long_structure = close > bull_paint_low and close < bull_paint_high and low <= bull_paint_low;  # Reason 3: Structure (price re-entry)

def long_entry_condition = long_location and long_momentum and long_structure;

# Short entry conditions
def short_location = in_time_window;  # Reason 1: Location (time window)
def short_momentum = bear_paint_active;  # Reason 2: Momentum (paint bar directional bias)
def short_structure = close < bear_paint_high and close > bear_paint_low and high >= bear_paint_high;  # Reason 3: Structure (price re-entry)

def short_entry_condition = short_location and short_momentum and short_structure;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# VISUAL ELEMENTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Paint bar coloring
AssignPriceColor(if show_paint_bars and bull_paint_condition then Color.GREEN 
                else if show_paint_bars and bear_paint_condition then Color.RED 
                else Color.CURRENT);

# Paint bar levels
plot bull_paint_high_line = if show_paint_levels and bull_paint_active then bull_paint_high else Double.NaN;
plot bull_paint_low_line = if show_paint_levels and bull_paint_active then bull_paint_low else Double.NaN;
plot bear_paint_high_line = if show_paint_levels and bear_paint_active then bear_paint_high else Double.NaN;
plot bear_paint_low_line = if show_paint_levels and bear_paint_active then bear_paint_low else Double.NaN;

bull_paint_high_line.SetDefaultColor(Color.GREEN);
bull_paint_high_line.SetLineWeight(2);
bull_paint_high_line.SetStyle(Curve.MEDIUM_DASH);

bull_paint_low_line.SetDefaultColor(Color.GREEN);
bull_paint_low_line.SetLineWeight(2);
bull_paint_low_line.SetStyle(Curve.MEDIUM_DASH);

bear_paint_high_line.SetDefaultColor(Color.RED);
bear_paint_high_line.SetLineWeight(2);
bear_paint_high_line.SetStyle(Curve.MEDIUM_DASH);

bear_paint_low_line.SetDefaultColor(Color.RED);
bear_paint_low_line.SetLineWeight(2);
bear_paint_low_line.SetStyle(Curve.MEDIUM_DASH);

# Stop and target levels
plot bull_stop_line = if show_stop_target and bull_paint_active then bull_stop_level else Double.NaN;
plot bull_target_line = if show_stop_target and bull_paint_active then bull_target_level else Double.NaN;
plot bear_stop_line = if show_stop_target and bear_paint_active then bear_stop_level else Double.NaN;
plot bear_target_line = if show_stop_target and bear_paint_active then bear_target_level else Double.NaN;

bull_stop_line.SetDefaultColor(Color.RED);
bull_stop_line.SetLineWeight(3);
bull_stop_line.SetStyle(Curve.FIRM);

bull_target_line.SetDefaultColor(Color.BLUE);
bull_target_line.SetLineWeight(3);
bull_target_line.SetStyle(Curve.FIRM);

bear_stop_line.SetDefaultColor(Color.RED);
bear_stop_line.SetLineWeight(3);
bear_stop_line.SetStyle(Curve.FIRM);

bear_target_line.SetDefaultColor(Color.BLUE);
bear_target_line.SetLineWeight(3);
bear_target_line.SetStyle(Curve.FIRM);

# Entry signals
plot long_entry_signal = if show_entry_signals and long_entry_condition then low - (high - low) * 0.1 else Double.NaN;
plot short_entry_signal = if show_entry_signals and short_entry_condition then high + (high - low) * 0.1 else Double.NaN;

long_entry_signal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
long_entry_signal.SetDefaultColor(Color.LIME);
long_entry_signal.SetLineWeight(3);

short_entry_signal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
short_entry_signal.SetDefaultColor(Color.RED);
short_entry_signal.SetLineWeight(3);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ALERTS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Entry alerts
Alert(long_entry_condition, "LONG Entry Signal - Silver Setup", Alert.BAR, Sound.Chimes);
Alert(short_entry_condition, "SHORT Entry Signal - Silver Setup", Alert.BAR, Sound.Chimes);

# Paint bar alerts
Alert(bull_paint_condition, "Bull Paint Bar Detected - Silver Setup", Alert.BAR, Sound.Ding);
Alert(bear_paint_condition, "Bear Paint Bar Detected - Silver Setup", Alert.BAR, Sound.Ding);

# Daily close alert
Alert(should_close, "Daily Close Time - Silver Setup", Alert.BAR, Sound.Bell);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND ANNOTATIONS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Add labels for entry signals
AddLabel(show_entry_signals and long_entry_condition, "LONG ENTRY", Color.LIME);
AddLabel(show_entry_signals and short_entry_condition, "SHORT ENTRY", Color.RED);

# Add labels for paint bar status
AddLabel(bull_paint_active, "BULL PAINT ACTIVE", Color.GREEN);
AddLabel(bear_paint_active, "BEAR PAINT ACTIVE", Color.RED);

# Add label for time window status
AddLabel(in_time_window, "IN TIME WINDOW", Color.YELLOW);

# Add labels for current levels
AddLabel(bull_paint_active, "Bull Stop: " + bull_stop_level, Color.RED);
AddLabel(bull_paint_active, "Bull Target: " + bull_target_level, Color.BLUE);
AddLabel(bear_paint_active, "Bear Stop: " + bear_stop_level, Color.RED);
AddLabel(bear_paint_active, "Bear Target: " + bear_target_level, Color.BLUE);

# Risk/Reward ratio label
def bull_risk_reward = if bull_paint_active then (bull_target_level - bull_paint_low) / (bull_paint_low - bull_stop_level) else 0;
def bear_risk_reward = if bear_paint_active then (bear_paint_high - bear_target_level) / (bear_stop_level - bear_paint_high) else 0;

AddLabel(bull_paint_active, "Bull R:R = 1:" + Round(bull_risk_reward, 1), Color.WHITE);
AddLabel(bear_paint_active, "Bear R:R = 1:" + Round(bear_risk_reward, 1), Color.WHITE);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS (FOR STOCK SCANNER)
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Scan for bull paint bars
def scan_bull_paint = bull_paint_condition;

# Scan for bear paint bars  
def scan_bear_paint = bear_paint_condition;

# Scan for long entry setups
def scan_long_entry = long_entry_condition;

# Scan for short entry setups
def scan_short_entry = short_entry_condition;

# Scan for active paint bars (waiting for entry)
def scan_paint_active = bull_paint_active or bear_paint_active;

# Export scan conditions for use in stock scanner
# To use: Create custom scan and use these conditions
# Example: scan_long_entry for finding long entry opportunities