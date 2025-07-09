# SCDTM Strategy - "Stone Cold DA MAN"

## Strategy Overview

**SCDTM** (Stone Cold DA MAN) is a sophisticated multi-timeframe breakout strategy developed by Brian Beamish, refined by Daveatt and JoshuaMcGowan. The strategy combines multi-timeframe trend analysis with fractal pattern recognition to identify high-probability breakout opportunities.

## Core Philosophy

The strategy operates on the principle that **multi-timeframe trend alignment combined with mean reversion signals and fractal breakouts produces exceptionally high-probability trading opportunities**. It uses a systematic checkpoint approach to validate entry conditions before committing capital.

## Key Features

### Multi-Confirmation System
- **Checkpoint 1**: Multi-timeframe EMA alignment (Daily, 4H, 1H)
- **Checkpoint 2**: Bollinger Band %B + Stochastic RSI confirmation  
- **Checkpoint 3**: 3 or 5-bar fractal pattern formation
- **Checkpoint 4**: Persistent breakout signal setup
- **Checkpoint 5**: Breakout confirmation and trade execution

### Advanced Risk Management
- Fixed USD risk per trade with dynamic position sizing
- Fractal-based stop loss placement (1 tick beyond pattern)
- Configurable risk/reward ratio (default 2.25:1)
- Automatic trade state management and cleanup

### Platform Integration
- Originally designed for BitMEX cryptocurrency trading
- AutoView integration for automated execution
- Comprehensive alert system for manual trading
- Win/loss statistics tracking

## Strategy Classification

- **Type**: Multi-timeframe trend-following breakout strategy
- **Timeframes**: Daily, 4H, 1H alignment with any chart timeframe
- **Risk Level**: Medium to High (crypto-focused)
- **Skill Level**: Advanced
- **Capital Requirements**: Flexible (uses fixed USD risk)
- **Best Markets**: Trending cryptocurrency markets

## Technical Components

### EMA Trend Analysis
- **Fast EMA**: 9 periods
- **Slow EMA**: 18 periods  
- **Timeframes**: Daily, 4-Hour, 1-Hour
- **Requirement**: 3/3 alignment for trend confirmation

### Bollinger Band %B
- **Length**: 20 periods
- **Standard Deviation**: 2.0
- **Upper Threshold**: 1.00 (overbought)
- **Lower Threshold**: 0.00 (oversold)
- **Purpose**: Identify return-to-mean opportunities

### Stochastic RSI
- **RSI Length**: 14 periods
- **Stochastic Length**: 14 periods
- **Smooth K**: 3 periods
- **Smooth D**: 3 periods
- **Purpose**: Momentum confirmation with trend

### Fractal Patterns
- **Options**: 3-bar or 5-bar fractals
- **Bull Fractal**: Low surrounded by higher lows
- **Bear Fractal**: High surrounded by lower highs
- **Purpose**: Identify key support/resistance for breakouts

## Risk Management Framework

### Position Sizing
```
Position Size = USD Risk Per Trade ÷ Fractal Distance
Fractal Distance = |Breakout Price - Stop Loss Price|
Default Risk = $1 USD per trade (production setting)
```

### Stop Loss Placement
```
Bull Setup: Stop = Fractal Low - 1 tick
Bear Setup: Stop = Fractal High + 1 tick
```

### Take Profit Target
```
Bull Target = Entry + (Risk Distance × Risk/Reward Ratio)
Bear Target = Entry - (Risk Distance × Risk/Reward Ratio)
Default R:R = 2.25:1
```

## Trade State Management

### State Definitions
- **State 0**: No active trade or pending orders
- **State 1**: Setup confirmed, waiting for breakout
- **State 2**: Active long position
- **State 3**: Active short position

### State Transitions
1. **CP1-CP3 Align** → State 1 (Setup Pending)
2. **Breakout Occurs** → State 2/3 (Trade Active)  
3. **Stop/Target Hit** → State 0 (Trade Closed)
4. **Setup Invalidated** → State 0 (Reset)

## Performance Characteristics

### Strengths
- Multiple confirmation filters reduce false signals
- Multi-timeframe analysis captures major trends
- Systematic approach eliminates emotional decisions
- Excellent risk/reward profile with proper execution
- AutoView integration enables 24/7 automated trading

### Considerations
- Requires significant trend alignment (may miss some opportunities)
- Designed primarily for cryptocurrency markets
- Complex multi-checkpoint system requires careful implementation
- Best performance in trending market conditions

## Implementation Requirements

### Software Requirements
- TradingView Pro+ (for multi-timeframe security calls)
- Optional: AutoView for automated execution
- Optional: ThinkOrSwim for traditional markets adaptation

### Market Requirements
- Trending market conditions preferred
- Sufficient volatility for meaningful fractal patterns
- Good liquidity for breakout execution
- 24/7 markets ideal (crypto focus)

## Original Development Credits

- **Trade Concept**: Brian Beamish (TRI)
- **Pine Script Development**: Daveatt & JoshuaMcGowan
- **Initial Version**: January 3, 2019
- **Major Revision**: April 20, 2020
- **License**: Mozilla Public License 2.0

## Strategy Motto

*"LOVE JOY PEACE PATIENCE KINDNESS GOODNESS FAITHFULNESS GENTLENESS SELF-CONTROL"*

This strategy embodies systematic patience and disciplined execution, waiting for perfect multi-timeframe alignment before committing to high-probability breakout trades.

---

**Next Steps**: Proceed through comprehensive strategy development workflow including technical implementation, backtesting, documentation, and quality assurance.