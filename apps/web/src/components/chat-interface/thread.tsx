import { useGraphContext } from "@/contexts/GraphContext";
import { useToast } from "@/hooks/use-toast";
import { ProgrammingLanguageOptions } from "@opencanvas/shared/types";
import { ThreadPrimitive } from "@assistant-ui/react";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import { ArrowDownIcon, PanelRightOpen, SquarePen, Home } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import { ReflectionsDialog } from "../reflections-dialog/ReflectionsDialog";
import { useLangSmithLinkToolUI } from "../tool-hooks/LangSmithLinkToolUI";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";
import { TighterText } from "../ui/header";
import { Composer } from "./composer";
import { AssistantMessage, UserMessage } from "./messages";
import { ThreadWelcome } from "./welcome";
import { useUserContext } from "@/contexts/UserContext";
import { useThreadContext } from "@/contexts/ThreadProvider";
import { useAssistantContext } from "@/contexts/AssistantContext";

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export interface ThreadProps {
  userId: string | undefined;
  hasChatStarted: boolean;
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  setChatStarted: Dispatch<SetStateAction<boolean>>;
  switchSelectedThreadCallback: (thread: ThreadType) => void;
  searchEnabled: boolean;
  setChatCollapsed: (c: boolean) => void;
}

export const Thread: FC<ThreadProps> = (props: ThreadProps) => {
  const {
    setChatStarted,
    hasChatStarted,
    handleQuickStart,
    switchSelectedThreadCallback,
  } = props;
  const { toast } = useToast();
  const {
    graphData: { clearState, runId, feedbackSubmitted, setFeedbackSubmitted },
  } = useGraphContext();
  const { selectedAssistant } = useAssistantContext();
  const {
    modelName,
    setModelName,
    modelConfig,
    setModelConfig,
    modelConfigs,
    setThreadId,
  } = useThreadContext();
  const { user } = useUserContext();

  // Render the LangSmith trace link
  useLangSmithLinkToolUI();

  const handleNewSession = async () => {
    if (!user) {
      toast({
        title: "User not found",
        description: "Failed to create thread without user",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    // Remove the threadId param from the URL
    setThreadId(null);

    setModelName(modelName);
    setModelConfig(modelName, modelConfig);
    clearState();
    setChatStarted(false);
  };

  const handleReturnToWelcome = () => {
    // Clear the thread state
    clearState();
    // Remove the threadId from URL
    setThreadId(null);
    // Reset chat state
    setChatStarted(false);
    // Keep chat collapsed
    props.setChatCollapsed(true);
  };

  return (
    <ThreadPrimitive.Root className="flex flex-col h-full w-full">
      {/* Conditionally render the header only when chat has started */}
      {hasChatStarted && (
        <div className="pr-3 pl-6 pt-3 pb-2 flex flex-row gap-4 items-center justify-between bg-[rgba(20,110,98,0.29)]">
          {/* Wrapper div with mx-auto to center the button group */}
          <div className="flex items-center justify-center gap-2 mx-auto">
            <button
              onClick={handleReturnToWelcome}
              className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <Home className="w-5 h-5" />
              {/* Danish text, hidden below md breakpoint, shown md and up */}
              <span className="md:inline text-xl">Tilbage til forsiden</span>
            </button>
          </div>
          {/* Ensure there's space on the right if needed for justify-between */}
          <div className="w-0"></div> {/* Placeholder or add actual right-side elements if any */}
        </div>
      )}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto scroll-smooth bg-inherit px-4 pt-8">
        {/* Welcome screen is now correctly displayed ONLY when chat hasn't started */}
        {!hasChatStarted && (
          <ThreadWelcome
            handleQuickStart={handleQuickStart}
            composer={
              <Composer
                chatStarted={false}
                userId={props.userId}
                searchEnabled={props.searchEnabled}
              />
            }
            searchEnabled={props.searchEnabled}
          />
        )}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: (prop) => (
              <AssistantMessage
                {...prop}
                feedbackSubmitted={feedbackSubmitted}
                setFeedbackSubmitted={setFeedbackSubmitted}
                runId={runId}
              />
            ),
          }}
        />
      </ThreadPrimitive.Viewport>
      <div className="mt-4 flex w-full flex-col items-center justify-end rounded-t-lg bg-inherit pb-4 px-4">
        <ThreadScrollToBottom />
        <div className="w-full max-w-2xl">
          {hasChatStarted && (
            <div className="flex flex-col space-y-2">
              <Composer
                chatStarted={true}
                userId={props.userId}
                searchEnabled={props.searchEnabled}
              />
            </div>
          )}
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};
