/**
 * Utility functions for fetching video duration from different video sources
 */

/**
 * Extract YouTube video ID from URL
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;

  if (url.includes("youtube.com/watch?v=")) {
    return url.split("v=")[1].split("&")[0];
  }

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("?")[0];
  }

  return null;
};

/**
 * Extract Vimeo video ID from URL
 */
export const getVimeoVideoId = (url) => {
  if (!url || !url.includes("vimeo.com/")) return null;

  const parts = url.split("vimeo.com/")[1].split("/");
  return parts[0].split("?")[0];
};

/**
 * Extract Loom video ID from URL
 */
export const getLoomVideoId = (url) => {
  if (!url) return null;

  if (url.includes("loom.com/share/")) {
    return url.split("loom.com/share/")[1].split("?")[0];
  }

  if (url.includes("useloom.com/share/")) {
    return url.split("useloom.com/share/")[1].split("?")[0];
  }

  return null;
};

/**
 * Detect video type from URL
 */
export const detectVideoType = (url) => {
  if (!url || typeof url !== "string") return "none";

  const lower = url.toLowerCase();

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }

  if (lower.includes("vimeo.com")) {
    return "vimeo";
  }

  if (lower.includes("loom.com") || lower.includes("useloom.com")) {
    return "loom";
  }

  // If it's not a known external video URL, assume it's an uploaded file
  return "upload";
};

/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Fetch video duration from Vimeo using oEmbed API
 */
export const fetchVimeoDuration = async (url) => {
  try {
    const videoId = getVimeoVideoId(url);
    if (!videoId) return null;

    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.duration) {
        return formatDuration(data.duration);
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching Vimeo duration:", error);
    return null;
  }
};

/**
 * Fetch video duration from Loom using oEmbed API
 */
export const fetchLoomDuration = async (url) => {
  try {
    const loomId = getLoomVideoId(url);
    if (!loomId) return null;

    const loomUrl = url.includes("useloom.com")
      ? url
      : `https://www.loom.com/share/${loomId}`;

    const oEmbedUrl = `https://www.loom.com/v1/oembed?url=${encodeURIComponent(loomUrl)}`;
    const response = await fetch(oEmbedUrl);

    if (response.ok) {
      const data = await response.json();
      // Loom oEmbed returns duration in seconds
      if (data.duration) {
        return formatDuration(data.duration);
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching Loom duration:", error);
    return null;
  }
};

/**
 * Fetch video duration from uploaded video file
 */
export const fetchUploadedVideoDuration = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("video/")) {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = formatDuration(video.duration);
      resolve(duration);
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(null);
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Main function to fetch video duration based on video type
 * Note: YouTube duration must be fetched via YouTube IFrame Player API in the component
 * This function handles Vimeo, Loom, and uploaded files
 */
export const fetchVideoDuration = async (url, videoType, file = null) => {
  if (!url && !file) return null;

  // If it's an uploaded file, use file-based fetching
  if (file && videoType === "upload") {
    return await fetchUploadedVideoDuration(file);
  }

  // If no URL or invalid video type, return null
  if (!url || !videoType || videoType === "none") return null;

  try {
    if (videoType === "youtube") {
      // YouTube duration is fetched via YouTube IFrame Player API in the preview component
      // when the player is ready (onReady callback)
      // No need to fetch here
      return null;
    } else if (videoType === "vimeo") {
      return await fetchVimeoDuration(url);
    } else if (videoType === "loom") {
      return await fetchLoomDuration(url);
    }
  } catch (error) {
    console.error("Error fetching video duration:", error);
    return null;
  }

  return null;
};
