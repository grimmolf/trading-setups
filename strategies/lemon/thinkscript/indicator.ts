# Lemon Strategy - ThinkorSwim Indicator
# TTM Squeeze with W/M Pattern Detection
# Translated from Pine Script version

declare lower;

# Input Parameters
input bbLength = 20;
input bbMultiplier = 2.0;
input keltnerLength = 20;
input keltnerMultiplier = 2.0;
input useStrictMode = no;
input williamsLength = 21;
input williamsEmaLength = 13;
input patternWidth = 9;
input patternOffset = 0;
input showPatternPoints = yes;
input showSqueezeColor = yes;
input showMomentumOscillator = yes;

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
def momColor = if mom > mom[1] then 1 else -1;

# Williams %R
def williamsHigh = Highest(high, williamsLength);
def williamsLow = Lowest(low, williamsLength);
def williamsR = 100 * (close - williamsHigh) / (williamsHigh - williamsLow);
def williamsEma = ExpAverage(williamsR, williamsEmaLength);

# VWAP Calculation
def vwapValue = VWAP(price = close);

# On Balance Volume
def obvChange = if close > close[1] then volume else if close < close[1] then -volume else 0;
def obv = TotalSum(obvChange);

# Simple W/M Pattern Detection (Simplified for ThinkScript)
def recentHigh = Highest(high, patternWidth);
def recentLow = Lowest(low, patternWidth);
def priceNearHigh = close >= recentHigh * 0.98;
def priceNearLow = close <= recentLow * 1.02;

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

# Plots
plot SqueezeHist = if showSqueezeColor then (if squeezeOn then 0 else Double.NaN) else Double.NaN;
SqueezeHist.SetPaintingStrategy(PaintingStrategy.HISTOGRAM);
SqueezeHist.SetDefaultColor(Color.RED);
SqueezeHist.SetLineWeight(3);

plot MomentumOsc = if showMomentumOscillator then mom else Double.NaN;
MomentumOsc.SetPaintingStrategy(PaintingStrategy.HISTOGRAM);
MomentumOsc.AssignValueColor(if momColor == 1 then Color.CYAN else Color.MAGENTA);
MomentumOsc.SetLineWeight(2);

plot ZeroLine = 0;
ZeroLine.SetDefaultColor(Color.GRAY);
ZeroLine.SetStyle(Curve.LONG_DASH);

# Entry Signals
plot LongSignal = if longCondition then mom else Double.NaN;
LongSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongSignal.SetDefaultColor(Color.GREEN);
LongSignal.SetLineWeight(3);

plot ShortSignal = if shortCondition then mom else Double.NaN;
ShortSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortSignal.SetDefaultColor(Color.RED);
ShortSignal.SetLineWeight(3);

# Pattern Points
plot WPatternPoint = if showPatternPoints and wPattern then -50 else Double.NaN;
WPatternPoint.SetPaintingStrategy(PaintingStrategy.POINTS);
WPatternPoint.SetDefaultColor(Color.LIME);
WPatternPoint.SetLineWeight(3);

plot MPatternPoint = if showPatternPoints and mPattern then 50 else Double.NaN;
MPatternPoint.SetPaintingStrategy(PaintingStrategy.POINTS);
MPatternPoint.SetDefaultColor(Color.ORANGE);
MPatternPoint.SetLineWeight(3);

# Williams %R Plot
plot WilliamsRLine = williamsEma;
WilliamsRLine.SetDefaultColor(Color.YELLOW);
WilliamsRLine.SetLineWeight(1);

# Reference Lines
plot OverboughtLine = -20;
OverboughtLine.SetDefaultColor(Color.RED);
OverboughtLine.SetStyle(Curve.LONG_DASH);

plot OversoldLine = -80;
OversoldLine.SetDefaultColor(Color.GREEN);
OversoldLine.SetStyle(Curve.LONG_DASH);

# Alerts
Alert(longCondition, "Lemon Long Signal", Alert.BAR, Sound.DING);
Alert(shortCondition, "Lemon Short Signal", Alert.BAR, Sound.DING);

# Labels
AddLabel(yes, "Squeeze: " + (if squeezeOn then "ON" else "OFF"), 
         if squeezeOn then Color.RED else Color.GREEN);
AddLabel(yes, "W/M: " + (if wPattern then "W" else if mPattern then "M" else "None"), 
         if wPattern then Color.LIME else if mPattern then Color.ORANGE else Color.GRAY);
AddLabel(yes, "Williams: " + Round(williamsEma, 1), 
         if williamsEma < -80 then Color.GREEN else if williamsEma > -20 then Color.RED else Color.YELLOW);

# Study Title
plot StudyTitle = Double.NaN;
StudyTitle.SetDefaultColor(Color.GRAY);
AddLabel(yes, "Lemon Strategy Indicator", Color.WHITE);