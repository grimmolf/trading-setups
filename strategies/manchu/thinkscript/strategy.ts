# Manchu Strategy - ThinkScript Strategy
# Complete trading strategy with order management

# Input Parameters
input showTradingSession = yes;
input sessionStartHour = 830;
input sessionEndHour = 1200;
input show100Line = yes;
input donchianLength = 5;
input riskPerTrade = 1.0;
input riskRewardRatio = 3.0;
input commission = 0.20;

# SMMA Calculation Function
script SMMA {
    input src = close;
    input length = 21;
    
    def smma;
    def sma_initial = Average(src, length);
    
    if IsNaN(smma[1]) {
        smma = sma_initial;
    } else {
        smma = (smma[1] * (length - 1) + src) / length;
    }
    
    plot result = smma;
}

# Calculate SMAs
def smma21 = SMMA(close, 21);
def smma50 = SMMA(close, 50);
def smma100 = SMMA(close, 100);
def smma200 = SMMA(close, 200);

# Donchian Channel
def upperChannel = Highest(high, donchianLength);
def lowerChannel = Lowest(low, donchianLength);
def middleChannel = (upperChannel + lowerChannel) / 2;

# Session Filter
def currentTime = GetTime();
def sessionStart = RegularTradingStart(GetYYYYMMDD());
def sessionEnd = RegularTradingEnd(GetYYYYMMDD());
def isMarketHours = if currentTime >= sessionStart and currentTime <= sessionEnd then 1 else 0;

# Trend Analysis
def trendAligned = smma50 > smma200;
def trendBearish = smma50 < smma200;
def priceAboveTrend = close > smma200;
def priceBelowTrend = close < smma200;

# Entry Triggers
def crossAbove21 = close > smma21 and close[1] <= smma21[1];
def crossAbove50 = close > smma50 and close[1] <= smma50[1];
def crossAbove100 = close > smma100 and close[1] <= smma100[1];

def crossBelow21 = close < smma21 and close[1] >= smma21[1];
def crossBelow50 = close < smma50 and close[1] >= smma50[1];
def crossBelow100 = close < smma100 and close[1] >= smma100[1];

# Signal Generation
def longCondition = trendAligned and priceAboveTrend and 
                    (crossAbove21 or crossAbove50 or crossAbove100) and isMarketHours;

def shortCondition = trendBearish and priceBelowTrend and 
                     (crossBelow21 or crossBelow50 or crossBelow100) and isMarketHours;

# Trade Management Variables
def longEntryPrice = if longCondition then close else longEntryPrice[1];
def shortEntryPrice = if shortCondition then close else shortEntryPrice[1];

def longStopLoss = if longCondition then lowerChannel else longStopLoss[1];
def shortStopLoss = if shortCondition then upperChannel else shortStopLoss[1];

def longTakeProfit = if longCondition then close + (close - lowerChannel) * riskRewardRatio 
                     else longTakeProfit[1];
def shortTakeProfit = if shortCondition then close - (upperChannel - close) * riskRewardRatio 
                      else shortTakeProfit[1];

# Position Size Calculation
def longStopDistance = if longCondition then close - lowerChannel else longStopDistance[1];
def shortStopDistance = if shortCondition then upperChannel - close else shortStopDistance[1];

def longPositionSize = if longCondition and longStopDistance > 0 then riskPerTrade / longStopDistance 
                       else longPositionSize[1];
def shortPositionSize = if shortCondition and shortStopDistance > 0 then riskPerTrade / shortStopDistance 
                        else shortPositionSize[1];

# Order Management
def longActive = if longCondition then 1 
                 else if (longActive[1] and (close <= longStopLoss or close >= longTakeProfit)) then 0 
                 else longActive[1];

def shortActive = if shortCondition then 1 
                  else if (shortActive[1] and (close >= shortStopLoss or close <= shortTakeProfit)) then 0 
                  else shortActive[1];

# Exit Conditions
def longStopHit = longActive and close <= longStopLoss;
def longProfitHit = longActive and close >= longTakeProfit;
def shortStopHit = shortActive and close >= shortStopLoss;
def shortProfitHit = shortActive and close <= shortTakeProfit;

# Order Execution
AddOrder(OrderType.BUY_TO_OPEN, longCondition, open[-1], 1, Color.GREEN, Color.GREEN, "Long Entry");
AddOrder(OrderType.SELL_TO_CLOSE, longStopHit or longProfitHit, open[-1], 1, Color.RED, Color.RED, "Long Exit");

AddOrder(OrderType.SELL_TO_OPEN, shortCondition, open[-1], 1, Color.RED, Color.RED, "Short Entry");
AddOrder(OrderType.BUY_TO_CLOSE, shortStopHit or shortProfitHit, open[-1], 1, Color.GREEN, Color.GREEN, "Short Exit");

# Plotting
plot SMMA21 = smma21;
SMMA21.SetDefaultColor(Color.WHITE);
SMMA21.SetLineWeight(2);

plot SMMA50 = smma50;
SMMA50.SetDefaultColor(Color.GREEN);
SMMA50.SetLineWeight(2);

plot SMMA100 = if show100Line then smma100 else Double.NaN;
SMMA100.SetDefaultColor(Color.YELLOW);
SMMA100.SetLineWeight(2);

plot SMMA200 = smma200;
SMMA200.SetDefaultColor(Color.RED);
SMMA200.SetLineWeight(2);

# Trade Levels
plot LongStop = if longActive then longStopLoss else Double.NaN;
LongStop.SetDefaultColor(Color.RED);
LongStop.SetStyle(Curve.LONG_DASH);

plot LongProfit = if longActive then longTakeProfit else Double.NaN;
LongProfit.SetDefaultColor(Color.GREEN);
LongProfit.SetStyle(Curve.LONG_DASH);

plot ShortStop = if shortActive then shortStopLoss else Double.NaN;
ShortStop.SetDefaultColor(Color.RED);
ShortStop.SetStyle(Curve.LONG_DASH);

plot ShortProfit = if shortActive then shortTakeProfit else Double.NaN;
ShortProfit.SetDefaultColor(Color.GREEN);
ShortProfit.SetStyle(Curve.LONG_DASH);

# Entry Signals
plot LongEntry = if longCondition then low * 0.999 else Double.NaN;
LongEntry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntry.SetDefaultColor(Color.GREEN);
LongEntry.SetLineWeight(3);

plot ShortEntry = if shortCondition then high * 1.001 else Double.NaN;
ShortEntry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntry.SetDefaultColor(Color.RED);
ShortEntry.SetLineWeight(3);

# Exit Signals
plot LongExit = if longStopHit or longProfitHit then 
                if longProfitHit then high * 1.001 else low * 0.999 
                else Double.NaN;
LongExit.SetPaintingStrategy(if longProfitHit then PaintingStrategy.ARROW_UP else PaintingStrategy.ARROW_DOWN);
LongExit.SetDefaultColor(if longProfitHit then Color.GREEN else Color.RED);

plot ShortExit = if shortStopHit or shortProfitHit then 
                 if shortProfitHit then low * 0.999 else high * 1.001 
                 else Double.NaN;
ShortExit.SetPaintingStrategy(if shortProfitHit then PaintingStrategy.ARROW_DOWN else PaintingStrategy.ARROW_UP);
ShortExit.SetDefaultColor(if shortProfitHit then Color.GREEN else Color.RED);

# Risk Areas
AddCloud(if longActive then longEntryPrice else Double.NaN, 
         if longActive then longStopLoss else Double.NaN, 
         Color.LIGHT_RED);

AddCloud(if longActive then longEntryPrice else Double.NaN, 
         if longActive then longTakeProfit else Double.NaN, 
         Color.LIGHT_GREEN);

AddCloud(if shortActive then shortEntryPrice else Double.NaN, 
         if shortActive then shortStopLoss else Double.NaN, 
         Color.LIGHT_RED);

AddCloud(if shortActive then shortEntryPrice else Double.NaN, 
         if shortActive then shortTakeProfit else Double.NaN, 
         Color.LIGHT_GREEN);

# Labels
AddLabel(yes, "Trend: " + if trendAligned then "Bullish" else "Bearish", 
         if trendAligned then Color.GREEN else Color.RED);

AddLabel(yes, "Session: " + if isMarketHours then "ACTIVE" else "CLOSED", 
         if isMarketHours then Color.GREEN else Color.GRAY);

AddLabel(longActive, "LONG ACTIVE - R:R " + riskRewardRatio, Color.GREEN);
AddLabel(shortActive, "SHORT ACTIVE - R:R " + riskRewardRatio, Color.RED);

AddLabel(longCondition, "LONG SIGNAL", Color.GREEN);
AddLabel(shortCondition, "SHORT SIGNAL", Color.RED);

# Performance Tracking
def longWins = if longProfitHit then longWins[1] + 1 else longWins[1];
def longLosses = if longStopHit then longLosses[1] + 1 else longLosses[1];
def shortWins = if shortProfitHit then shortWins[1] + 1 else shortWins[1];
def shortLosses = if shortStopHit then shortLosses[1] + 1 else shortLosses[1];

def totalTrades = longWins + longLosses + shortWins + shortLosses;
def totalWins = longWins + shortWins;
def winRate = if totalTrades > 0 then totalWins / totalTrades * 100 else 0;

AddLabel(totalTrades > 0, "Trades: " + totalTrades + " | Win Rate: " + AsPercent(winRate/100), 
         if winRate >= 50 then Color.GREEN else Color.YELLOW);