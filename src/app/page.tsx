"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

// -------------------- Component --------------------

export default function TradingChecklistApp() {
  // strategies state
  const [strategies, setStrategies] = useState<Strategy[]>(defaultStrategies);
  const [activeId, setActiveId] = useState<string>(strategies[0].id);
  const activeStrategy = strategies.find((s) => s.id === activeId)!;

  // checklist state
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const toggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // notes
  const [notes, setNotes] = useState<string>("");

  // history
  const [history, setHistory] = useState<TradeLog[]>([]);

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // new strategy builder state
  const [newName, setNewName] = useState("");
  const [builderConds, setBuilderConds] = useState<Condition[]>([]);

  // edit builder clones existing
  const startEdit = () => {
    setBuilderConds(JSON.parse(JSON.stringify(activeStrategy.conditions)));
    setNewName(activeStrategy.name);
    setOpenEdit(true);
  };

  // utility: scoring
  const possibleScore = activeStrategy.conditions.reduce(
    (sum, c) => sum + importanceWeights[c.importance],
    0
  );
  const score = checkedIds.reduce((sum, id) => {
    const cond = activeStrategy.conditions.find((c) => c.id === id);
    return cond ? sum + importanceWeights[cond.importance] : sum;
  }, 0);

  const verdict = score >= possibleScore * 0.9 ? "A+" : "Not A+";

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
    doc.text(`Score: ${score}/${possibleScore} (${verdict})`, 10, 20);
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
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">A+ Trade Checklist</h1>

      {/* Strategy Selector */}
      <div className="flex items-center space-x-4">
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
            <span
              className={verdict === "A+" ? "text-green-600" : "text-yellow-600"}
            >
              Verdict: {verdict === "A+" ? "✅ Confident Entry. This is an A+ trade setup." : "⚠️ Not A+. Wait for more confluences before entering."}
            </span>
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
Run these once if you haven’t already:

npx shadcn@latest add button
npx shadcn@latest add checkbox
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add label

*/
