"use client";

import { BrainCircuit, LoaderCircle, Users } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import type { DiagnosisEntry } from "@/types";

interface DiagnosisWorkspaceProps {
  demoMode: boolean;
  initialEntries: DiagnosisEntry[];
  canEdit: boolean;
  canViewSensitive: boolean;
}

export function DiagnosisWorkspace({
  demoMode,
  initialEntries,
  canEdit,
  canViewSensitive
}: DiagnosisWorkspaceProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [caseId, setCaseId] = useState(initialEntries[0]?.caseId ?? "CASE-1001");
  const [authorName, setAuthorName] = useState("Dr. Collaborative Team");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [status, setStatus] = useState<DiagnosisEntry["status"]>("Shared");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const caseIds = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.caseId))),
    [entries]
  );

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.caseId === caseId),
    [entries, caseId]
  );

  const contributorSummary = useMemo(() => {
    return Object.values(
      entries.reduce<Record<string, { authorName: string; specialty: string; count: number }>>(
        (accumulator, entry) => {
          const key = `${entry.authorName}-${entry.specialty}`;

          if (!accumulator[key]) {
            accumulator[key] = {
              authorName: entry.authorName,
              specialty: entry.specialty,
              count: 0
            };
          }

          accumulator[key].count += 1;
          return accumulator;
        },
        {}
      )
    );
  }, [entries]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const newEntry: DiagnosisEntry = {
      id: `local-${Date.now()}`,
      caseId,
      authorName,
      specialty,
      note,
      status,
      createdAt: new Date().toISOString(),
      confidenceScore: 0.84
    };

    try {
      const supabase = createBrowserSupabaseClient();

      if (supabase && !demoMode) {
        const { data, error } = await supabase
          .from("diagnoses")
          .insert([
            {
              case_id: caseId,
              author_name: authorName,
              specialty,
              note,
              status,
              created_at: newEntry.createdAt,
              confidence_score: newEntry.confidenceScore
            }
          ])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          newEntry.id = String(data.id ?? newEntry.id);
        }
      }

      setEntries((current) => [newEntry, ...current]);
      setNote("");
      setFeedback(
        demoMode
          ? "Entry added to the demo case board."
          : "Diagnosis update shared with the collaborative case thread."
      );
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to add diagnosis entry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`grid gap-6 ${
        canEdit ? "xl:grid-cols-[1.3fr_0.7fr]" : "xl:grid-cols-1"
      }`}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-teal-700" />
            Shared case workspace
          </CardTitle>
          <CardDescription>
            {canViewSensitive
              ? "Add multiple specialist viewpoints to a single diagnosis case without losing timeline context."
              : "Patient mode shows case progress while internal clinical commentary remains protected."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="board">
            <TabsList>
              <TabsTrigger value="board">Case board</TabsTrigger>
              <TabsTrigger value="contributors">Contributors</TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {caseIds.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCaseId(value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      value === caseId
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-border bg-white/80 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-3xl border border-border/70 bg-slate-50/70 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {canViewSensitive ? entry.authorName : "Care team member"}
                          </p>
                          <Badge
                            variant={
                              entry.status === "Resolved"
                                ? "success"
                                : entry.status === "Needs Review"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {canViewSensitive ? entry.specialty : "Specialty hidden"}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatDateTime(entry.createdAt)}
                      </div>
                    </div>
                    <p className="mt-4 leading-7 text-slate-700">
                      {canViewSensitive
                        ? entry.note
                        : "Internal clinician notes are hidden in patient mode. The current status remains visible without exposing protected review details."}
                    </p>
                    <div className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                      Confidence {Math.round(entry.confidenceScore * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contributors">
              <div className="grid gap-4 md:grid-cols-2">
                {contributorSummary.map((contributor) => (
                  <div
                    key={`${contributor.authorName}-${contributor.specialty}`}
                    className="rounded-3xl border border-border/70 bg-slate-50/70 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-teal-100 p-3 text-teal-800">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {canViewSensitive ? contributor.authorName : "Verified clinician"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {canViewSensitive ? contributor.specialty : "Specialty hidden"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      {contributor.count} updates contributed across active case
                      discussions.
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Add case entry</CardTitle>
            <CardDescription>
              Capture another specialist note, triage update, or evidence-based
              observation for the selected case.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="case-id">Case ID</Label>
                <Input
                  id="case-id"
                  value={caseId}
                  onChange={(event) => setCaseId(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author-name">Author</Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Entry status</Label>
                <select
                  id="status"
                  className="flex h-11 w-full rounded-xl border border-input bg-white/90 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as DiagnosisEntry["status"])
                  }
                >
                  <option value="Shared">Shared</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Clinical note</Label>
                <Textarea
                  id="note"
                  placeholder="Add your specialist observation, recommendation, or follow-up request..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  required
                />
              </div>
              {feedback ? (
                <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                  {feedback}
                </div>
              ) : null}
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Publishing entry
                  </>
                ) : (
                  "Share diagnosis update"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Protected collaboration</CardTitle>
            <CardDescription>
              Patient sessions can follow case status, but only verified doctors
              can add entries or reveal full internal commentary.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-600">
            <p>
              Sign in as a doctor with a verified licence number to add entries,
              view specialist identities, and access the complete collaborative
              diagnosis workspace.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
