# Lemon Strategy - ThinkorSwim Strategy
# TTM Squeeze with W/M Pattern Detection - Trading Strategy
# Translated from Pine Script version

input bbLength = 20;
input bbMultiplier = 2.0;
input keltnerLength = 20;
input keltnerMultiplier = 2.0;
input useStrictMode = no;
input williamsLength = 21;
input williamsEmaLength = 13;
input patternWidth = 9;
input patternOffset = 0;
input riskRewardRatio = 3.0;
input stopLossPercent = 3.3;
input useTrailingStop = yes;
input maxPositions = 1;

# Bollinger Bands Calculation
def bbMidline = Average(close, bbLength);
def bbStdDev = StDev(close, bbLength);
def upperBB = bbMidline + (bbMultiplier * bbStdDev);
def lowerBB = bbMidline - (bbMultiplier * bbStdDev);

# Keltner Channel Calculation
def keltnerMidline = ExpAverage(close, keltnerLength);
def keltnerRange = ExpAverage(TrueRange(high, close, low), keltnerLength);
def upperKeltner = keltnerMidline + (keltnerMultiplier * keltnerRange);
def lowerKeltner = keltnerMidline - (keltnerMultiplier * keltnerRange);

# TTM Squeeze Detection
def squeezeOn = upperBB < upperKeltner and lowerBB > lowerKeltner;
def squeezeOff = upperBB >= upperKeltner or lowerBB <= lowerKeltner;

# Momentum Oscillator
def mom = LinearRegressionSlope(close - Average(Average(highest(high, bbLength), lowest(low, bbLength)), bbMidline), bbLength, 0);

# Williams %R
def williamsHigh = Highest(high, williamsLength);
def williamsLow = Lowest(low, williamsLength);
def williamsR = 100 * (close - williamsHigh) / (williamsHigh - williamsLow);
def williamsEma = ExpAverage(williamsR, williamsEmaLength);

# VWAP Calculation
def vwapValue = VWAP(price = close);

# Simple W/M Pattern Detection (Simplified for ThinkScript)
def recentHigh = Highest(high, patternWidth);
def recentLow = Lowest(low, patternWidth);

# W Pattern Detection (Simplified)
def wPattern = recentLow == Lowest(low, patternWidth * 2) and 
               close > recentLow * 1.02 and 
               close[patternWidth] > recentLow * 1.02;

# M Pattern Detection (Simplified)
def mPattern = recentHigh == Highest(high, patternWidth * 2) and 
               close < recentHigh * 0.98 and 
               close[patternWidth] < recentHigh * 0.98;

# Long Entry Conditions
def longCondition = squeezeOff and squeezeOn[1] and
                   wPattern and
                   close > upperKeltner and
                   close > vwapValue and
                   williamsEma < -80;

# Short Entry Conditions
def shortCondition = squeezeOff and squeezeOn[1] and
                    mPattern and
                    close < lowerKeltner and
                    close < vwapValue and
                    williamsEma > -20;

# Position Management
def currentPosition = GetQuantity();
def isLong = currentPosition > 0;
def isShort = currentPosition < 0;
def isFlat = currentPosition == 0;

# Entry Signals
def longEntry = longCondition and isFlat;
def shortEntry = shortCondition and isFlat;

# Stop Loss Calculation
def longStopPrice = if useTrailingStop then lowerKeltner else entryPrice() * (1 - stopLossPercent / 100);
def shortStopPrice = if useTrailingStop then upperKeltner else entryPrice() * (1 + stopLossPercent / 100);

# Take Profit Calculation
def longTakeProfit = entryPrice() + ((entryPrice() - longStopPrice) * riskRewardRatio);
def shortTakeProfit = entryPrice() - ((shortStopPrice - entryPrice()) * riskRewardRatio);

# Exit Conditions
def longExit = isLong and (close <= longStopPrice or close >= longTakeProfit);
def shortExit = isShort and (close >= shortStopPrice or close <= shortTakeProfit);

# Order Management
AddOrder(OrderType.BUY_TO_OPEN, longEntry, tradeSize = maxPositions, name = "Long Entry");
AddOrder(OrderType.SELL_TO_CLOSE, longExit, tradeSize = maxPositions, name = "Long Exit");
AddOrder(OrderType.SELL_TO_OPEN, shortEntry, tradeSize = maxPositions, name = "Short Entry");
AddOrder(OrderType.BUY_TO_CLOSE, shortExit, tradeSize = maxPositions, name = "Short Exit");

# Plots for visualization
plot UpperBB = upperBB;
UpperBB.SetDefaultColor(Color.ORANGE);
UpperBB.SetLineWeight(1);

plot LowerBB = lowerBB;
LowerBB.SetDefaultColor(Color.ORANGE);
LowerBB.SetLineWeight(1);

plot UpperKeltner = upperKeltner;
UpperKeltner.SetDefaultColor(Color.WHITE);
UpperKeltner.SetLineWeight(1);

plot LowerKeltner = lowerKeltner;
LowerKeltner.SetDefaultColor(Color.WHITE);
LowerKeltner.SetLineWeight(1);

plot KeltnerMidline = keltnerMidline;
KeltnerMidline.SetDefaultColor(Color.WHITE);
KeltnerMidline.SetLineWeight(1);

plot VwapLine = vwapValue;
VwapLine.SetDefaultColor(Color.CYAN);
VwapLine.SetLineWeight(2);

# Entry Signals
plot LongSignal = if longEntry then low else Double.NaN;
LongSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongSignal.SetDefaultColor(Color.GREEN);
LongSignal.SetLineWeight(3);

plot ShortSignal = if shortEntry then high else Double.NaN;
ShortSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortSignal.SetDefaultColor(Color.RED);
ShortSignal.SetLineWeight(3);

# Exit Signals
plot LongExitSignal = if longExit then high else Double.NaN;
LongExitSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
LongExitSignal.SetDefaultColor(Color.ORANGE);
LongExitSignal.SetLineWeight(2);

plot ShortExitSignal = if shortExit then low else Double.NaN;
ShortExitSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
ShortExitSignal.SetDefaultColor(Color.ORANGE);
ShortExitSignal.SetLineWeight(2);

# Stop Loss and Take Profit Lines
plot LongStopLine = if isLong then longStopPrice else Double.NaN;
LongStopLine.SetDefaultColor(Color.RED);
LongStopLine.SetStyle(Curve.LONG_DASH);

plot LongTargetLine = if isLong then longTakeProfit else Double.NaN;
LongTargetLine.SetDefaultColor(Color.GREEN);
LongTargetLine.SetStyle(Curve.LONG_DASH);

plot ShortStopLine = if isShort then shortStopPrice else Double.NaN;
ShortStopLine.SetDefaultColor(Color.RED);
ShortStopLine.SetStyle(Curve.LONG_DASH);

plot ShortTargetLine = if isShort then shortTakeProfit else Double.NaN;
ShortTargetLine.SetDefaultColor(Color.GREEN);
ShortTargetLine.SetStyle(Curve.LONG_DASH);

# Background coloring for squeeze
def squeezeBackground = if squeezeOn then Color.RED else Color.GREEN;
AddCloud(upperBB, upperKeltner, Color.LIGHT_RED, Color.LIGHT_GREEN);
AddCloud(lowerKeltner, lowerBB, Color.LIGHT_RED, Color.LIGHT_GREEN);

# Labels
AddLabel(yes, "Squeeze: " + (if squeezeOn then "ON" else "OFF"), 
         if squeezeOn then Color.RED else Color.GREEN);
AddLabel(yes, "Position: " + 
         (if isLong then "LONG" else if isShort then "SHORT" else "FLAT"), 
         if isLong then Color.GREEN else if isShort then Color.RED else Color.GRAY);
AddLabel(yes, "W/M: " + (if wPattern then "W" else if mPattern then "M" else "None"), 
         if wPattern then Color.LIME else if mPattern then Color.ORANGE else Color.GRAY);
AddLabel(yes, "Williams: " + Round(williamsEma, 1), 
         if williamsEma < -80 then Color.GREEN else if williamsEma > -20 then Color.RED else Color.YELLOW);

# Risk Management Alert
AddLabel(yes, "R:R = 1:" + riskRewardRatio + " | Stop: " + stopLossPercent + "%", Color.WHITE);

# Strategy Title
AddLabel(yes, "Lemon Strategy", Color.YELLOW);