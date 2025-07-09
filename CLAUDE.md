# CLAUDE.md - Trading Strategy Development Assistant

## Project Overview

This is a comprehensive trading strategy development repository focused on systematically transforming trading ideas into production-ready implementations across multiple platforms (TradingView Pine Script, ThinkScript, etc.).

## Core Directives

### Primary Functions
- **Strategy Development**: Transform raw ideas into structured trading logic
- **Multi-Platform Implementation**: Create code for TradingView and Thinkorswim
- **Backtesting & Validation**: Test strategies with historical data
- **Documentation**: Provide clear explanations and visual examples
- **Code Quality**: Maintain high standards for production-ready code

### Key Technologies
- **Pine Script**: TradingView indicator and strategy development
- **ThinkScript**: TD Ameritrade/Thinkorswim platform integration
- **Trading Platforms**: TradingView, Thinkorswim, AutoView
- **Languages**: Pine Script, ThinkScript, Markdown

## Development Workflow

### Phase Structure
Follow the 7-phase development process outlined in WORKFLOW.md:
1. **Strategy Analysis & Research**
2. **Strategy Design** 
3. **Technical Implementation**
4. **Testing & Validation**
5. **Documentation & Examples**
6. **Quality Assurance**
7. **Production Deployment**

### File Organization Standards
```
strategies/[strategy-name]/
├── README.md
├── pseudocode.md
├── pinescript/
│   ├── indicator.pine
│   └── strategy.pine
├── thinkscript/
│   ├── indicator.ts
│   └── strategy.ts
├── documentation/
│   ├── strategy-guide.md
│   └── trade-examples/
└── backtest-results/
```

## Code Development Standards

### Pine Script Requirements
- Include alert conditions for AutoView integration
- Use proper input parameters for customization
- Follow TradingView coding best practices
- Include comprehensive comments explaining logic
- Implement proper position sizing and risk management

### ThinkScript Requirements
- Adapt Pine Script logic to ThinkScript syntax
- Ensure compatibility with TOS platform
- Include scan conditions where applicable
- Optimize for platform performance

### Documentation Requirements
- Clear strategy description and rationale
- Entry and exit criteria with examples
- Risk management rules and position sizing
- Market conditions and optimal timeframes
- Visual examples of trades with screenshots
- Performance metrics and backtesting results

## Task Management

### Strategy Development Tasks
When working on strategy development:
1. Create todos for each phase of development
2. Break complex implementations into smaller tasks
3. Track progress through Pine Script → ThinkScript → Documentation
4. Validate each component before moving to next phase

### Quality Assurance Tasks
- Code compilation and syntax validation
- Logic verification and signal testing
- Alert message formatting for AutoView
- Visual indicator display confirmation
- Performance metric calculation accuracy

## Risk Management Focus

### Security Standards
- Never implement strategies that could be used maliciously
- Focus on defensive trading techniques
- Implement proper risk controls in all strategies
- Include appropriate disclaimers about trading risks

### Code Safety
- Validate all input parameters
- Implement proper error handling
- Avoid lookahead bias in backtesting
- Include position sizing controls
- Test across different market conditions

## Command Specialization

### When to Use Specific Tools
- **Task**: For complex strategy research and codebase exploration
- **Glob/Grep**: For finding specific Pine Script patterns or indicators
- **Read**: For analyzing existing strategy implementations
- **Edit/MultiEdit**: For modifying Pine Script and ThinkScript files
- **Bash**: For running any testing frameworks if available

### File Management
- Always read existing files before editing
- Use templates from `/templates/` directory for new strategies
- Maintain consistent naming conventions
- Follow the established directory structure

## Performance Optimization

### Development Efficiency
- Batch read multiple related files when analyzing strategies
- Use parallel tool calls for independent research tasks
- Leverage templates to accelerate development
- Focus on code quality over quantity

### Strategy Optimization
- Implement parameter optimization frameworks
- Test robustness across different market conditions
- Avoid overfitting through proper validation
- Document optimization ranges and constraints

## Common Patterns

### Strategy Analysis Pattern
1. Read existing strategy files or ideas
2. Analyze core concept and market theory
3. Create pseudocode breaking down logic
4. Implement indicator first, then strategy
5. Test and validate functionality
6. Create comprehensive documentation

### Multi-Platform Development Pattern
1. Develop Pine Script version first
2. Test and validate Pine Script implementation
3. Translate to ThinkScript with platform adaptations
4. Ensure functional equivalence between platforms
5. Create unified documentation covering both platforms

## Success Metrics

### Development Quality
- Strategy shows consistent positive expectancy
- Code compiles without errors on target platforms
- Risk controls prevent excessive losses
- Documentation enables others to implement successfully

### Process Efficiency
- Follow systematic development workflow
- Complete all phases before moving to production
- Maintain high code quality standards
- Provide clear, actionable documentation

---

**Project Focus**: Transform trading ideas into production-ready, multi-platform implementations
**Quality Standard**: Production-ready code with comprehensive documentation
**Risk Priority**: Always implement proper risk management and controls
**Platform Target**: TradingView (Pine Script) and Thinkorswim (ThinkScript)