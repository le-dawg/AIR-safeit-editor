import { ProgrammingLanguageOptions } from "@opencanvas/shared/types";
import { ThreadPrimitive, useThreadRuntime } from "@assistant-ui/react";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { JOURNAL_SYSTEM_PROMPT, formatPromptWithVars } from "@/config/journal-prompts";

interface JournalFormData {
  date: Date;
  author: string;
  subject: string;
  content: string;
}

interface ThreadWelcomeProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
  searchEnabled: boolean;
}

const JournalEntryForm = ({ handleQuickStart }: { handleQuickStart: ThreadWelcomeProps['handleQuickStart'] }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<JournalFormData>({
    date: new Date(),
    author: "",
    subject: "",
    content: ""
  });

  const threadRuntime = useThreadRuntime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First navigate to canvas view
    handleQuickStart("text");

    // Format the prompt with all available variables
    const prompt = formatPromptWithVars(JOURNAL_SYSTEM_PROMPT, {
      content: formData.content,
      date: format(formData.date, "PPP"),
      author: formData.author,
      subject: formData.subject
    });
    
    // Add system prompt and user content to the thread
    await threadRuntime.append({
      role: "system",
      content: [{ type: "text", text: prompt }],
    });
    
    await threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: formData.content }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-8 rounded-lg bg-teal-50">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setFormData(prev => ({ ...prev, date }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Author Name</label>
          <Input
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Subject Name</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter the name of the person you're writing about"
            className="w-full"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Journal Entry</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your journal entry here..."
            className="w-full min-h-[200px]"
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg transition-colors"
        >
          Generate New Journal Entry
        </Button>
      </div>
    </form>
  );
};

export const ThreadWelcome: FC<ThreadWelcomeProps> = (props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full py-12 px-4">
      <JournalEntryForm handleQuickStart={props.handleQuickStart} />
    </div>
  );
};
