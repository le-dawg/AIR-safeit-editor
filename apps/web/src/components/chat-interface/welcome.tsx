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
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { PanelLeftOpen } from "lucide-react";

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
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSessionActive(true);
    // Rest of form submission logic
  };

  return (
    <>
      <div className="text-center mb-4">
        {/* <img
          src="/safe-it-logo.png"
          alt="Logo"
          style={{ width: '140px', height: '50px', margin: '0 auto' }}
        /> */}
        <h1 className="text-2xl font-bold mt-4">JournalHelper</h1>
        {isSessionActive && (
          <TooltipIconButton
            tooltip="Close Chat"
            variant="ghost"
            className="w-8 h-8 text-gray-600 hover:text-gray-900 mx-auto block"
            delayDuration={400}
            onClick={() => {
              setIsSessionActive(false);
              props.handleQuickStart("text");
            }}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </TooltipIconButton>
        )}
      </div>
      <div className="form-container bg-[rgba(20,110,98,0.29)] rounded-lg sm:w-[80%] md:w-[80%] lg:w-[60%] xl:w-[40%] 2xl:w-[40%] mx-auto">
        <div className="flex items-center justify-center mt-16 w-full">
          <div className="text-center max-w-xl w-full">
            <Avatar className="mx-auto">
              <AvatarImage src="/safe-it-logo.png" alt="Safe-IT Logo" className="object-cover cropped-bg" />
              <AvatarFallback>SI</AvatarFallback>
            </Avatar>
            <TighterText className="text-lg font-medium">
              Velkommen til din personlige hjælper
            </TighterText>
            <div className="mt-8 w-full">
              <JournalEntryForm handleQuickStart={props.handleQuickStart} handleSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const JournalEntryForm = ({
  handleQuickStart,
  handleSubmit,
}: {
  handleQuickStart: ThreadWelcomeProps["handleQuickStart"];
  handleSubmit: (e: React.FormEvent) => void;
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<JournalFormData>({
    date: new Date(),
    author: "",
    subject: "",
    content: "",
  });

  const threadRuntime = useThreadRuntime();

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    handleQuickStart("text");

    const prompt = formatPromptWithVars(JOURNAL_SYSTEM_PROMPT, {
      content: formData.content,
      date: format(date, "PPP"),
      author: formData.author,
      subject: formData.subject,
    });

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
    <form onSubmit={handleFormSubmit} className="flex flex-col w-full">
      <div className="bg-white p-2 rounded m-2">
        <label htmlFor="date" className="block text-left">Dato og klokkeslæt:</label>
        <Input
          type="date"
          id="date"
          value={format(date, "yyyy-MM-dd")} // Use the correct yyyy-MM-dd format
          onChange={(e) => setDate(new Date(e.target.value))}
        />
      </div>

      <div className="bg-white p-2 rounded m-2">
        <label htmlFor="author" className="block text-left">Forfatter:</label>
        <Input
          type="text"
          id="author"
          value={formData.author}
          onChange={(e) =>
            setFormData({ ...formData, author: e.target.value })
          }
          placeholder="Forfatter"
          className="w-full hover:border-red-500 transition-colors"
        />
      </div>

      <div className="bg-white p-2 rounded m-2">
        <label htmlFor="subject" className="block text-left">Borgernavn:</label>
        <Input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          placeholder="Borgernavn"
          className="w-full hover:border-red-500 transition-colors"
        />
      </div>

      <div className="bg-white p-2 rounded m-2">
        <label htmlFor="content" className="block text-left">Journalen:</label>
        <div className="relative">
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Journalen"
            className="w-full min-h-[200px] h-[200px] max-h-[400px] overflow-y-auto resize-y hover:border-red-500 transition-colors"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="bg-orange-700 text-white font-bold rounded-lg px-5 py-3 mb-4 hover:bg-yellow-300 hover:text-black transition-colors ease-in rounded-2xl flex items-center justify-center gap-2 w-[95%] mx-auto"
      >
        Gennemgå Journalnotat
      </Button>
    </form>
  );
};
