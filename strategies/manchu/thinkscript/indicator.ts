# Manchu Strategy - ThinkScript Indicator
# Based on Pine Script implementation with TOS platform adaptations

# Input Parameters
input showTradingSession = yes;
input sessionStartHour = 830;
input sessionEndHour = 1200;
input showTrendFill = yes;
input show100Line = yes;
input donchianLength = 5;
input riskPerTrade = 1.0;
input riskRewardRatio = 3.0;

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

# Simplified session check (TOS handles market hours automatically)
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
def longSignal = trendAligned and priceAboveTrend and 
                 (crossAbove21 or crossAbove50 or crossAbove100) and isMarketHours;

def shortSignal = trendBearish and priceBelowTrend and 
                  (crossBelow21 or crossBelow50 or crossBelow100) and isMarketHours;

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

# Donchian Channel
plot UpperBand = upperChannel;
UpperBand.SetDefaultColor(Color.BLUE);
UpperBand.SetStyle(Curve.SHORT_DASH);

plot LowerBand = lowerChannel;
LowerBand.SetDefaultColor(Color.BLUE);
LowerBand.SetStyle(Curve.SHORT_DASH);

plot MiddleBand = middleChannel;
MiddleBand.SetDefaultColor(Color.ORANGE);
MiddleBand.SetStyle(Curve.SHORT_DASH);

# Cloud Fill
AddCloud(if showTrendFill then close else Double.NaN, smma200, 
         if close > smma200 then Color.LIGHT_GREEN else Color.LIGHT_RED);

# Session Background
AddCloud(if showTradingSession and isMarketHours then high else Double.NaN, 
         if showTradingSession and isMarketHours then low else Double.NaN, 
         Color.LIGHT_GRAY);

# Entry Signals
plot LongEntry = if longSignal then low * 0.999 else Double.NaN;
LongEntry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntry.SetDefaultColor(Color.GREEN);
LongEntry.SetLineWeight(3);

plot ShortEntry = if shortSignal then high * 1.001 else Double.NaN;
ShortEntry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntry.SetDefaultColor(Color.RED);
ShortEntry.SetLineWeight(3);

# Bar Color
AssignPriceColor(if longSignal then Color.YELLOW 
                 else if shortSignal then Color.WHITE 
                 else Color.CURRENT);

# Alerts
Alert(longSignal, "Manchu Long Signal", Alert.BAR, Sound.Ring);
Alert(shortSignal, "Manchu Short Signal", Alert.BAR, Sound.Ring);

# Labels for Trade Information
AddLabel(yes, "SMMA Trend: " + if trendAligned then "Bullish" else "Bearish", 
         if trendAligned then Color.GREEN else Color.RED);

AddLabel(yes, "Session: " + if isMarketHours then "ACTIVE" else "CLOSED", 
         if isMarketHours then Color.GREEN else Color.GRAY);

AddLabel(longSignal, "LONG SIGNAL", Color.GREEN);
AddLabel(shortSignal, "SHORT SIGNAL", Color.RED);