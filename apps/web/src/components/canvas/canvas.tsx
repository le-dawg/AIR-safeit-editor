"use client";

import { ArtifactRenderer } from "@/components/artifacts/ArtifactRenderer";
import {
  ALL_MODEL_NAMES,
  DEFAULT_MODEL_CONFIG,
  DEFAULT_MODEL_NAME,
} from "@opencanvas/shared/models";
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
  const { setModelName, setModelConfig } = useThreadContext();
  const { setArtifact, chatStarted, setChatStarted } = graphData;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(true); // Default state
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [hasMounted, setHasMounted] = useState(false); // <-- Add mount state

  const searchParams = useSearchParams();
  const router = useRouter();
  const chatCollapsedSearchParam = searchParams.get(CHAT_COLLAPSED_QUERY_PARAM);

  // Effect to set mount state only on client
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Effect to sync chatCollapsed state with URL search param AFTER mounting
  useEffect(() => {
    if (!hasMounted) { // <-- Only run after mounting
      return;
    }
    try {
      // Default to true if param is missing or invalid
      let collapsedFromParam = true;
      if (chatCollapsedSearchParam !== null) {
        collapsedFromParam = JSON.parse(chatCollapsedSearchParam);
      }
      // Only update state if it differs from the param
      if (chatCollapsed !== collapsedFromParam) {
        setChatCollapsed(collapsedFromParam);
      }
    } catch (e) {
      // If parsing fails, default to false and clean up URL
      if (chatCollapsed !== false) {
        setChatCollapsed(false);
      }
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.delete(CHAT_COLLAPSED_QUERY_PARAM);
      router.replace(`?${queryParams.toString()}`, { scroll: false });
    }
    // Dependencies: hasMounted ensures it runs after mount,
    // chatCollapsedSearchParam ensures it re-runs if the URL changes.
    // router and searchParams are included as they are used.
    // chatCollapsed is included to prevent unnecessary updates if state already matches param.
  }, [hasMounted, chatCollapsedSearchParam, router, searchParams, chatCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key && typeof e.key === 'string') {
        setKeysPressed((prevKeys) => [...prevKeys, e.key.toLowerCase()]);

        if (
          keysPressed.includes("s") &&
          keysPressed.includes("h") &&
          keysPressed.includes("i") &&
          keysPressed.includes("t") &&
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
            // Update URL when toggling via shortcut
            const newCollapsedState = !chatCollapsed;
            setChatCollapsed(newCollapsedState);
            const queryParams = new URLSearchParams(searchParams.toString());
            queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(newCollapsedState));
            router.replace(`?${queryParams.toString()}`, { scroll: false });
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
    // Include router and searchParams as they are used for URL update
  }, [chatCollapsed, keysPressed, timeoutId, router, searchParams]);

  useEffect(() => {
    const handleToggleChat = () => {
      // Update URL when toggling via event
      const newCollapsedState = !chatCollapsed;
      setChatCollapsed(newCollapsedState);
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(newCollapsedState));
      router.replace(`?${queryParams.toString()}`, { scroll: false });
    };

    window.addEventListener('toggleChat', handleToggleChat);

    return () => {
      window.removeEventListener('toggleChat', handleToggleChat);
    };
    // Include router and searchParams as they are used for URL update
  }, [chatCollapsed, router, searchParams]);

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

  // Helper function to update URL when chatCollapsed changes
  const updateChatCollapsedQueryParam = (newCollapsedState: boolean) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(newCollapsedState));
    router.replace(`?${queryParams.toString()}`, { scroll: false });
  };

  // Render null until mounted to prevent hydration mismatch
  if (!hasMounted) { // <-- Add mount check
    return null;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {!chatStarted && (
        <ContentComposerChatInterface
          chatCollapsed={chatCollapsed}
          setChatCollapsed={(c) => {
            setChatCollapsed(c);
            updateChatCollapsedQueryParam(c); // <-- Use helper
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
          <ContentComposerChatInterface
            chatCollapsed={chatCollapsed}
            setChatCollapsed={(c) => {
              setChatCollapsed(c);
              updateChatCollapsedQueryParam(c); // <-- Use helper
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
        </ResizablePanel>
      )}

      {chatStarted && (
        <>
          {!chatCollapsed && <ResizableHandle />} {/* Conditionally render handle */}
          <ResizablePanel
            defaultSize={chatCollapsed ? 100 : 75}
            maxSize={chatCollapsed ? 100 : 85} // Adjust max size based on state
            minSize={50}
            id="canvas-panel"
            order={2}
            className="flex flex-row w-full"
          >
            <div className="w-full ml-auto">
              <ArtifactRenderer
                chatCollapsed={chatCollapsed}
                setChatCollapsed={(c) => {
                  setChatCollapsed(c);
                  updateChatCollapsedQueryParam(c); // <-- Use helper
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
