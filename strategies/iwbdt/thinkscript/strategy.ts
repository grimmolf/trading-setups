# IWBDT Strategy - ThinkScript Strategy
# It Will Break Down/Through - Multi-Timeframe Fractal Breakout System
# Full backtesting strategy with position management

declare upper;

# Input Parameters
input FirstAddTF = AggregationPeriod.HOUR;
input SecondAddTF = AggregationPeriod.FOUR_HOURS;
input ThirdAddTF = AggregationPeriod.DAY;

input EMA_Short_period = 9;
input EMA_Long_period = 18;
input rr = 2.0;
input USDRiskPerTrade = 20;
input IncludeCT = no;

# Strategy Settings
input enableLongTrades = yes;
input enableShortTrades = yes;
input riskPerTrade = 0.02;
input maxPositions = 1;

# Visual Settings
input HideBackground = no;
input showSignals = yes;
input showLevels = yes;

# ATR settings
input ATR_Length = 14;

# Multi-Timeframe EMA Calculation
def FirstAddTF_ema_short = ExpAverage(close, EMA_Short_period);
def FirstAddTF_ema_long = ExpAverage(close, EMA_Long_period);

def SecondAddTF_close = close(period = SecondAddTF);
def SecondAddTF_ema_short = ExpAverage(SecondAddTF_close, EMA_Short_period);
def SecondAddTF_ema_long = ExpAverage(SecondAddTF_close, EMA_Long_period);

def ThirdAddTF_close = close(period = ThirdAddTF);
def ThirdAddTF_ema_short = ExpAverage(ThirdAddTF_close, EMA_Short_period);
def ThirdAddTF_ema_long = ExpAverage(ThirdAddTF_close, EMA_Long_period);

# Current timeframe EMAs
def ctf_ema_short = ExpAverage(close, EMA_Short_period);
def ctf_ema_long = ExpAverage(close, EMA_Long_period);

# Trend direction calculation
def FirstAddTF_Bull = if FirstAddTF_ema_short > FirstAddTF_ema_long then 1 else 0;
def SecondAddTF_Bull = if SecondAddTF_ema_short > SecondAddTF_ema_long then 1 else 0;
def ThirdAddTF_Bull = if ThirdAddTF_ema_short > ThirdAddTF_ema_long then 1 else 0;

def FirstAddTF_Bear = if FirstAddTF_ema_short < FirstAddTF_ema_long then 1 else 0;
def SecondAddTF_Bear = if SecondAddTF_ema_short < SecondAddTF_ema_long then 1 else 0;
def ThirdAddTF_Bear = if ThirdAddTF_ema_short < ThirdAddTF_ema_long then 1 else 0;

# Full trend alignment (3/3 timeframes)
def L_TF_Bull = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull) == 3 then 1 else 0;
def L_TF_Bear = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear) == 3 then 1 else 0;

# Partial trend alignment (2/3 timeframes)
def L_TF_Bull_partial = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull) == 2 then 1 else 0;
def L_TF_Bear_partial = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear) == 2 then 1 else 0;

# Current timeframe trend
def CT_Bull = if ctf_ema_short > ctf_ema_long then 1 else 0;
def CT_Bear = if ctf_ema_short < ctf_ema_long then 1 else 0;

# All timeframes including current (4/4)
def All_TF_Bull = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull + CT_Bull) == 4 then 1 else 0;
def All_TF_Bear = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear + CT_Bear) == 4 then 1 else 0;

# Final trend determination
def BullTrend = if IncludeCT then All_TF_Bull else L_TF_Bull;
def BearTrend = if IncludeCT then All_TF_Bear else L_TF_Bear;

# ATR-based Risk Management
def Min_Trade_Risk = ATR(ATR_Length);
def Max_Trade_Risk = 2 * ATR(ATR_Length);

# Fractal Detection
def topfractal = high[3] < high[2] and high[2] > high[1] and BullTrend == 0 and BearTrend == 1;
def botfractal = low[3] > low[2] and low[2] < low[1] and BullTrend == 1 and BearTrend == 0;

# Position Management
def currentPosition = if GetQuantity() > 0 then 1 else if GetQuantity() < 0 then -1 else 0;
def canEnterLong = enableLongTrades and currentPosition == 0;
def canEnterShort = enableShortTrades and currentPosition == 0;

# Fractal confirmation with risk filters
def topfractalconfirmed = high[3] < high[2] and high[2] > high[1] and BearTrend == 1 and 
                          low < low[1] and canEnterShort and
                          (high[2] - low[1]) > Min_Trade_Risk and (high[2] - low[1]) < Max_Trade_Risk;

def botfractalconfirmed = low[3] > low[2] and low[2] < low[1] and BullTrend == 1 and 
                          high > high[1] and canEnterLong and
                          (high[1] - low[2]) > Min_Trade_Risk and (high[1] - low[2]) < Max_Trade_Risk;

# Trade Level Calculation
def longStopLevel = if botfractalconfirmed then low[2] else Double.NaN;
def longEntryLevel = if botfractalconfirmed then close else Double.NaN;
def longStopDistance = if botfractalconfirmed then close - low[2] else Double.NaN;
def longTPLevel = if botfractalconfirmed then close + (rr * longStopDistance) else Double.NaN;
def longBELevel = if botfractalconfirmed then close + longStopDistance else Double.NaN;

def shortStopLevel = if topfractalconfirmed then high[2] else Double.NaN;
def shortEntryLevel = if topfractalconfirmed then close else Double.NaN;
def shortStopDistance = if topfractalconfirmed then high[2] - close else Double.NaN;
def shortTPLevel = if topfractalconfirmed then close - (rr * shortStopDistance) else Double.NaN;
def shortBELevel = if topfractalconfirmed then close - shortStopDistance else Double.NaN;

# Position Sizing
def longPositionSize = if !IsNaN(longStopDistance) and longStopDistance > 0 then USDRiskPerTrade / longStopDistance else 0;
def shortPositionSize = if !IsNaN(shortStopDistance) and shortStopDistance > 0 then USDRiskPerTrade / shortStopDistance else 0;

# Entry Orders
AddOrder(OrderType.BUY_TO_OPEN, 
    botfractalconfirmed and canEnterLong and longPositionSize > 0, 
    close, 
    longPositionSize, 
    Color.GREEN, 
    "IWBDT Long Entry");

AddOrder(OrderType.SELL_TO_OPEN, 
    topfractalconfirmed and canEnterShort and shortPositionSize > 0, 
    close, 
    shortPositionSize, 
    Color.RED, 
    "IWBDT Short Entry");

# Stop Loss Orders
AddOrder(OrderType.SELL_TO_CLOSE, 
    currentPosition == 1 and !IsNaN(longStopLevel), 
    longStopLevel, 
    GetQuantity(), 
    Color.RED, 
    "Long Stop Loss");

AddOrder(OrderType.BUY_TO_CLOSE, 
    currentPosition == -1 and !IsNaN(shortStopLevel), 
    shortStopLevel, 
    AbsValue(GetQuantity()), 
    Color.RED, 
    "Short Stop Loss");

# Take Profit Orders
AddOrder(OrderType.SELL_TO_CLOSE, 
    currentPosition == 1 and !IsNaN(longTPLevel), 
    longTPLevel, 
    GetQuantity(), 
    Color.GREEN, 
    "Long Take Profit");

AddOrder(OrderType.BUY_TO_CLOSE, 
    currentPosition == -1 and !IsNaN(shortTPLevel), 
    shortTPLevel, 
    AbsValue(GetQuantity()), 
    Color.GREEN, 
    "Short Take Profit");

# Breakeven Management (simplified)
def longBreakevenHit = currentPosition == 1 and high >= longBELevel;
def shortBreakevenHit = currentPosition == -1 and low <= shortBELevel;

AddOrder(OrderType.SELL_TO_CLOSE, 
    longBreakevenHit and close <= longEntryLevel, 
    longEntryLevel, 
    GetQuantity(), 
    Color.BLUE, 
    "Long Breakeven");

AddOrder(OrderType.BUY_TO_CLOSE, 
    shortBreakevenHit and close >= shortEntryLevel, 
    shortEntryLevel, 
    AbsValue(GetQuantity()), 
    Color.BLUE, 
    "Short Breakeven");

# Visual Elements
# Background Colors
AssignBackgroundColor(if !HideBackground and BullTrend then Color.DARK_GREEN else 
                      if !HideBackground and BearTrend then Color.DARK_RED else 
                      if !HideBackground and L_TF_Bull_partial then Color.DARK_GRAY else 
                      if !HideBackground and L_TF_Bear_partial then Color.MAGENTA else Color.CURRENT);

# Entry Signals
plot LongEntry = if showSignals and botfractalconfirmed then low - (0.001 * close) else Double.NaN;
LongEntry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntry.SetDefaultColor(Color.GREEN);
LongEntry.SetLineWeight(5);

plot ShortEntry = if showSignals and topfractalconfirmed then high + (0.001 * close) else Double.NaN;
ShortEntry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntry.SetDefaultColor(Color.RED);
ShortEntry.SetLineWeight(5);

# Current Position Levels
plot CurrentStopLevel = if showLevels and currentPosition == 1 then longStopLevel else if showLevels and currentPosition == -1 then shortStopLevel else Double.NaN;
CurrentStopLevel.SetDefaultColor(Color.RED);
CurrentStopLevel.SetLineWeight(2);
CurrentStopLevel.SetStyle(Curve.LONG_DASH);

plot CurrentTPLevel = if showLevels and currentPosition == 1 then longTPLevel else if showLevels and currentPosition == -1 then shortTPLevel else Double.NaN;
CurrentTPLevel.SetDefaultColor(Color.GREEN);
CurrentTPLevel.SetLineWeight(2);
CurrentTPLevel.SetStyle(Curve.LONG_DASH);

plot CurrentBELevel = if showLevels and currentPosition == 1 then longBELevel else if showLevels and currentPosition == -1 then shortBELevel else Double.NaN;
CurrentBELevel.SetDefaultColor(Color.BLUE);
CurrentBELevel.SetLineWeight(1);
CurrentBELevel.SetStyle(Curve.LONG_DASH);

plot EntryPrice = if showLevels and currentPosition != 0 then GetAveragePrice() else Double.NaN;
EntryPrice.SetDefaultColor(Color.WHITE);
EntryPrice.SetLineWeight(2);

# EMAs for reference
plot EMAShort = ctf_ema_short;
EMAShort.SetDefaultColor(Color.BLUE);
EMAShort.SetLineWeight(1);

plot EMALong = ctf_ema_long;
EMALong.SetDefaultColor(Color.RED);
EMALong.SetLineWeight(1);

# Performance Tracking
def totalLongSignals = TotalSum(if botfractalconfirmed then 1 else 0);
def totalShortSignals = TotalSum(if topfractalconfirmed then 1 else 0);
def totalSignals = totalLongSignals + totalShortSignals;

# Information Labels
AddLabel(yes, "Position: " + 
    (if currentPosition == 1 then "LONG" else if currentPosition == -1 then "SHORT" else "FLAT"), 
    if currentPosition == 1 then Color.GREEN else if currentPosition == -1 then Color.RED else Color.GRAY);

AddLabel(yes, "Trend: " + 
    (if BullTrend then "BULL" else if BearTrend then "BEAR" else if L_TF_Bull_partial then "BULL PARTIAL" else if L_TF_Bear_partial then "BEAR PARTIAL" else "NEUTRAL"), 
    if BullTrend then Color.GREEN else if BearTrend then Color.RED else Color.YELLOW);

AddLabel(yes, "Signals: " + totalSignals + " (L:" + totalLongSignals + " S:" + totalShortSignals + ")", Color.CYAN);

# Risk Management Display
def currentRisk = if currentPosition == 1 then (GetAveragePrice() - longStopLevel) * GetQuantity() 
                  else if currentPosition == -1 then (shortStopLevel - GetAveragePrice()) * AbsValue(GetQuantity()) 
                  else 0;

AddLabel(currentPosition != 0, "Risk: $" + Round(currentRisk, 2), 
    if currentRisk <= USDRiskPerTrade then Color.GREEN else Color.RED);

def positionValue = if currentPosition != 0 then GetQuantity() * close else 0;
AddLabel(currentPosition != 0, "Position Value: $" + Round(AbsValue(positionValue), 2), Color.WHITE);

# Timeframe Status
def trendScore = FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull;
def bearScore = FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear;

AddLabel(yes, "TF Alignment: " + 
    (if BullTrend then "3/3 Bull" else if BearTrend then "3/3 Bear" else if L_TF_Bull_partial then trendScore + "/3 Bull" else if L_TF_Bear_partial then bearScore + "/3 Bear" else "Mixed"), 
    if BullTrend or BearTrend then Color.WHITE else Color.GRAY);

# ATR Information
AddLabel(yes, "ATR: " + Round(Min_Trade_Risk, 2) + " | Max: " + Round(Max_Trade_Risk, 2), Color.YELLOW);

# Alerts
Alert(botfractalconfirmed and canEnterLong, "IWBDT Long Entry Signal", Alert.BAR, Sound.RING);
Alert(topfractalconfirmed and canEnterShort, "IWBDT Short Entry Signal", Alert.BAR, Sound.RING);
Alert(currentPosition == 1 and close <= longStopLevel, "Long Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == -1 and close >= shortStopLevel, "Short Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == 1 and close >= longTPLevel, "Long Target Hit", Alert.BAR, Sound.DING);
Alert(currentPosition == -1 and close <= shortTPLevel, "Short Target Hit", Alert.BAR, Sound.DING);
Alert(BullTrend and !BullTrend[1], "Bull Trend Activated", Alert.BAR, Sound.CHIMES);
Alert(BearTrend and !BearTrend[1], "Bear Trend Activated", Alert.BAR, Sound.CHIMES);