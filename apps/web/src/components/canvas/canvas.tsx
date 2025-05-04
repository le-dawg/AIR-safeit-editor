"use client";

import { ArtifactRenderer } from "@/components/artifacts/ArtifactRenderer";
import {
  ALL_MODEL_NAMES,
  DEFAULT_MODEL_CONFIG,
  DEFAULT_MODEL_NAME,
} from "@opencanvas/shared/models";
// Removed Home icon import, no longer needed here
import { useGraphContext } from "@/contexts/GraphContext";
import { useToast } from "@/hooks/use-toast";
import { getLanguageTemplate } from "@/lib/get_language_template";
import {
  ArtifactCodeV3,
  ArtifactMarkdownV3,
  ArtifactV3,
  CustomModelConfig,
  ProgrammingLanguageOptions,
} from "@opencanvas/shared/types";
import React, { useEffect, useState } from "react";
import { ContentComposerChatInterface } from "./content-composer";
import NoSSRWrapper from "../NoSSRWrapper";
import { useThreadContext } from "@/contexts/ThreadProvider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CHAT_COLLAPSED_QUERY_PARAM } from "@/constants";
import { useRouter, useSearchParams } from "next/navigation";

export function CanvasComponent() {
  const { graphData } = useGraphContext();
  // Removed clearState destructuring
  const { setArtifact, chatStarted, setChatStarted } = graphData;
  // Removed setThreadId destructuring
  const { setModelName, setModelConfig } = useThreadContext();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(true); // Set initial state to true to keep chat panel closed
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const chatCollapsedSearchParam = searchParams.get(CHAT_COLLAPSED_QUERY_PARAM);
  
  useEffect(() => {
    try {
      if (chatCollapsedSearchParam) {
        setChatCollapsed(JSON.parse(chatCollapsedSearchParam));
      }
    } catch (e) {
      setChatCollapsed(false);
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.delete(CHAT_COLLAPSED_QUERY_PARAM);
      router.replace(`?${queryParams.toString()}`, { scroll: false });
    }
  }, [chatCollapsedSearchParam]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key && typeof e.key === 'string') {
        setKeysPressed((prevKeys) => [...prevKeys, e.key.toLowerCase()]);

        if (
          keysPressed.includes("s") &&
          keysPressed.includes("a") &&
          keysPressed.includes("f") &&
          keysPressed.includes("e") &&
          document.activeElement?.id !== "canvas-panel" // Check if canvas is focused
        ) {
          e.preventDefault();
          if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
            setKeysPressed([]);
            return;
          }
          const newTimeoutId = setTimeout(() => {
            setChatCollapsed(!chatCollapsed);
            setKeysPressed([]);
          }, 500);
          setTimeoutId(newTimeoutId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key && typeof e.key === 'string') {
        setKeysPressed((prevKeys) => prevKeys.filter((key) => key !== e.key.toLowerCase()));
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [chatCollapsed, keysPressed, timeoutId]);

  useEffect(() => {
    const handleToggleChat = () => {
      setChatCollapsed((prevChatCollapsed) => !prevChatCollapsed);
    };

    window.addEventListener('toggleChat', handleToggleChat);

    return () => {
      window.removeEventListener('toggleChat', handleToggleChat);
    };
  }, [chatCollapsed]);

  const handleQuickStart = (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => {
    if (type === "code" && !language) {
      toast({
        title: "Language not selected",
        description: "Please select a language to continue",
        duration: 5000,
      });
      return;
    }
    setChatStarted(true);

    let artifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
    if (type === "code" && language) {
      artifactContent = {
        index: 1,
        type: "code",
        title: `Quick start ${type}`,
        code: getLanguageTemplate(language),
        language,
      };
    } else {
      artifactContent = {
        index: 1,
        type: "text",
        title: `Quick start ${type}`,
        fullMarkdown: "",
      };
    }

    const newArtifact: ArtifactV3 = {
      currentIndex: 1,
      contents: [artifactContent],
    };
    // Do not worry about existing items in state. This should
    // never occur since this action can only be invoked if
    // there are no messages/artifacts in the thread.
    setArtifact(newArtifact);
    setIsEditing(true);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {!chatStarted && (
        <NoSSRWrapper>
          <ContentComposerChatInterface
            chatCollapsed={chatCollapsed}
            setChatCollapsed={(c) => {
              setChatCollapsed(c);
              const queryParams = new URLSearchParams(searchParams.toString());
              queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(c));
              router.replace(`?${queryParams.toString()}`, { scroll: false });
            }}
            switchSelectedThreadCallback={(thread) => {
              // Chat should only be "started" if there are messages present
              if ((thread.values as Record<string, any>)?.messages?.length) {
                setChatStarted(true);
                setModelName(DEFAULT_MODEL_NAME);
                setModelConfig(DEFAULT_MODEL_NAME, DEFAULT_MODEL_CONFIG);
              } else {
                setChatStarted(false);
              }
            }}
            setChatStarted={setChatStarted}
            hasChatStarted={chatStarted}
            handleQuickStart={handleQuickStart}
          />
        </NoSSRWrapper>
      )}
      {!chatCollapsed && chatStarted && (
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          maxSize={50}
          className="transition-all duration-700 h-screen mr-auto bg-gray-50/70 shadow-inner-right"
          id="chat-panel-main"
          order={1}
        >
          <NoSSRWrapper>
            <ContentComposerChatInterface
              chatCollapsed={chatCollapsed}
              setChatCollapsed={(c) => {
                setChatCollapsed(c);
                const queryParams = new URLSearchParams(searchParams.toString()); 
                queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(c));
                router.replace(`?${queryParams.toString()}`, { scroll: false });
              }}
              switchSelectedThreadCallback={(thread) => {
                // Chat should only be "started" if there are messages present
                if ((thread.values as Record<string, any>)?.messages?.length) {
                  setChatStarted(true);
                  setModelName(DEFAULT_MODEL_NAME);
                  setModelConfig(DEFAULT_MODEL_NAME, DEFAULT_MODEL_CONFIG);
                } else {
                  setChatStarted(false);
                }
              }}
              setChatStarted={setChatStarted}
              hasChatStarted={chatStarted}
              handleQuickStart={handleQuickStart}
            />
          </NoSSRWrapper>
        </ResizablePanel>
      )}

      {chatStarted && (
        <>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={chatCollapsed ? 100 : 75}
            maxSize={85}
            minSize={50}
            id="canvas-panel"
            order={2}
            // Restored original className
            className="flex flex-row w-full" 
          >
            {/* Removed button and padding div */}
            <div className="w-full ml-auto"> 
              <ArtifactRenderer
                chatCollapsed={chatCollapsed}
                setChatCollapsed={(c) => {
                  setChatCollapsed(c);
                  const queryParams = new URLSearchParams(searchParams.toString());
                  queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(c));
                  router.replace(`?${queryParams.toString()}`, { scroll: false });
                }}
                setIsEditing={setIsEditing}
                isEditing={isEditing}
              />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

export const Canvas = React.memo(CanvasComponent);
