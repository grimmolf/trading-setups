# SCDTM (Stone Cold DA MAN) Indicator for ThinkOrSwim
# Original concept: Brian Beamish (TRI)
# ThinkScript adaptation from Pine Script implementation
# Multi-timeframe breakout strategy with fractal pattern recognition

#hint: SCDTM strategy uses multi-timeframe EMA alignment, Bollinger Band %B, Stochastic RSI, and fractal patterns to identify high-probability breakout opportunities.

# Input Parameters
input src = close;
input fractalPeriods = 2;
input fractalBars = {default "5", "3"};
input showInfo = yes;

# Bollinger Band %B Inputs
input bbLength = 20;
input bbStdDev = 2.0;
input bbUpperThresh = 1.00;
input bbLowerThresh = 0.00;

# Stochastic RSI Inputs  
input stochRSILength = 14;
input rsiLength = 14;
input smoothK = 3;
input smoothD = 3;

#=============================================================================
# EMA CALCULATIONS
#=============================================================================

# EMA calculations for current timeframe
def ema9 = ExpAverage(src, 9);
def ema18 = ExpAverage(src, 18);

# Multi-timeframe EMA values
# Daily timeframe
def ema9_D = ema9[AggregationPeriod.DAY];
def ema18_D = ema18[AggregationPeriod.DAY];

# 4-hour timeframe
def ema9_4H = ema9[AggregationPeriod.FOUR_HOURS];
def ema18_4H = ema18[AggregationPeriod.FOUR_HOURS];

# 1-hour timeframe
def ema9_1H = ema9[AggregationPeriod.HOUR];
def ema18_1H = ema18[AggregationPeriod.HOUR];

# Individual timeframe bias
def bullEmaDaily = if ema9_D >= ema18_D then 1 else 0;
def bearEmaDaily = if ema9_D < ema18_D then 1 else 0;

def bullEma4H = if ema9_4H >= ema18_4H then 1 else 0;
def bearEma4H = if ema9_4H < ema18_4H then 1 else 0;

def bullEma1H = if ema9_1H >= ema18_1H then 1 else 0;
def bearEma1H = if ema9_1H < ema18_1H then 1 else 0;

# Consolidated EMA alignment
def bullEmaIndex = bullEmaDaily + bullEma4H + bullEma1H;
def bearEmaIndex = bearEmaDaily + bearEma4H + bearEma1H;

# Checkpoint 1: Multi-timeframe alignment
def cp1 = if (bullEmaIndex == 3 or bearEmaIndex == 3) then 1 else 0;

#=============================================================================
# BOLLINGER BAND %B AND STOCHASTIC RSI
#=============================================================================

# Bollinger Band %B calculation
def bbBasis = Average(src, bbLength);
def bbDev = bbStdDev * StDev(src, bbLength);
def bbUpper = bbBasis + bbDev;
def bbLower = bbBasis - bbDev;
def bbPercent = if (bbUpper - bbLower) != 0 then (src - bbLower) / (bbUpper - bbLower) else 0;

# %B signal tracking
script BBSignalTracker {
    input bbValue = 0.0;
    input upperThresh = 1.0;
    input lowerThresh = 0.0;
    
    def longSignal = if bbValue <= lowerThresh then 1 
                    else if bbValue >= 0.55 and longSignal[1] == 1 then 0 
                    else longSignal[1];
    
    def shortSignal = if bbValue >= upperThresh then 1 
                     else if bbValue <= 0.45 and shortSignal[1] == 1 then 0 
                     else shortSignal[1];
    
    plot long = longSignal;
    plot short = shortSignal;
}

def longBBR = BBSignalTracker(bbPercent, bbUpperThresh, bbLowerThresh).long;
def shortBBR = BBSignalTracker(bbPercent, bbUpperThresh, bbLowerThresh).short;

# Stochastic RSI calculation
def rsi1 = RSI(price = src, length = rsiLength);
def stochRSI = 100 * (rsi1 - Lowest(rsi1, stochRSILength)) / 
               (Highest(rsi1, stochRSILength) - Lowest(rsi1, stochRSILength));
def stochK = Average(stochRSI, smoothK);
def stochD = Average(stochK, smoothD);

# Stochastic RSI signals
def longRSI = if stochK >= stochD then 1 else 0;
def shortRSI = if stochD >= stochK then 1 else 0;

# Checkpoint 2: %B and Stochastic RSI confirmation
def cp2 = if ((bearEmaIndex == 3 and shortBBR == 1 and shortRSI == 1) or 
              (bullEmaIndex == 3 and longBBR == 1 and longRSI == 1)) then 1 else 0;

#=============================================================================
# FRACTAL PATTERN RECOGNITION
#=============================================================================

# Fractal detection functions
def n = fractalPeriods;

# Down fractal (resistance high)
def dnFractal5 = if fractalBars == fractalBars."5" then
    (high[n-2] < high[n] and high[n-1] < high[n] and 
     high[n+1] < high[n] and high[n+2] < high[n]) else 0;

def dnFractal3 = if fractalBars == fractalBars."3" then
    (high[n-1] < high[n] and high[n+1] < high[n]) else 0;

def dnFractal = if fractalBars == fractalBars."5" then dnFractal5 else dnFractal3;

# Up fractal (support low)
def upFractal5 = if fractalBars == fractalBars."5" then
    (low[n-2] > low[n] and low[n-1] > low[n] and 
     low[n+1] > low[n] and low[n+2] > low[n]) else 0;

def upFractal3 = if fractalBars == fractalBars."3" then
    (low[n-1] > low[n] and low[n+1] > low[n]) else 0;

def upFractal = if fractalBars == fractalBars."5" then upFractal5 else upFractal3;

# Valid fractal conditions with trend alignment
def bullFractalValid = upFractal and (bullEmaIndex == 3);
def bearFractalValid = dnFractal and (bearEmaIndex == 3);

# Checkpoint 3: Fractal pattern recognition
def cp3 = if (cp2 == 1 and (bullFractalValid or bearFractalValid)) then 1 else 0;

#=============================================================================
# SIGNAL GENERATION
#=============================================================================

# Primary signals
def bullSignal = cp3 and bullFractalValid;
def bearSignal = cp3 and bearFractalValid;

# Signal strength assessment
def signalStrength = if cp1 then (if cp2 then (if cp3 then 3 else 2) else 1) else 0;

#=============================================================================
# VISUAL COMPONENTS
#=============================================================================

# Plot fractal patterns
plot UpFractal = if (bullEmaIndex == 3 and cp2 and upFractal) then low[n] else Double.NaN;
UpFractal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
UpFractal.SetDefaultColor(Color.GREEN);
UpFractal.SetLineWeight(3);

plot DownFractal = if (bearEmaIndex == 3 and cp2 and dnFractal) then high[n] else Double.NaN;
DownFractal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
DownFractal.SetDefaultColor(Color.RED);
DownFractal.SetLineWeight(3);

# Plot entry signals
plot LongSignal = if bullSignal then low - (0.001 * close) else Double.NaN;
LongSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongSignal.SetDefaultColor(Color.GREEN);
LongSignal.SetLineWeight(5);

plot ShortSignal = if bearSignal then high + (0.001 * close) else Double.NaN;
ShortSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortSignal.SetDefaultColor(Color.RED);
ShortSignal.SetLineWeight(5);

# Trend background coloring
AssignPriceColor(if bullEmaIndex == 3 then Color.DARK_GREEN 
                else if bearEmaIndex == 3 then Color.DARK_RED 
                else Color.CURRENT);

#=============================================================================
# INFORMATION LABELS
#=============================================================================

# Create information display
def showLabels = showInfo and IsLast(BarNumber(), 0);

AddLabel(showLabels, "SCDTM: " + 
         (if cp1 then "✓" else "✗") + " EMA | " +
         (if cp2 then "✓" else "✗") + " %B/RSI | " +
         (if cp3 then "✓" else "✗") + " Fractal", 
         if cp3 then Color.GREEN else if cp2 then Color.YELLOW else Color.RED);

AddLabel(showLabels, "Bull Index: " + bullEmaIndex + "/3", 
         if bullEmaIndex == 3 then Color.GREEN else Color.GRAY);

AddLabel(showLabels, "Bear Index: " + bearEmaIndex + "/3", 
         if bearEmaIndex == 3 then Color.RED else Color.GRAY);

AddLabel(showLabels, "Signal Strength: " + signalStrength + "/3", 
         if signalStrength >= 2 then Color.GREEN else Color.GRAY);

AddLabel(showLabels, "BB%: " + Round(bbPercent, 3), 
         if bbPercent > 0.8 then Color.RED 
         else if bbPercent < 0.2 then Color.GREEN 
         else Color.GRAY);

#=============================================================================
# ALERTS
#=============================================================================

# Alert conditions
Alert(bullSignal, "SCDTM Long Signal on " + GetSymbol(), Alert.BAR, Sound.Chimes);
Alert(bearSignal, "SCDTM Short Signal on " + GetSymbol(), Alert.BAR, Sound.Chimes);

#=============================================================================
# SCAN CONDITIONS
#=============================================================================

# Scan for SCDTM setups
plot ScanLong = bullSignal;
plot ScanShort = bearSignal;
plot ScanAny = bullSignal or bearSignal;

# Additional scan plots for filtering
plot BullEMA = bullEmaIndex;
plot BearEMA = bearEmaIndex;
plot CP1 = cp1;
plot CP2 = cp2;
plot CP3 = cp3;
plot SignalStr = signalStrength;

#=============================================================================
# STUDY TITLE AND DESCRIPTION
#=============================================================================

# Study configuration
DefineGlobalColor("BullTrend", Color.DARK_GREEN);
DefineGlobalColor("BearTrend", Color.DARK_RED);
DefineGlobalColor("Neutral", Color.GRAY);

# Hide data window plots
ScanLong.Hide();
ScanShort.Hide();
ScanAny.Hide();
BullEMA.Hide();
BearEMA.Hide();
CP1.Hide();
CP2.Hide();
CP3.Hide();
SignalStr.Hide();