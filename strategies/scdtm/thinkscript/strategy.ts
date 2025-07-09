# SCDTM (Stone Cold DA MAN) Strategy for ThinkOrSwim
# Original concept: Brian Beamish (TRI)
# ThinkScript strategy adaptation with order management
# Multi-timeframe breakout strategy with comprehensive risk management

#hint: SCDTM strategy with automatic order management, position sizing, and risk controls for live trading on ThinkOrSwim platform.

# Input Parameters
input src = close;
input fractalPeriods = 2;
input fractalBars = {default "5", "3"};

# Risk Management Inputs
input riskRewardRatio = 2.25;
input dollarRiskPerTrade = 50.0;
input usePercentRisk = no;
input percentRisk = 1.0;

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

# Trading Controls
input allowLongs = yes;
input allowShorts = yes;
input showOrders = yes;
input showInfo = yes;

#=============================================================================
# EMA CALCULATIONS AND MULTI-TIMEFRAME ANALYSIS
#=============================================================================

# EMA calculations
def ema9 = ExpAverage(src, 9);
def ema18 = ExpAverage(src, 18);

# Multi-timeframe EMA values
def ema9_D = ema9[AggregationPeriod.DAY];
def ema18_D = ema18[AggregationPeriod.DAY];
def ema9_4H = ema9[AggregationPeriod.FOUR_HOURS];
def ema18_4H = ema18[AggregationPeriod.FOUR_HOURS];
def ema9_1H = ema9[AggregationPeriod.HOUR];
def ema18_1H = ema18[AggregationPeriod.HOUR];

# Individual timeframe bias
def bullEmaDaily = if ema9_D >= ema18_D then 1 else 0;
def bullEma4H = if ema9_4H >= ema18_4H then 1 else 0;
def bullEma1H = if ema9_1H >= ema18_1H then 1 else 0;

def bearEmaDaily = if ema9_D < ema18_D then 1 else 0;
def bearEma4H = if ema9_4H < ema18_4H then 1 else 0;
def bearEma1H = if ema9_1H < ema18_1H then 1 else 0;

# Consolidated alignment
def bullEmaIndex = bullEmaDaily + bullEma4H + bullEma1H;
def bearEmaIndex = bearEmaDaily + bearEma4H + bearEma1H;

# Checkpoint 1
def cp1 = if (bullEmaIndex == 3 or bearEmaIndex == 3) then 1 else 0;

#=============================================================================
# BOLLINGER BAND %B AND STOCHASTIC RSI
#=============================================================================

# Bollinger Band %B
def bbBasis = Average(src, bbLength);
def bbDev = bbStdDev * StDev(src, bbLength);
def bbUpper = bbBasis + bbDev;
def bbLower = bbBasis - bbDev;
def bbPercent = if (bbUpper - bbLower) != 0 then (src - bbLower) / (bbUpper - bbLower) else 0;

# %B signal tracking with state management
script BBSignalManager {
    input bbValue = 0.0;
    input upperThresh = 1.0;
    input lowerThresh = 0.0;
    
    def longBBR = if bbValue <= lowerThresh then 1 
                 else if bbValue >= 0.55 and longBBR[1] == 1 then 0 
                 else longBBR[1];
    
    def shortBBR = if bbValue >= upperThresh then 1 
                  else if bbValue <= 0.45 and shortBBR[1] == 1 then 0 
                  else shortBBR[1];
    
    plot long = longBBR;
    plot short = shortBBR;
}

def longBBR = BBSignalManager(bbPercent, bbUpperThresh, bbLowerThresh).long;
def shortBBR = BBSignalManager(bbPercent, bbUpperThresh, bbLowerThresh).short;

# Stochastic RSI
def rsi1 = RSI(price = src, length = rsiLength);
def stochRSI = 100 * (rsi1 - Lowest(rsi1, stochRSILength)) / 
               (Highest(rsi1, stochRSILength) - Lowest(rsi1, stochRSILength));
def stochK = Average(stochRSI, smoothK);
def stochD = Average(stochK, smoothD);

def longRSI = if stochK >= stochD then 1 else 0;
def shortRSI = if stochD >= stochK then 1 else 0;

# Checkpoint 2
def cp2 = if ((bearEmaIndex == 3 and shortBBR == 1 and shortRSI == 1) or 
              (bullEmaIndex == 3 and longBBR == 1 and longRSI == 1)) then 1 else 0;

#=============================================================================
# FRACTAL PATTERN RECOGNITION
#=============================================================================

def n = fractalPeriods;

# Fractal detection
def dnFractal = if fractalBars == fractalBars."5" then
    (high[n-2] < high[n] and high[n-1] < high[n] and 
     high[n+1] < high[n] and high[n+2] < high[n]) else
    (high[n-1] < high[n] and high[n+1] < high[n]);

def upFractal = if fractalBars == fractalBars."5" then
    (low[n-2] > low[n] and low[n-1] > low[n] and 
     low[n+1] > low[n] and low[n+2] > low[n]) else
    (low[n-1] > low[n] and low[n+1] > low[n]);

# Valid fractal conditions
def bullFractalValid = upFractal and (bullEmaIndex == 3);
def bearFractalValid = dnFractal and (bearEmaIndex == 3);

# Checkpoint 3
def cp3 = if (cp2 == 1 and (bullFractalValid or bearFractalValid)) then 1 else 0;

#=============================================================================
# TRADE LEVEL CALCULATIONS
#=============================================================================

# Calculate key levels when fractal forms
def bullBreakoutPrice = if bullFractalValid then high[n] + TickSize() else bullBreakoutPrice[1];
def bullStopLoss = if bullFractalValid then low[n] - TickSize() else bullStopLoss[1];

def bearBreakoutPrice = if bearFractalValid then low[n] - TickSize() else bearBreakoutPrice[1];
def bearStopLoss = if bearFractalValid then high[n] + TickSize() else bearStopLoss[1];

# Risk distance calculation
def bullRiskDistance = if !IsNaN(bullBreakoutPrice) and !IsNaN(bullStopLoss) 
                      then bullBreakoutPrice - bullStopLoss else 0;
def bearRiskDistance = if !IsNaN(bearBreakoutPrice) and !IsNaN(bearStopLoss) 
                      then bearStopLoss - bearBreakoutPrice else 0;

# Target calculation
def bullTarget = if bullRiskDistance > 0 then bullBreakoutPrice + (bullRiskDistance * riskRewardRatio) 
                else Double.NaN;
def bearTarget = if bearRiskDistance > 0 then bearBreakoutPrice - (bearRiskDistance * riskRewardRatio) 
                else Double.NaN;

# Position sizing
def accountValue = GetNetLiq();
def riskAmount = if usePercentRisk then accountValue * percentRisk / 100 else dollarRiskPerTrade;

def bullPositionSize = if bullRiskDistance > 0 then Round(riskAmount / bullRiskDistance, 0) else 0;
def bearPositionSize = if bearRiskDistance > 0 then Round(riskAmount / bearRiskDistance, 0) else 0;

#=============================================================================
# SIGNAL GENERATION
#=============================================================================

# Entry conditions
def longSetupReady = cp3 and bullFractalValid and bullEmaIndex == 3;
def shortSetupReady = cp3 and bearFractalValid and bearEmaIndex == 3;

# Breakout confirmation
def longEntry = longSetupReady and high >= bullBreakoutPrice and allowLongs;
def shortEntry = shortSetupReady and low <= bearBreakoutPrice and allowShorts;

#=============================================================================
# ORDER MANAGEMENT
#=============================================================================

# Order logic
AddOrder(OrderType.BUY_TO_OPEN, longEntry, open[-1], bullPositionSize, Color.GREEN, Color.GREEN, "SCDTM Long");
AddOrder(OrderType.SELL_TO_CLOSE, high >= bullTarget, high, bullPositionSize, Color.GREEN, Color.GREEN, "Long Target");
AddOrder(OrderType.SELL_TO_CLOSE, low <= bullStopLoss, low, bullPositionSize, Color.RED, Color.RED, "Long Stop");

AddOrder(OrderType.SELL_TO_OPEN, shortEntry, open[-1], bearPositionSize, Color.RED, Color.RED, "SCDTM Short");
AddOrder(OrderType.BUY_TO_CLOSE, low <= bearTarget, low, bearPositionSize, Color.GREEN, Color.GREEN, "Short Target");
AddOrder(OrderType.BUY_TO_CLOSE, high >= bearStopLoss, high, bearPositionSize, Color.RED, Color.RED, "Short Stop");

#=============================================================================
# VISUAL COMPONENTS
#=============================================================================

# Plot fractal patterns
plot UpFractal = if (bullEmaIndex == 3 and cp2 and upFractal) then low[n] else Double.NaN;
UpFractal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
UpFractal.SetDefaultColor(Color.GREEN);

plot DownFractal = if (bearEmaIndex == 3 and cp2 and dnFractal) then high[n] else Double.NaN;
DownFractal.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
DownFractal.SetDefaultColor(Color.RED);

# Entry signals
plot LongEntry = if longEntry then low else Double.NaN;
LongEntry.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
LongEntry.SetDefaultColor(Color.GREEN);
LongEntry.SetLineWeight(5);

plot ShortEntry = if shortEntry then high else Double.NaN;
ShortEntry.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
ShortEntry.SetDefaultColor(Color.RED);
ShortEntry.SetLineWeight(5);

# Level plots
plot BullBreakout = if showOrders and !IsNaN(bullBreakoutPrice) then bullBreakoutPrice else Double.NaN;
BullBreakout.SetDefaultColor(Color.YELLOW);
BullBreakout.SetStyle(Curve.LONG_DASH);

plot BullStop = if showOrders and !IsNaN(bullStopLoss) then bullStopLoss else Double.NaN;
BullStop.SetDefaultColor(Color.RED);
BullStop.SetStyle(Curve.LONG_DASH);

plot BullTarget = if showOrders and !IsNaN(bullTarget) then bullTarget else Double.NaN;
BullTarget.SetDefaultColor(Color.GREEN);
BullTarget.SetStyle(Curve.LONG_DASH);

plot BearBreakout = if showOrders and !IsNaN(bearBreakoutPrice) then bearBreakoutPrice else Double.NaN;
BearBreakout.SetDefaultColor(Color.YELLOW);
BearBreakout.SetStyle(Curve.LONG_DASH);

plot BearStop = if showOrders and !IsNaN(bearStopLoss) then bearStopLoss else Double.NaN;
BearStop.SetDefaultColor(Color.RED);
BearStop.SetStyle(Curve.LONG_DASH);

plot BearTarget = if showOrders and !IsNaN(bearTarget) then bearTarget else Double.NaN;
BearTarget.SetDefaultColor(Color.GREEN);
BearTarget.SetStyle(Curve.LONG_DASH);

# Background coloring for trend
AssignPriceColor(if bullEmaIndex == 3 then Color.DARK_GREEN 
                else if bearEmaIndex == 3 then Color.DARK_RED 
                else Color.CURRENT);

#=============================================================================
# INFORMATION DISPLAY
#=============================================================================

# Status labels
def isLastBar = IsLast(BarNumber(), 0);

AddLabel(showInfo and isLastBar, "SCDTM Strategy", Color.WHITE);

AddLabel(showInfo and isLastBar, "EMA: " + 
         (if cp1 then "✓ " + bullEmaIndex + "B/" + bearEmaIndex + "S" else "✗ Waiting"), 
         if cp1 then Color.GREEN else Color.RED);

AddLabel(showInfo and isLastBar, "%B/RSI: " + (if cp2 then "✓" else "✗"), 
         if cp2 then Color.GREEN else Color.RED);

AddLabel(showInfo and isLastBar, "Fractal: " + (if cp3 then "✓" else "✗"), 
         if cp3 then Color.GREEN else Color.RED);

AddLabel(showInfo and isLastBar and !IsNaN(riskAmount), "Risk: $" + riskAmount, Color.YELLOW);

AddLabel(showInfo and isLastBar and longSetupReady, 
         "Long Setup: Entry " + bullBreakoutPrice + " | Stop " + bullStopLoss + " | Target " + bullTarget, 
         Color.GREEN);

AddLabel(showInfo and isLastBar and shortSetupReady, 
         "Short Setup: Entry " + bearBreakoutPrice + " | Stop " + bearStopLoss + " | Target " + bearTarget, 
         Color.RED);

AddLabel(showInfo and isLastBar and bullPositionSize > 0, "Long Size: " + bullPositionSize, Color.GREEN);
AddLabel(showInfo and isLastBar and bearPositionSize > 0, "Short Size: " + bearPositionSize, Color.RED);

#=============================================================================
# ALERT CONDITIONS
#=============================================================================

# Setup alerts
Alert(longSetupReady and !longSetupReady[1], "SCDTM Long Setup Ready on " + GetSymbol(), Alert.BAR, Sound.Chimes);
Alert(shortSetupReady and !shortSetupReady[1], "SCDTM Short Setup Ready on " + GetSymbol(), Alert.BAR, Sound.Chimes);

# Entry alerts
Alert(longEntry, "SCDTM Long Entry Triggered on " + GetSymbol() + " at " + close, Alert.BAR, Sound.Bell);
Alert(shortEntry, "SCDTM Short Entry Triggered on " + GetSymbol() + " at " + close, Alert.BAR, Sound.Bell);

#=============================================================================
# SCANNER CONDITIONS
#=============================================================================

# Scan plots for use in TOS scanner
plot ScanLongSetup = longSetupReady;
plot ScanShortSetup = shortSetupReady;
plot ScanLongEntry = longEntry;
plot ScanShortEntry = shortEntry;
plot ScanAnySetup = longSetupReady or shortSetupReady;
plot ScanAnyEntry = longEntry or shortEntry;

# Additional scan criteria
plot ScanBullTrend = bullEmaIndex == 3;
plot ScanBearTrend = bearEmaIndex == 3;
plot ScanCP1 = cp1;
plot ScanCP2 = cp2;
plot ScanCP3 = cp3;

# Hide scanner plots from chart
ScanLongSetup.Hide();
ScanShortSetup.Hide();
ScanLongEntry.Hide();
ScanShortEntry.Hide();
ScanAnySetup.Hide();
ScanAnyEntry.Hide();
ScanBullTrend.Hide();
ScanBearTrend.Hide();
ScanCP1.Hide();
ScanCP2.Hide();
ScanCP3.Hide();

#=============================================================================
# STRATEGY NOTES
#=============================================================================

# Strategy implementation notes:
# 1. This strategy requires TOS Pro features for multi-timeframe analysis
# 2. Position sizing is calculated based on risk per trade
# 3. Orders are automatically placed when conditions are met
# 4. Use scanner conditions to find potential setups across multiple symbols
# 5. Adjust risk parameters based on account size and risk tolerance
# 6. Monitor performance and adjust parameters as needed

# Usage Instructions:
# 1. Add this strategy to your TOS chart
# 2. Configure input parameters for your risk tolerance
# 3. Enable alerts for setup and entry notifications
# 4. Use scanner to find setups across multiple symbols
# 5. Monitor trade execution and manage positions accordingly