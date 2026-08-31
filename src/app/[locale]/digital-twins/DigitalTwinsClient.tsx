"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, BrainCircuit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DIGITAL_TWINS, DIGITAL_TWINS_LIST } from "@/lib/agent-os/personas";

export function DigitalTwinsClient() {
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "twin"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const activePersona = selectedTwin ? DIGITAL_TWINS[selectedTwin] : null;

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTwin) return;

    const userMessage = message;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/twins/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinId: selectedTwin, message: userMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");

      setChatHistory((prev) => [...prev, { role: "twin", content: data.reply }]);
      if (data.modelUsed) {
        setModelUsed(data.modelUsed);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4">
          <Sparkles className="text-brand-500 mr-2 h-4 w-4" />
          Agent-OS: Bilge Kurul
        </Badge>
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Dijital İkizler (Rent-a-Genius)
        </h1>
        <p className="text-fg-muted mx-auto mt-4 max-w-2xl text-lg">
          Tarihe yön veren dehaların zihin yapılarıyla doğrudan etkileşime geçin. Agent-OS
          &quot;Model Arbitraj Motoru&quot; sayesinde en uygun yapay zeka modeliyle yüksek mantıksal
          kapasitede danışmanlık alın.
        </p>
      </div>

      {!selectedTwin || !activePersona ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DIGITAL_TWINS_LIST.map((twin) => (
            <Card
              key={twin.id}
              className="group hover:shadow-brand-500/20 border-border-subtle cursor-pointer bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-xl"
              onClick={() => setSelectedTwin(twin.id)}
            >
              <CardHeader className="text-center">
                <div className="from-brand-500 to-brand-700 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br p-1">
                  <div className="bg-bg-primary flex h-full w-full flex-col items-center justify-center rounded-full">
                    <BrainCircuit className="text-brand-400 h-10 w-10" />
                  </div>
                </div>
                <CardTitle>{twin.name}</CardTitle>
                <CardDescription className="text-brand-400">{twin.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {twin.expertise.map((exp: unknown, _i: number) => (
                    <Badge
                      key={String(exp)}
                      variant="outline"
                      className="border-brand-500/30 text-xs"
                    >
                      {String(exp)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedTwin(null);
              setChatHistory([]);
              setModelUsed(null);
            }}
            className="mb-6"
          >
            ← İkiz Seçimine Dön
          </Button>

          <Card className="border-border-subtle flex h-[600px] flex-col bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-border-subtle border-b bg-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{activePersona.name}</CardTitle>
                  <CardDescription>{activePersona.title}</CardDescription>
                </div>
                {modelUsed && (
                  <Badge
                    variant="outline"
                    className="border-brand-500/30 bg-brand-500/10 text-brand-300"
                  >
                    Model: {modelUsed}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-6">
              {chatHistory.length === 0 ? (
                <div className="text-fg-muted flex h-full flex-col items-center justify-center">
                  <BrainCircuit className="mb-4 h-16 w-16 opacity-50" />
                  <p>Sohbeti başlatmak için bir soru sorun.</p>
                </div>
              ) : (
                chatHistory.map((msg, _i) => (
                  <div
                    key={_i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === "user"
                          ? "bg-brand-600 text-white"
                          : "text-fg-primary bg-white/10 backdrop-blur-md"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="text-fg-muted flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Düşünüyor...</span>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="border-border-subtle border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${activePersona.name} ikizine sorunuzu yöneltin...`}
                  className="border-border-strong flex-1 bg-white/5"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="bg-brand-600 hover:bg-brand-500"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
