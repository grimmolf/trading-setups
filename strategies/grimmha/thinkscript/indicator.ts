# GrimmHA Strategy - ThinkScript Indicator
# Heikin Ashi Pattern Recognition with SMMA Trend Analysis
# Adapted for TD Ameritrade ThinkOrSwim Platform

declare upper;

# Input Parameters
# ═══════════════════════════════════════════════════════════════════════════════════════

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

# Visual Settings
input hideBackground = no; # "Hide Background Colors"
input showSignals = yes; # "Show Entry Signals"
input showLevels = yes; # "Show Trade Levels"
input showStatistics = yes; # "Show Statistics"

# Risk Management
input riskRewardRatio = 3.0; # "Risk:Reward Ratio"
input usdRiskPerTrade = 50; # "Fixed Risk Amount (USD)"

# Additional Patterns
input enable3LineStrike = yes; # "Enable 3-Line Strike Patterns"
input enableEngulfing = yes; # "Enable Engulfing Patterns"

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

# Heikin Ashi Calculations
# ═══════════════════════════════════════════════════════════════════════════════════════

def haClose = (open + high + low + close) / 4;
def haOpen = if IsNaN(haOpen[1]) then (open + close) / 2 else (haOpen[1] + haClose[1]) / 2;
def haHigh = Max(high, Max(haOpen, haClose));
def haLow = Min(low, Min(haOpen, haClose));

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

# Combined entry conditions
def longCondition = bullishTrend and aboveTrend and bullHA;
def shortCondition = bearishTrend and belowTrend and bearHA;

# Additional Pattern Recognition
# ═══════════════════════════════════════════════════════════════════════════════════════

# 3-Line Strike Patterns
def bearish3LS = enable3LineStrike and close[3] > open[3] and close[2] > open[2] and close[1] > open[1] and close < open[1];
def bullish3LS = enable3LineStrike and close[3] < open[3] and close[2] < open[2] and close[1] < open[1] and close > open[1];

# Engulfing Patterns
def bullishEngulfing = enableEngulfing and open <= close[1] and open < open[1] and close > open[1];
def bearishEngulfing = enableEngulfing and open >= close[1] and open > open[1] and close < open[1];

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

# Position sizing
def longPositionSize = if longCondition and longStopDistance > 0 then usdRiskPerTrade / longStopDistance else 0;
def shortPositionSize = if shortCondition and shortStopDistance > 0 then usdRiskPerTrade / shortStopDistance else 0;

# Visualization
# ═══════════════════════════════════════════════════════════════════════════════════════

# Background colors
AssignBackgroundColor(if bullishTrend and !hideBackground then Color.DARK_GREEN else 
                      if bearishTrend and !hideBackground then Color.DARK_RED else Color.CURRENT);

# Doji markers
plot DojiMarker = if doji then high + 0.001 * close else Double.NaN;
DojiMarker.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
DojiMarker.SetDefaultColor(Color.GRAY);
DojiMarker.SetLineWeight(3);

# HA signal markers
plot BullHAMarker = if bullHA and showSignals then low - 0.001 * close else Double.NaN;
BullHAMarker.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BullHAMarker.SetDefaultColor(Color.LIME);
BullHAMarker.SetLineWeight(3);

plot BearHAMarker = if bearHA and showSignals then high + 0.001 * close else Double.NaN;
BearHAMarker.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
BearHAMarker.SetDefaultColor(Color.RED);
BearHAMarker.SetLineWeight(3);

# Entry signals
plot LongEntryMarker = if longCondition and showSignals then low - 0.002 * close else Double.NaN;
LongEntryMarker.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntryMarker.SetDefaultColor(Color.GREEN);
LongEntryMarker.SetLineWeight(5);

plot ShortEntryMarker = if shortCondition and showSignals then high + 0.002 * close else Double.NaN;
ShortEntryMarker.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntryMarker.SetDefaultColor(Color.RED);
ShortEntryMarker.SetLineWeight(5);

# Additional pattern markers
plot Bullish3LSMarker = if bullish3LS and showSignals then low - 0.0005 * close else Double.NaN;
Bullish3LSMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLE_UP);
Bullish3LSMarker.SetDefaultColor(Color.BLUE);
Bullish3LSMarker.SetLineWeight(2);

plot Bearish3LSMarker = if bearish3LS and showSignals then high + 0.0005 * close else Double.NaN;
Bearish3LSMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLE_DOWN);
Bearish3LSMarker.SetDefaultColor(Color.MAGENTA);
Bearish3LSMarker.SetLineWeight(2);

plot BullishEngulfingMarker = if bullishEngulfing and showSignals then low - 0.0003 * close else Double.NaN;
BullishEngulfingMarker.SetPaintingStrategy(PaintingStrategy.POINT);
BullishEngulfingMarker.SetDefaultColor(Color.CYAN);
BullishEngulfingMarker.SetLineWeight(3);

plot BearishEngulfingMarker = if bearishEngulfing and showSignals then high + 0.0003 * close else Double.NaN;
BearishEngulfingMarker.SetPaintingStrategy(PaintingStrategy.POINT);
BearishEngulfingMarker.SetDefaultColor(Color.ORANGE);
BearishEngulfingMarker.SetLineWeight(3);

# Trade levels
plot LongStopLevel = if showLevels and !IsNaN(longStopLevel) then longStopLevel else Double.NaN;
LongStopLevel.SetDefaultColor(Color.RED);
LongStopLevel.SetLineWeight(2);
LongStopLevel.SetStyle(Curve.LONG_DASH);

plot LongEntryLevel = if showLevels and !IsNaN(longEntryLevel) then longEntryLevel else Double.NaN;
LongEntryLevel.SetDefaultColor(Color.WHITE);
LongEntryLevel.SetLineWeight(2);

plot LongTargetLevel = if showLevels and !IsNaN(longTargetLevel) then longTargetLevel else Double.NaN;
LongTargetLevel.SetDefaultColor(Color.GREEN);
LongTargetLevel.SetLineWeight(2);
LongTargetLevel.SetStyle(Curve.LONG_DASH);

plot LongBreakevenLevel = if showLevels and !IsNaN(longBreakevenLevel) then longBreakevenLevel else Double.NaN;
LongBreakevenLevel.SetDefaultColor(Color.BLUE);
LongBreakevenLevel.SetLineWeight(1);
LongBreakevenLevel.SetStyle(Curve.LONG_DASH);

plot ShortStopLevel = if showLevels and !IsNaN(shortStopLevel) then shortStopLevel else Double.NaN;
ShortStopLevel.SetDefaultColor(Color.RED);
ShortStopLevel.SetLineWeight(2);
ShortStopLevel.SetStyle(Curve.LONG_DASH);

plot ShortEntryLevel = if showLevels and !IsNaN(shortEntryLevel) then shortEntryLevel else Double.NaN;
ShortEntryLevel.SetDefaultColor(Color.WHITE);
ShortEntryLevel.SetLineWeight(2);

plot ShortTargetLevel = if showLevels and !IsNaN(shortTargetLevel) then shortTargetLevel else Double.NaN;
ShortTargetLevel.SetDefaultColor(Color.GREEN);
ShortTargetLevel.SetLineWeight(2);
ShortTargetLevel.SetStyle(Curve.LONG_DASH);

plot ShortBreakevenLevel = if showLevels and !IsNaN(shortBreakevenLevel) then shortBreakevenLevel else Double.NaN;
ShortBreakevenLevel.SetDefaultColor(Color.BLUE);
ShortBreakevenLevel.SetLineWeight(1);
ShortBreakevenLevel.SetStyle(Curve.LONG_DASH);

# Alerts
# ═══════════════════════════════════════════════════════════════════════════════════════

Alert(doji, "GrimmHA Doji Pattern", Alert.BAR, Sound.RING);
Alert(bullHA, "GrimmHA Bullish HA Signal", Alert.BAR, Sound.DING);
Alert(bearHA, "GrimmHA Bearish HA Signal", Alert.BAR, Sound.DING);
Alert(longCondition, "GrimmHA Long Entry Signal", Alert.BAR, Sound.CHIMES);
Alert(shortCondition, "GrimmHA Short Entry Signal", Alert.BAR, Sound.CHIMES);
Alert(bullishTrend and !bullishTrend[1], "GrimmHA Bullish Trend Activated", Alert.BAR, Sound.BELL);
Alert(bearishTrend and !bearishTrend[1], "GrimmHA Bearish Trend Activated", Alert.BAR, Sound.BELL);

# Information Labels
# ═══════════════════════════════════════════════════════════════════════════════════════

# Trend status
def trendScore = (if smma1 > smma2 then 1 else 0) + 
                 (if smma2 > smma3 then 1 else 0) + 
                 (if smma3 > smma4 then 1 else 0);

AddLabel(yes, "GrimmHA: " + 
    (if bullishTrend then "BULL TREND" else 
     if bearishTrend then "BEAR TREND" else 
     "TREND SCORE: " + trendScore + "/3"), 
    if bullishTrend then Color.GREEN else 
    if bearishTrend then Color.RED else Color.YELLOW);

# Position relative to trend
AddLabel(showStatistics, "Position: " + (if aboveTrend then "ABOVE 50 SMMA" else "BELOW 50 SMMA"), 
         if aboveTrend then Color.GREEN else Color.RED);

# Current signal status
AddLabel(showStatistics, "Signal: " + 
         (if longCondition then "LONG SETUP" else 
          if shortCondition then "SHORT SETUP" else "NO SIGNAL"), 
         if longCondition then Color.GREEN else 
         if shortCondition then Color.RED else Color.GRAY);

# Risk management info
AddLabel(showStatistics, "Risk/Reward: " + riskRewardRatio + ":1 | Risk: $" + usdRiskPerTrade, Color.CYAN);

# Current position size for active setup
def currentPosSize = if longCondition then longPositionSize else if shortCondition then shortPositionSize else 0;
AddLabel(currentPosSize > 0, "Position Size: " + Round(currentPosSize, 2), Color.MAGENTA);

# Pattern detection status
AddLabel(showStatistics, "Patterns: " + 
         (if doji then "DOJI " else "") +
         (if bullish3LS then "3LS+ " else "") +
         (if bearish3LS then "3LS- " else "") +
         (if bullishEngulfing then "ENG+ " else "") +
         (if bearishEngulfing then "ENG- " else ""), 
         Color.YELLOW);

# SMMA alignment info
AddLabel(showStatistics, "SMMA: " + 
         (if smma1 > smma2 then "21>50 " else "21<50 ") +
         (if smma2 > smma3 then "50>100 " else "50<100 ") +
         (if smma3 > smma4 then "100>200" else "100<200"), 
         Color.WHITE);