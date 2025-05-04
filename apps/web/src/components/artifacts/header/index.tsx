import { ReflectionsDialog } from "../../reflections-dialog/ReflectionsDialog";
import { ArtifactTitle } from "./artifact-title";
import { NavigateArtifactHistory } from "./navigate-artifact-history";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { Assistant } from "@langchain/langgraph-sdk";
import { PanelRightClose, PanelLeftClose, Home } from "lucide-react"; // Import Home icon
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { useGraphContext } from "@/contexts/GraphContext"; // Import Graph context
import { useThreadContext } from "@/contexts/ThreadProvider"; // Import Thread context
import { TighterText } from "@/components/ui/header";

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
    // Added relative positioning context for potential absolute elements if needed later
    <div className="relative flex flex-row items-center justify-between px-4 py-2"> {/* Added padding */}
      {/* Left side content (Title) */}
      <div className="flex flex-row items-center justify-start gap-1"> 
        {/* Removed original Home button */}
        {/* Removed PanelRightClose/PanelLeftClose buttons as they were hidden */}
        <ArtifactTitle
          title={props.currentArtifactContent.title}
          isArtifactSaved={props.isArtifactSaved}
          artifactUpdateFailed={props.artifactUpdateFailed}
        />
      </div>

      {/* Centered Button Group using mx-auto */}
      <div className="flex items-center justify-center mx-auto"> {/* Use mx-auto for centering */}
        {/* Standard button for click handling and layout */}
        <button
          onClick={handleReturnToWelcome}
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer rounded p-1 hover:bg-gray-100" // Added hover bg and padding
        >
          {/* Tooltip wraps only the icon */}
          <TooltipIconButton
            tooltip="Tilbage til forsiden" 
            variant="ghost" 
            className="w-auto h-auto p-0" // Minimal styling, let parent button handle size/padding
            delayDuration={300}
            // Removed asChild prop
          >
             <Home className="w-5 h-5" />
          </TooltipIconButton>
          {/* Responsive text next to the icon */}
          <span className="hidden md:inline text-lg">Tilbage til forsiden</span> 
        </button>
      </div>

      {/* Right side content (History Navigation) */}
      {/* Added flex-col and items-end for vertical alignment and right justification */}
      <div className="flex flex-col items-end gap-1"> 
        {/* Added headline */}
        <div className="text-xs text-gray-500 mr-1">Skift mellem versioner</div> 
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

/* Old structure for reference:
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center justify-center gap-1"> 
        <TooltipIconButton
          tooltip="Return to Welcome"
          variant="ghost"
          className="ml-2 mb-1 w-8 h-8" 
          delayDuration={400}
          onClick={handleReturnToWelcome}
        >
          <Home className="text-gray-600" />
          <TighterText className="text-xl"> </TighterText>
        </TooltipIconButton>
        {(!props.chatCollapsed) && (
          <TooltipIconButton
            tooltip="Close Chat"
            variant="ghost"
            className="ml-2 mb-1 w-8 h-8 hidden"
            delayDuration={400}
            onClick={() => props.setChatCollapsed(true)}
          >
            <PanelRightClose className="text-gray-600" />
          </TooltipIconButton>
        )}
        {props.chatCollapsed && ( 
          <TooltipIconButton
            tooltip="Expand Chat"
            variant="ghost"
            className="ml-2 mb-1 w-8 h-8 hidden"
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
      </div>
    </div>
*/
