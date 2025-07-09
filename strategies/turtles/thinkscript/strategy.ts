# Turtle Trading Strategy - ThinkScript Strategy
# Multi-Component Turtle System with SMMA Trend Filter

declare upper;

# === INPUT PARAMETERS ===
input channelLength = 10;
input smmaLength1 = 21;
input smmaLength2 = 50;
input smmaLength3 = 100;
input smmaLength4 = 200;
input riskPerTrade = 50.0;
input riskRewardRatio = 3.0;
input showSMMA = yes;
input showTradeInfo = yes;
input usePatterns = yes;
input allowLongs = yes;
input allowShorts = yes;

# === SMOOTHED MOVING AVERAGE FUNCTION ===
script SMMA {
    input src = close;
    input length = 20;
    
    def smma = if IsNaN(smma[1]) then SimpleMovingAvg(src, length) else (smma[1] * (length - 1) + src) / length;
    plot result = smma;
}

# === SMMA CALCULATIONS ===
def smma1 = SMMA(close, smmaLength1);
def smma2 = SMMA(close, smmaLength2);
def smma3 = SMMA(close, smmaLength3);
def smma4 = SMMA(close, smmaLength4);

# === SMMA PLOTS ===
plot SMMA21 = if showSMMA then smma1 else Double.NaN;
SMMA21.SetDefaultColor(Color.YELLOW);
SMMA21.SetLineWeight(2);

plot SMMA50 = if showSMMA then smma2 else Double.NaN;
SMMA50.SetDefaultColor(Color.GREEN);
SMMA50.SetLineWeight(2);

plot SMMA100 = if showSMMA then smma3 else Double.NaN;
SMMA100.SetDefaultColor(Color.BLUE);
SMMA100.SetLineWeight(1);

plot SMMA200 = if showSMMA then smma4 else Double.NaN;
SMMA200.SetDefaultColor(Color.RED);
SMMA200.SetLineWeight(2);

# === TREND FILL ===
def ema2 = ExpAverage(close, 2);
AddCloud(ema2, smma4, Color.DARK_GREEN, Color.DARK_RED);

# === PATTERN RECOGNITION ===
def bearStrike = usePatterns and close[3] > open[3] and close[2] > open[2] and close[1] > open[1] and close < open[1];
def bullStrike = usePatterns and close[3] < open[3] and close[2] < open[2] and close[1] < open[1] and close > open[1];

def bullEngulf = usePatterns and open <= close[1] and open < open[1] and close > open[1];
def bearEngulf = usePatterns and open >= close[1] and open > open[1] and close < open[1];

# === DONCHIAN CHANNELS ===
def upper = Highest(high, channelLength);
def lower = Lowest(low, channelLength);
def basis = (upper + lower) / 2;

plot UpperChannel = upper;
UpperChannel.SetDefaultColor(Color.WHITE);
UpperChannel.SetLineWeight(1);

plot LowerChannel = lower;
LowerChannel.SetDefaultColor(Color.WHITE);
LowerChannel.SetLineWeight(1);

# === BREAKOUT SIGNALS ===
def bullBreakout = upper > upper[1];
def bearBreakout = lower < lower[1];
def bullSignal = bullBreakout and !bullBreakout[1];
def bearSignal = bearBreakout and !bearBreakout[1];

# === TREND ALIGNMENT ===
def trendBullish = smma4 < smma2 and smma2 < smma1;
def trendBearish = smma4 > smma2 and smma2 > smma1;

# === TRADE CONDITIONS ===
def longCondition = allowLongs and trendBullish and bullSignal;
def shortCondition = allowShorts and trendBearish and bearSignal;

# === POSITION SIZING ===
def stopDistance = 2.0;
def positionSize = riskPerTrade / stopDistance;

# === TRADE SIGNALS ===
plot LongSignal = if longCondition then low - (high - low) * 0.05 else Double.NaN;
LongSignal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
LongSignal.SetDefaultColor(Color.LIME);
LongSignal.SetLineWeight(4);

plot ShortSignal = if shortCondition then high + (high - low) * 0.05 else Double.NaN;
ShortSignal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
ShortSignal.SetDefaultColor(Color.RED);
ShortSignal.SetLineWeight(4);

# === PATTERN SIGNALS ===
plot BullStrikePlot = if bullStrike then low - (high - low) * 0.02 else Double.NaN;
BullStrikePlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BullStrikePlot.SetDefaultColor(Color.CYAN);
BullStrikePlot.SetLineWeight(2);

plot BearStrikePlot = if bearStrike then high + (high - low) * 0.02 else Double.NaN;
BearStrikePlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BearStrikePlot.SetDefaultColor(Color.MAGENTA);
BearStrikePlot.SetLineWeight(2);

plot BullEngulfPlot = if bullEngulf then low - (high - low) * 0.01 else Double.NaN;
BullEngulfPlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BullEngulfPlot.SetDefaultColor(Color.LIGHT_GREEN);
BullEngulfPlot.SetLineWeight(1);

plot BearEngulfPlot = if bearEngulf then high + (high - low) * 0.01 else Double.NaN;
BearEngulfPlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BearEngulfPlot.SetDefaultColor(Color.PINK);
BearEngulfPlot.SetLineWeight(1);

# === TRADE LEVELS ===
def entryPrice = if longCondition then close else if shortCondition then close else Double.NaN;
def stopPrice = if longCondition then close - stopDistance else if shortCondition then close + stopDistance else Double.NaN;
def targetPrice = if longCondition then close + (stopDistance * riskRewardRatio) else if shortCondition then close - (stopDistance * riskRewardRatio) else Double.NaN;

# === AUTOMATIC ORDERS ===
AddOrder(OrderType.BUY_TO_OPEN, longCondition, open[-1], positionSize, Color.LIME, Color.LIME, "Long Entry");
AddOrder(OrderType.SELL_TO_CLOSE, longCondition, stopPrice, positionSize, Color.RED, Color.RED, "Long Stop");
AddOrder(OrderType.SELL_TO_CLOSE, longCondition, targetPrice, positionSize, Color.GREEN, Color.GREEN, "Long Target");

AddOrder(OrderType.SELL_TO_OPEN, shortCondition, open[-1], positionSize, Color.RED, Color.RED, "Short Entry");
AddOrder(OrderType.BUY_TO_CLOSE, shortCondition, stopPrice, positionSize, Color.RED, Color.RED, "Short Stop");
AddOrder(OrderType.BUY_TO_CLOSE, shortCondition, targetPrice, positionSize, Color.GREEN, Color.GREEN, "Short Target");

# === INFORMATION LABELS ===
AddLabel(yes, "Turtle Strategy", Color.CYAN);
AddLabel(yes, "Channel: " + channelLength, Color.GRAY);
AddLabel(yes, "Risk/Trade: $" + riskPerTrade, Color.YELLOW);
AddLabel(yes, "R:R = 1:" + riskRewardRatio, Color.ORANGE);
AddLabel(yes, "Trend: " + (if trendBullish then "BULL" else if trendBearish then "BEAR" else "NEUTRAL"), 
         if trendBullish then Color.LIME else if trendBearish then Color.RED else Color.GRAY);
AddLabel(yes, "Upper: " + Round(upper, 2), Color.LIME);
AddLabel(yes, "Lower: " + Round(lower, 2), Color.RED);

# === ALERTS ===
Alert(longCondition, "Turtle Long Entry", Alert.BAR, Sound.Chimes);
Alert(shortCondition, "Turtle Short Entry", Alert.BAR, Sound.Bell);
Alert(bullStrike, "Bullish 3-Line Strike", Alert.BAR, Sound.Ding);
Alert(bearStrike, "Bearish 3-Line Strike", Alert.BAR, Sound.Ding);
Alert(bullEngulf, "Bullish Engulfing", Alert.BAR, Sound.Ring);
Alert(bearEngulf, "Bearish Engulfing", Alert.BAR, Sound.Ring);

# === TRADE INFORMATION BUBBLES ===
AddChartBubble(showTradeInfo and longCondition, low, 
               "LONG TURTLE\nEntry: " + Round(close, 2) + "\nStop: " + Round(stopPrice, 2) + "\nTarget: " + Round(targetPrice, 2) + "\nRisk: $" + riskPerTrade, 
               Color.LIME, no);

AddChartBubble(showTradeInfo and shortCondition, high, 
               "SHORT TURTLE\nEntry: " + Round(close, 2) + "\nStop: " + Round(stopPrice, 2) + "\nTarget: " + Round(targetPrice, 2) + "\nRisk: $" + riskPerTrade, 
               Color.RED, yes);

# === BAR COLORING ===
AssignPriceColor(if trendBullish and bullBreakout then Color.LIME 
                else if trendBearish and bearBreakout then Color.RED 
                else if bullBreakout then Color.YELLOW 
                else if bearBreakout then Color.WHITE 
                else Color.CURRENT);

# === SCANNER PLOTS ===
plot ScanLongSetup = longCondition;
plot ScanShortSetup = shortCondition;
plot ScanAnySetup = longCondition or shortCondition;
plot ScanTrendBullish = trendBullish;
plot ScanTrendBearish = trendBearish;
plot ScanBullStrike = bullStrike;
plot ScanBearStrike = bearStrike;
plot ScanBullEngulf = bullEngulf;
plot ScanBearEngulf = bearEngulf;