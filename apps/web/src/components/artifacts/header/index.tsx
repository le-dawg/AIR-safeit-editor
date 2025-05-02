import { ReflectionsDialog } from "../../reflections-dialog/ReflectionsDialog";
import { ArtifactTitle } from "./artifact-title";
import { NavigateArtifactHistory } from "./navigate-artifact-history";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { Assistant } from "@langchain/langgraph-sdk";
import { PanelRightClose, PanelLeftClose, Home } from "lucide-react"; // Import Home icon
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { useGraphContext } from "@/contexts/GraphContext"; // Import Graph context
import { useThreadContext } from "@/contexts/ThreadProvider"; // Import Thread context

interface ArtifactHeaderProps {
  isBackwardsDisabled: boolean;
  isForwardDisabled: boolean;
  setSelectedArtifact: (index: number) => void;
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
  isArtifactSaved: boolean;
  totalArtifactVersions: number;
  selectedAssistant: Assistant | undefined;
  artifactUpdateFailed: boolean;
  chatCollapsed: boolean;
  setChatCollapsed: (c: boolean) => void;
}

export function ArtifactHeader(props: ArtifactHeaderProps) {
  const { graphData: { clearState, setChatStarted } } = useGraphContext();
  const { setThreadId } = useThreadContext();

  const handleReturnToWelcome = () => {
    // Clear the thread state
    clearState();
    // Remove the threadId from URL
    setThreadId(null);
    // Reset chat state
    setChatStarted(false);
    // Keep chat collapsed (using the passed prop)
    props.setChatCollapsed(true);
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center justify-center gap-1"> {/* Reduced gap slightly */}
        {/* Add the Home button here */}
        <TooltipIconButton
          tooltip="Return to Welcome"
          variant="ghost"
          className="ml-2 mb-1 w-8 h-8"
          delayDuration={400}
          onClick={handleReturnToWelcome}
        >
          <Home className="text-gray-600" />
        </TooltipIconButton>
        {(!props.chatCollapsed) && (
          <TooltipIconButton
            tooltip="Close Chat"
            variant="ghost"
            className="ml-2 mb-1 w-8 h-8"
            delayDuration={400}
            onClick={() => props.setChatCollapsed(true)}
          >
            <PanelRightClose className="text-gray-600" />
          </TooltipIconButton>
        )}
        {props.chatCollapsed && ( // Simplified condition
          <TooltipIconButton
            tooltip="Expand Chat"
            variant="ghost"
            className="ml-2 mb-1 w-8 h-8"
            delayDuration={400}
            onClick={() => props.setChatCollapsed(false)}
          >
            <PanelLeftClose className="text-gray-600" />
          </TooltipIconButton>
        )}
        <ArtifactTitle
          title={props.currentArtifactContent.title}
          isArtifactSaved={props.isArtifactSaved}
          artifactUpdateFailed={props.artifactUpdateFailed}
        />
      </div>
      <div className="flex gap-2 items-end mt-[10px] mr-[6px]">
        <NavigateArtifactHistory
          isBackwardsDisabled={props.isBackwardsDisabled}
          isForwardDisabled={props.isForwardDisabled}
          setSelectedArtifact={props.setSelectedArtifact}
          currentArtifactIndex={props.currentArtifactContent.index}
          totalArtifactVersions={props.totalArtifactVersions}
        />
        {/* <ReflectionsDialog selectedAssistant={props.selectedAssistant} /> */}
      </div>
    </div>
  );
}
