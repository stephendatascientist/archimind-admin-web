import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PagePlaceholderProps {
  title?: string;
  description?: string;
}

export function PagePlaceholder({
  title = "Coming Soon",
  description = "This feature is under development.",
}: PagePlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center text-muted-foreground">
        <Construction className="h-10 w-10" />
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
