# IWBDT Strategy - ThinkScript Indicator
# It Will Break Down/Through - Multi-Timeframe Fractal Breakout System
# Adapted for TD Ameritrade ThinkOrSwim Platform

declare upper;

# Input Parameters
input FirstAddTF = AggregationPeriod.HOUR;
input SecondAddTF = AggregationPeriod.FOUR_HOURS;
input ThirdAddTF = AggregationPeriod.DAY;

input EMA_Short_period = 9;
input EMA_Long_period = 18;
input rr = 2.0;
input USDRiskPerTrade = 20;
input IncludeCT = no;

# Visual Settings
input HideBackground = no;
input showSignals = yes;
input showLevels = yes;
input showStatistics = yes;

# ATR settings
input ATR_Length = 14;

# Multi-Timeframe EMA Calculation
def FirstAddTF_ema_short = ExpAverage(close, EMA_Short_period);
def FirstAddTF_ema_long = ExpAverage(close, EMA_Long_period);

def SecondAddTF_close = close(period = SecondAddTF);
def SecondAddTF_ema_short = ExpAverage(SecondAddTF_close, EMA_Short_period);
def SecondAddTF_ema_long = ExpAverage(SecondAddTF_close, EMA_Long_period);

def ThirdAddTF_close = close(period = ThirdAddTF);
def ThirdAddTF_ema_short = ExpAverage(ThirdAddTF_close, EMA_Short_period);
def ThirdAddTF_ema_long = ExpAverage(ThirdAddTF_close, EMA_Long_period);

# Current timeframe EMAs
def ctf_ema_short = ExpAverage(close, EMA_Short_period);
def ctf_ema_long = ExpAverage(close, EMA_Long_period);

# Trend direction calculation
def FirstAddTF_Bull = if FirstAddTF_ema_short > FirstAddTF_ema_long then 1 else 0;
def SecondAddTF_Bull = if SecondAddTF_ema_short > SecondAddTF_ema_long then 1 else 0;
def ThirdAddTF_Bull = if ThirdAddTF_ema_short > ThirdAddTF_ema_long then 1 else 0;

def FirstAddTF_Bear = if FirstAddTF_ema_short < FirstAddTF_ema_long then 1 else 0;
def SecondAddTF_Bear = if SecondAddTF_ema_short < SecondAddTF_ema_long then 1 else 0;
def ThirdAddTF_Bear = if ThirdAddTF_ema_short < ThirdAddTF_ema_long then 1 else 0;

# Full trend alignment (3/3 timeframes)
def L_TF_Bull = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull) == 3 then 1 else 0;
def L_TF_Bear = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear) == 3 then 1 else 0;

# Partial trend alignment (2/3 timeframes)
def L_TF_Bull_partial = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull) == 2 then 1 else 0;
def L_TF_Bear_partial = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear) == 2 then 1 else 0;

# Current timeframe trend
def CT_Bull = if ctf_ema_short > ctf_ema_long then 1 else 0;
def CT_Bear = if ctf_ema_short < ctf_ema_long then 1 else 0;

# All timeframes including current (4/4)
def All_TF_Bull = if (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull + CT_Bull) == 4 then 1 else 0;
def All_TF_Bear = if (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear + CT_Bear) == 4 then 1 else 0;

# Final trend determination
def BullTrend = if IncludeCT then All_TF_Bull else L_TF_Bull;
def BearTrend = if IncludeCT then All_TF_Bear else L_TF_Bear;

# ATR-based Risk Management
def Min_Trade_Risk = ATR(ATR_Length);
def Max_Trade_Risk = 2 * ATR(ATR_Length);

# Fractal Detection
def topfractal = high[3] < high[2] and high[2] > high[1] and BullTrend == 0 and BearTrend == 1;
def botfractal = low[3] > low[2] and low[2] < low[1] and BullTrend == 1 and BearTrend == 0;

# Fractal confirmation with risk filters
def topfractalconfirmed = high[3] < high[2] and high[2] > high[1] and BearTrend == 1 and 
                          low < low[1] and 
                          (high[2] - low[1]) > Min_Trade_Risk and (high[2] - low[1]) < Max_Trade_Risk;

def botfractalconfirmed = low[3] > low[2] and low[2] < low[1] and BullTrend == 1 and 
                          high > high[1] and 
                          (high[1] - low[2]) > Min_Trade_Risk and (high[1] - low[2]) < Max_Trade_Risk;

# Trade Level Calculation
def StopLevel = if topfractalconfirmed then high[2] else if botfractalconfirmed then low[2] else Double.NaN;
def EntryLevel = if topfractalconfirmed or botfractalconfirmed then close else Double.NaN;
def stopdistance = if topfractalconfirmed then StopLevel - EntryLevel else if botfractalconfirmed then EntryLevel - StopLevel else Double.NaN;
def TPLevel = if topfractalconfirmed then EntryLevel - (rr * stopdistance) else if botfractalconfirmed then EntryLevel + (rr * stopdistance) else Double.NaN;
def BELevel = if topfractalconfirmed then EntryLevel - stopdistance else if botfractalconfirmed then EntryLevel + stopdistance else Double.NaN;

# Position Sizing
def TradeSizeInUSD = if !IsNaN(stopdistance) and stopdistance > 0 then Round(USDRiskPerTrade / stopdistance, 0) else 0;

# Visual Elements
# Background Colors
AssignBackgroundColor(if !HideBackground and BullTrend then Color.DARK_GREEN else 
                      if !HideBackground and BearTrend then Color.DARK_RED else 
                      if !HideBackground and L_TF_Bull_partial then Color.DARK_GRAY else 
                      if !HideBackground and L_TF_Bear_partial then Color.MAGENTA else Color.CURRENT);

# Fractal Markers
plot TopFractal = if showSignals and topfractal then high[2] + (0.002 * close) else Double.NaN;
TopFractal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
TopFractal.SetDefaultColor(Color.RED);
TopFractal.SetLineWeight(3);

plot BotFractal = if showSignals and botfractal then low[2] - (0.002 * close) else Double.NaN;
BotFractal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BotFractal.SetDefaultColor(Color.GREEN);
BotFractal.SetLineWeight(3);

# Entry Confirmation Markers
plot TopFractalConfirmed = if showSignals and topfractalconfirmed then high + (0.001 * close) else Double.NaN;
TopFractalConfirmed.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
TopFractalConfirmed.SetDefaultColor(Color.YELLOW);
TopFractalConfirmed.SetLineWeight(5);

plot BotFractalConfirmed = if showSignals and botfractalconfirmed then low - (0.001 * close) else Double.NaN;
BotFractalConfirmed.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BotFractalConfirmed.SetDefaultColor(Color.WHITE);
BotFractalConfirmed.SetLineWeight(5);

# Trade Levels
plot StopLevelPlot = if showLevels and !IsNaN(StopLevel) then StopLevel else Double.NaN;
StopLevelPlot.SetDefaultColor(Color.RED);
StopLevelPlot.SetLineWeight(2);

plot EntryLevelPlot = if showLevels and !IsNaN(EntryLevel) then EntryLevel else Double.NaN;
EntryLevelPlot.SetDefaultColor(Color.WHITE);
EntryLevelPlot.SetLineWeight(2);

plot BELevelPlot = if showLevels and !IsNaN(BELevel) then BELevel else Double.NaN;
BELevelPlot.SetDefaultColor(Color.BLUE);
BELevelPlot.SetLineWeight(1);

plot TPLevelPlot = if showLevels and !IsNaN(TPLevel) then TPLevel else Double.NaN;
TPLevelPlot.SetDefaultColor(Color.GREEN);
TPLevelPlot.SetLineWeight(2);

# EMAs for reference
plot EMAShort = ctf_ema_short;
EMAShort.SetDefaultColor(Color.BLUE);
EMAShort.SetLineWeight(1);

plot EMALong = ctf_ema_long;
EMALong.SetDefaultColor(Color.RED);
EMALong.SetLineWeight(1);

# Alerts
Alert(topfractalconfirmed, "IWBDT Short Entry Signal", Alert.BAR, Sound.BELL);
Alert(botfractalconfirmed, "IWBDT Long Entry Signal", Alert.BAR, Sound.BELL);
Alert(BullTrend and !BullTrend[1], "IWBDT Bull Trend Activated", Alert.BAR, Sound.DING);
Alert(BearTrend and !BearTrend[1], "IWBDT Bear Trend Activated", Alert.BAR, Sound.DING);

# Information Labels
def trendScore = FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull;
def bearScore = FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear;

AddLabel(yes, "IWBDT: " + 
    (if BullTrend then "BULL TREND" else 
     if BearTrend then "BEAR TREND" else 
     if L_TF_Bull_partial then "BULL PARTIAL (" + trendScore + "/3)" else 
     if L_TF_Bear_partial then "BEAR PARTIAL (" + bearScore + "/3)" else 
     "NO TREND"), 
    if BullTrend then Color.GREEN else 
    if BearTrend then Color.RED else 
    if L_TF_Bull_partial then Color.BLUE else 
    if L_TF_Bear_partial then Color.MAGENTA else Color.GRAY);

AddLabel(showStatistics, "Risk: $" + USDRiskPerTrade + " | R:R: " + rr + ":1 | ATR: " + Round(Min_Trade_Risk, 2), Color.CYAN);

# Current Position Status
def currentSignal = if topfractalconfirmed then -1 else if botfractalconfirmed then 1 else 0;
AddLabel(currentSignal != 0, 
    "SIGNAL: " + (if currentSignal > 0 then "LONG" else "SHORT") + 
    " | Entry: " + Round(EntryLevel, 2) + 
    " | Stop: " + Round(StopLevel, 2) + 
    " | Target: " + Round(TPLevel, 2) + 
    " | Size: $" + TradeSizeInUSD,
    if currentSignal > 0 then Color.GREEN else Color.RED);

# Timeframe Information
AddLabel(showStatistics, "TF: " + 
    (if FirstAddTF_Bull then "1H✓" else if FirstAddTF_Bear then "1H✗" else "1H~") + " | " +
    (if SecondAddTF_Bull then "4H✓" else if SecondAddTF_Bear then "4H✗" else "4H~") + " | " +
    (if ThirdAddTF_Bull then "D✓" else if ThirdAddTF_Bear then "D✗" else "D~"),
    Color.YELLOW);

# Risk Management Information
AddLabel(!IsNaN(stopdistance) and stopdistance > 0, 
    "Stop Distance: " + Round(stopdistance, 2) + " | Risk Valid: " + 
    (if stopdistance >= Min_Trade_Risk and stopdistance <= Max_Trade_Risk then "YES" else "NO"),
    if stopdistance >= Min_Trade_Risk and stopdistance <= Max_Trade_Risk then Color.GREEN else Color.RED);

# Performance Tracking (simplified)
def longSignals = TotalSum(if botfractalconfirmed then 1 else 0);
def shortSignals = TotalSum(if topfractalconfirmed then 1 else 0);
def totalSignals = longSignals + shortSignals;

AddLabel(showStatistics, "Signals: " + totalSignals + " (L:" + longSignals + " S:" + shortSignals + ")", Color.WHITE);