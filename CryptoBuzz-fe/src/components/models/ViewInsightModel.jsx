import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AccessGate } from "@/components/common/AccessGate";
import ImageSlider from "@/components/common/ImageSlider";

export default function ViewInsightModel({ insight, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full max-h-[85vh] p-0">
        <DialogHeader className="p-4 border-b bg-background">
          <DialogTitle className="text-lg font-bold">
            {insight?.title}
          </DialogTitle>
        </DialogHeader>

        {/* AccessGate protects the Detail View */}
        <AccessGate
          accessType={insight?.accessType}
          allowedPlans={insight?.allowedPlans}
        >
          <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
            {/* Image Slider */}
            <ImageSlider
              images={
                insight?.photos && Array.isArray(insight.photos) && insight.photos.length > 0
                  ? insight.photos
                  : insight?.image
                  ? [insight.image]
                  : []
              }
              description={insight?.fullDisplayHtml || insight?.full || ""}
              descriptionLimit={95}
              showDescription={false}
              alt="Trade insight chart"
              height="h-64"
            />

            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {insight?.date} • {insight?.category}
              </p>

              <h2 className="text-2xl font-bold">{insight?.title}</h2>

              {/* Full description with clickable links and line breaks preserved */}
              <div
                className="text-sm text-muted-foreground leading-relaxed"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{
                  __html:
                    insight?.fullDisplayHtml ||
                    insight?.full ||
                    'No content available.',
                }}
              />

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={insight?.avatar} />
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {insight?.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {insight?.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccessGate>
      </DialogContent>
    </Dialog>
  );
}

