# Silver Setup - ThinkScript Strategy
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
input risk_per_trade = 2.0;

input allow_long = yes;
input allow_short = yes;
input close_daily = yes;

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
def should_close = close_daily and current_time >= daily_close_min and current_time <= daily_close_min + 1 and GetDayOfWeek(GetYYYYMMDD()) < 6;

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
def bull_paint_high = if bull_paint_condition and !bull_paint_active[1] and GetQuantity() == 0 then high else bull_paint_high[1];
def bull_paint_low = if bull_paint_condition and !bull_paint_active[1] and GetQuantity() == 0 then low else bull_paint_low[1];
def bull_stop_level = if bull_paint_condition and !bull_paint_active[1] and GetQuantity() == 0 then low[stop_offset] else bull_stop_level[1];
def bull_target_level = if bull_paint_condition and !bull_paint_active[1] and GetQuantity() == 0 then bull_paint_low + (bull_paint_low - bull_stop_level) * risk_multiplier else bull_target_level[1];

# Bear paint state variables  
def bear_paint_high = if bear_paint_condition and !bear_paint_active[1] and GetQuantity() == 0 then high else bear_paint_high[1];
def bear_paint_low = if bear_paint_condition and !bear_paint_active[1] and GetQuantity() == 0 then low else bear_paint_low[1];
def bear_stop_level = if bear_paint_condition and !bear_paint_active[1] and GetQuantity() == 0 then high[stop_offset] else bear_stop_level[1];
def bear_target_level = if bear_paint_condition and !bear_paint_active[1] and GetQuantity() == 0 then bear_paint_high - (bear_stop_level - bear_paint_high) * risk_multiplier else bear_target_level[1];

# Paint active status
def bull_paint_active = if bull_paint_condition and !bull_paint_active[1] and GetQuantity() == 0 then yes 
                       else if bull_paint_active[1] and (high > bull_paint_high * 1.1 or low < bull_stop_level or GetQuantity() != 0) then no
                       else if bull_paint_active[1] and bear_paint_condition then no
                       else bull_paint_active[1];

def bear_paint_active = if bear_paint_condition and !bear_paint_active[1] and GetQuantity() == 0 then yes
                       else if bear_paint_active[1] and (low < bear_paint_low * 0.9 or high > bear_stop_level or GetQuantity() != 0) then no
                       else if bear_paint_active[1] and bull_paint_condition then no
                       else bear_paint_active[1];

# ═══════════════════════════════════════════════════════════════════════════════════════════
# ENTRY CONDITIONS (3 REASONS: LOCATION, MOMENTUM, STRUCTURE)
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long entry conditions
def long_location = in_time_window;  # Reason 1: Location (time window)
def long_momentum = bull_paint_active;  # Reason 2: Momentum (paint bar directional bias)
def long_structure = close > bull_paint_low and close < bull_paint_high and low <= bull_paint_low;  # Reason 3: Structure (price re-entry)

def long_entry_condition = long_location and long_momentum and long_structure and allow_long and GetQuantity() == 0;

# Short entry conditions
def short_location = in_time_window;  # Reason 1: Location (time window)
def short_momentum = bear_paint_active;  # Reason 2: Momentum (paint bar directional bias)
def short_structure = close < bear_paint_high and close > bear_paint_low and high >= bear_paint_high;  # Reason 3: Structure (price re-entry)

def short_entry_condition = short_location and short_momentum and short_structure and allow_short and GetQuantity() == 0;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# POSITION SIZING CALCULATION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Calculate position size based on risk per trade
def account_value = GetNetLiq();
def risk_amount = account_value * (risk_per_trade / 100);

def bull_stop_distance = if bull_paint_active then AbsValue(close - bull_stop_level) else 0;
def bear_stop_distance = if bear_paint_active then AbsValue(close - bear_stop_level) else 0;

def long_position_size = if bull_stop_distance > 0 then Round(risk_amount / bull_stop_distance, 0) else 0;
def short_position_size = if bear_stop_distance > 0 then Round(risk_amount / bear_stop_distance, 0) else 0;

# ═══════════════════════════════════════════════════════════════════════════════════════════
# STRATEGY EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Long entry orders
AddOrder(OrderType.BUY_TO_OPEN, long_entry_condition, open[-1], long_position_size, Color.GREEN, Color.GREEN, "Long Entry");

# Short entry orders
AddOrder(OrderType.SELL_TO_OPEN, short_entry_condition, open[-1], short_position_size, Color.RED, Color.RED, "Short Entry");

# Exit conditions
def long_stop_hit = GetQuantity() > 0 and low <= bull_stop_level;
def long_target_hit = GetQuantity() > 0 and high >= bull_target_level;
def long_daily_close = GetQuantity() > 0 and should_close;

def short_stop_hit = GetQuantity() < 0 and high >= bear_stop_level;
def short_target_hit = GetQuantity() < 0 and low <= bear_target_level;
def short_daily_close = GetQuantity() < 0 and should_close;

# Long exit orders
AddOrder(OrderType.SELL_TO_CLOSE, long_stop_hit, open[-1], GetQuantity(), Color.RED, Color.RED, "Long Stop");
AddOrder(OrderType.SELL_TO_CLOSE, long_target_hit, open[-1], GetQuantity(), Color.BLUE, Color.BLUE, "Long Target");
AddOrder(OrderType.SELL_TO_CLOSE, long_daily_close, open[-1], GetQuantity(), Color.GRAY, Color.GRAY, "Long Daily Close");

# Short exit orders
AddOrder(OrderType.BUY_TO_CLOSE, short_stop_hit, open[-1], AbsValue(GetQuantity()), Color.RED, Color.RED, "Short Stop");
AddOrder(OrderType.BUY_TO_CLOSE, short_target_hit, open[-1], AbsValue(GetQuantity()), Color.BLUE, Color.BLUE, "Short Target");
AddOrder(OrderType.BUY_TO_CLOSE, short_daily_close, open[-1], AbsValue(GetQuantity()), Color.GRAY, Color.GRAY, "Short Daily Close");

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

# Stop and target levels for active positions
plot bull_stop_line = if show_stop_target and GetQuantity() > 0 then bull_stop_level else Double.NaN;
plot bull_target_line = if show_stop_target and GetQuantity() > 0 then bull_target_level else Double.NaN;
plot bear_stop_line = if show_stop_target and GetQuantity() < 0 then bear_stop_level else Double.NaN;
plot bear_target_line = if show_stop_target and GetQuantity() < 0 then bear_target_level else Double.NaN;

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

# Exit alerts
Alert(long_stop_hit, "LONG Stop Hit - Silver Setup", Alert.BAR, Sound.Ring);
Alert(long_target_hit, "LONG Target Hit - Silver Setup", Alert.BAR, Sound.Bell);
Alert(short_stop_hit, "SHORT Stop Hit - Silver Setup", Alert.BAR, Sound.Ring);
Alert(short_target_hit, "SHORT Target Hit - Silver Setup", Alert.BAR, Sound.Bell);

# Paint bar alerts
Alert(bull_paint_condition, "Bull Paint Bar Detected - Silver Setup", Alert.BAR, Sound.Ding);
Alert(bear_paint_condition, "Bear Paint Bar Detected - Silver Setup", Alert.BAR, Sound.Ding);

# Daily close alert
Alert(should_close, "Daily Close Time - Silver Setup", Alert.BAR, Sound.Bell);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# LABELS AND PERFORMANCE METRICS
# ═══════════════════════════════════════════════════════════════════════════════════════════

# Current position status
def current_position = if GetQuantity() > 0 then "LONG" else if GetQuantity() < 0 then "SHORT" else "FLAT";
def position_color = if GetQuantity() > 0 then Color.GREEN else if GetQuantity() < 0 then Color.RED else Color.GRAY;

AddLabel(yes, "Position: " + current_position, position_color);

# Paint bar status
AddLabel(bull_paint_active, "BULL PAINT ACTIVE", Color.GREEN);
AddLabel(bear_paint_active, "BEAR PAINT ACTIVE", Color.RED);

# Time window status
AddLabel(in_time_window, "IN TIME WINDOW", Color.YELLOW);

# Current levels for active positions
AddLabel(GetQuantity() > 0, "Stop: " + bull_stop_level, Color.RED);
AddLabel(GetQuantity() > 0, "Target: " + bull_target_level, Color.BLUE);
AddLabel(GetQuantity() < 0, "Stop: " + bear_stop_level, Color.RED);
AddLabel(GetQuantity() < 0, "Target: " + bear_target_level, Color.BLUE);

# Risk/Reward ratio
def current_risk_reward = if GetQuantity() > 0 then (bull_target_level - close) / (close - bull_stop_level)
                         else if GetQuantity() < 0 then (close - bear_target_level) / (bear_stop_level - close)
                         else 0;

AddLabel(GetQuantity() != 0, "Current R:R = 1:" + Round(current_risk_reward, 1), Color.WHITE);

# Position size information
def current_position_size = if GetQuantity() > 0 then long_position_size else if GetQuantity() < 0 then short_position_size else 0;
AddLabel(GetQuantity() != 0, "Position Size: " + current_position_size, Color.WHITE);

# Risk amount
def current_risk_amount = if GetQuantity() > 0 then GetQuantity() * (close - bull_stop_level)
                         else if GetQuantity() < 0 then AbsValue(GetQuantity()) * (bear_stop_level - close)
                         else 0;

AddLabel(GetQuantity() != 0, "Risk Amount: $" + Round(current_risk_amount, 2), Color.YELLOW);

# Performance metrics
def total_profit = GetTotalTradingPnL();
def total_trades = GetTotalTrades();
def winning_trades = GetWinningTrades();
def win_rate = if total_trades > 0 then Round((winning_trades / total_trades) * 100, 1) else 0;

AddLabel(yes, "Total P&L: $" + Round(total_profit, 2), if total_profit > 0 then Color.GREEN else Color.RED);
AddLabel(yes, "Total Trades: " + total_trades, Color.WHITE);
AddLabel(yes, "Win Rate: " + win_rate + "%", Color.WHITE);

# ═══════════════════════════════════════════════════════════════════════════════════════════
# SCAN CONDITIONS (FOR STOCK SCANNER)
# ═══════════════════════════════════════════════════════════════════════════════════════════

# These can be used in ThinkOrSwim stock scanner
def scan_long_entry = long_entry_condition;
def scan_short_entry = short_entry_condition;
def scan_bull_paint = bull_paint_condition;
def scan_bear_paint = bear_paint_condition;
def scan_paint_active = bull_paint_active or bear_paint_active;