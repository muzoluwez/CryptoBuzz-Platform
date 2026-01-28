import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AccessGate } from "@/components/common/AccessGate";
import ImageSlider from "@/components/common/ImageSlider";

// Helper function to check if URL is an external video URL (YouTube, Vimeo, Loom)
const isExternalVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
  const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com|loom\.share)\/.+/;
  return youtubeRegex.test(url) || vimeoRegex.test(url) || loomRegex.test(url);
};

// Helper function to convert video URLs to embed URLs
const getEmbedUrl = (url) => {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  // Vimeo
  if (url.includes('vimeo.com/')) {
    const parts = url.split('vimeo.com/')[1]?.split('/');
    const id = parts?.[0]?.split('?')[0];
    const hash = parts?.[1] ? parts[1].split('?')[0] : null;
    return id
      ? hash
        ? `https://player.vimeo.com/video/${id}?h=${hash}`
        : `https://player.vimeo.com/video/${id}`
      : null;
  }

  // Loom
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }

  return null;
};

export default function ViewCryptoModel({ crypto, isOpen, onClose }) {
  const videoUrl = crypto?.videoUrl;
  const isExternalVideo = videoUrl && isExternalVideoUrl(videoUrl);
  const embedUrl = isExternalVideo ? getEmbedUrl(videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b bg-background flex-shrink-0">
          <DialogTitle className="text-lg font-bold">
            {crypto?.title}
          </DialogTitle>
        </DialogHeader>
        {/* AccessGate protects the Detail View */}
        <AccessGate
          accessType={crypto?.accessType}
          allowedPlans={crypto?.allowedPlans}
        >
          <div className="bg-card p-4 overflow-y-auto flex-1 min-h-0">
            {/* Media (Video or Image) */}
            {crypto?.mediaType === 'video' && videoUrl ? (
              // Video Player - External (iframe) or Uploaded (video tag)
              <div className="w-full mb-4">
                {isExternalVideo && embedUrl ? (
                  // External video (YouTube, Vimeo, Loom) - use iframe
                  <div className="w-full bg-black rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0 rounded-lg"
                      style={{ margin: 0, padding: 0, display: 'block' }}
                    />
                  </div>
                ) : (
                  // Uploaded video file - use video tag
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              // Image Slider
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
            )}

            <div className="mt-4 space-y-4">
              {(crypto?.date || crypto?.category) && (
                <p className="text-sm text-muted-foreground">
                  {crypto?.date} {crypto?.date && crypto?.category ? '•' : ''} {crypto?.category}
                </p>
              )}

              {/* Full description with clickable links, line breaks, and inline images */}
              <div 
                className="text-sm text-muted-foreground leading-relaxed"
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ 
                  __html: crypto?.fullDisplayHtml || crypto?.fullHtml || crypto?.full || "No content available." 
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

