import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, MessageSquare, Sparkles, Car, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  transcriptText?: string | null;
}

interface ChatSession {
  id: number;
  activeFilters: Record<string, any>;
  status: string;
}

interface VoiceChatDrawerProps {
  onFiltersChange?: (filters: Record<string, any>) => void;
  onCarsFound?: (cars: any[]) => void;
}

export default function VoiceChatDrawer({ onFiltersChange, onCarsFound }: VoiceChatDrawerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Start a new session when drawer opens
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chat/session");
      return res.json();
    },
    onSuccess: (session: ChatSession) => {
      setSessionId(session.id);
      setMessages([]);
      // Add welcome message
      setMessages([{
        id: 0,
        role: "assistant",
        content: "Hi! I'm your AutoNinja car search assistant. Tell me what kind of car you're looking for - I can help filter by make, model, price, year, or any other preferences!"
      }]);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; isVoice?: boolean; transcriptText?: string }) => {
      const res = await apiRequest("POST", `/api/chat/session/${sessionId}/message`, data);
      return res.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: response.message.content
      }]);
      
      if (response.filters && onFiltersChange) {
        onFiltersChange(response.filters);
      }
      
      if (response.shouldSearch && response.cars && onCarsFound) {
        onCarsFound(response.cars);
        toast({
          title: `Found ${response.cars.length} cars`,
          description: "Matching your criteria"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (open && !sessionId) {
      startSessionMutation.mutate();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !sessionId || sendMessageMutation.isPending) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: userMessage
    }]);
    setInputValue("");
    sendMessageMutation.mutate({ content: userMessage });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice search",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    // For now, we'll use a text prompt to describe the voice input
    // In a full implementation, this would send audio to the server for transcription
    toast({
      title: "Voice recorded",
      description: "Voice transcription is processing... Type your request for now.",
    });
    
    setIsProcessing(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-white z-50"
          data-testid="button-voice-chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-primary text-white">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-accent" />
            Car Search Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-accent text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                    data-testid={`chat-message-${message.role}-${idx}`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.transcriptText && (
                      <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        <Mic className="h-3 w-3" /> Voice transcription
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sendMessageMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-2 rounded-bl-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-background">
          <div className="flex items-center gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className="shrink-0"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || sendMessageMutation.isPending}
              data-testid="button-voice-record"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your ideal car..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              className="shrink-0 bg-accent hover:bg-accent/90"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-destructive mt-2 text-center animate-pulse">
              Recording... Click the mic to stop
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
