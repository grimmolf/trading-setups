# GrimmHA Strategy - Pseudocode

## Strategy Logic Breakdown

This document provides a detailed pseudocode breakdown of the GrimmHA Strategy, combining Heikin Ashi pattern recognition with SMMA trend analysis and comprehensive trade management.

---

## Core Components

### 1. Heikin Ashi Calculations

```
FUNCTION calculateHeikinAshi():
    haClose = (open + high + low + close) / 4
    haOpen = firstBar ? (open + close) / 2 : (previousHaOpen + previousHaClose) / 2
    haHigh = maximum(high, haOpen, haClose)
    haLow = minimum(low, haOpen, haClose)
    haColor = haClose > haOpen ? green : red
    RETURN haOpen, haHigh, haLow, haClose, haColor
```

### 2. Doji Pattern Detection

```
FUNCTION detectDoji():
    // Calculate candle body and shadows
    bodyHigh = maximum(close, open)
    bodyLow = minimum(close, open)
    body = bodyHigh - bodyLow
    bodyAverage = EMA(body, 14)
    upperShadow = high - bodyHigh
    lowerShadow = bodyLow - low
    totalRange = high - low
    
    // Doji criteria
    shadowPercent = 5.0
    dojiBodyPercent = 5.0
    shadowEqualsPercent = 100.0
    
    // Check for balanced shadows
    shadowEquals = (upperShadow == lowerShadow) OR 
                  (abs(upperShadow - lowerShadow) / lowerShadow * 100 < shadowEqualsPercent)
    
    // Check for small body
    isDojiBody = (totalRange > 0) AND (body <= totalRange * dojiBodyPercent / 100)
    
    // Exclude specific Doji types
    dragonflyDoji = isDojiBody AND (upperShadow <= body)
    gravestoneDoji = isDojiBody AND (lowerShadow <= body)
    
    // Final Doji determination
    isDoji = isDojiBody AND shadowEquals AND NOT dragonflyDoji AND NOT gravestoneDoji
    
    RETURN isDoji
```

### 3. SMMA Trend Analysis

```
FUNCTION calculateSMMA(source, length):
    IF firstBar:
        smma = SMA(source, length)
    ELSE:
        smma = (previousSMMA * (length - 1) + source) / length
    RETURN smma

FUNCTION analyzeTrend():
    smma21 = calculateSMMA(close, 21)
    smma50 = calculateSMMA(close, 50)
    smma100 = calculateSMMA(close, 100)
    smma200 = calculateSMMA(close, 200)
    
    // Trend determination
    bullishTrend = (smma21 > smma50) AND (smma50 > smma100) AND (smma100 > smma200)
    bearishTrend = (smma21 < smma50) AND (smma50 < smma100) AND (smma100 < smma200)
    
    // Price position relative to key SMMA
    aboveTrend = close > smma50
    belowTrend = close < smma50
    
    RETURN bullishTrend, bearishTrend, aboveTrend, belowTrend, smma21, smma50, smma100, smma200
```

### 4. Heikin Ashi Signal Detection

```
FUNCTION detectHASignals():
    // Calculate Heikin Ashi values
    haOpen, haHigh, haLow, haClose = calculateHeikinAshi()
    
    // Previous bar Doji detection
    previousDoji = detectDoji()[1]  // Previous bar
    
    // Bullish HA signal
    bullishHA = (haLow == haOpen) AND (haClose > haOpen) AND previousDoji
    
    // Bearish HA signal
    bearishHA = (haHigh == haOpen) AND (haClose < haOpen) AND previousDoji
    
    RETURN bullishHA, bearishHA
```

### 5. Additional Pattern Recognition

```
FUNCTION detect3LineStrike():
    // Bullish 3-Line Strike
    bullish3LS = (close[3] < open[3]) AND 
                 (close[2] < open[2]) AND 
                 (close[1] < open[1]) AND 
                 (close > open[1])
    
    // Bearish 3-Line Strike
    bearish3LS = (close[3] > open[3]) AND 
                 (close[2] > open[2]) AND 
                 (close[1] > open[1]) AND 
                 (close < open[1])
    
    RETURN bullish3LS, bearish3LS

FUNCTION detectEngulfing():
    // Previous and current bar values
    prevOpen = open[1]
    prevClose = close[1]
    currOpen = open
    currClose = close
    
    // Bullish Engulfing
    bullishEngulfing = (currOpen <= prevClose) AND 
                       (currOpen < prevOpen) AND 
                       (currClose > prevOpen)
    
    // Bearish Engulfing
    bearishEngulfing = (currOpen >= prevClose) AND 
                       (currOpen > prevOpen) AND 
                       (currClose < prevOpen)
    
    RETURN bullishEngulfing, bearishEngulfing
```

### 6. Session Filtering

```
FUNCTION isActiveSession():
    // Configurable session parameters
    timezone = "America/Chicago"
    startHour = 8
    startMinute = 30
    endHour = 12
    endMinute = 0
    
    // Days of week
    monday = true
    tuesday = true
    wednesday = true
    thursday = true
    friday = true
    saturday = false
    sunday = false
    
    // Current time in specified timezone
    currentTime = getCurrentTime(timezone)
    sessionStart = getSessionTime(timezone, startHour, startMinute)
    sessionEnd = getSessionTime(timezone, endHour, endMinute)
    
    // Check if within session time and active day
    withinTime = (currentTime >= sessionStart) AND (currentTime <= sessionEnd)
    activeDay = isActiveDay(getCurrentDay(), monday, tuesday, wednesday, thursday, friday, saturday, sunday)
    
    RETURN withinTime AND activeDay
```

---

## Entry Logic

### Long Entry Conditions

```
FUNCTION checkLongEntry():
    // Get trend analysis
    bullishTrend, bearishTrend, aboveTrend, belowTrend, smma21, smma50, smma100, smma200 = analyzeTrend()
    
    // Get HA signals
    bullishHA, bearishHA = detectHASignals()
    
    // Get session status
    activeSession = isActiveSession()
    
    // Check if no current trade active
    noActivePosition = NOT isTradeActive()
    
    // Long entry condition
    longCondition = noActivePosition AND
                   bullishTrend AND
                   aboveTrend AND
                   bullishHA AND
                   activeSession
    
    RETURN longCondition
```

### Short Entry Conditions

```
FUNCTION checkShortEntry():
    // Get trend analysis
    bullishTrend, bearishTrend, aboveTrend, belowTrend, smma21, smma50, smma100, smma200 = analyzeTrend()
    
    // Get HA signals
    bullishHA, bearishHA = detectHASignals()
    
    // Get session status
    activeSession = isActiveSession()
    
    // Check if no current trade active
    noActivePosition = NOT isTradeActive()
    
    // Short entry condition
    shortCondition = noActivePosition AND
                    bearishTrend AND
                    belowTrend AND
                    bearishHA AND
                    activeSession
    
    RETURN shortCondition
```

---

## Trade Management

### Position Sizing

```
FUNCTION calculatePositionSize(entryPrice, stopPrice, riskAmount):
    stopDistance = abs(entryPrice - stopPrice)
    
    IF stopDistance == 0:
        RETURN 0
    
    positionSize = riskAmount / stopDistance
    RETURN positionSize
```

### Entry Execution

```
FUNCTION executeLongEntry():
    // Calculate trade levels
    entryLevel = close
    stopLevel = minimum(low[1], low[2], low[3])
    stopDistance = entryLevel - stopLevel
    targetLevel = entryLevel + (stopDistance * riskRewardRatio)
    breakevenLevel = entryLevel + stopDistance
    
    // Calculate position size
    positionSize = calculatePositionSize(entryLevel, stopLevel, usdRiskPerTrade)
    
    IF positionSize > 0:
        // Set trade variables
        setTradeActive(true)
        setLongTradeActive(true)
        setEntryLevel(entryLevel)
        setStopLevel(stopLevel)
        setTargetLevel(targetLevel)
        setBreakevenLevel(breakevenLevel)
        setPositionSize(positionSize)
        setBreakevenActive(false)
        
        // Send entry alert
        sendAlert("LONG ENTRY: " + symbol + " at " + entryLevel)
    
    RETURN positionSize > 0

FUNCTION executeShortEntry():
    // Calculate trade levels
    entryLevel = close
    stopLevel = maximum(high[1], high[2], high[3])
    stopDistance = stopLevel - entryLevel
    targetLevel = entryLevel - (stopDistance * riskRewardRatio)
    breakevenLevel = entryLevel - stopDistance
    
    // Calculate position size
    positionSize = calculatePositionSize(entryLevel, stopLevel, usdRiskPerTrade)
    
    IF positionSize > 0:
        // Set trade variables
        setTradeActive(true)
        setShortTradeActive(true)
        setEntryLevel(entryLevel)
        setStopLevel(stopLevel)
        setTargetLevel(targetLevel)
        setBreakevenLevel(breakevenLevel)
        setPositionSize(positionSize)
        setBreakevenActive(false)
        
        // Send entry alert
        sendAlert("SHORT ENTRY: " + symbol + " at " + entryLevel)
    
    RETURN positionSize > 0
```

### Dynamic Stop Management

```
FUNCTION updateStopLevels():
    IF isLongTradeActive():
        currentStop = getStopLevel()
        newStop = getSMMA(50)  // Use 50 SMMA as dynamic stop
        
        IF newStop > currentStop:  // Only move stop up for longs
            setStopLevel(newStop)
    
    IF isShortTradeActive():
        currentStop = getStopLevel()
        newStop = getSMMA(50)  // Use 50 SMMA as dynamic stop
        
        IF newStop < currentStop:  // Only move stop down for shorts
            setStopLevel(newStop)
```

### Breakeven Management

```
FUNCTION checkBreakevenActivation():
    IF isLongTradeActive() AND NOT isBreakevenActive():
        IF high > getBreakevenLevel() AND high < getTargetLevel():
            setBreakevenActive(true)
            sendAlert("BREAKEVEN ACTIVATED: " + symbol)
    
    IF isShortTradeActive() AND NOT isBreakevenActive():
        IF low < getBreakevenLevel() AND low > getTargetLevel():
            setBreakevenActive(true)
            sendAlert("BREAKEVEN ACTIVATED: " + symbol)
```

---

## Exit Logic

### Stop Loss Exits

```
FUNCTION checkStopLoss():
    IF isLongTradeActive():
        IF low < getStopLevel() AND NOT isBreakevenActive():
            // Stop loss hit
            closeTrade("STOP LOSS")
            incrementLossCounter()
            sendAlert("STOP LOSS: " + symbol)
            RETURN true
    
    IF isShortTradeActive():
        IF high > getStopLevel() AND NOT isBreakevenActive():
            // Stop loss hit
            closeTrade("STOP LOSS")
            incrementLossCounter()
            sendAlert("STOP LOSS: " + symbol)
            RETURN true
    
    RETURN false
```

### Take Profit Exits

```
FUNCTION checkTakeProfit():
    IF isLongTradeActive():
        IF high > getTargetLevel():
            // Target reached
            closeTrade("TAKE PROFIT")
            incrementWinCounter()
            sendAlert("TAKE PROFIT: " + symbol)
            RETURN true
    
    IF isShortTradeActive():
        IF low < getTargetLevel():
            // Target reached
            closeTrade("TAKE PROFIT")
            incrementWinCounter()
            sendAlert("TAKE PROFIT: " + symbol)
            RETURN true
    
    RETURN false
```

### Breakeven Exits

```
FUNCTION checkBreakevenExit():
    IF isLongTradeActive() AND isBreakevenActive():
        IF low < getEntryLevel():
            // Breakeven exit
            closeTrade("BREAKEVEN")
            incrementBreakevenCounter()
            sendAlert("BREAKEVEN EXIT: " + symbol)
            RETURN true
    
    IF isShortTradeActive() AND isBreakevenActive():
        IF high > getEntryLevel():
            // Breakeven exit
            closeTrade("BREAKEVEN")
            incrementBreakevenCounter()
            sendAlert("BREAKEVEN EXIT: " + symbol)
            RETURN true
    
    RETURN false
```

---

## Main Strategy Loop

```
FUNCTION main():
    // Update technical indicators
    updateIndicators()
    
    // Check for active session
    IF NOT isActiveSession():
        RETURN
    
    // Update dynamic stops if in trade
    IF isTradeActive():
        updateStopLevels()
        checkBreakevenActivation()
        
        // Check exit conditions
        IF checkStopLoss() OR checkTakeProfit() OR checkBreakevenExit():
            RETURN  // Trade closed, exit main loop
    ELSE:
        // Check entry conditions when no active trade
        IF checkLongEntry():
            executeLongEntry()
        ELSE IF checkShortEntry():
            executeShortEntry()
    
    // Update performance statistics
    updateStatistics()
    
    // Plot visual elements
    plotIndicators()
    plotTradeLevels()
    plotSignals()
```

---

## Utility Functions

### Trade State Management

```
FUNCTION closeTrade(reason):
    setTradeActive(false)
    setLongTradeActive(false)
    setShortTradeActive(false)
    setBreakevenActive(false)
    
    // Log trade details
    logTradeResult(reason, getEntryLevel(), close, getPositionSize())

FUNCTION resetTradeVariables():
    setEntryLevel(0)
    setStopLevel(0)
    setTargetLevel(0)
    setBreakevenLevel(0)
    setPositionSize(0)
```

### Performance Tracking

```
FUNCTION updateStatistics():
    totalTrades = getWinCounter() + getLossCounter() + getBreakevenCounter()
    
    IF totalTrades > 0:
        winRate = (getWinCounter() / totalTrades) * 100
        lossRate = (getLossCounter() / totalTrades) * 100
        breakevenRate = (getBreakevenCounter() / totalTrades) * 100
        
        winLossRate = getWinCounter() / (getWinCounter() + getLossCounter()) * 100
        
        equityCurve = (getWinCounter() * riskRewardRatio * usdRiskPerTrade) - 
                     (getLossCounter() * usdRiskPerTrade) - 
                     (totalTrades * commission)
```

### Alert Management

```
FUNCTION sendAlert(message):
    // Format alert with timestamp and symbol
    formattedMessage = getCurrentTime() + " - " + symbol + ": " + message
    
    // Send to configured alert channels
    sendToTradingView(formattedMessage)
    sendToEmail(formattedMessage)
    sendToWebhook(formattedMessage)
```

---

## Configuration Parameters

```
CONSTANTS:
    // SMMA Periods
    SMMA_FAST = 21
    SMMA_MEDIUM = 50
    SMMA_SLOW = 100
    SMMA_TREND = 200
    
    // Doji Detection
    DOJI_BODY_PERCENT = 5.0
    SHADOW_PERCENT = 5.0
    SHADOW_EQUALS_PERCENT = 100.0
    
    // Risk Management
    RISK_REWARD_RATIO = 3.0
    USD_RISK_PER_TRADE = 50.0
    MIN_TRADE_RISK = 2 * ATR(14)
    MAX_TRADE_RISK = 4 * ATR(14)
    
    // Session Settings
    DEFAULT_TIMEZONE = "America/Chicago"
    SESSION_START_HOUR = 8
    SESSION_START_MINUTE = 30
    SESSION_END_HOUR = 12
    SESSION_END_MINUTE = 0
    
    // Performance
    COMMISSION = 0.20
    LEVERAGE = 1
```

---

This pseudocode provides a complete blueprint for implementing the GrimmHA strategy across different platforms while maintaining consistency in logic and execution.