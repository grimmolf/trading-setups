# SCDTM Strategy - Technical Implementation Pseudocode

## Strategy Architecture Overview

The SCDTM strategy uses a **checkpoint-based validation system** where each checkpoint must be satisfied before proceeding to the next level. This creates a highly selective but accurate signal generation process.

---

## Global Variables and State Management

### Core State Variables
```pseudocode
// Trade state tracking
var tradeState = 0  // 0=No trade, 1=Setup pending, 2=Long active, 3=Short active

// Checkpoint states
var cp1 = 0  // Multi-timeframe EMA alignment
var cp2 = 0  // %B and Stochastic RSI confirmation
var cp3 = 0  // Fractal pattern formation
var cp4 = 0  // Persistent breakout signal
var cp5 = 0  // Breakout confirmation and trade entry

// Position management
var bull_breakout_price = na
var bear_breakout_price = na
var bull_fractal_sl = na
var bear_fractal_sl = na
var fractal_dist = na
var fractal_tgt = na

// Trade tracking
var longClose = 0
var shortClose = 0
var longCloseTgt = 0
var shortCloseTgt = 0
```

### Input Parameters
```pseudocode
INPUTS:
    src = close                    // Price source
    rr = 2.25                     // Risk/reward ratio
    USDRiskPerTrade = 1           // Fixed USD risk amount
    n = 2                         // Fractal periods
    fractalBars = "5"             // 3 or 5 bar fractals
    
    // Bollinger Band %B
    length_bbr = 20
    mult_bbr = 2.0
    upper_thresh = 1.00
    lower_thresh = 0.00
    
    // Stochastic RSI
    smoothK = 3
    smoothD = 3
    lengthRSI = 14
    lengthStoch = 14
```

---

## Checkpoint 1: Multi-Timeframe EMA Alignment

### Purpose
Ensure institutional bias across multiple timeframes pointing in same direction.

### Implementation
```pseudocode
FUNCTION calculateEMAAlignment():
    // Calculate EMAs for current timeframe
    ema9 = EMA(src, 9)
    ema18 = EMA(src, 18)
    
    // Get higher timeframe EMAs
    ema9_Daily = security(symbol, "D", ema9)
    ema18_Daily = security(symbol, "D", ema18)
    ema9_4H = security(symbol, "240", ema9)
    ema18_4H = security(symbol, "240", ema18)
    ema9_1H = security(symbol, "60", ema9)
    ema18_1H = security(symbol, "60", ema18)
    
    // Calculate individual timeframe bias
    bull_ema_daily = (ema9_Daily >= ema18_Daily) ? 1 : 0
    bull_ema_4H = (ema9_4H >= ema18_4H) ? 1 : 0
    bull_ema_1H = (ema9_1H >= ema18_1H) ? 1 : 0
    
    bear_ema_daily = (ema9_Daily < ema18_Daily) ? 1 : 0
    bear_ema_4H = (ema9_4H < ema18_4H) ? 1 : 0
    bear_ema_1H = (ema9_1H < ema18_1H) ? 1 : 0
    
    // Consolidate alignment
    bull_ema_index = bull_ema_daily + bull_ema_4H + bull_ema_1H
    bear_ema_index = bear_ema_daily + bear_ema_4H + bear_ema_1H
    
    // Set checkpoint 1
    IF (bull_ema_index == 3) OR (bear_ema_index == 3):
        cp1 = 1
    ELSE:
        cp1 = 0
    
    RETURN bull_ema_index, bear_ema_index, cp1
```

---

## Checkpoint 2: Bollinger Band %B and Stochastic RSI

### Purpose
With trend alignment confirmed, look for return-to-mean signals supporting trend direction.

### Bollinger Band %B Implementation
```pseudocode
FUNCTION calculateBollingerBandPercent():
    // Calculate Bollinger Bands
    basis_bbr = SMA(src, length_bbr)
    dev_bbr = mult_bbr * STDEV(src, length_bbr)
    upper_bbr = basis_bbr + dev_bbr
    lower_bbr = basis_bbr - dev_bbr
    
    // Calculate %B
    bbr = (src - lower_bbr) / (upper_bbr - lower_bbr)
    
    // Long %B signal (oversold with potential reversal)
    IF bbr <= lower_thresh:
        long_bbr = 1
    IF bbr >= 0.55 AND long_bbr == 1:
        long_bbr = 0  // Reset if signal gets stale
    
    // Short %B signal (overbought with potential reversal)
    IF bbr >= upper_thresh:
        short_bbr = 1
    IF bbr <= 0.45 AND short_bbr == 1:
        short_bbr = 0  // Reset if signal gets stale
    
    RETURN long_bbr, short_bbr, bbr
```

### Stochastic RSI Implementation
```pseudocode
FUNCTION calculateStochasticRSI():
    // Calculate base RSI
    rsi1 = RSI(src, lengthRSI)
    
    // Apply Stochastic to RSI
    stoch_rsi = STOCH(rsi1, rsi1, rsi1, lengthStoch)
    k = SMA(stoch_rsi, smoothK)  // Fast line
    d = SMA(k, smoothD)          // Slow line
    
    // Signal generation
    IF k >= d:
        long_rsi = 1   // Fast above slow (bullish momentum)
    ELSE:
        long_rsi = 0
    
    IF d >= k:
        short_rsi = 1  // Slow above fast (bearish momentum)
    ELSE:
        short_rsi = 0
    
    RETURN k, d, long_rsi, short_rsi
```

### Checkpoint 2 Validation
```pseudocode
FUNCTION validateCheckpoint2():
    // Requires trending EMAs AND %B signal AND Stochastic RSI agreement
    long_setup = (bull_ema_index == 3) AND (long_bbr == 1) AND (long_rsi == 1)
    short_setup = (bear_ema_index == 3) AND (short_bbr == 1) AND (short_rsi == 1)
    
    IF long_setup OR short_setup:
        cp2 = 1
    ELSE:
        cp2 = 0
    
    RETURN cp2
```

---

## Checkpoint 3: Fractal Pattern Recognition

### Purpose
Identify key swing points for potential breakout entries when trend and momentum align.

### Fractal Detection Implementation
```pseudocode
FUNCTION detectFractals():
    // 5-bar fractal detection (default)
    IF fractalBars == "5":
        // Down fractal (resistance high)
        dnFractal = (high[n-2] < high[n]) AND 
                   (high[n-1] < high[n]) AND 
                   (high[n+1] < high[n]) AND 
                   (high[n+2] < high[n])
        
        // Up fractal (support low)
        upFractal = (low[n-2] > low[n]) AND 
                   (low[n-1] > low[n]) AND 
                   (low[n+1] > low[n]) AND 
                   (low[n+2] > low[n])
    
    // 3-bar fractal detection (alternative)
    ELSE IF fractalBars == "3":
        dnFractal = (high[n-1] < high[n]) AND (high[n+1] < high[n])
        upFractal = (low[n-1] > low[n]) AND (low[n+1] > low[n])
    
    RETURN upFractal, dnFractal
```

### Checkpoint 3 Validation
```pseudocode
FUNCTION validateCheckpoint3():
    // Exclude fractal signals during close events
    exclude_condition = longClose[2] OR shortClose[2] OR 
                       longCloseTgt[2] OR shortCloseTgt[2]
    
    // Valid fractal conditions
    bull_fractal_valid = upFractal AND (bull_ema_index == 3) AND (tradeState == 0)
    bear_fractal_valid = dnFractal AND (bear_ema_index == 3) AND (tradeState == 0)
    
    IF (cp2 == 1) AND NOT exclude_condition AND (bull_fractal_valid OR bear_fractal_valid):
        cp3 = 1
        cp4 = 1  // Set persistent signal for breakout detection
        
        // Reset close signals for clean setup
        longClose = 0
        shortClose = 0
        longCloseTgt = 0
        shortCloseTgt = 0
    ELSE:
        cp3 = 0
    
    RETURN cp3, cp4
```

---

## Checkpoint 4: Breakout Level Calculation

### Purpose
When fractal pattern forms, calculate key levels for trade management.

### Level Calculation Implementation
```pseudocode
FUNCTION calculateBreakoutLevels():
    // Bull fractal setup levels
    IF change(cp4) AND cp4 == 1 AND bull_ema_index == 3:
        bull_fractal_sl = valuewhen(upFractal, low[2], 0) - (1 * mintick)
        bull_breakout_price = valuewhen(upFractal, high, 0) + (1 * mintick)
        
        fractal_dist = bull_breakout_price - bull_fractal_sl
        fractal_tgt = bull_breakout_price + (fractal_dist * rr)
        
        tradeState = 1  // Setup pending breakout
        
        // Position sizing
        TradeSizeInXBT = USDRiskPerTrade / fractal_dist
        TradeSizeInUSD = round(bull_breakout_price * TradeSizeInXBT)
    
    // Bear fractal setup levels
    IF change(cp4) AND cp4 == 1 AND bear_ema_index == 3:
        bear_fractal_sl = valuewhen(dnFractal, high[2], 0) + (1 * mintick)
        bear_breakout_price = valuewhen(dnFractal, low, 0) - (1 * mintick)
        
        fractal_dist = bear_fractal_sl - bear_breakout_price
        fractal_tgt = bear_breakout_price - (fractal_dist * rr)
        
        tradeState = 1  // Setup pending breakout
        
        // Position sizing
        TradeSizeInXBT = USDRiskPerTrade / fractal_dist
        TradeSizeInUSD = round(bear_breakout_price * TradeSizeInXBT)
```

### Setup Invalidation Logic
```pseudocode
FUNCTION checkSetupInvalidation():
    // Bull setup invalidation (stop hit before breakout)
    IF (low < bull_fractal_sl) AND (bull_ema_index == 3) AND (tradeState == 0 OR tradeState == 1):
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
    
    // Bear setup invalidation (stop hit before breakout)
    IF (high > bear_fractal_sl) AND (bear_ema_index == 3) AND (tradeState == 0 OR tradeState == 1):
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
```

---

## Checkpoint 5: Breakout Confirmation and Entry

### Purpose
Execute trade when price breaks out of fractal pattern with trend alignment.

### Breakout Detection Implementation
```pseudocode
FUNCTION detectBreakout():
    // Bull breakout confirmation
    IF cp4 == 1 AND (high >= bull_breakout_price) AND (bull_ema_index >= 2):
        tradeState = 2  // Active long position
        cp5 = 1
        
        // Generate entry alert
        alert("Entry Buy: Long position at " + bull_breakout_price)
    
    // Bear breakout confirmation  
    IF cp4 == 1 AND (low <= bear_breakout_price) AND (bear_ema_index >= 2):
        tradeState = 3  // Active short position
        cp5 = 1
        
        // Generate entry alert
        alert("Entry Sell: Short position at " + bear_breakout_price)
```

---

## Trade Management System

### Stop Loss Management
```pseudocode
FUNCTION manageStopLoss():
    // Long position stop loss
    IF (low < bull_fractal_sl) AND (tradeState == 2) AND NOT longCloseTgt[1]:
        longClose = 1
        alert("Long Close Loss: Stop loss hit")
    ELSE:
        longClose = 0
    
    // Short position stop loss
    IF (high > bear_fractal_sl) AND (tradeState == 3) AND NOT shortCloseTgt[1]:
        shortClose = 1
        alert("Short Close Loss: Stop loss hit")
    ELSE:
        shortClose = 0
```

### Take Profit Management
```pseudocode
FUNCTION manageTakeProfit():
    // Long position take profit
    IF (high >= fractal_tgt) AND (tradeState == 2) AND NOT longClose[1]:
        longCloseTgt = 1
        alert("Long Close Win: Target reached")
    ELSE:
        longCloseTgt = 0
    
    // Short position take profit
    IF (low <= fractal_tgt) AND (tradeState == 3) AND NOT shortClose[1]:
        shortCloseTgt = 1
        alert("Short Close Win: Target reached")
    ELSE:
        shortCloseTgt = 0
```

### Trade Cleanup and Reset
```pseudocode
FUNCTION cleanupCompletedTrade():
    // Cleanup after stop loss
    IF change(longClose[1]) AND longClose[1] == 1:
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
        plotLossCounter = plotLossCounter + 1
    
    IF change(shortClose[1]) AND shortClose[1] == 1:
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
        plotLossCounter = plotLossCounter + 1
    
    // Cleanup after take profit
    IF change(longCloseTgt[1]) AND longCloseTgt[1] == 1:
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
        plotWinCounter = plotWinCounter + 1
    
    IF change(shortCloseTgt[1]) AND shortCloseTgt[1] == 1:
        resetAllLevels()
        resetAllCheckpoints()
        tradeState = 0
        plotWinCounter = plotWinCounter + 1
```

---

## Utility Functions

### Reset Functions
```pseudocode
FUNCTION resetAllLevels():
    bull_fractal_sl = na
    bear_fractal_sl = na
    bull_breakout_price = na
    bear_breakout_price = na
    fractal_dist = na
    fractal_tgt = na

FUNCTION resetAllCheckpoints():
    cp2 = 0
    cp3 = 0
    cp4 = 0
    cp5 = 0
```

### Position Sizing Calculation
```pseudocode
FUNCTION calculatePositionSize(riskAmount, stopDistance):
    positionSize = riskAmount / stopDistance
    positionValueUSD = round(entryPrice * positionSize)
    RETURN positionSize, positionValueUSD
```

### Alert Generation
```pseudocode
FUNCTION generateAutoViewAlert(direction, symbol, positionSize):
    IF direction == "long":
        message = "c=position e=bitmex s=" + symbol + " t=market ro=1 | " +
                 "e=bitmex s=" + symbol + " b=long q=" + positionSize + " l=1 t=market"
    ELSE:
        message = "c=position e=bitmex s=" + symbol + " t=market ro=1 | " +
                 "e=bitmex s=" + symbol + " b=short q=" + positionSize + " l=1 t=market"
    
    alert(message)
```

---

## Main Strategy Loop

### Primary Execution Flow
```pseudocode
FUNCTION main():
    // Phase 1: Calculate multi-timeframe EMA alignment
    bull_ema_index, bear_ema_index, cp1 = calculateEMAAlignment()
    
    // Phase 2: Check for return-to-mean signals
    IF cp1 == 1:
        long_bbr, short_bbr, bbr = calculateBollingerBandPercent()
        k, d, long_rsi, short_rsi = calculateStochasticRSI()
        cp2 = validateCheckpoint2()
    
    // Phase 3: Look for fractal patterns
    IF cp2 == 1:
        upFractal, dnFractal = detectFractals()
        cp3, cp4 = validateCheckpoint3()
    
    // Phase 4: Calculate breakout levels
    IF cp4 == 1:
        calculateBreakoutLevels()
        checkSetupInvalidation()
    
    // Phase 5: Monitor for breakouts
    IF cp4 == 1 AND tradeState == 1:
        detectBreakout()
    
    // Phase 6: Manage active trades
    IF tradeState == 2 OR tradeState == 3:
        manageStopLoss()
        manageTakeProfit()
        cleanupCompletedTrade()
    
    // Update displays and alerts
    updatePlotsAndAlerts()
```

---

## Performance Tracking

### Statistics Management
```pseudocode
FUNCTION updateStatistics():
    // Track win/loss counters
    plotWinCounter = persistent counter for wins
    plotLossCounter = persistent counter for losses
    
    // Display statistics on chart
    IF trade_closed:
        display("Win: " + plotWinCounter + 
               "\nLoss: " + plotLossCounter + 
               "\nBE: " + plotBECounter)
```

This pseudocode provides a complete technical blueprint for implementing the SCDTM strategy across any trading platform while maintaining the original logic and risk management principles.