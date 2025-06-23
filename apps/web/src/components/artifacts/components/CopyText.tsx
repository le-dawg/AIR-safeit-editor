import { useToast } from "@/hooks/use-toast";
import { isArtifactCodeContent } from "@opencanvas/shared/utils/artifacts";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
interface CopyTextProps {
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
  className?: string; 
}

export function CopyText(props: CopyTextProps) {
  const { toast } = useToast();

  return (
    <button
      type="button"
      className="flex items-center justify-center text-black w-full h-12 px-4 py-2 text-sm font-medium bg-customTealFaint border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      onClick={() => {
        try {
          const text = isArtifactCodeContent(props.currentArtifactContent)
            ? props.currentArtifactContent.code
            : props.currentArtifactContent.fullMarkdown;
          navigator.clipboard.writeText(text).then(() => {
            toast({
              title: "Kopieret til udklipsholder",
              description: "Dit dagbogsudkast er blevet kopieret.",
              duration: 5000,
            });
          });
        } catch (_) {
          toast({
            title: "Copy error",
            description:
              "Kunne ikke kopiere dit dagbogsudkast. Prøv venligst igen.",
            duration: 5000,
          });
        }
      }}
    >
    Kopier dit udkast til dagbog!
    </button>
  );
}
