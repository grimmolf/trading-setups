# Silver Setup - Trading Strategy

## Overview

**Strategy Type**: Mean Reversion / Momentum
**Market**: Stocks, Forex, Futures, Crypto
**Timeframe**: 1-5 minute charts (scalping/day trading)
**Difficulty**: Intermediate

## Strategy Description

### Core Concept
The Silver setup identifies "paint" candlestick patterns where price creates a gap that signals potential reversal or continuation. The strategy uses a 3-reason entry system: Location (time-based filtering during active trading sessions), Momentum (paint bar directional bias), and Structure (price re-enters paint bar range).

### Market Conditions
- **Best Markets**: Volatile trending markets with clear directional bias
- **Avoid During**: Low volatility periods, major news events, market open/close
- **Optimal Timeframes**: 1-5 minute charts during active trading sessions

## Entry Criteria

### Long Entry Conditions (3 Reasons)
1. **Location**: Within active trading time windows (7-9am, 10am-12pm PT)
2. **Momentum**: Bullish paint bar detected (low > high[2]) 
3. **Structure**: Price re-enters paint bar range (close > paint_low AND close < paint_high AND low <= paint_low)

### Short Entry Conditions (3 Reasons)
1. **Location**: Within active trading time windows (7-9am, 10am-12pm PT)
2. **Momentum**: Bearish paint bar detected (high < low[2])
3. **Structure**: Price re-enters paint bar range (close < paint_high AND close > paint_low AND high >= paint_high)

## Exit Criteria

### Take Profit Rules
- **Target**: 4.6x risk ratio (4.6 * stop_distance from entry)
- **Single Target**: Exit entire position at target level

### Stop Loss Rules
- **Long Stop**: Low from 2 bars before the paint candle (low[3])
- **Short Stop**: High from 2 bars before the paint candle (high[3])
- **No Trailing**: Fixed stop loss maintained throughout trade

### Time-Based Exits
- **Daily Close**: 1:00 PM Pacific Time (mandatory exit)
- **Weekend**: No positions held over weekends

## Risk Management

### Position Sizing
- **Risk Per Trade**: 1-2% of account (user defined)
- **Maximum Positions**: 1 (no concurrent positions allowed)
- **Correlation Rules**: Only one direction at a time (no hedge positions)

### Money Management
- **Account Risk**: Maximum 2% per trade
- **Win Rate Expectation**: 45-55% (strategy depends on high R:R ratio)
- **Risk/Reward Ratio**: 1:4.6 (fixed ratio)

## Indicators Required

### Primary Indicators
1. **Paint Bar Detection**: Custom logic comparing current bar to 2 bars prior
2. **Price Range Tracking**: Paint bar high/low levels
3. **Time Session Filter**: Active trading windows

### Secondary Indicators
1. **Position Tracking**: State management for active positions
2. **Stop/Target Levels**: Dynamic calculation based on paint bar levels

## Strategy Parameters

### Input Parameters
- **Time Window 1**: 0700-0900 (7-9 AM Pacific) - Default active
- **Time Window 2**: 1000-1200 (10 AM-12 PM Pacific) - Default active  
- **Time Window 3**: Empty - Optional third window
- **Risk Multiplier**: 4.6 - Take profit multiplier
- **Stop Offset**: 3 bars - Lookback for stop level

### Optimization Guidelines
- **Optimizable**: Time windows, risk multiplier (3.0-6.0 range)
- **Fixed**: Paint bar detection logic, stop calculation method
- **Avoid Over-optimization**: Keep core paint bar logic unchanged

## Implementation Notes

### TradingView Setup
- Add Silver Setup indicator to chart
- Configure time windows for your timezone
- Set up alerts for entry/exit signals
- Use 1-5 minute timeframes

### AutoView Integration
- **Long Entry**: `{{ticker}} - LONG Entry at {{close}}`
- **Short Entry**: `{{ticker}} - SHORT Entry at {{close}}`
- **Exit**: `{{ticker}} - Exit at {{close}}`

### Thinkorswim Setup
- Custom ThinkScript study required
- Set up scanner for paint bar patterns
- Configure alerts for entry conditions

## Performance Expectations

### Historical Performance
- **Backtesting Period**: To be determined during testing phase
- **Win Rate**: 45-55% (estimated)
- **Average Win**: 4.6R (by design)
- **Average Loss**: 1R (by design)
- **Profit Factor**: 2.3+ (estimated based on 50% win rate)
- **Maximum Drawdown**: 10-15% (estimated)

### Market Performance
- **Bull Market**: Strong performance during trending up moves
- **Bear Market**: Strong performance during trending down moves
- **Sideways Market**: Reduced performance, more false signals

## Common Pitfalls

### What to Avoid
1. Taking trades outside defined time windows
2. Modifying stops after entry (stick to plan)
3. Taking multiple positions simultaneously

### Troubleshooting
- **Problem**: Too many false signals → **Solution**: Ensure proper time filtering
- **Problem**: Stops too tight → **Solution**: Verify using low[3]/high[3] for stop calculation
- **Problem**: Missing entries → **Solution**: Check time zone settings and session filters

## Strategy Evolution

### Version History
- **v1.0**: Initial paint bar detection logic
- **v2.0**: Added time filtering and position management
- **v2.1**: Enhanced alert system and visualization

### Future Improvements
- Volume confirmation for paint bar validity
- Multiple timeframe confirmation
- Dynamic risk multiplier based on volatility
- Additional time session options

## Related Strategies

### Similar Approaches
- Gap trading strategies
- Range breakout systems
- Time-based momentum strategies

### Complementary Strategies
- Can be combined with longer-term trend filters
- Works well with volatility-based position sizing

## References

### Educational Resources
- Original concept developed by allanster
- Based on price action and gap trading principles
- Incorporates session-based timing concepts

### Attribution
- **Original Creator**: allanster
- **Modifications**: Enhanced for systematic trading
- **Inspiration**: Paint bar price action patterns

---

**Created**: July 2025
**Last Updated**: July 2025
**Status**: Development