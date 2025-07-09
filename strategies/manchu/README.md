# Manchu Strategy

## Strategy Overview

The Manchu Strategy is a sophisticated multi-component trading system that combines VuManChu Cipher B oscillator signals with a smoothed moving average trend-following system. It incorporates session-based filtering and comprehensive risk management for optimal performance across multiple timeframes.

## Core Components

### 1. VuManChu Cipher B Integration
- **WaveTrend Oscillator**: Identifies momentum shifts and overbought/oversold conditions
- **Divergence Detection**: Spots potential reversal points through price/oscillator divergences
- **Multi-Signal System**: Buy/sell signals, divergence alerts, and gold circle confirmations

### 2. Multi-SMMA Trend System
- **21 SMMA**: Fast trend identification (Green line)
- **50 SMMA**: Medium-term trend confirmation (Yellow line)
- **100 SMMA**: Long-term trend filter (White line - optional)
- **200 SMMA**: Major trend direction (Red line)

### 3. Donchian Channel Framework
- **Dynamic Support/Resistance**: 5-period Donchian channels
- **Stop Loss Levels**: Based on channel extremes
- **Take Profit Targets**: Risk/reward ratio optimization

### 4. Session Filtering
- **CME Trading Hours**: 8:30 AM - 12:00 PM Chicago time
- **Weekday Focus**: Monday-Friday trading only
- **Optimal Liquidity**: Targets high-volume sessions

## Entry Criteria

### Long Entry Conditions
1. **Trend Alignment**: SMMA2 (50) > SMMA4 (200)
2. **Price Position**: Close > SMMA4 (200)
3. **Entry Trigger**: Price crosses above any SMMA (21, 50, or 100)
4. **Session Filter**: Active during CME trading hours
5. **Risk Management**: No active trades present

### Short Entry Conditions
1. **Trend Reversal**: SMMA2 (50) < SMMA4 (200)
2. **Price Position**: Close < SMMA4 (200)
3. **Entry Trigger**: Price crosses below any SMMA (21, 50, or 100)
4. **Session Filter**: Active during CME trading hours
5. **Risk Management**: No active trades present

## Risk Management

### Position Sizing
- **Fixed Risk**: $1 per trade (configurable)
- **Stop Distance**: Based on Donchian channel levels
- **Position Size**: Risk amount / Stop distance
- **Leverage**: 1:1 (adjustable)

### Stop Loss & Take Profit
- **Stop Loss**: Donchian channel opposite extreme
- **Take Profit**: 3:1 risk/reward ratio (configurable)
- **Commission**: $0.20 per round turn

### Trade Management
- **Maximum Positions**: 1 per direction
- **Breakeven**: Optional trailing stop system
- **Trade Logging**: Complete performance tracking

## Performance Expectations

### Target Markets
- **Primary**: XBTUSD (Bitcoin perpetual futures)
- **Secondary**: Major forex pairs
- **Tertiary**: Liquid cryptocurrency pairs
- **Timeframe**: 1H primary, 15M-4H secondary

### Expected Performance
- **Win Rate**: 40-50% (backtesting required)
- **Risk/Reward**: 1:3 minimum
- **Maximum Drawdown**: <10% target
- **Profit Factor**: >1.5 target

## Signal Types

### Visual Signals
- **Yellow Bars**: Long entry conditions met
- **White Bars**: Short entry conditions met
- **Triangle Up**: Long trade triggered
- **Triangle Down**: Short trade triggered

### Alert Integration
- **Entry Alerts**: "{{ticker}} LONG" / "{{ticker}} SHORT"
- **Exit Alerts**: "{{ticker}} Close" / "{{ticker}} Take Profit"
- **AutoView Compatible**: Direct broker integration

## Implementation Notes

### TradingView Setup
1. Load indicator.pine for signal visualization
2. Load strategy.pine for backtesting
3. Configure session times for your timezone
4. Set appropriate risk parameters

### Live Trading Considerations
- **Paper Trading**: Test thoroughly before live deployment
- **Session Alignment**: Ensure correct timezone settings
- **Risk Limits**: Never risk more than 1-2% per trade
- **Market Conditions**: Monitor for changing volatility

## Strategy Advantages

### Multi-Confirmation System
- Combines trend following with momentum oscillator
- Session filtering reduces false signals
- Divergence detection improves entry timing

### Comprehensive Risk Management
- Fixed risk per trade
- Dynamic stop loss placement
- Configurable risk/reward ratios

### Automation Ready
- Complete alert system
- AutoView integration
- Performance tracking

## Strategy Limitations

### Market Dependency
- Requires trending markets for optimal performance
- May struggle in choppy, low-volume conditions
- Session-dependent (limited trading hours)

### Complexity
- Multiple confirmation filters may reduce trade frequency
- Requires understanding of all components
- More complex setup than simple strategies

## Next Steps

1. **Backtesting**: Test across multiple market conditions
2. **Parameter Optimization**: Fine-tune SMMA periods and risk ratios
3. **Forward Testing**: Paper trade for validation
4. **Live Deployment**: Start with minimal position sizes

---

**Version**: 1.0  
**Created**: 2025-07-09  
**Author**: Grimm Trading Systems  
**License**: MIT  