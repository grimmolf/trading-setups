# Lemon Strategy - Advanced Squeeze Breakout System

## Overview

**Strategy Type**: Momentum + Structure Breakout
**Market**: Forex, Crypto, Futures (optimized for XBTUSD)
**Timeframe**: 1H-4H primary, 15M-1H secondary
**Difficulty**: Advanced

## Strategy Description

### Core Concept
The Lemon Strategy combines TTM Squeeze detection with W/M pattern recognition to identify high-probability momentum breakouts. It uses multiple confirmation filters to reduce false signals and incorporates dynamic risk management through trailing stops.

### Market Conditions
- **Best Markets**: Trending and volatile markets with clear directional moves
- **Avoid During**: Low volatility sideways markets, major news events
- **Optimal Timeframes**: 1H, 2H, 4H (primary), 15M, 30M (secondary)

## Entry Criteria

### Long Entry Conditions
1. **Squeeze Release**: TTM Squeeze fires (Bollinger Bands expand beyond Keltner Channels)
2. **W Pattern**: Price forms double bottom structure with confirmation
3. **Momentum Confluence**: Close above upper Keltner Channel
4. **OBV Confirmation**: On Balance Volume shows accumulation pattern (W formation)
5. **Williams %R**: Below -80 (oversold) during structure formation
6. **VWAP Position**: Price above VWAP for trend confirmation

### Short Entry Conditions
1. **Squeeze Release**: TTM Squeeze fires (Bollinger Bands expand beyond Keltner Channels)
2. **M Pattern**: Price forms double top structure with confirmation
3. **Momentum Confluence**: Close below lower Keltner Channel
4. **OBV Confirmation**: On Balance Volume shows distribution pattern (M formation)
5. **Williams %R**: Above -20 (overbought) during structure formation
6. **VWAP Position**: Price below VWAP for trend confirmation

## Exit Criteria

### Take Profit Rules
- **Target 1**: 1:3 Risk/Reward ratio (default)
- **Target 2**: 1:4.669 Risk/Reward ratio (optimized)
- **Dynamic Target**: Adjusts to opposite Keltner Channel when favorable

### Stop Loss Rules
- **Initial Stop**: Below/Above W/M pattern structure points
- **Trailing Stop**: Keltner Channel midline (basis)
- **Dynamic Adjustment**: Follows favorable Keltner Channel movement

### Time-Based Exits
- **Session Filtering**: Configurable trading sessions (default: CME hours)
- **Period Limiting**: Optional time-based restrictions for performance

## Risk Management

### Position Sizing
- **Risk Per Trade**: $1 default (configurable)
- **Maximum Positions**: 1 at a time per direction
- **Correlation Rules**: No multiple positions in same direction

### Money Management
- **Account Risk**: 1-2% per trade maximum
- **Win Rate Expectation**: 45-55% (depends on market conditions)
- **Risk/Reward Ratio**: 1:3 to 1:4.669 (configurable)

## Indicators Required

### Primary Indicators
1. **TTM Squeeze**: Bollinger Bands (20, 2.0) vs Keltner Channels (20, 2.0)
2. **W/M Pattern Detection**: Custom algorithm with 9-18 bar lookback
3. **OBV (On Balance Volume)**: Standard calculation
4. **Williams %R**: 21-period with 13-period EMA smoothing

### Secondary Indicators
1. **VWAP**: Volume Weighted Average Price
2. **RSI**: 14-period (optional filter)
3. **MFI**: Money Flow Index, 14-period (optional filter)
4. **DMI**: Directional Movement Index, 14-period (optional filter)

## Strategy Parameters

### Input Parameters
- **Global W/M Width**: 9-18 bars (default: 9)
- **Global W/M Offset**: 0-5 bars (default: 0)
- **BB Length**: 20 periods (default)
- **BB StdDev**: 2.0 multiplier (default)
- **Keltner Length**: 20 periods (default)
- **Keltner Multiplier**: 1.5-2.0 (default: 2.0)
- **Risk/Reward**: 3.0-4.669 (default: 3.0)
- **Risk Per Trade**: $1-50 (default: $1)

### Optimization Guidelines
- **Optimize**: Risk/Reward ratio, Keltner multiplier, W/M width
- **Keep Fixed**: Bollinger Band settings, core indicator periods
- **Optimization Ranges**: RR 2.0-6.0, Keltner 1.0-3.0, W/M 5-25

## Implementation Notes

### TradingView Setup
- **Required Studies**: TTM Squeeze, Custom W/M detection, OBV, Williams %R
- **Chart Settings**: 1H timeframe, overlay enabled
- **Alert Setup**: Entry and exit conditions with AutoView formatting

### AutoView Integration
- **Entry Messages**: "{{ticker}} LONG" / "{{ticker}} SHORT"
- **Exit Messages**: "{{ticker}} Close" / "{{ticker}} Take Profit"
- **Position Sizing**: Dynamic based on stop distance and risk amount

### Thinkorswim Setup
- **Required Studies**: Custom TTM Squeeze, W/M pattern detection
- **Chart Setup**: 1H timeframe with volume analysis
- **Scanner Conditions**: Squeeze release with momentum confirmation

## Performance Expectations

### Historical Performance
- **Backtesting Period**: 2+ years across multiple market conditions
- **Win Rate**: 45-55% (varies by market regime)
- **Average Win**: 3-4.669R (risk units)
- **Average Loss**: -1R (risk unit)
- **Profit Factor**: 1.8-2.5 (depends on optimization)
- **Maximum Drawdown**: 15-25% (depends on position sizing)

### Market Performance
- **Bull Market**: Higher win rate, larger average wins
- **Bear Market**: Lower win rate, more consistent performance
- **Sideways Market**: Avoid trading, high false signal rate

## Common Pitfalls

### What to Avoid
1. **Trading during low volatility**: Wait for squeeze release
2. **Ignoring W/M structure**: Structure confirmation is critical
3. **Over-leveraging**: Stick to 1-2% risk per trade
4. **Chasing entries**: Wait for proper confluence

### Troubleshooting
- **Problem**: Too many false signals → **Solution**: Increase filter strictness
- **Problem**: Missing good moves → **Solution**: Reduce filter requirements
- **Problem**: Large losses → **Solution**: Check stop loss placement and trailing

## Strategy Evolution

### Version History
- **v1.0**: Basic squeeze with W/M patterns
- **v2.0**: Added OBV and Williams %R filters
- **v3.0**: Implemented trailing stop mechanism
- **v4.0**: Added VWAP and session filtering

### Future Improvements
- **Multi-timeframe confirmation**: Higher TF trend alignment
- **Volume profile integration**: Enhanced entry/exit precision
- **Machine learning optimization**: Dynamic parameter adjustment
- **Risk management enhancements**: Volatility-based position sizing

## Related Strategies

### Similar Approaches
- **TTM Squeeze Pro**: Pure squeeze breakout without structure
- **W/M Pattern Trader**: Structure-based without squeeze confirmation
- **Momentum Breakout**: Simple channel breakout system

### Complementary Strategies
- **Range Trading**: For sideways market conditions
- **Trend Following**: For established directional moves
- **Scalping System**: For lower timeframe opportunities

## References

### Educational Resources
- **TTM Squeeze**: John Carter's original squeeze methodology
- **W/M Patterns**: Technical analysis structure recognition
- **OBV Analysis**: Volume-price relationship studies
- **Risk Management**: Position sizing and money management principles

### Attribution
- **Original Concept**: GitLemon community development
- **Modifications**: Grimm trading system enhancements
- **Optimization**: Community backtesting and refinement

---

**Created**: July 2025
**Last Updated**: July 2025
**Status**: Production Ready