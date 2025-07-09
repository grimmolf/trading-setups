# GrimmHA Strategy - ThinkScript Trading Strategy
# Heikin Ashi Pattern Recognition with SMMA Trend Analysis
# Full backtesting strategy with position management

declare upper;

# Input Parameters
# ═══════════════════════════════════════════════════════════════════════════════════════

# Strategy Settings
input enableLongTrades = yes; # "Enable Long Trades"
input enableShortTrades = yes; # "Enable Short Trades"
input riskPerTrade = 0.02; # "Risk per Trade (% of equity)"

# SMMA Settings
input len1 = 21; # "SMMA Length 1"
input len2 = 50; # "SMMA Length 2"
input len3 = 100; # "SMMA Length 3"
input len4 = 200; # "SMMA Length 4"
input show100Line = yes; # "Show 100 SMMA"

# Doji Detection Settings
input dojiBodyPercent = 5.0; # "Doji Body Percentage"
input shadowPercent = 5.0; # "Shadow Percentage"
input shadowEqualsPercent = 100.0; # "Shadow Balance Tolerance"

# Risk Management
input riskRewardRatio = 3.0; # "Risk:Reward Ratio"
input usdRiskPerTrade = 50; # "Fixed Risk Amount (USD)"
input enableBreakeven = yes; # "Enable Breakeven Management"
input enableDynamicStops = yes; # "Enable Dynamic Stop Adjustment"

# Additional Patterns
input enable3LineStrike = yes; # "Enable 3-Line Strike Patterns"
input enableEngulfing = yes; # "Enable Engulfing Patterns"

# Visual Settings
input hideBackground = no; # "Hide Background Colors"
input showSignals = yes; # "Show Entry Signals"
input showLevels = yes; # "Show Trade Levels"

# ATR Settings
input atrLength = 14; # "ATR Length"

# SMMA Calculations
# ═══════════════════════════════════════════════════════════════════════════════════════

def smma1;
def sma_1 = Average(close, len1);
smma1 = if IsNaN(smma1[1]) then sma_1 else (smma1[1] * (len1 - 1) + close) / len1;

def smma2;
def sma_2 = Average(close, len2);
smma2 = if IsNaN(smma2[1]) then sma_2 else (smma2[1] * (len2 - 1) + close) / len2;

def smma3;
def sma_3 = Average(close, len3);
smma3 = if IsNaN(smma3[1]) then sma_3 else (smma3[1] * (len3 - 1) + close) / len3;

def smma4;
def sma_4 = Average(close, len4);
smma4 = if IsNaN(smma4[1]) then sma_4 else (smma4[1] * (len4 - 1) + close) / len4;

# Plot SMAs
plot SMMA21 = smma1;
SMMA21.SetDefaultColor(Color.WHITE);
SMMA21.SetLineWeight(2);

plot SMMA50 = smma2;
SMMA50.SetDefaultColor(Color.GREEN);
SMMA50.SetLineWeight(2);

plot SMMA100 = if show100Line then smma3 else Double.NaN;
SMMA100.SetDefaultColor(Color.YELLOW);
SMMA100.SetLineWeight(2);

plot SMMA200 = smma4;
SMMA200.SetDefaultColor(Color.RED);
SMMA200.SetLineWeight(2);

# ATR-Based Risk Management
# ═══════════════════════════════════════════════════════════════════════════════════════

def atrValue = Average(TrueRange(high, close, low), atrLength);
def minTradeRisk = 2 * atrValue;
def maxTradeRisk = 4 * atrValue;

# Doji Pattern Detection
# ═══════════════════════════════════════════════════════════════════════════════════════

def bodyHi = Max(close, open);
def bodyLo = Min(close, open);
def body = bodyHi - bodyLo;
def bodyAvg = ExpAverage(body, 14);
def upShadow = high - bodyHi;
def dnShadow = bodyLo - low;
def totalRange = high - low;

# Doji detection logic
def shadowEquals = upShadow == dnShadow or 
                  (AbsValue(upShadow - dnShadow) / dnShadow * 100 < shadowEqualsPercent and
                   AbsValue(dnShadow - upShadow) / upShadow * 100 < shadowEqualsPercent);

def isDojiBody = totalRange > 0 and body <= totalRange * dojiBodyPercent / 100;

# Exclude specific Doji types
def dragonflyDoji = isDojiBody and upShadow <= body;
def gravestoneDoji = isDojiBody and dnShadow <= body;

# Final Doji determination
def doji = isDojiBody and shadowEquals and !dragonflyDoji and !gravestoneDoji;

# Trend Analysis
# ═══════════════════════════════════════════════════════════════════════════════════════

# Trend direction based on SMMA hierarchy
def bullishTrend = smma1 > smma2 and smma2 > smma3 and smma3 > smma4;
def bearishTrend = smma1 < smma2 and smma2 < smma3 and smma3 < smma4;

# Price position relative to key SMMA
def aboveTrend = close > smma2;
def belowTrend = close < smma2;

# Heikin Ashi Signal Detection
# ═══════════════════════════════════════════════════════════════════════════════════════

# HA signal conditions (using regular OHLC for precise entry signals)
def bullHA = low == open and close > open and doji[1];
def bearHA = high == open and close < open and doji[1];

# Additional Pattern Recognition
# ═══════════════════════════════════════════════════════════════════════════════════════

# 3-Line Strike Patterns
def bearish3LS = enable3LineStrike and close[3] > open[3] and close[2] > open[2] and close[1] > open[1] and close < open[1];
def bullish3LS = enable3LineStrike and close[3] < open[3] and close[2] < open[2] and close[1] < open[1] and close > open[1];

# Engulfing Patterns
def bullishEngulfing = enableEngulfing and open <= close[1] and open < open[1] and close > open[1];
def bearishEngulfing = enableEngulfing and open >= close[1] and open > open[1] and close < open[1];

# Position Management
# ═══════════════════════════════════════════════════════════════════════════════════════

def currentPosition = if GetQuantity() > 0 then 1 else if GetQuantity() < 0 then -1 else 0;
def canEnterLong = enableLongTrades and currentPosition == 0;
def canEnterShort = enableShortTrades and currentPosition == 0;

# Entry Conditions
# ═══════════════════════════════════════════════════════════════════════════════════════

def longCondition = canEnterLong and bullishTrend and aboveTrend and bullHA;
def shortCondition = canEnterShort and bearishTrend and belowTrend and bearHA;

# Trade Level Calculations
# ═══════════════════════════════════════════════════════════════════════════════════════

# Long trade levels
def longStopLevel = if longCondition then Min(low[1], Min(low[2], low[3])) else Double.NaN;
def longEntryLevel = if longCondition then close else Double.NaN;
def longStopDistance = if longCondition then close - longStopLevel else Double.NaN;
def longTargetLevel = if longCondition then close + (longStopDistance * riskRewardRatio) else Double.NaN;
def longBreakevenLevel = if longCondition then close + longStopDistance else Double.NaN;

# Short trade levels
def shortStopLevel = if shortCondition then Max(high[1], Max(high[2], high[3])) else Double.NaN;
def shortEntryLevel = if shortCondition then close else Double.NaN;
def shortStopDistance = if shortCondition then shortStopLevel - close else Double.NaN;
def shortTargetLevel = if shortCondition then close - (shortStopDistance * riskRewardRatio) else Double.NaN;
def shortBreakevenLevel = if shortCondition then close - shortStopDistance else Double.NaN;

# Position Sizing
# ═══════════════════════════════════════════════════════════════════════════════════════

def longPositionSize = if longCondition and longStopDistance > 0 and longStopDistance >= minTradeRisk and longStopDistance <= maxTradeRisk 
                       then usdRiskPerTrade / longStopDistance else 0;
def shortPositionSize = if shortCondition and shortStopDistance > 0 and shortStopDistance >= minTradeRisk and shortStopDistance <= maxTradeRisk 
                        then usdRiskPerTrade / shortStopDistance else 0;

# Entry Orders
# ═══════════════════════════════════════════════════════════════════════════════════════

AddOrder(OrderType.BUY_TO_OPEN, 
         longCondition and longPositionSize > 0, 
         close, 
         longPositionSize, 
         Color.GREEN, 
         "GrimmHA Long Entry");

AddOrder(OrderType.SELL_TO_OPEN, 
         shortCondition and shortPositionSize > 0, 
         close, 
         shortPositionSize, 
         Color.RED, 
         "GrimmHA Short Entry");

# Dynamic Stop Management
# ═══════════════════════════════════════════════════════════════════════════════════════

def dynamicLongStop = if enableDynamicStops and currentPosition == 1 then Max(smma2, longStopLevel) else longStopLevel;
def dynamicShortStop = if enableDynamicStops and currentPosition == -1 then Min(smma2, shortStopLevel) else shortStopLevel;

# Stop Loss Orders
# ═══════════════════════════════════════════════════════════════════════════════════════

AddOrder(OrderType.SELL_TO_CLOSE, 
         currentPosition == 1 and !IsNaN(dynamicLongStop), 
         dynamicLongStop, 
         GetQuantity(), 
         Color.RED, 
         "Long Stop Loss");

AddOrder(OrderType.BUY_TO_CLOSE, 
         currentPosition == -1 and !IsNaN(dynamicShortStop), 
         dynamicShortStop, 
         AbsValue(GetQuantity()), 
         Color.RED, 
         "Short Stop Loss");

# Take Profit Orders
# ═══════════════════════════════════════════════════════════════════════════════════════

AddOrder(OrderType.SELL_TO_CLOSE, 
         currentPosition == 1 and !IsNaN(longTargetLevel), 
         longTargetLevel, 
         GetQuantity(), 
         Color.GREEN, 
         "Long Take Profit");

AddOrder(OrderType.BUY_TO_CLOSE, 
         currentPosition == -1 and !IsNaN(shortTargetLevel), 
         shortTargetLevel, 
         AbsValue(GetQuantity()), 
         Color.GREEN, 
         "Short Take Profit");

# Breakeven Management
# ═══════════════════════════════════════════════════════════════════════════════════════

def longBreakevenHit = enableBreakeven and currentPosition == 1 and high >= longBreakevenLevel;
def shortBreakevenHit = enableBreakeven and currentPosition == -1 and low <= shortBreakevenLevel;

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

# Visualization
# ═══════════════════════════════════════════════════════════════════════════════════════

# Background colors
AssignBackgroundColor(if bullishTrend and !hideBackground then Color.DARK_GREEN else 
                      if bearishTrend and !hideBackground then Color.DARK_RED else Color.CURRENT);

# Entry signals
plot LongEntrySignal = if longCondition and showSignals then low - 0.001 * close else Double.NaN;
LongEntrySignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntrySignal.SetDefaultColor(Color.GREEN);
LongEntrySignal.SetLineWeight(5);

plot ShortEntrySignal = if shortCondition and showSignals then high + 0.001 * close else Double.NaN;
ShortEntrySignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntrySignal.SetDefaultColor(Color.RED);
ShortEntrySignal.SetLineWeight(5);

# Doji markers
plot DojiMarker = if doji then high + 0.0005 * close else Double.NaN;
DojiMarker.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
DojiMarker.SetDefaultColor(Color.GRAY);
DojiMarker.SetLineWeight(3);

# HA signal markers
plot BullHAMarker = if bullHA and showSignals then low - 0.0005 * close else Double.NaN;
BullHAMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLE_UP);
BullHAMarker.SetDefaultColor(Color.LIME);
BullHAMarker.SetLineWeight(3);

plot BearHAMarker = if bearHA and showSignals then high + 0.0005 * close else Double.NaN;
BearHAMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLE_DOWN);
BearHAMarker.SetDefaultColor(Color.RED);
BearHAMarker.SetLineWeight(3);

# Additional pattern markers
plot Bullish3LSMarker = if bullish3LS and showSignals then low - 0.0003 * close else Double.NaN;
Bullish3LSMarker.SetPaintingStrategy(PaintingStrategy.POINT);
Bullish3LSMarker.SetDefaultColor(Color.BLUE);
Bullish3LSMarker.SetLineWeight(2);

plot Bearish3LSMarker = if bearish3LS and showSignals then high + 0.0003 * close else Double.NaN;
Bearish3LSMarker.SetPaintingStrategy(PaintingStrategy.POINT);
Bearish3LSMarker.SetDefaultColor(Color.MAGENTA);
Bearish3LSMarker.SetLineWeight(2);

# Current Position Levels
# ═══════════════════════════════════════════════════════════════════════════════════════

plot CurrentStopLevel = if showLevels and currentPosition == 1 then dynamicLongStop else 
                        if showLevels and currentPosition == -1 then dynamicShortStop else Double.NaN;
CurrentStopLevel.SetDefaultColor(Color.RED);
CurrentStopLevel.SetLineWeight(2);
CurrentStopLevel.SetStyle(Curve.LONG_DASH);

plot CurrentTPLevel = if showLevels and currentPosition == 1 then longTargetLevel else 
                      if showLevels and currentPosition == -1 then shortTargetLevel else Double.NaN;
CurrentTPLevel.SetDefaultColor(Color.GREEN);
CurrentTPLevel.SetLineWeight(2);
CurrentTPLevel.SetStyle(Curve.LONG_DASH);

plot CurrentBELevel = if showLevels and currentPosition == 1 then longBreakevenLevel else 
                      if showLevels and currentPosition == -1 then shortBreakevenLevel else Double.NaN;
CurrentBELevel.SetDefaultColor(Color.BLUE);
CurrentBELevel.SetLineWeight(1);
CurrentBELevel.SetStyle(Curve.LONG_DASH);

plot EntryPrice = if showLevels and currentPosition != 0 then GetAveragePrice() else Double.NaN;
EntryPrice.SetDefaultColor(Color.WHITE);
EntryPrice.SetLineWeight(2);

# Performance Tracking
# ═══════════════════════════════════════════════════════════════════════════════════════

def totalLongSignals = TotalSum(if longCondition then 1 else 0);
def totalShortSignals = TotalSum(if shortCondition then 1 else 0);
def totalSignals = totalLongSignals + totalShortSignals;

# Alerts
# ═══════════════════════════════════════════════════════════════════════════════════════

Alert(longCondition, "GrimmHA Long Entry Signal", Alert.BAR, Sound.CHIMES);
Alert(shortCondition, "GrimmHA Short Entry Signal", Alert.BAR, Sound.CHIMES);
Alert(doji, "GrimmHA Doji Pattern", Alert.BAR, Sound.RING);
Alert(bullHA, "GrimmHA Bullish HA Signal", Alert.BAR, Sound.DING);
Alert(bearHA, "GrimmHA Bearish HA Signal", Alert.BAR, Sound.DING);
Alert(currentPosition == 1 and close <= dynamicLongStop, "GrimmHA Long Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == -1 and close >= dynamicShortStop, "GrimmHA Short Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == 1 and close >= longTargetLevel, "GrimmHA Long Target Hit", Alert.BAR, Sound.DING);
Alert(currentPosition == -1 and close <= shortTargetLevel, "GrimmHA Short Target Hit", Alert.BAR, Sound.DING);
Alert(bullishTrend and !bullishTrend[1], "GrimmHA Bullish Trend Activated", Alert.BAR, Sound.CHIMES);
Alert(bearishTrend and !bearishTrend[1], "GrimmHA Bearish Trend Activated", Alert.BAR, Sound.CHIMES);

# Information Labels
# ═══════════════════════════════════════════════════════════════════════════════════════

# Position status
AddLabel(yes, "Position: " + 
         (if currentPosition == 1 then "LONG" else 
          if currentPosition == -1 then "SHORT" else "FLAT"), 
         if currentPosition == 1 then Color.GREEN else 
         if currentPosition == -1 then Color.RED else Color.GRAY);

# Trend status
AddLabel(yes, "Trend: " + 
         (if bullishTrend then "BULLISH" else 
          if bearishTrend then "BEARISH" else "NEUTRAL"), 
         if bullishTrend then Color.GREEN else 
         if bearishTrend then Color.RED else Color.YELLOW);

# Signal count
AddLabel(yes, "Signals: " + totalSignals + " (L:" + totalLongSignals + " S:" + totalShortSignals + ")", Color.CYAN);

# Risk management display
def currentRisk = if currentPosition == 1 then (GetAveragePrice() - dynamicLongStop) * GetQuantity() 
                  else if currentPosition == -1 then (dynamicShortStop - GetAveragePrice()) * AbsValue(GetQuantity()) 
                  else 0;

AddLabel(currentPosition != 0, "Risk: $" + Round(currentRisk, 2), 
         if currentRisk <= usdRiskPerTrade then Color.GREEN else Color.RED);

# Position value
def positionValue = if currentPosition != 0 then GetQuantity() * close else 0;
AddLabel(currentPosition != 0, "Position Value: $" + Round(AbsValue(positionValue), 2), Color.WHITE);

# Trend alignment score
def trendScore = (if smma1 > smma2 then 1 else 0) + 
                 (if smma2 > smma3 then 1 else 0) + 
                 (if smma3 > smma4 then 1 else 0);

AddLabel(yes, "SMMA Alignment: " + 
         (if bullishTrend then "4/4 Bull" else 
          if bearishTrend then "4/4 Bear" else 
          trendScore + "/4"), 
         if bullishTrend or bearishTrend then Color.WHITE else Color.GRAY);

# ATR information
AddLabel(yes, "ATR: " + Round(atrValue, 2) + " | Min: " + Round(minTradeRisk, 2) + " | Max: " + Round(maxTradeRisk, 2), Color.YELLOW);

# Pattern status
AddLabel(yes, "Patterns: " + 
         (if doji then "DOJI " else "") +
         (if bullish3LS then "3LS+ " else "") +
         (if bearish3LS then "3LS- " else "") +
         (if bullishEngulfing then "ENG+ " else "") +
         (if bearishEngulfing then "ENG- " else ""), 
         Color.ORANGE);