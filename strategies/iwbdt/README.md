# IWBDT Strategy - Multi-Timeframe Fractal Breakout System

## Overview

The IWBDT (It Will Break Down/Through) Strategy is a sophisticated fractal-based breakout trading system that combines multi-timeframe trend analysis with price action fractals to identify high-probability breakout trades. This institutional-grade strategy uses exponential moving average (EMA) alignments across multiple timeframes to define the market trend, then enters trades based on fractal pattern breakouts in the trend direction.

## Core Concept

The strategy operates on the principle that when higher timeframe trends align, breakouts from fractal patterns in the direction of the trend have a higher probability of success. The system uses:

1. **Multi-Timeframe Trend Confirmation**: 9/18 EMA crossovers across 3 timeframes
2. **Fractal Pattern Recognition**: 3-bar fractal formations for entry signals
3. **Dynamic Risk Management**: ATR-based stop loss and take profit placement
4. **Automated Trade Management**: Breakeven activation and position management

## Strategy Components

### 1. Multi-Timeframe Trend Analysis
- **First Timeframe**: 60 minutes (1 hour)
- **Second Timeframe**: 240 minutes (4 hours)
- **Third Timeframe**: Daily
- **EMA Periods**: 9 (fast) and 18 (slow)

The trend is considered:
- **Bullish**: When all three timeframes show 9 EMA > 18 EMA
- **Bearish**: When all three timeframes show 9 EMA < 18 EMA
- **Partial**: When 2 out of 3 timeframes align

### 2. Fractal Pattern Detection
- **Bottom Fractal (Long Signal)**:
  - Low[2] < Low[1] and Low[2] < Low[3]
  - Confirmed when price breaks above High[1]
  - Must occur during bullish trend

- **Top Fractal (Short Signal)**:
  - High[2] > High[1] and High[2] > High[3]
  - Confirmed when price breaks below Low[1]
  - Must occur during bearish trend

### 3. Risk Management
- **Stop Loss**: Pattern-based (fractal high/low)
- **Position Sizing**: Based on ATR range (1-2x ATR)
- **Risk per Trade**: Fixed dollar amount (default: $20)
- **Risk/Reward Ratio**: 2:1 (configurable)
- **Breakeven Management**: Automatic when price reaches 1:1 R:R

### 4. Trade Filtering
- **ATR Range Filter**: Trade distance must be between 1x and 2x ATR(14)
- **Trend Alignment**: All configured timeframes must agree
- **Active Trade Limit**: Only one trade at a time
- **Session Filter**: Optional time-based filtering

## Entry Criteria

### Long Entry
1. **Trend Confirmation**: All three timeframes show bullish EMA alignment (9 > 18)
2. **Fractal Formation**: Valid bottom fractal identified (Low[2] < Low[1] and Low[2] < Low[3])
3. **Breakout Confirmation**: Current high > High[1] (fractal breakout)
4. **Risk Filter**: Stop distance between 1x and 2x ATR(14)
5. **No Active Trade**: No existing position open

### Short Entry
1. **Trend Confirmation**: All three timeframes show bearish EMA alignment (9 < 18)
2. **Fractal Formation**: Valid top fractal identified (High[2] > High[1] and High[2] > High[3])
3. **Breakout Confirmation**: Current low < Low[1] (fractal breakdown)
4. **Risk Filter**: Stop distance between 1x and 2x ATR(14)
5. **No Active Trade**: No existing position open

## Exit Criteria

### Stop Loss Exit
- **Long**: Price closes below fractal low (entry fractal point)
- **Short**: Price closes above fractal high (entry fractal point)
- **Breakeven Active**: Stop moves to entry after reaching 1:1 R:R

### Take Profit Exit
- **Fixed Target**: 2:1 risk/reward ratio (configurable)
- **Long**: Entry + (2 × stop distance)
- **Short**: Entry - (2 × stop distance)

### Breakeven Management
- **Activation**: When price reaches 1:1 R:R level
- **Stop Adjustment**: Move stop to entry price
- **Protection**: Ensures no loss after reaching breakeven

## Platform Implementation

### TradingView (Pine Script)
- **Version**: Pine Script v4
- **Type**: Study with alerts
- **Features**: Visual signals, colored backgrounds, trade levels
- **Alerts**: AutoView/3Commas compatible

### ThinkScript (TOS)
- **Platform**: TD Ameritrade ThinkOrSwim
- **Features**: Fractal identification, trend analysis
- **Limitations**: Simplified multi-timeframe analysis

## Risk Management

### Position Sizing
```
Position Size = Risk Amount / Stop Distance
Where:
- Risk Amount = Fixed USD amount (default: $20)
- Stop Distance = Entry - Stop Level
```

### Maximum Risk Controls
- **Per Trade Risk**: 1-2% of account (recommended)
- **Stop Distance**: Limited to 1-2x ATR(14)
- **Leverage**: Configurable (default: 1x)
- **Maximum Positions**: 1 (no pyramiding)

## Performance Characteristics

### Expected Metrics
- **Win Rate**: 40-50% (typical for 2:1 R:R systems)
- **Profit Factor**: 1.8-2.5
- **Average Win**: 2R (2 times risk)
- **Average Loss**: 1R (1 times risk)
- **Breakeven Rate**: 10-20% of trades

### Market Conditions
- **Best Performance**: Trending markets with clear directional bias
- **Moderate Performance**: Ranging markets with defined boundaries
- **Poor Performance**: Choppy, directionless markets
- **Avoid**: Major news events and low liquidity periods

## Configuration Settings

### Basic Settings
```javascript
// Timeframe Settings
FirstAddTF: "60"    // 1 hour
SecondAddTF: "240"  // 4 hours
ThirdAddTF: "D"     // Daily

// EMA Settings
EMA_Short_period: 9
EMA_Long_period: 18

// Risk Management
rr: 2               // Risk/Reward ratio
USDRiskPerTrade: 20 // Fixed risk in USD
Leverage: 1         // Position leverage
```

### Advanced Settings
```javascript
// Trend Options
IncludeCT: false    // Include current timeframe in trend

// Visual Settings
HideBackground: false
bgcolorBullTransp: 55
bgcolorBearTransp: 55
bgcolorBullPartialTransp: 70
bgcolorBearPartialTransp: 70

// Statistics
HideStatistics: false
DisplayEquityCurve: false
commission: 0.1744  // Round-trip commission
```

## Visual Elements

### Chart Display
- **Background Colors**:
  - Green: Full bullish trend alignment
  - Red: Full bearish trend alignment
  - Teal: Partial bullish alignment (2/3)
  - Maroon: Partial bearish alignment (2/3)

- **Fractal Markers**:
  - ˆ: Top fractal (potential short)
  - ˬ: Bottom fractal (potential long)
  - ↓: Confirmed short entry
  - ↑: Confirmed long entry

- **Trade Outcome Markers**:
  - "1": Winning trade (green)
  - "0": Breakeven trade (blue)
  - "X": Losing trade (fuchsia)

### Trade Levels
- **Red Zone**: Stop loss area
- **Blue Zone**: Breakeven area
- **Green Zone**: Take profit area

## Alert Integration

### AutoView Format
```javascript
// Long Entry
e=bitmex s={{ticker}} b=long l=100 q=5% t=market

// Short Entry
e=bitmex s={{ticker}} b=short l=100 q=5% t=market

// Exit (All Types)
e=bitmex s={{ticker}} c=position q=100% t=market
```

### Alert Types
1. **IWBADT Trend Alert Bull**: Bullish trend established
2. **IWBADT Trend Alert Bear**: Bearish trend established
3. **IWBADT Fractal Alert Top**: Top fractal detected
4. **IWBADT Fractal Alert Bottom**: Bottom fractal detected
5. **IWBADT Entry Trade Sig Long**: Long entry signal
6. **IWBADT Entry Trade Sig Short**: Short entry signal
7. **IWBADT Close Trade BE or Stop**: Exit at breakeven or stop
8. **IWBADT Close Trade Win**: Exit at profit target

## Installation and Setup

### Quick Start
1. **Import Strategy**: Load Pine Script into TradingView
2. **Configure Timeframes**: Set appropriate analysis periods
3. **Adjust Risk**: Set risk amount based on account size
4. **Enable Alerts**: Configure AutoView integration
5. **Backtest**: Verify performance on historical data
6. **Paper Trade**: Test with simulated account first

### Recommended Workflow
1. Analyze market structure on higher timeframes
2. Wait for full trend alignment (all EMAs agree)
3. Monitor for fractal formations
4. Enter on fractal breakout confirmation
5. Manage trade according to rules
6. Review performance regularly

## Optimization Tips

### Parameter Tuning
- **EMA Periods**: Test 8/21, 10/20, or 13/26 combinations
- **Timeframes**: Adjust based on trading style (scalping vs swing)
- **Risk/Reward**: Consider 1.5:1 or 3:1 ratios
- **ATR Multiplier**: Adjust range based on volatility

### Market-Specific Settings
- **Forex**: Use 15m/1H/4H timeframes
- **Crypto**: Use 1H/4H/D timeframes
- **Futures**: Use 5m/30m/2H timeframes
- **Stocks**: Use 30m/D/W timeframes

## Common Issues and Solutions

### Low Signal Frequency
- **Solution**: Reduce timeframe requirements (use 2/3 alignment)
- **Alternative**: Lower the timeframe periods
- **Check**: Ensure market has sufficient volatility

### High Drawdown
- **Solution**: Increase risk/reward ratio
- **Alternative**: Add additional filters
- **Check**: Verify trend alignment is working

### Breakeven Exits
- **Solution**: Widen stop distance requirements
- **Alternative**: Adjust breakeven activation level
- **Check**: Ensure proper volatility measurement

## Advanced Features

### Conflicting Candle Handling
The strategy includes sophisticated logic for handling candles that cross multiple trade levels:
- **Type 3a**: Crosses entry and breakeven (continuation pattern)
- **Type 4a**: Crosses all levels (winner determination)
- Prevents premature exits on volatile candles

### Performance Statistics
- Real-time win/loss/breakeven tracking
- Equity curve visualization
- Win rate and risk/reward calculations
- Commission-adjusted returns

### Multi-Market Support
- Cryptocurrency exchanges (BitMEX, Deribit)
- Forex brokers (via MT4/MT5 bridge)
- Futures markets (CME, EUREX)
- Stock markets (with modifications)

## Risk Warnings

### Trading Risks
- Past performance does not guarantee future results
- High leverage can lead to significant losses
- Market conditions can change rapidly
- Technical failures can impact execution

### Strategy Limitations
- Requires trending market conditions
- May underperform in ranging markets
- Subject to slippage in fast markets
- Dependent on multi-timeframe data quality

## Version History

- **v1.0**: Initial release with basic fractal detection
- **v2.0**: Added multi-timeframe trend analysis
- **v3.0**: Implemented breakeven management
- **v4.0**: Current version with full automation support

## Support and Resources

- **Documentation**: This README and code comments
- **Community**: TradingView public scripts
- **Updates**: GitHub repository
- **Support**: Via GitHub issues

---

**Disclaimer**: This strategy is for educational purposes only. Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. Always practice proper risk management and consider consulting with a financial advisor.