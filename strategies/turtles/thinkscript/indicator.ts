# Turtle Trading System - ThinkScript Indicator
# Donchian Channel Breakout System

declare upper;

# === INPUT PARAMETERS ===
input channelLength = 20;
input showBasis = yes;
input showSignals = yes;
input showInfoBubble = yes;

# === DONCHIAN CHANNEL CALCULATIONS ===
def upper = Highest(high, channelLength);
def lower = Lowest(low, channelLength);
def basis = (upper + lower) / 2;

# === TURTLE BREAKOUT SIGNALS ===
def bullTurtle = upper > upper[1];
def bearTurtle = lower < lower[1];

# Signal filtering - only new breakouts
def bullSignal = bullTurtle and !bullTurtle[1];
def bearSignal = bearTurtle and !bearTurtle[1];

# === VISUAL DISPLAY ===
plot UpperChannel = upper;
UpperChannel.SetDefaultColor(Color.WHITE);
UpperChannel.SetLineWeight(2);
UpperChannel.SetStyle(Curve.FIRM);

plot LowerChannel = lower;
LowerChannel.SetDefaultColor(Color.WHITE);
LowerChannel.SetLineWeight(2);
LowerChannel.SetStyle(Curve.FIRM);

plot BasisLine = if showBasis then basis else Double.NaN;
BasisLine.SetDefaultColor(Color.ORANGE);
BasisLine.SetLineWeight(1);
BasisLine.SetStyle(Curve.FIRM);

# === CLOUD FILL ===
AddCloud(UpperChannel, LowerChannel, Color.DARK_GRAY, Color.DARK_GRAY);

# === SIGNAL VISUALIZATION ===
plot BullSignalPlot = if showSignals and bullSignal then low - (high - low) * 0.02 else Double.NaN;
BullSignalPlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BullSignalPlot.SetDefaultColor(Color.LIME);
BullSignalPlot.SetLineWeight(3);

plot BearSignalPlot = if showSignals and bearSignal then high + (high - low) * 0.02 else Double.NaN;
BearSignalPlot.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BearSignalPlot.SetDefaultColor(Color.RED);
BearSignalPlot.SetLineWeight(3);

# === BAR COLORING ===
AssignPriceColor(if bullTurtle then Color.YELLOW else if bearTurtle then Color.WHITE else Color.CURRENT);

# === INFORMATION LABELS ===
AddLabel(yes, "Turtle System", Color.CYAN);
AddLabel(yes, "Length: " + channelLength, Color.GRAY);
AddLabel(yes, "Upper: " + Round(upper, 2), Color.LIME);
AddLabel(yes, "Lower: " + Round(lower, 2), Color.RED);
AddLabel(yes, "Status: " + (if bullTurtle then "BULLISH" else if bearTurtle then "BEARISH" else "NEUTRAL"), 
         if bullTurtle then Color.LIME else if bearTurtle then Color.RED else Color.GRAY);

# === ALERTS ===
Alert(bullSignal, "Turtle Bullish Breakout", Alert.BAR, Sound.Bell);
Alert(bearSignal, "Turtle Bearish Breakdown", Alert.BAR, Sound.Bell);

# === INFORMATION BUBBLE ===
AddChartBubble(showInfoBubble and bullSignal, low, 
               "BULLISH TURTLE\nBreakout: " + Round(upper, 2) + "\nTarget: " + Round(upper + (upper - lower), 2), 
               Color.LIME, no);

AddChartBubble(showInfoBubble and bearSignal, high, 
               "BEARISH TURTLE\nBreakdown: " + Round(lower, 2) + "\nTarget: " + Round(lower - (upper - lower), 2), 
               Color.RED, yes);

# === SCANNER PLOTS ===
plot ScanLongSetup = bullSignal;
plot ScanShortSetup = bearSignal;
plot ScanAnySetup = bullSignal or bearSignal;