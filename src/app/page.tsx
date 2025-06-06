"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
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

  // new strategy builder state
  const [newName, setNewName] = useState("");
  const [builderConds, setBuilderConds] = useState<Condition[]>([]);

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
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const activeStrategy = strategies.find((s) => s.id === activeId) || strategies[0];
  if (!activeStrategy) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center text-red-600">No strategies available</div>
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
  const saveTrade = () => {
    const trade: TradeLog = {
      id: Date.now(),
      strategyName: activeStrategy.name,
      checkedIds,
      score,
      possible: possibleScore,
      notes,
      verdict,
      timestamp: new Date().toLocaleString(),
    };
    setHistory([trade, ...history]);
    // reset
    setCheckedIds([]);
    setNotes("");
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

  const saveEditedStrategy = () => {
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">A+ Trade Checklist</h1>

      {/* Strategy Selector */}
      <div className="flex items-center space-x-4 flex-wrap">
        <Select value={activeId} onValueChange={(v) => setActiveId(v)}>
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
        <Button onClick={() => setOpenNew(true)}>+ New Strategy</Button>
        <Button variant="outline" onClick={startEdit}>Edit Strategy</Button>
        <Button variant="destructive" size="sm" onClick={clearAllData}>Clear All Data</Button>
      </div>

      {/* Checklist Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {activeStrategy.conditions.map((c) => (
            <div key={c.id} className="flex items-center space-x-2">
              <Checkbox checked={checkedIds.includes(c.id)} onCheckedChange={() => toggleCheck(c.id)} />
              <span>
                {c.text} {" "}
                <span className={
                  c.importance === "high"
                    ? "text-red-600"
                    : c.importance === "medium"
                    ? "text-orange-500"
                    : "text-yellow-500"
                }>
                  ({c.importance})
                </span>
              </span>
            </div>
          ))}

          <Textarea
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span
                className={verdict === "A+" ? "text-green-600" : "text-yellow-600"}
              >
                Verdict: {verdict === "A+" ? "✅ Confident Entry. This is an A+ trade setup." : "⚠️ Not A+. Wait for more confluences before entering."}
              </span>
              <span className="text-sm text-muted-foreground">
                Score: {score}/{possibleScore} ({percentage}%)
              </span>
            </div>
            <div className="space-x-2">
              <Button onClick={saveTrade}>Save Trade</Button>
              <Button variant="outline" onClick={exportPdf}>Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade History */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Trade History</h2>
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">No trades logged yet.</p>
        )}
        {history.map((t) => (
          <Card key={t.id} className="mb-2">
            <CardContent className="p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t.strategyName}</span>
                <span>{t.timestamp}</span>
              </div>
              <p>Score: {t.score}/{t.possible} — {t.verdict}</p>
              <p className="italic">{t.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- New Strategy Dialog ---------- */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Strategy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <Label>Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />

            <Label>Conditions</Label>
            {builderConds.map((c, idx) => (
              <div key={c.id} className="flex space-x-2 items-center">
                <Input
                  className="flex-1"
                  value={c.text}
                  onChange={(e) => {
                    const copy = [...builderConds];
                    copy[idx].text = e.target.value;
                    setBuilderConds(copy);
                  }}
                  placeholder="Condition text..."
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
                    <SelectItem value="high">🟥 High</SelectItem>
                    <SelectItem value="medium">🟧 Medium</SelectItem>
                    <SelectItem value="low">🟨 Low</SelectItem>
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
            <Button variant="secondary" onClick={addBuilderCondition}>+ Add Condition</Button>
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={saveNewStrategy}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Edit Strategy Dialog ---------- */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Strategy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <Label>Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />

            <Label>Conditions</Label>
            {builderConds.map((c, idx) => (
              <div key={c.id} className="flex space-x-2 items-center">
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
                    <SelectItem value="high">🟥 High</SelectItem>
                    <SelectItem value="medium">🟧 Medium</SelectItem>
                    <SelectItem value="low">🟨 Low</SelectItem>
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
            <Button variant="secondary" onClick={addBuilderCondition}>+ Add Condition</Button>
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={saveEditedStrategy}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
