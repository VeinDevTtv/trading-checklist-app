"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { RiskCalculator } from "@/components/risk-calculator";
import { Settings } from "@/components/settings";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { StrategyHistoryModal } from "@/components/strategy-history-modal";
import { StrategySharingComponent } from "@/components/strategy-sharing";
import { ImageAttachment } from "@/components/image-attachment";
import { OnboardingTour, TourControls } from "@/components/onboarding-tour";
import { TradeFilters, useTradeFilters, type TradeFilters as TradeFiltersType, type EnhancedTradeLog, type TradeTag } from "@/components/trade-filters";
import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { StrategyVersionManager } from "@/lib/strategy-versioning";
import { ImageStorageManager, TradeImage } from "@/lib/image-storage";
import { 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Calculator,
  Settings as SettingsIcon,
  Plus,
  Edit,
  Download,
  Star,
  Filter,
  Calendar
} from "lucide-react";
import jsPDF from "jspdf";

// -------------------- Types --------------------

type Importance = "high" | "medium" | "low";

interface Condition {
  id: number;
  text: string;
  importance: Importance;
}

interface Strategy {
  id: string;
  name: string;
  conditions: Condition[];
}

interface TradeLog {
  id: number;
  strategyName: string;
  checkedIds: number[];
  score: number;
  possible: number;
  notes: string;
  verdict: string;
  timestamp: string;
  pnl?: number;
  riskAmount?: number;
  outcome?: 'win' | 'loss' | 'breakeven';
  riskRewardRatio?: number;
  imageIds?: string[];
  tags?: string[];
  pair?: string;
  session?: 'london' | 'new-york' | 'tokyo' | 'sydney';
  dayOfWeek?: string;
  setup?: string;
}

// -------------------- Constants --------------------

const importanceWeights: Record<Importance, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const defaultStrategies: Strategy[] = [
  {
    id: "ict2022",
    name: "ICT 2022 Entry",
    conditions: [
      { id: 1, text: "SMT confirmed", importance: "high" },
      { id: 2, text: "BOS after FVG", importance: "high" },
      { id: 3, text: "Killzone timing", importance: "medium" },
      { id: 4, text: "Clean OB mitigation", importance: "medium" },
      { id: 5, text: "RR ≥ 1:3", importance: "low" },
    ],
  },
  {
    id: "pa",
    name: "Regular Price Action",
    conditions: [
      { id: 6, text: "Break / Retest confirmed", importance: "high" },
      { id: 7, text: "Clear trend direction", importance: "medium" },
      { id: 8, text: "Support/Resistance respected", importance: "medium" },
      { id: 9, text: "No upcoming red‑folder news", importance: "low" },
    ],
  },
  {
    id: "snD",
    name: "Supply & Demand",
    conditions: [
      { id: 10, text: "Fresh S/D zone", importance: "high" },
      { id: 11, text: "Liquidity sweep into zone", importance: "high" },
      { id: 12, text: "Lower‑TF BOS out of zone", importance: "medium" },
      { id: 13, text: "Confluence with HTF imbalance", importance: "low" },
    ],
  },
];

// -------------------- LocalStorage Utilities --------------------

const STORAGE_KEYS = {
  STRATEGIES: 'trading-checklist-strategies',
  HISTORY: 'trading-checklist-history',
  ACTIVE_STRATEGY: 'trading-checklist-active-strategy',
  CHECKED_IDS: 'trading-checklist-checked-ids',
  NOTES: 'trading-checklist-notes',
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// -------------------- Component --------------------

export default function TradingChecklistApp() {
  // strategies state
  const [strategies, setStrategies] = useState<Strategy[]>(defaultStrategies);
  const [activeId, setActiveId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // checklist state
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<string>("");

  // history
  const [history, setHistory] = useState<TradeLog[]>([]);

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSharing, setOpenSharing] = useState(false);

  // images
  const [tradeImages, setTradeImages] = useState<TradeImage[]>([]);

  // new strategy builder state
  const [newName, setNewName] = useState("");
  const [builderConds, setBuilderConds] = useState<Condition[]>([]);

  // onboarding state
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [tradeFilters, setTradeFilters] = useState<TradeFiltersType>({
    search: '',
    strategy: '',
    verdict: '',
    outcome: '',
    pair: '',
    session: '',
    dayOfWeek: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    pnlMin: '',
    pnlMax: '',
  });
  const [availableTags, setAvailableTags] = useState<TradeTag[]>([]);

  // calendar state
  const [showCalendar, setShowCalendar] = useState(false);

  // Filtered trades
  const filteredTrades = useTradeFilters(history as EnhancedTradeLog[], tradeFilters);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedStrategies = loadFromStorage(STORAGE_KEYS.STRATEGIES, defaultStrategies);
    const loadedHistory = loadFromStorage(STORAGE_KEYS.HISTORY, []);
    const loadedActiveId = loadFromStorage(STORAGE_KEYS.ACTIVE_STRATEGY, loadedStrategies[0]?.id || "");
    const loadedCheckedIds = loadFromStorage(STORAGE_KEYS.CHECKED_IDS, []);
    const loadedNotes = loadFromStorage(STORAGE_KEYS.NOTES, "");

    setStrategies(loadedStrategies);
    setHistory(loadedHistory);
    setActiveId(loadedActiveId);
    setCheckedIds(loadedCheckedIds);
    setNotes(loadedNotes);
    setIsLoaded(true);

    // Check if this is the first visit
    const hasVisited = localStorage.getItem('trading-checklist-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('trading-checklist-visited', 'true');
    }
  }, []);

  // Save strategies to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.STRATEGIES, strategies);
    }
  }, [strategies, isLoaded]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.HISTORY, history);
    }
  }, [history, isLoaded]);

  // Save active strategy to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && activeId) {
      saveToStorage(STORAGE_KEYS.ACTIVE_STRATEGY, activeId);
    }
  }, [activeId, isLoaded]);

  // Save checked conditions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.CHECKED_IDS, checkedIds);
    }
  }, [checkedIds, isLoaded]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.NOTES, notes);
    }
  }, [notes, isLoaded]);

  // Don't render until data is loaded to prevent hydration issues
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your trading data...</p>
        </div>
      </div>
    );
  }

  const activeStrategy = strategies.find((s) => s.id === activeId) || strategies[0];
  if (!activeStrategy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>No strategies available</p>
        </div>
      </div>
    );
  }

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // edit builder clones existing
  const startEdit = () => {
    setBuilderConds(JSON.parse(JSON.stringify(activeStrategy.conditions)));
    setNewName(activeStrategy.name);
    setOpenEdit(true);
  };

  // utility: improved scoring
  const possibleScore = activeStrategy.conditions.reduce(
    (sum, c) => sum + importanceWeights[c.importance],
    0
  );
  const score = checkedIds.reduce((sum, id) => {
    const cond = activeStrategy.conditions.find((c) => c.id === id);
    return cond ? sum + importanceWeights[cond.importance] : sum;
  }, 0);

  // Improved A+ calculation
  const getVerdict = () => {
    const highConditions = activeStrategy.conditions.filter(c => c.importance === "high");
    const checkedHighConditions = checkedIds.filter(id => {
      const cond = activeStrategy.conditions.find(c => c.id === id);
      return cond?.importance === "high";
    });
    
    // If all high importance conditions are checked, it's A+
    if (highConditions.length > 0 && checkedHighConditions.length === highConditions.length) {
      return "A+";
    }
    
    // Otherwise, use the 85% threshold (lowered from 90%)
    const percentage = possibleScore > 0 ? (score / possibleScore) : 0;
    return percentage >= 0.85 ? "A+" : "Not A+";
  };

  const verdict = getVerdict();
  const percentage = possibleScore > 0 ? Math.round((score / possibleScore) * 100) : 0;

  // save trade
  const saveTrade = async () => {
    const trade: TradeLog = {
      id: Date.now(),
      strategyName: activeStrategy.name,
      checkedIds,
      score,
      possible: possibleScore,
      notes,
      verdict,
      timestamp: new Date().toLocaleString(),
      imageIds: tradeImages.map(img => img.imageId),
    };

    // Save images to IndexedDB with the trade ID
    try {
      for (const image of tradeImages) {
        if (image.imageId.startsWith('temp_')) {
          // Save temporary images permanently
          await ImageStorageManager.saveImage(trade.id, image.blob, image.filename);
        }
      }
    } catch (error) {
      console.warn('Failed to save trade images:', error);
    }

    setHistory([trade, ...history]);
    // reset
    setCheckedIds([]);
    setNotes("");
    setTradeImages([]);
  };

  // export
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text(`Strategy: ${activeStrategy.name}`, 10, 10);
    doc.text(`Score: ${score}/${possibleScore} (${percentage}%) - ${verdict}`, 10, 20);
    activeStrategy.conditions.forEach((c, idx) => {
      const mark = checkedIds.includes(c.id) ? "[x]" : "[ ]";
      doc.text(`${mark} ${c.text} (${c.importance})`, 10, 30 + idx * 10);
    });
    doc.text(`Notes: ${notes}`, 10, 40 + activeStrategy.conditions.length * 10);
    doc.save("trade-checklist.pdf");
  };

  // builder helpers
  const addBuilderCondition = () => {
    setBuilderConds([
      ...builderConds,
      {
        id: Date.now(),
        text: "",
        importance: "medium",
      },
    ]);
  };

  const removeBuilderCondition = (index: number) => {
    setBuilderConds(builderConds.filter((_, i) => i !== index));
  };

  const saveNewStrategy = () => {
    if (!newName || builderConds.length === 0) return;
    const strat: Strategy = {
      id: Date.now().toString(),
      name: newName,
      conditions: builderConds,
    };
    setStrategies([...strategies, strat]);
    setActiveId(strat.id);
    setOpenNew(false);
    // reset builder
    setNewName("");
    setBuilderConds([]);
  };

  const saveEditedStrategy = async () => {
    const strategyData = { name: newName, conditions: builderConds };
    
    // Save revision to version history
    try {
      await StrategyVersionManager.saveRevision(
        activeId, 
        strategyData, 
        "Strategy edited via builder"
      );
    } catch (error) {
      console.warn('Failed to save strategy revision:', error);
    }

    const updated = strategies.map((s) =>
      s.id === activeId ? { ...s, name: newName, conditions: builderConds } : s
    );
    setStrategies(updated);
    setOpenEdit(false);
    // Clear checked conditions that no longer exist
    const newConditionIds = builderConds.map(c => c.id);
    setCheckedIds(prev => prev.filter(id => newConditionIds.includes(id)));
  };

  // Clear all data function (for debugging/reset purposes)
  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all saved data? This cannot be undone.")) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      // Reset to defaults
      setStrategies(defaultStrategies);
      setActiveId(defaultStrategies[0].id);
      setCheckedIds([]);
      setNotes("");
      setHistory([]);
    }
  };

  // Onboarding handlers
  const handleTourComplete = () => {
    setIsFirstVisit(false);
  };

  // Tag management
  const handleCreateTag = (tag: Omit<TradeTag, 'id'>) => {
    const newTag: TradeTag = {
      ...tag,
      id: `custom-${Date.now()}`
    };
    setAvailableTags(prev => [...prev, newTag]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">A+ Trade Checklist</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <TourControls />
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="w-full sm:grid sm:grid-cols-5 flex gap-2 px-2 py-1 rounded-xl bg-muted/50 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="checklist" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <CheckCircle className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <Calculator className="h-4 w-4" />
              Risk Calculator
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap" data-tour="performance-tab">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <History className="h-4 w-4" />
              Trade History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            {/* Strategy Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategy Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 flex-wrap gap-4">
                  <Select value={activeId} onValueChange={(v) => setActiveId(v)} data-tour="strategy-selector">
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setOpenNew(true)} className="flex items-center gap-2" data-tour="new-strategy">
                    <Plus className="h-4 w-4" />
                    New Strategy
                  </Button>
                  <Button variant="outline" onClick={startEdit} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Strategy
                  </Button>
                  <Button variant="outline" onClick={() => setOpenHistory(true)} className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </Button>
                  <Button variant="outline" onClick={() => setOpenSharing(true)} className="flex items-center gap-2" data-tour="share-strategy">
                    <Star className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearAllData}>
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Card */}
            <Card data-tour="checklist">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {activeStrategy.name}
                  </span>
                  <Badge variant={verdict === "A+" ? "default" : "secondary"} className="text-sm">
                    {verdict === "A+" ? "✅ A+ Setup" : "⚠️ Not A+"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {activeStrategy.conditions.map((c) => (
                    <div key={c.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Checkbox 
                        checked={checkedIds.includes(c.id)} 
                        onCheckedChange={() => toggleCheck(c.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{c.text}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${
                            c.importance === "high"
                              ? "border-red-500 text-red-600"
                              : c.importance === "medium"
                              ? "border-orange-500 text-orange-600"
                              : "border-yellow-500 text-yellow-600"
                          }`}
                        >
                          {c.importance}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4" data-tour="notes">
                  <Label htmlFor="notes">Trade Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add your trade analysis, market conditions, or any other relevant notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="space-y-2">
                    <Label>Screenshots & Charts</Label>
                    <ImageAttachment
                      images={tradeImages}
                      onImagesChange={setTradeImages}
                      maxImages={3}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className={`text-lg font-semibold ${verdict === "A+" ? "text-green-600" : "text-yellow-600"}`}>
                      {verdict === "A+" ? "✅ Confident Entry" : "⚠️ Wait for More Confluences"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score: {score}/{possibleScore} ({percentage}%)
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={saveTrade} className="flex items-center gap-2" data-tour="save-trade">
                      <CheckCircle className="h-4 w-4" />
                      Save Trade
                    </Button>
                    <Button variant="outline" onClick={exportPdf} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Calculator Tab */}
          <TabsContent value="calculator">
            <RiskCalculator />
          </TabsContent>

          {/* Performance Dashboard Tab */}
          <TabsContent value="performance">
            <PerformanceDashboard trades={history} />
          </TabsContent>

          {/* Trade History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Trade History
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Trade Filters */}
            {showFilters && (
              <TradeFilters
                trades={history as EnhancedTradeLog[]}
                filters={tradeFilters}
                onFiltersChange={setTradeFilters}
                availableTags={availableTags}
                onCreateTag={handleCreateTag}
              />
            )}

            {/* Calendar Heatmap */}
            {showCalendar && (
              <CalendarHeatmap
                trades={history as EnhancedTradeLog[]}
                year={new Date().getFullYear()}
                month={new Date().getMonth()}
              />
            )}

            {/* Trade List */}
            <Card>
              <CardContent>
                {filteredTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{history.length === 0 ? 'No trades logged yet.' : 'No trades match your filters.'}</p>
                    <p className="text-sm">
                      {history.length === 0 
                        ? 'Start by completing a checklist and saving your first trade!' 
                        : 'Try adjusting your filter criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTrades.map((t) => (
                      <Card key={t.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{t.strategyName}</Badge>
                              <Badge variant={t.verdict === "A+" ? "default" : "secondary"}>
                                {t.verdict}
                              </Badge>
                              {t.pair && <Badge variant="outline">{t.pair}</Badge>}
                              {t.session && <Badge variant="outline">{t.session}</Badge>}
                            </div>
                            <span className="text-sm text-muted-foreground">{t.timestamp}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><strong>Score:</strong> {t.score}/{t.possible} ({Math.round((t.score/t.possible)*100)}%)</p>
                            {t.pnl !== undefined && (
                              <p><strong>P&L:</strong> <span className={t.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ${t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                              </span></p>
                            )}
                            {t.notes && <p className="italic text-muted-foreground">&ldquo;{t.notes}&rdquo;</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>

        {/* Strategy Builder Dialogs */}
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Strategy</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="strategy-name">Strategy Name</Label>
                <Input 
                  id="strategy-name"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter strategy name..."
                />
              </div>

              <div className="space-y-4">
                <Label>Conditions</Label>
                {builderConds.map((c, idx) => (
                  <div key={c.id} className="flex space-x-2 items-center p-3 border rounded-lg">
                    <Input
                      className="flex-1"
                      value={c.text}
                      onChange={(e) => {
                        const copy = [...builderConds];
                        copy[idx].text = e.target.value;
                        setBuilderConds(copy);
                      }}
                      placeholder="Condition description..."
                    />
                    <Select
                      value={c.importance}
                      onValueChange={(v) => {
                        const copy = [...builderConds];
                        copy[idx].importance = v as Importance;
                        setBuilderConds(copy);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeBuilderCondition(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addBuilderCondition} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={saveNewStrategy} disabled={!newName || builderConds.length === 0}>
                  Create Strategy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Strategy</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-strategy-name">Strategy Name</Label>
                <Input 
                  id="edit-strategy-name"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Conditions</Label>
                {builderConds.map((c, idx) => (
                  <div key={c.id} className="flex space-x-2 items-center p-3 border rounded-lg">
                    <Input
                      className="flex-1"
                      value={c.text}
                      onChange={(e) => {
                        const copy = [...builderConds];
                        copy[idx].text = e.target.value;
                        setBuilderConds(copy);
                      }}
                    />
                    <Select
                      value={c.importance}
                      onValueChange={(v) => {
                        const copy = [...builderConds];
                        copy[idx].importance = v as Importance;
                        setBuilderConds(copy);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeBuilderCondition(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addBuilderCondition} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={saveEditedStrategy}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Strategy History Modal */}
        <StrategyHistoryModal
          open={openHistory}
          onOpenChange={setOpenHistory}
          strategyId={activeId}
          strategyName={activeStrategy.name}
          onRestore={(strategyData) => {
            // Update the strategy with restored data
            const updated = strategies.map((s) =>
              s.id === activeId ? { ...s, ...strategyData } : s
            );
            setStrategies(updated);
            // Clear checked conditions that no longer exist
            const newConditionIds = strategyData.conditions.map(c => c.id);
            setCheckedIds(prev => prev.filter(id => newConditionIds.includes(id)));
          }}
        />

        {/* Strategy Sharing Modal */}
        <StrategySharingComponent
          open={openSharing}
          onOpenChange={setOpenSharing}
          strategy={activeStrategy}
          onImportStrategy={(importedStrategy) => {
            setStrategies([...strategies, importedStrategy]);
            setActiveId(importedStrategy.id);
          }}
        />

        {/* Onboarding Tour */}
        <OnboardingTour
          isFirstVisit={isFirstVisit}
          onTourComplete={handleTourComplete}
        />
      </main>
    </div>
  );
}

/*
--------------------------------------------------------------------
👉  CLI COMPONENTS TO ADD (shadcn)
--------------------------------------------------------------------
Run these once if you haven't already:

npx shadcn@latest add button
npx shadcn@latest add checkbox
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add label

*/
