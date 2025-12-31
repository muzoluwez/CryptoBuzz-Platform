import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AccessGate } from "@/components/common/AccessGate";
import ImageSlider from "@/components/common/ImageSlider";

export default function ViewCryptoModel({ crypto, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full max-h-[85vh] p-0">
        <DialogHeader className="p-4 border-b bg-background">
          <DialogTitle className="text-lg font-bold">
            {crypto?.title}
          </DialogTitle>
        </DialogHeader>

        {/* AccessGate protects the Detail View */}
        <AccessGate
          accessType={crypto?.accessType}
          allowedPlans={crypto?.allowedPlans}
        >
          <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
            {/* Image Slider */}
            <ImageSlider
              images={
                crypto?.photos && Array.isArray(crypto.photos) && crypto.photos.length > 0
                  ? crypto.photos
                  : crypto?.image
                  ? [crypto.image]
                  : []
              }
              description={crypto?.fullDisplayHtml || crypto?.full || ""}
              descriptionLimit={95}
              showDescription={false}
              alt="Crypto analysis chart"
              height="h-64"
            />

            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {crypto?.date} • {crypto?.category}
              </p>

              <h2 className="text-2xl font-bold">{crypto?.title}</h2>

              {/* Full description with clickable links and line breaks preserved */}
              <div 
                className="text-sm text-muted-foreground leading-relaxed"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ 
                  __html: crypto?.fullDisplayHtml || crypto?.full || "No content available." 
                }}
              />

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={crypto?.avatar} />
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{crypto?.author}</p>
                  <p className="text-xs text-muted-foreground">{crypto?.category}</p>
                </div>
              </div>
            </div>
          </div>
        </AccessGate>
      </DialogContent>
    </Dialog>
  );
}

