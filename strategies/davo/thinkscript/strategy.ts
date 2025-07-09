# Davo Strategy - ThinkScript Strategy
# Based on Davinci's Dav-O Meter with W/M Pattern Recognition
# Full backtesting strategy with position management

declare upper;

# Input Parameters
input source = close;
input includePrice = yes;
input includeOBV = yes;
input includeWilly = yes;
input includeMFI = no;
input includeRSI = no;
input includeDMI = no;

# Pattern Detection Settings
input rangePrice = 9;
input offsetPrice = 0;
input strictPrice = yes;
input rangeOBV = 9;
input offsetOBV = 0;
input strictOBV = yes;
input rangeWly = 9;
input offsetWly = 0;
input strictWly = yes;
input lengthWly = 21;
input rangeMFI = 9;
input offsetMFI = 0;
input strictMFI = yes;
input lengthMFI = 14;
input rangeRSI = 9;
input offsetRSI = 0;
input strictRSI = yes;
input lengthRSI = 14;
input rangeDMI = 9;
input offsetDMI = 0;
input strictDMI = yes;
input lengthDMI = 14;

# Risk Management
input stopLossPercentage = 0.01;
input riskRewardRatio = 2.0;
input riskPerTrade = 0.01;
input initialCapital = 10000;

# Session Filtering
input limitPeriod = yes;
input lengthPeriod = 240; # hours

# Strategy Settings
input enableLongTrades = yes;
input enableShortTrades = yes;
input maxPositions = 1;

# Indicator Calculations
def change_src = source - source[1];
def OBVs = TotalSum(if change_src > 0 then volume else if change_src < 0 then -volume else 0);

# Money Flow Index
def upper_s = Sum(volume * (if hlc3 > hlc3[1] then hlc3 else 0), lengthMFI);
def lower_s = Sum(volume * (if hlc3 < hlc3[1] then hlc3 else 0), lengthMFI);
def MFIs = if lower_s != 0 then 100 * upper_s / (upper_s + lower_s) else 50;

# RSI
def RSIs = RSI(length = lengthRSI, price = source);

# Williams %R
def upperWly = Highest(high, lengthWly);
def lowerWly = Lowest(low, lengthWly);
def WLYs = if upperWly != lowerWly then 100 * (source - upperWly) / (upperWly - lowerWly) else -50;

# Simple Moving Average
def SMAs = Average(source, 20);

# Directional Movement Index
def DIplus = DMI(length = lengthDMI).DIPlus;
def DIminus = DMI(length = lengthDMI).DIMinus;

# Time filtering
def withinPeriod = if limitPeriod then 
    (GetTime() - GetTime()[lengthPeriod * 4]) < (lengthPeriod * 3600000) else yes;

# Pattern Detection Functions
script data_W {
    input aSeries = close;
    input aRange = 9;
    input anOffset = 0;
    input strict = yes;
    input stopLossPercentage = 0.01;
    input riskRewardRatio = 2.0;
    
    # Simplified pattern detection for ThinkScript
    def recentLow = Lowest(aSeries, aRange);
    def recentHigh = Highest(aSeries, aRange);
    def midLevel = (recentHigh + recentLow) / 2;
    
    # W pattern approximation - looking for double bottom structure
    def lowCount = Sum(if aSeries <= recentLow * 1.01 then 1 else 0, aRange);
    def highBreak = aSeries > Average(aSeries, aRange / 2);
    def potentialW = lowCount >= 2 and highBreak;
    
    def entry = if potentialW then aSeries else Double.NaN;
    def stopLoss = if potentialW then recentLow * (1 - stopLossPercentage) else Double.NaN;
    def target = if potentialW then entry + (entry - stopLoss) * riskRewardRatio else Double.NaN;
    
    plot result = potentialW;
    plot entryLevel = entry;
    plot stopLevel = stopLoss;
    plot targetLevel = target;
}

script data_M {
    input aSeries = close;
    input aRange = 9;
    input anOffset = 0;
    input strict = yes;
    input stopLossPercentage = 0.01;
    input riskRewardRatio = 2.0;
    
    # Simplified pattern detection for ThinkScript
    def recentLow = Lowest(aSeries, aRange);
    def recentHigh = Highest(aSeries, aRange);
    def midLevel = (recentHigh + recentLow) / 2;
    
    # M pattern approximation - looking for double top structure
    def highCount = Sum(if aSeries >= recentHigh * 0.99 then 1 else 0, aRange);
    def lowBreak = aSeries < Average(aSeries, aRange / 2);
    def potentialM = highCount >= 2 and lowBreak;
    
    def entry = if potentialM then aSeries else Double.NaN;
    def stopLoss = if potentialM then recentHigh * (1 + stopLossPercentage) else Double.NaN;
    def target = if potentialM then entry - (stopLoss - entry) * riskRewardRatio else Double.NaN;
    
    plot result = potentialM;
    plot entryLevel = entry;
    plot stopLevel = stopLoss;
    plot targetLevel = target;
}

# Pattern Detection
def W_found = data_W(source, rangePrice, offsetPrice, strictPrice);
def W_entry = data_W(source, rangePrice, offsetPrice, strictPrice).entryLevel;
def W_stopLoss = data_W(source, rangePrice, offsetPrice, strictPrice).stopLevel;
def W_target = data_W(source, rangePrice, offsetPrice, strictPrice).targetLevel;

def M_found = data_M(source, rangePrice, offsetPrice, strictPrice);
def M_entry = data_M(source, rangePrice, offsetPrice, strictPrice).entryLevel;
def M_stopLoss = data_M(source, rangePrice, offsetPrice, strictPrice).stopLevel;
def M_target = data_M(source, rangePrice, offsetPrice, strictPrice).targetLevel;

# Multi-indicator confirmation
def priceW = !includePrice or W_found;
def priceM = !includePrice or M_found;

def OBVw = !includeOBV or data_W(OBVs, rangeOBV, offsetOBV, strictOBV);
def OBVm = !includeOBV or data_M(OBVs, rangeOBV, offsetOBV, strictOBV);

def MFIw = !includeMFI or data_W(MFIs, rangeMFI, offsetMFI, strictMFI);
def MFIm = !includeMFI or data_M(MFIs, rangeMFI, offsetMFI, strictMFI);

# RSI patterns (inverted logic)
def RSIw = !includeRSI or data_M(RSIs, rangeRSI, offsetRSI, strictRSI);
def RSIm = !includeRSI or data_W(RSIs, rangeRSI, offsetRSI, strictRSI);

def Wlyw = !includeWilly or data_W(WLYs, rangeWly, offsetWly, strictWly);
def Wlym = !includeWilly or data_M(WLYs, rangeWly, offsetWly, strictWly);

def DMIw = !includeDMI or (data_W(DIplus, rangeDMI, offsetDMI, strictDMI) and data_M(DIminus, rangeDMI, offsetDMI, strictDMI));
def DMIm = !includeDMI or (data_M(DIplus, rangeDMI, offsetDMI, strictDMI) and data_W(DIminus, rangeDMI, offsetDMI, strictDMI));

# SMA filters
def LowBelowSMA = low <= SMAs;
def HighAboveSMA = high >= SMAs;

# Trading conditions
def longCondition = LowBelowSMA and priceW and OBVw and MFIw and RSIw and Wlyw and DMIw and withinPeriod;
def shortCondition = HighAboveSMA and priceM and OBVm and MFIm and RSIm and Wlym and DMIm and withinPeriod;

# Signal generation
def longSignal = longCondition and !longCondition[1];
def shortSignal = shortCondition and !shortCondition[1];

# Position Management
def currentPosition = if GetQuantity() > 0 then 1 else if GetQuantity() < 0 then -1 else 0;
def canEnterLong = enableLongTrades and currentPosition == 0;
def canEnterShort = enableShortTrades and currentPosition == 0;

# Position sizing calculation
def accountValue = initialCapital;
def riskAmount = accountValue * riskPerTrade;
def longStopDistance = if !IsNaN(W_stopLoss) then close - W_stopLoss else 0;
def shortStopDistance = if !IsNaN(M_stopLoss) then M_stopLoss - close else 0;

def longPositionSize = if longStopDistance > 0 then riskAmount / longStopDistance else 0;
def shortPositionSize = if shortStopDistance > 0 then riskAmount / shortStopDistance else 0;

# Entry Orders
AddOrder(OrderType.BUY_TO_OPEN, 
    longSignal and canEnterLong and longPositionSize > 0, 
    close, 
    longPositionSize, 
    Color.GREEN, 
    "Davo Long Entry");

AddOrder(OrderType.SELL_TO_OPEN, 
    shortSignal and canEnterShort and shortPositionSize > 0, 
    close, 
    shortPositionSize, 
    Color.RED, 
    "Davo Short Entry");

# Exit Orders - Stop Loss
AddOrder(OrderType.SELL_TO_CLOSE, 
    currentPosition == 1 and !IsNaN(W_stopLoss), 
    W_stopLoss, 
    GetQuantity(), 
    Color.RED, 
    "Long Stop Loss");

AddOrder(OrderType.BUY_TO_CLOSE, 
    currentPosition == -1 and !IsNaN(M_stopLoss), 
    M_stopLoss, 
    AbsValue(GetQuantity()), 
    Color.RED, 
    "Short Stop Loss");

# Exit Orders - Take Profit
AddOrder(OrderType.SELL_TO_CLOSE, 
    currentPosition == 1 and !IsNaN(W_target), 
    W_target, 
    GetQuantity(), 
    Color.GREEN, 
    "Long Take Profit");

AddOrder(OrderType.BUY_TO_CLOSE, 
    currentPosition == -1 and !IsNaN(M_target), 
    M_target, 
    AbsValue(GetQuantity()), 
    Color.GREEN, 
    "Short Take Profit");

# Visualization
plot LongSignal = if longSignal then low - (0.001 * close) else Double.NaN;
LongSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongSignal.SetDefaultColor(Color.GREEN);
LongSignal.SetLineWeight(3);

plot ShortSignal = if shortSignal then high + (0.001 * close) else Double.NaN;
ShortSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortSignal.SetDefaultColor(Color.RED);
ShortSignal.SetLineWeight(3);

# Entry and Exit Levels
plot EntryLevel = if currentPosition != 0 then GetAveragePrice() else Double.NaN;
EntryLevel.SetDefaultColor(Color.WHITE);
EntryLevel.SetLineWeight(2);

plot StopLevel = if currentPosition == 1 then W_stopLoss else if currentPosition == -1 then M_stopLoss else Double.NaN;
StopLevel.SetDefaultColor(Color.RED);
StopLevel.SetLineWeight(1);
StopLevel.SetStyle(Curve.LONG_DASH);

plot TargetLevel = if currentPosition == 1 then W_target else if currentPosition == -1 then M_target else Double.NaN;
TargetLevel.SetDefaultColor(Color.GREEN);
TargetLevel.SetLineWeight(1);
TargetLevel.SetStyle(Curve.LONG_DASH);

# Performance Labels
def totalTrades = TotalSum(if longSignal or shortSignal then 1 else 0);
def longTrades = TotalSum(if longSignal then 1 else 0);
def shortTrades = TotalSum(if shortSignal then 1 else 0);

AddLabel(yes, "Position: " + 
    (if currentPosition == 1 then "LONG" else if currentPosition == -1 then "SHORT" else "FLAT"), 
    if currentPosition == 1 then Color.GREEN else if currentPosition == -1 then Color.RED else Color.GRAY);

AddLabel(yes, "Signals: " + totalTrades + " (L:" + longTrades + " S:" + shortTrades + ")", Color.CYAN);

AddLabel(yes, "Patterns: P(" + (if includePrice then "✓" else "✗") + 
    ") OBV(" + (if includeOBV then "✓" else "✗") + 
    ") W%R(" + (if includeWilly then "✓" else "✗") + 
    ") MFI(" + (if includeMFI then "✓" else "✗") + 
    ") RSI(" + (if includeRSI then "✓" else "✗") + 
    ") DMI(" + (if includeDMI then "✓" else "✗") + ")", Color.YELLOW);

# Risk Management Display
def positionRisk = if currentPosition == 1 then (GetAveragePrice() - W_stopLoss) * GetQuantity() 
                  else if currentPosition == -1 then (M_stopLoss - GetAveragePrice()) * AbsValue(GetQuantity()) 
                  else 0;

AddLabel(currentPosition != 0, "Risk: $" + Round(positionRisk, 2), 
    if positionRisk <= riskAmount then Color.GREEN else Color.RED);

def positionValue = if currentPosition != 0 then GetQuantity() * close else 0;
AddLabel(currentPosition != 0, "Position Value: $" + Round(AbsValue(positionValue), 2), Color.WHITE);

# Alerts
Alert(longSignal and canEnterLong, "Davo Long Entry Signal", Alert.BAR, Sound.RING);
Alert(shortSignal and canEnterShort, "Davo Short Entry Signal", Alert.BAR, Sound.RING);
Alert(currentPosition == 1 and close <= W_stopLoss, "Long Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == -1 and close >= M_stopLoss, "Short Stop Loss Hit", Alert.BAR, Sound.BELL);
Alert(currentPosition == 1 and close >= W_target, "Long Target Hit", Alert.BAR, Sound.DING);
Alert(currentPosition == -1 and close <= M_target, "Short Target Hit", Alert.BAR, Sound.DING);