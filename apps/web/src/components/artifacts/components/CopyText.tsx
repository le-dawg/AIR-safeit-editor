import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { isArtifactCodeContent } from "@opencanvas/shared/utils/artifacts";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
interface CopyTextProps {
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
}

export function CopyText(props: CopyTextProps) {
  const { toast } = useToast();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center w-full h-12 px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      onClick={() => {
        try {
          const text = isArtifactCodeContent(props.currentArtifactContent)
            ? props.currentArtifactContent.code
            : props.currentArtifactContent.fullMarkdown;
          navigator.clipboard.writeText(text).then(() => {
            toast({
              title: "Copied to clipboard",
              description: "Your journal draft has been copied.",
              duration: 5000,
            });
          });
        } catch (_) {
          toast({
            title: "Copy error",
            description:
              "Failed to copy your journal draft. Please try again.",
            duration: 5000,
          });
        }
      }}
    >
      Copy your draft journal!
    </motion.button>
  );
}
