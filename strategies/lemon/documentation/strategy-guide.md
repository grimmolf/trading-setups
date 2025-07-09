# Lemon Strategy - Complete Implementation Guide

## Table of Contents
1. [Strategy Overview](#strategy-overview)
2. [Setup Instructions](#setup-instructions)
3. [Entry Rules](#entry-rules)
4. [Exit Rules](#exit-rules)
5. [Risk Management](#risk-management)
6. [Platform Setup](#platform-setup)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)

## Strategy Overview

### Core Concept
The Lemon Strategy is a sophisticated breakout system that combines TTM Squeeze detection with W/M pattern recognition. It identifies low-volatility periods followed by directional breakouts, using multiple confirmation filters to ensure high-probability entries.

### Key Components
1. **TTM Squeeze**: Identifies volatility compression and expansion
2. **W/M Patterns**: Provides structural entry points
3. **Volume Confirmation**: Validates breakout strength
4. **Momentum Filters**: Ensures directional bias
5. **Risk Management**: Controls position sizing and stops

### Expected Performance
- **Win Rate**: 45-55%
- **Profit Factor**: 2.5-3.0
- **Average R/R**: 1:3
- **Maximum Drawdown**: <10%

## Setup Instructions

### TradingView Setup

#### Required Indicators
1. **TTM Squeeze** (built-in or custom)
2. **Bollinger Bands** (20, 2.0)
3. **Keltner Channels** (20, 2.0)
4. **Williams %R** (21, 13 EMA)
5. **VWAP** (session-based)
6. **Volume** (standard)

#### Chart Configuration
```
Timeframe: 1 Hour (primary)
Symbol: XBTUSD, EURUSD, or similar liquid instrument
Style: Candlestick chart
Volume: Always visible
Grid: Enable for price reference
```

#### Indicator Settings
```
TTM Squeeze:
- BB Length: 20
- BB Multiplier: 2.0
- Keltner Length: 20
- Keltner Multiplier: 2.0
- Show Squeeze Dots: Yes
- Show Momentum Histogram: Yes

Williams %R:
- Period: 21
- Smoothing: 13 EMA
- Overbought: -20
- Oversold: -80
```

### ThinkOrSwim Setup

#### Study Configuration
1. **Load Custom Studies**:
   - Import `lemon-indicator.ts`
   - Import `lemon-strategy.ts`
   - Apply to 1H chart

2. **Chart Layout**:
   - Upper Panel: Price with Bollinger/Keltner bands
   - Lower Panel: TTM Squeeze histogram
   - Volume Panel: Standard volume bars

3. **Alert Setup**:
   - Entry alerts for long/short signals
   - Exit alerts for stop/target hits
   - Custom sound notifications

### AutoView Integration

#### Alert Messages
```
Long Entry: "{{ticker}} LONG"
Short Entry: "{{ticker}} SHORT"
Exit: "{{ticker}} Close"
Take Profit: "{{ticker}} Take Profit"
```

#### Position Sizing
```
Risk Per Trade: $50 (adjust based on account size)
Maximum Position: 1% of account
Leverage: 1:1 (no leverage recommended)
```

## Entry Rules

### Long Entry Checklist
```
☐ TTM Squeeze Release (red to green dots)
☐ W Pattern Identified (double bottom structure)
☐ Close above upper Keltner Channel
☐ Price above VWAP
☐ Williams %R coming from oversold (<-80)
☐ Volume spike on breakout (>1.5x average)
☐ OBV showing W pattern
☐ No major news events pending
```

### Short Entry Checklist
```
☐ TTM Squeeze Release (red to green dots)
☐ M Pattern Identified (double top structure)
☐ Close below lower Keltner Channel
☐ Price below VWAP
☐ Williams %R coming from overbought (>-20)
☐ Volume spike on breakdown (>1.5x average)
☐ OBV showing M pattern
☐ No major news events pending
```

### Pattern Recognition Guide

#### W Pattern Criteria
1. **First Low**: Clear support level
2. **First High**: Bounce from support
3. **Second Low**: Higher than first low (or equal)
4. **Second High**: Break above first high
5. **Neckline**: Connect the two highs
6. **Entry**: Break above neckline with volume

#### M Pattern Criteria
1. **First High**: Clear resistance level
2. **First Low**: Drop from resistance
3. **Second High**: Lower than first high (or equal)
4. **Second Low**: Break below first low
5. **Neckline**: Connect the two lows
6. **Entry**: Break below neckline with volume

## Exit Rules

### Stop Loss Placement

#### Long Positions
- **Initial Stop**: Below W pattern low
- **Buffer**: 15-20 points below pattern
- **Trailing**: Keltner Channel midline
- **Maximum Risk**: 1% of account

#### Short Positions
- **Initial Stop**: Above M pattern high
- **Buffer**: 15-20 points above pattern
- **Trailing**: Keltner Channel midline
- **Maximum Risk**: 1% of account

### Take Profit Targets

#### Standard Targets
- **Target 1**: 1:2 Risk/Reward ratio
- **Target 2**: 1:3 Risk/Reward ratio
- **Target 3**: 1:4 Risk/Reward ratio (if momentum strong)

#### Dynamic Targets
- **Resistance/Support**: Previous significant levels
- **Fibonacci Extensions**: 127.2%, 161.8% extensions
- **Keltner Channels**: Opposite channel boundary

### Exit Conditions
1. **Stop Loss Hit**: Exit immediately at stop price
2. **Target Hit**: Exit at predetermined target level
3. **Momentum Failure**: Exit if momentum oscillator reverses
4. **Time Stop**: Exit after 24 hours if no movement
5. **Squeeze Reversal**: Exit if new squeeze forms

## Risk Management

### Position Sizing Formula
```
Position Size = Risk Amount / (Entry Price - Stop Price)
Risk Amount = Account Balance × Risk Percentage
Risk Percentage = 1-2% maximum per trade
```

### Example Calculation
```
Account Balance: $10,000
Risk Percentage: 1%
Risk Amount: $100
Entry Price: $45,000
Stop Price: $44,500
Stop Distance: $500
Position Size: $100 / $500 = 0.2 contracts
```

### Money Management Rules
1. **Never Risk More**: Than 2% per trade
2. **Maximum Positions**: 3 trades open simultaneously
3. **Correlation Check**: No correlated positions
4. **Drawdown Limit**: Stop trading at 10% drawdown
5. **Position Scaling**: Reduce size after losses

### Portfolio Management
```
Monthly P&L Target: 5-10%
Maximum Monthly Loss: -5%
Win Rate Target: >45%
Profit Factor Target: >2.0
Sharpe Ratio Target: >1.0
```

## Platform Setup

### TradingView Configuration

#### Workspace Setup
1. **Chart Layout**: 2x2 grid with multiple timeframes
2. **Indicator Template**: Save standard indicator setup
3. **Alert Templates**: Create reusable alert formats
4. **Watchlist**: Add liquid trading instruments

#### Alert Configuration
```json
{
  "message": "{{ticker}} LONG - Entry: {{close}} Stop: {{plot_0}} Target: {{plot_1}}",
  "frequency": "Once Per Bar Close",
  "condition": "Long Entry Signal",
  "expiration": "86400"
}
```

### ThinkOrSwim Configuration

#### Chart Settings
```
Time Frame: 1 Hour
Price Type: Last
Chart Type: Candlestick
Volume: Always On
Grid: Major lines only
```

#### Study Configuration
```
Lemon Indicator:
- BB Length: 20
- Keltner Length: 20
- Pattern Width: 9
- Show Alerts: Yes

Lemon Strategy:
- Risk/Reward: 3.0
- Trail Stop: Yes
- Max Positions: 1
```

## Troubleshooting

### Common Issues

#### No Signals Appearing
**Symptoms**: Indicator loaded but no entry signals
**Solutions**:
1. Check timeframe (must be 1H)
2. Verify all indicators are loaded
3. Confirm sufficient price history
4. Review parameter settings

#### False Signals
**Symptoms**: Many signals but poor win rate
**Solutions**:
1. Add volume filter (>1000 BTC/hour)
2. Increase pattern recognition strictness
3. Add session time filter
4. Verify squeeze detection settings

#### Missed Entries
**Symptoms**: Signals appear but trades not executed
**Solutions**:
1. Check alert configuration
2. Verify AutoView connection
3. Review position sizing settings
4. Confirm account balance

### Performance Issues

#### Low Win Rate (<40%)
**Possible Causes**:
- Trading during low-volume sessions
- Insufficient volume confirmation
- Poor pattern recognition
- Wrong market conditions

**Solutions**:
- Add minimum volume requirement
- Improve entry timing
- Increase pattern strictness
- Focus on trending markets

#### High Drawdown (>10%)
**Possible Causes**:
- Position sizing too large
- Stop losses too wide
- Consecutive losses
- Market regime change

**Solutions**:
- Reduce position size
- Tighten stop losses
- Implement maximum loss rules
- Adjust to market conditions

## Performance Optimization

### Parameter Optimization

#### Core Parameters
```
BB Length: 15-25 (default: 20)
BB Multiplier: 1.5-2.5 (default: 2.0)
Keltner Length: 15-25 (default: 20)
Keltner Multiplier: 1.5-2.5 (default: 2.0)
Pattern Width: 5-15 (default: 9)
Risk/Reward: 2.0-5.0 (default: 3.0)
```

#### Optimization Process
1. **Backtest Period**: Use 2+ years of data
2. **Walk Forward**: Test on out-of-sample data
3. **Parameter Stability**: Ensure robust parameters
4. **Market Conditions**: Test across different regimes

### Advanced Enhancements

#### Multi-Timeframe Analysis
```
Higher Timeframe: 4H trend confirmation
Lower Timeframe: 15M entry refinement
Volume Profile: Identify key levels
Market Structure: Support/resistance levels
```

#### Additional Filters
```
Volatility Filter: ATR-based minimum
News Filter: Avoid major events
Correlation Filter: Check asset relationships
Session Filter: Trade optimal hours only
```

### Monitoring and Maintenance

#### Daily Checklist
```
☐ Review overnight positions
☐ Check economic calendar
☐ Verify alert functionality
☐ Monitor market conditions
☐ Update watchlist
```

#### Weekly Review
```
☐ Analyze trade performance
☐ Review parameter effectiveness
☐ Check system connectivity
☐ Update strategy documentation
☐ Plan upcoming week
```

#### Monthly Analysis
```
☐ Calculate performance metrics
☐ Review risk management
☐ Optimize parameters if needed
☐ Update strategy rules
☐ Plan strategy improvements
```

## Conclusion

The Lemon Strategy provides a systematic approach to trading breakouts with multiple confirmation filters. Success depends on:

1. **Proper Setup**: Following installation instructions precisely
2. **Discipline**: Adhering to entry and exit rules
3. **Risk Management**: Never risking more than 2% per trade
4. **Continuous Learning**: Analyzing each trade for improvement
5. **Patience**: Waiting for high-quality setups

Remember that no strategy wins every trade. The key is to maintain proper risk management and let the statistical edge play out over many trades.

---

**Disclaimer**: Trading involves substantial risk of loss. Past performance does not guarantee future results. Always conduct thorough testing before risking real money.

**Version**: 1.0
**Last Updated**: July 2025
**Status**: Production Ready