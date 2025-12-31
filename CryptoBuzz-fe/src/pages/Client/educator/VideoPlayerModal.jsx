import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ShowMoreLess from '@/components/common/ShowMoreLess';

// Helper to detect and convert embed URLs
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

  // Dailymotion
  if (url.includes('dailymotion.com/video/')) {
    const id = url.split('dailymotion.com/video/')[1]?.split('?')[0];
    return id ? `https://www.dailymotion.com/embed/video/${id}` : null;
  }

  // Loom
  if (url.includes('loom.com/share/')) {
    const id = url.split('loom.com/share/')[1]?.split('?')[0];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }

  // DynTube
  if (url.includes('dyntube.com/video/')) {
    const match = url.match(/video\/([^/?#]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  if (url.includes('videos.dyntube.com/iframes/')) {
    const match = url.match(/iframes\/([^/?#]+)/);
    if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
  }

  if (url.includes('player.dyntube.com/video/')) {
    const match = url.match(/video\/([^/?#]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  if (url.includes('dyntube.com/')) return url;

  return null;
};

const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{data?.call_title || 'Recording Playback'}</DialogTitle>
          {data?.call_description && (
            <ShowMoreLess
              html={data?.call_description || 'View and access all video recordings uploaded by educators and admins.'}
              limit={100}
            />
          )}
        </DialogHeader>

        <div className="p-4">
          {open && videoUrl && (
            embedUrl ? (
              // Iframe-based embed player
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 rounded-lg"
                  title={data?.call_title || 'Video Player'}
                />
              </div>
            ) : (
              // HTML5 video player for direct file URLs
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                  style={{ maxHeight: '70vh' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

