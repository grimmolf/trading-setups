# IWBDT Strategy - Pseudocode Implementation

## Overview

This document provides the detailed implementation logic for the IWBDT (It Will Break Down/Through) Strategy, a multi-timeframe fractal breakout system with automated trade management.

## Core Data Structures

### Trade State Variables
```
TradeState {
    tradeactive: boolean (default: false)
    Longtradeactive: boolean (default: false)
    Shorttradeactive: boolean (default: false)
    Breakevenactive: boolean (default: false)
}
```

### Trade Levels
```
TradeLevels {
    StopLevel: float (default: 0.0)
    EntryLevel: float (default: 0.0)
    TPLevel: float (default: 0.0)
    BELevel: float (default: 0.0)
    stopdistance: float (default: 0.0)
}
```

### Position Sizing
```
PositionData {
    TradeSizeInXBT: float (default: 0.0)
    TradeSizeInUSD: integer (default: 0)
    PositionMarginXBT: float (default: 0.0)
    MaxPosMarginXBT: float (default: 0.0)
}
```

### Performance Tracking
```
Statistics {
    PlotWinCounter: integer (default: 0)
    PlotLossCounter: integer (default: 0)
    PlotBreakEvenCounter: integer (default: 0)
    EquityCurve: float (calculated)
}
```

## Input Parameters

### Timeframe Configuration
```
INPUTS:
    FirstAddTF = "60"      // 1 hour
    SecondAddTF = "240"    // 4 hours
    ThirdAddTF = "D"       // Daily
    
    EMA_Short_period = 9   // Fast EMA
    EMA_Long_period = 18   // Slow EMA
    
    IncludeCT = false      // Include current timeframe
```

### Risk Management
```
RISK_INPUTS:
    Min_Trade_Risk = ATR(14)      // Minimum stop distance
    Max_Trade_Risk = 2 * ATR(14)  // Maximum stop distance
    rr = 2                        // Risk/Reward ratio
    USDRiskPerTrade = 20          // Fixed risk amount
    Leverage = 1                  // Position leverage
```

### Visual Settings
```
VISUAL_INPUTS:
    HideBackground = false
    bgcolorBullTransp = 55
    bgcolorBearTransp = 55
    bgcolorBullPartialTransp = 70
    bgcolorBearPartialTransp = 70
    HideStatistics = false
    DisplayEquityCurve = false
```

## Multi-Timeframe Trend Calculation

### EMA Data Collection
```
FUNCTION collectTimeframeData():
    // Get EMA values for each timeframe
    FirstAddTF_ema_short = security(symbol, FirstAddTF, EMA(close, EMA_Short_period))
    FirstAddTF_ema_long = security(symbol, FirstAddTF, EMA(close, EMA_Long_period))
    
    SecondAddTF_ema_short = security(symbol, SecondAddTF, EMA(close, EMA_Short_period))
    SecondAddTF_ema_long = security(symbol, SecondAddTF, EMA(close, EMA_Long_period))
    
    ThirdAddTF_ema_short = security(symbol, ThirdAddTF, EMA(close, EMA_Short_period))
    ThirdAddTF_ema_long = security(symbol, ThirdAddTF, EMA(close, EMA_Long_period))
    
    // Current timeframe EMAs
    ctf_ema_short = EMA(close, EMA_Short_period)
    ctf_ema_long = EMA(close, EMA_Long_period)
    
    RETURN all EMA values
```

### Trend Direction Calculation
```
FUNCTION calculateTrendDirection():
    // Bull trend scoring
    FirstAddTF_Bull = IF FirstAddTF_ema_short > FirstAddTF_ema_long THEN 1 ELSE 0
    SecondAddTF_Bull = IF SecondAddTF_ema_short > SecondAddTF_ema_long THEN 1 ELSE 0
    ThirdAddTF_Bull = IF ThirdAddTF_ema_short > ThirdAddTF_ema_long THEN 1 ELSE 0
    
    // Bear trend scoring
    FirstAddTF_Bear = IF FirstAddTF_ema_short < FirstAddTF_ema_long THEN 1 ELSE 0
    SecondAddTF_Bear = IF SecondAddTF_ema_short < SecondAddTF_ema_long THEN 1 ELSE 0
    ThirdAddTF_Bear = IF ThirdAddTF_ema_short < ThirdAddTF_ema_long THEN 1 ELSE 0
    
    // Full alignment (3/3)
    L_TF_Bull = (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull == 3)
    L_TF_Bear = (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear == 3)
    
    // Partial alignment (2/3)
    L_TF_Bull_partial = (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull == 2)
    L_TF_Bear_partial = (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear == 2)
    
    // Current timeframe
    CT_Bull = IF ctf_ema_short > ctf_ema_long THEN 1 ELSE 0
    CT_Bear = IF ctf_ema_short < ctf_ema_long THEN 1 ELSE 0
    
    // All timeframes (4/4) if including current
    IF IncludeCT:
        All_TF_Bull = (FirstAddTF_Bull + SecondAddTF_Bull + ThirdAddTF_Bull + CT_Bull == 4)
        All_TF_Bear = (FirstAddTF_Bear + SecondAddTF_Bear + ThirdAddTF_Bear + CT_Bear == 4)
    
    // Final trend determination
    BullTrend = IF IncludeCT THEN All_TF_Bull ELSE L_TF_Bull
    BearTrend = IF IncludeCT THEN All_TF_Bear ELSE L_TF_Bear
    
    RETURN BullTrend, BearTrend, partial trends
```

## Fractal Pattern Detection

### Top Fractal (Bearish)
```
FUNCTION detectTopFractal():
    // Basic top fractal: High[2] is highest of 3 bars
    topfractal = high[3] < high[2] AND high[2] > high[1] AND BearTrend == true
    
    RETURN topfractal
```

### Bottom Fractal (Bullish)
```
FUNCTION detectBottomFractal():
    // Basic bottom fractal: Low[2] is lowest of 3 bars
    botfractal = low[3] > low[2] AND low[2] < low[1] AND BullTrend == true
    
    RETURN botfractal
```

### Fractal Confirmation
```
FUNCTION confirmFractals():
    // Top fractal confirmed when price breaks below previous low
    topfractalconfirmed = high[3] < high[2] AND 
                         high[2] > high[1] AND 
                         BearTrend == true AND 
                         low < low[1] AND 
                         tradeactive == false AND
                         (high[2] - low[1]) > Min_Trade_Risk AND 
                         (high[2] - low[1]) < Max_Trade_Risk
    
    // Bottom fractal confirmed when price breaks above previous high
    botfractalconfirmed = low[3] > low[2] AND 
                         low[2] < low[1] AND 
                         BullTrend == true AND 
                         high > high[1] AND 
                         tradeactive == false AND
                         (high[1] - low[2]) > Min_Trade_Risk AND 
                         (high[1] - low[2]) < Max_Trade_Risk
    
    RETURN topfractalconfirmed, botfractalconfirmed
```

## Trade Entry Logic

### Short Trade Entry
```
FUNCTION enterShortTrade():
    IF topfractalconfirmed == true:
        // Set trade levels
        StopLevel = high[2]              // Fractal high
        EntryLevel = close               // Current close
        stopdistance = StopLevel - EntryLevel
        TPLevel = EntryLevel - (rr * stopdistance)
        BELevel = EntryLevel - stopdistance
        
        // Calculate position size
        TradeSizeInXBT = USDRiskPerTrade / stopdistance
        TradeSizeInUSD = round(EntryLevel * TradeSizeInXBT / 1000)
        PositionMarginXBT = round(100000 * TradeSizeInXBT / Leverage) / 100000
        MaxPosMarginXBT = round(100000 * USDRiskPerTrade / Min_Trade_Risk / Leverage) / 100000
        
        // Update trade state
        tradeactive = true
        Shorttradeactive = true
        
        // Trigger alert
        ALERT("Short entry signal")
```

### Long Trade Entry
```
FUNCTION enterLongTrade():
    IF botfractalconfirmed == true:
        // Set trade levels
        StopLevel = low[2]               // Fractal low
        EntryLevel = close               // Current close
        stopdistance = EntryLevel - StopLevel
        TPLevel = EntryLevel + (rr * stopdistance)
        BELevel = EntryLevel + stopdistance
        
        // Calculate position size
        TradeSizeInXBT = USDRiskPerTrade / stopdistance
        TradeSizeInUSD = round(EntryLevel * TradeSizeInXBT)
        PositionMarginXBT = round(100000 * TradeSizeInXBT / Leverage) / 100000
        MaxPosMarginXBT = round(100000 * USDRiskPerTrade / Min_Trade_Risk / Leverage) / 100000
        
        // Update trade state
        tradeactive = true
        Longtradeactive = true
        
        // Trigger alert
        ALERT("Long entry signal")
```

## Breakeven Management

### Breakeven Activation
```
FUNCTION checkBreakevenActivation():
    // Get 1-minute data for precise breakeven
    low_m1 = security(symbol, "1", low)
    high_m1 = security(symbol, "1", high)
    
    // Short trade breakeven
    shorttradeBElevelactivation = (low < BELevel) AND NOT (low_m1 < TPLevel)
    
    // Long trade breakeven
    longtradeBElevelactivation = (high > BELevel) AND NOT (high_m1 > TPLevel)
    
    // Activate breakeven
    IF Shorttradeactive AND shorttradeBElevelactivation:
        Breakevenactive = true
    
    IF Longtradeactive AND longtradeBElevelactivation:
        Breakevenactive = true
```

## Trade Exit Logic

### Stop Loss Exit
```
FUNCTION checkStopLoss():
    // Short trade stop loss
    IF Shorttradeactive AND high > StopLevel AND NOT Breakevenactive:
        // Close trade as loss
        tradeactive = false
        Shorttradeactive = false
        PlotLossCounter += 1
        ALERT("Stop loss hit")
    
    // Long trade stop loss
    IF Longtradeactive AND low < StopLevel AND NOT Breakevenactive:
        // Close trade as loss
        tradeactive = false
        Longtradeactive = false
        PlotLossCounter += 1
        ALERT("Stop loss hit")
```

### Breakeven Exit
```
FUNCTION checkBreakevenExit():
    // Handle conflicting candles
    checkConflictingCandles()
    
    // Short trade breakeven
    IF Shorttradeactive AND high > EntryLevel AND Breakevenactive 
       AND NOT Bartype3_a_short AND NOT Bartype4_a_short:
        // Close trade at breakeven
        tradeactive = false
        Shorttradeactive = false
        Breakevenactive = false
        PlotBreakEvenCounter += 1
        ALERT("Breakeven exit")
    
    // Long trade breakeven
    IF Longtradeactive AND low < EntryLevel AND Breakevenactive 
       AND NOT Bartype3_a_long AND NOT Bartype4_a_long:
        // Close trade at breakeven
        tradeactive = false
        Longtradeactive = false
        Breakevenactive = false
        PlotBreakEvenCounter += 1
        ALERT("Breakeven exit")
```

### Take Profit Exit
```
FUNCTION checkTakeProfit():
    // Short trade take profit
    IF Shorttradeactive AND low < TPLevel:
        // Close trade as winner
        tradeactive = false
        Shorttradeactive = false
        Breakevenactive = false
        PlotWinCounter += 1
        ALERT("Take profit hit")
    
    // Long trade take profit
    IF Longtradeactive AND high > TPLevel:
        // Close trade as winner
        tradeactive = false
        Longtradeactive = false
        Breakevenactive = false
        PlotWinCounter += 1
        ALERT("Take profit hit")
```

## Conflicting Candle Handling

### Type 3a Candles
```
FUNCTION handleBartype3a():
    // Candle crosses entry and breakeven with close favorable
    
    // Long: High > BE, Low < Entry, Close > midpoint
    Bartype3_a_long = high > BELevel AND 
                      high < TPLevel AND 
                      low < EntryLevel AND 
                      low > StopLevel AND 
                      close > ((BELevel + EntryLevel) / 2) AND 
                      Longtradeactive
    
    // Short: High > Entry, Low < BE, Close < midpoint
    Bartype3_a_short = high > EntryLevel AND 
                       high < StopLevel AND 
                       low < BELevel AND 
                       low > TPLevel AND 
                       close < ((BELevel + EntryLevel) / 2) AND 
                       Shorttradeactive
    
    // Don't exit on these candles - continue trade
```

### Type 4a Candles
```
FUNCTION handleBartype4a():
    // Candle crosses all levels with close favorable
    
    // Long: High > TP, Low < Entry, Close > BE
    Bartype4_a_long = high > TPLevel AND 
                      low < EntryLevel AND 
                      low > StopLevel AND 
                      close > BELevel AND 
                      Longtradeactive
    
    // Short: High > Entry, Low < TP, Close < BE
    Bartype4_a_short = high > EntryLevel AND 
                       high < StopLevel AND 
                       low < TPLevel AND 
                       close < BELevel AND 
                       Shorttradeactive
    
    // Consider these as winners
```

## Performance Statistics

### Calculate Statistics
```
FUNCTION calculateStatistics():
    // Calculate equity curve
    EquityCurve = (PlotWinCounter * 2 * USDRiskPerTrade) - 
                  (PlotLossCounter * USDRiskPerTrade) - 
                  ((PlotWinCounter + PlotLossCounter + PlotBreakEvenCounter) * commission)
    
    // Calculate percentages
    totalTrades = PlotWinCounter + PlotLossCounter + PlotBreakEvenCounter
    
    IF totalTrades > 0:
        winpercent = round((PlotWinCounter / totalTrades) * 100)
        losspercent = round((PlotLossCounter / totalTrades) * 100)
        bepercent = round((PlotBreakEvenCounter / totalTrades) * 100)
        
        // Risk/Reward success rate
        totalWinLoss = PlotWinCounter + PlotLossCounter
        IF totalWinLoss > 0:
            rrpercent = round((PlotWinCounter / totalWinLoss) * 100)
```

### Display Statistics
```
FUNCTION displayStatistics():
    IF (trade completed) AND NOT HideStatistics:
        label = "Win : " + PlotWinCounter + " (" + winpercent + "%)" +
                "\nLoss : " + PlotLossCounter + " (" + losspercent + "%)" +
                "\nBE : " + PlotBreakEvenCounter + " (" + bepercent + "%)" +
                "\nRate : " + rrpercent + "%"
        
        PLOT_LABEL(label, position=high + ATR(14))
    
    IF DisplayEquityCurve:
        PLOT(EquityCurve, color=yellow, linewidth=3)
```

## Visual Display

### Background Coloring
```
FUNCTION drawBackground():
    IF NOT HideBackground:
        IF BullTrend:
            BGCOLOR(color.green, transparency=bgcolorBullTransp)
        ELSE IF BearTrend:
            BGCOLOR(color.red, transparency=bgcolorBearTransp)
        ELSE IF L_TF_Bull_partial:
            BGCOLOR(color.teal, transparency=bgcolorBullPartialTransp)
        ELSE IF L_TF_Bear_partial:
            BGCOLOR(color.maroon, transparency=bgcolorBearPartialTransp)
```

### Trade Level Visualization
```
FUNCTION drawTradeLevels():
    // Plot levels
    p1 = PLOT(StopLevel, color=red, title="Stop Level")
    p2 = PLOT(EntryLevel, color=white, title="Entry Level")
    p3 = PLOT(BELevel, color=blue, title="Breakeven Level")
    p4 = PLOT(TPLevel, color=green, title="Take Profit Level")
    
    // Fill zones
    FILL(p1, p2, color=red, transparency=65)    // Risk zone
    FILL(p2, p3, color=blue, transparency=65)   // BE zone
    FILL(p3, p4, color=green, transparency=65)  // Profit zone
```

### Signal Markers
```
FUNCTION plotSignals():
    // Fractal markers
    PLOTCHAR(topfractal, char="ˆ", location=abovebar, color=red, offset=-2)
    PLOTCHAR(botfractal, char="ˬ", location=belowbar, color=lime, offset=-2)
    
    // Entry confirmation
    PLOTCHAR(topfractalconfirmed, char="↓", location=abovebar, color=yellow)
    PLOTCHAR(botfractalconfirmed, char="↑", location=belowbar, color=white)
    
    // Trade outcomes
    PLOTCHAR(plotWinshort OR plotWinlong, char="1", color=green)
    PLOTCHAR(plotBreakevenshort OR plotBreakevenlong, char="0", color=blue)
    PLOTCHAR(plotlosshort OR plotlosslong, char="X", color=fuchsia)
```

## Alert System

### Alert Messages
```
FUNCTION generateAlerts():
    // Trend alerts
    ALERT_CONDITION(BullTrend, title="IWBADT Trend Alert Bull")
    ALERT_CONDITION(BearTrend, title="IWBADT Trend Alert Bear")
    
    // Fractal alerts
    ALERT_CONDITION(topfractal, title="IWBADT Fractal Alert Top")
    ALERT_CONDITION(botfractal, title="IWBADT Fractal Alert Bottom")
    
    // Entry alerts with exchange integration
    ALERT_CONDITION(Shorttradetrigger, 
        title="IWBADT Entry Trade Sig Short",
        message="e=bitmex s={{ticker}} b=short l=100 q=5% t=market")
    
    ALERT_CONDITION(Longtradetrigger,
        title="IWBADT Entry Trade Sig Long", 
        message="e=bitmex s={{ticker}} b=long l=100 q=5% t=market")
    
    // Exit alerts
    ALERT_CONDITION(exitSignal,
        title="IWBADT Close Trade",
        message="e=bitmex s={{ticker}} c=position q=100% t=market")
```

## Main Execution Loop

### Initialize
```
FUNCTION initialize():
    // Set all state variables to default
    tradeactive = false
    Longtradeactive = false
    Shorttradeactive = false
    Breakevenactive = false
    
    // Initialize counters
    PlotWinCounter = 0
    PlotLossCounter = 0
    PlotBreakEvenCounter = 0
    
    // Initialize levels
    StopLevel = 0.0
    EntryLevel = 0.0
    TPLevel = 0.0
    BELevel = 0.0
```

### Main Loop
```
FUNCTION main():
    // Calculate multi-timeframe trends
    collectTimeframeData()
    calculateTrendDirection()
    
    // Detect fractals
    topfractal = detectTopFractal()
    botfractal = detectBottomFractal()
    
    // Check for confirmed entries
    IF NOT tradeactive:
        [topconfirmed, botconfirmed] = confirmFractals()
        
        IF topconfirmed:
            enterShortTrade()
        ELSE IF botconfirmed:
            enterLongTrade()
    
    // Manage active trades
    IF tradeactive:
        checkBreakevenActivation()
        checkStopLoss()
        checkBreakevenExit()
        checkTakeProfit()
    
    // Update visuals
    drawBackground()
    drawTradeLevels()
    plotSignals()
    
    // Calculate and display statistics
    calculateStatistics()
    displayStatistics()
    
    // Generate alerts
    generateAlerts()
```

## Error Handling

### Data Validation
```
FUNCTION validateData():
    // Check for valid price data
    IF close == 0 OR volume == 0:
        RETURN error
    
    // Check for valid timeframe data
    IF FirstAddTF_ema_short == na OR FirstAddTF_ema_long == na:
        RETURN error
    
    // Check for valid ATR
    IF ATR(14) == 0:
        RETURN error
```

### Trade Safety Checks
```
FUNCTION tradeSafetyChecks():
    // Prevent multiple positions
    IF tradeactive AND (topfractalconfirmed OR botfractalconfirmed):
        topfractalconfirmed = false
        botfractalconfirmed = false
    
    // Validate stop distance
    IF stopdistance <= 0:
        CANCEL_TRADE()
    
    // Check position size limits
    IF TradeSizeInUSD > accountBalance * 0.1:
        TradeSizeInUSD = accountBalance * 0.1
```

## Implementation Notes

### Performance Considerations
- Use `security()` calls efficiently to avoid repainting
- Calculate ATR once per bar to reduce computation
- Store fractal states to prevent recalculation
- Use bar state checks for real-time vs historical

### Platform-Specific Adaptations
- **TradingView**: Full implementation with all features
- **ThinkScript**: Simplified multi-timeframe logic
- **MT4/MT5**: Requires custom indicator development
- **Python**: Can implement full logic with data feeds

### Testing Recommendations
1. Backtest on minimum 1000 trades
2. Forward test for at least 3 months
3. Verify alert functionality
4. Test conflicting candle scenarios
5. Validate breakeven management

This pseudocode provides the complete implementation framework for the IWBDT Strategy, enabling accurate reproduction across different trading platforms and programming languages.