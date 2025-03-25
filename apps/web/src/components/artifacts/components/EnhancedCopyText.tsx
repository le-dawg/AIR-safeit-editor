import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { isArtifactCodeContent } from "@opencanvas/shared/utils/artifacts";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedCopyTextProps {
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
}

export function EnhancedCopyText(props: EnhancedCopyTextProps) {
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed right-4 top-24 z-50"
    >
      <Button
        variant="default"
        className="bg-orange-500 hover:bg-orange-600 text-white min-w-[10vw] py-6 flex items-center gap-2"
        onClick={() => {
          try {
            const text = isArtifactCodeContent(props.currentArtifactContent)
              ? props.currentArtifactContent.code
              : props.currentArtifactContent.fullMarkdown;
            navigator.clipboard.writeText(text).then(() => {
              toast({
                title: "Copied to clipboard",
                description: "The journal draft has been copied.",
                duration: 5000,
              });
            });
          } catch (_) {
            toast({
              title: "Copy error",
              description:
                "Failed to copy the journal draft. Please try again.",
              duration: 5000,
            });
          }
        }}
      >
        <Copy className="w-5 h-5" />
        Copy current journal draft
      </Button>
    </motion.div>
  );
}
