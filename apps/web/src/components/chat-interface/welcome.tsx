import { ProgrammingLanguageOptions } from "@opencanvas/shared/types";
import { ThreadPrimitive, useThreadRuntime } from "@assistant-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { FC, useMemo } from "react";
import { TighterText } from "../ui/header";
import { NotebookPen } from "lucide-react";
import { ProgrammingLanguagesDropdown } from "../ui/programming-lang-dropdown";
import { Button } from "../ui/button";
// Added imports for the journal form UI
// import { journalPrompts } from '@/config/journal-prompts';
import { FC, useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { JOURNAL_SYSTEM_PROMPT, formatPromptWithVars } from "../../config/journal-prompts";

// const QUICK_START_PROMPTS_SEARCH = [
//   "",
// ];

// const QUICK_START_PROMPTS = [
//   "Start with a new report for Person X",
//   "Begin with a new journal entry for school Y",
//   "Help me write a journal entry under the rules for Region Z.",
// ];

// function getRandomPrompts(prompts: string[], count: number = 4): string[] {
//   return [...prompts].sort(() => Math.random() - 0.5).slice(0, count);
// }

// interface QuickStartButtonsProps {
//   handleQuickStart: (
//     type: "text" | "code",
//     language?: ProgrammingLanguageOptions
//   ) => void;
//   composer: React.ReactNode;
//   searchEnabled: boolean;
// }

// interface QuickStartPromptsProps {
//   searchEnabled: boolean;
// }

// const QuickStartPrompts = ({ searchEnabled }: QuickStartPromptsProps) => {
//   const threadRuntime = useThreadRuntime();

//   const handleClick = (text: string) => {
//     threadRuntime.append({
//       role: "user",
//       content: [{ type: "text", text }],
//     });
//   };

//   const selectedPrompts = useMemo(
//     () =>
//       getRandomPrompts(
//         searchEnabled ? QUICK_START_PROMPTS_SEARCH : QUICK_START_PROMPTS
//       ),
//     [searchEnabled]
//   );

//   return (
//     <div className="flex flex-col w-full gap-2">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
//         {selectedPrompts.map((prompt, index) => (
//           <Button
//             key={`quick-start-prompt-${index}`}
//             onClick={() => handleClick(prompt)}
//             variant="outline"
//             className="min-h-[60px] w-full flex items-center justify-center p-6 whitespace-normal text-gray-500 hover:text-gray-700 transition-colors ease-in rounded-2xl"
//           >
//             <p className="text-center break-words text-sm font-normal">
//               {prompt}
//             </p>
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// };

// const QuickStartButtons = (props: QuickStartButtonsProps) => {
//   return (
//     <div className="flex flex-col gap-8 items-center justify-center w-full">
//       <div className="flex flex-col gap-6">
//         <p className="text-gray-600 text-sm">Start with a blank canvas</p>
//         <div className="flex flex-row gap-1 items-center justify-center w-full">
//           <Button
//             variant="outline"
//             className="text-gray-500 hover:text-gray-700 transition-colors ease-in rounded-2xl flex items-center justify-center gap-2 w-[250px] h-[64px]"
//             onClick={() => props.handleQuickStart("text")}
//           >
//             New Report Draft
//             <NotebookPen />
//           </Button>
//         </div>
//       </div>
//       <div className="flex flex-col gap-6 mt-2 w-full">
//         <p className="text-gray-600 text-sm">or with a message</p>
//         {props.composer}
//         <QuickStartPrompts searchEnabled={props.searchEnabled} />
//       </div>
//     </div>
//   );
// };

interface ThreadWelcomeProps {
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  composer: React.ReactNode;
  searchEnabled: boolean;
}

// Added from the makeitsafe branch


interface JournalFormData {
  date: Date;
  author: string;
  subject: string;
  content: string;
}

export const ThreadWelcome: FC<ThreadWelcomeProps> = (
  props: ThreadWelcomeProps
) => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex items-center justify-center mt-16 w-full">
        <div className="text-center max-w-3xl w-full">
          <Avatar className="mx-auto">
            <AvatarImage src="/safe-it-logo.png" alt="Safe-IT Logo" className="object-cover cropped-bg" />
            <AvatarFallback>SI</AvatarFallback>
          </Avatar>
          <TighterText className="mt-4 text-lg font-medium">
            What would you like to write today?
          </TighterText>
          <div className="mt-8 w-full">
            <JournalEntryForm handleQuickStart={props.handleQuickStart} />
          </div>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const JournalEntryForm = ({
  handleQuickStart,
}: {
  handleQuickStart: ThreadWelcomeProps["handleQuickStart"];
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<JournalFormData>({
    date: new Date(),
    author: "",
    subject: "",
    content: "",
  });

  // Get thread runtime to append messages.
  const threadRuntime = useThreadRuntime();

  // Handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Navigate to the canvas view.
    handleQuickStart("text");

    // Format the prompt using the journal system prompt and current form data.
    const prompt = formatPromptWithVars(JOURNAL_SYSTEM_PROMPT, {
      content: formData.content,
      date: format(date, "PPP"),
      author: formData.author,
      subject: formData.subject,
    });

    // Append a system message with the formatted prompt.
    await threadRuntime.append({
      role: "system",
      content: [{ type: "text", text: prompt }],
    });

    // Append the user message with the journal content.
    await threadRuntime.append({
      role: "user",
      content: [{ type: "text", text: formData.content }],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <Input
        type="text"
        value={formData.author}
        onChange={(e) =>
          setFormData({ ...formData, author: e.target.value })
        }
        placeholder="Author"
        className="w-full"
      />
      <Input
        type="text"
        value={formData.subject}
        onChange={(e) =>
          setFormData({ ...formData, subject: e.target.value })
        }
        placeholder="Subject"
        className="w-full"
      />
      <Textarea
        value={formData.content}
        onChange={(e) =>
          setFormData({ ...formData, content: e.target.value })
        }
        placeholder="Content"
        className="w-full"
      />
      <div className="flex flex-row gap-2 items-center justify-center w-full">
        <CalendarIcon className="text-gray-500" />
        <Input
          type="date"
          value={format(date, "yyyy-MM-dd")}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="text-gray-500 hover:text-gray-700 transition-colors ease-in rounded-2xl flex items-center justify-center gap-2 w-full"
      >
        Start Writing
      </Button>
    </form>
  );
};