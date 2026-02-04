const isExternalVideoUrl = (url) =>
    /youtube\.com|youtu\.be|vimeo\.com|loom\.com|loom\.share/.test(url);
  
  const getEmbedUrl = (url) => {
    if (url.includes("loom.com/share/")) {
      const id = url.split("loom.com/share/")[1]?.split("?")[0];
      return `https://www.loom.com/embed/${id}`;
    }
  
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
  
    return null;
  };
  
  const CustomVideoPlayer = ({ videoUrl }) => {
    const embedUrl = isExternalVideoUrl(videoUrl)
      ? getEmbedUrl(videoUrl)
      : null;
  
    return (
      <div className="w-full rounded-lg overflow-hidden bg-black aspect-video">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };
  export default CustomVideoPlayer;
  