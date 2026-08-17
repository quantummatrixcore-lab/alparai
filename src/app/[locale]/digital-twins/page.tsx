"use client";

import { useState } from "react";
import { DIGITAL_TWINS, DIGITAL_TWINS_LIST } from "@/lib/agent-os/personas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, BrainCircuit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function DigitalTwinsPage() {
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="mr-2 h-4 w-4 text-brand-500" />
          Agent-OS: Bilge Kurul
        </Badge>
        <h1 className="text-4xl font-display font-bold md:text-5xl">
          Dijital İkizler (Rent-a-Genius)
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-fg-muted text-lg">
          Tarihe yön veren dehaların zihin yapılarıyla doğrudan etkileşime geçin. 
          Agent-OS &quot;Model Arbitraj Motoru&quot; sayesinde en uygun yapay zeka modeliyle yüksek mantıksal kapasitede danışmanlık alın.
        </p>
      </div>

      {!selectedTwin || !activePersona ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DIGITAL_TWINS_LIST.map((twin) => (
            <Card 
              key={twin.id} 
              className="group cursor-pointer border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-brand-500/20"
              onClick={() => setSelectedTwin(twin.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 p-1">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-bg-primary">
                    <BrainCircuit className="h-10 w-10 text-brand-400" />
                  </div>
                </div>
                <CardTitle>{twin.name}</CardTitle>
                <CardDescription className="text-brand-400">{twin.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {twin.expertise.slice(0, 3).map((exp) => (
                    <Badge key={exp} variant="outline" className="border-brand-500/30 text-xs">
                      {exp}
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
            onClick={() => { setSelectedTwin(null); setChatHistory([]); setModelUsed(null); }}
            className="mb-6"
          >
            ← İkiz Seçimine Dön
          </Button>

          <Card className="flex h-[600px] flex-col border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 bg-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{activePersona.name}</CardTitle>
                  <CardDescription>{activePersona.title}</CardDescription>
                </div>
                {modelUsed && (
                  <Badge variant="outline" className="border-brand-500/30 bg-brand-500/10 text-brand-300">
                    Model: {modelUsed}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-fg-muted">
                  <BrainCircuit className="mb-4 h-16 w-16 opacity-50" />
                  <p>Sohbeti başlatmak için bir soru sorun.</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === "user" 
                        ? "bg-brand-600 text-white" 
                        : "bg-white/10 text-fg-primary backdrop-blur-md"
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-fg-muted backdrop-blur-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Düşünüyor...</span>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="border-t border-white/10 p-4">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${activePersona.name} ikizine sorunuzu yöneltin...`}
                  className="flex-1 border-white/20 bg-white/5"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !message.trim()} className="bg-brand-600 hover:bg-brand-500">
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
