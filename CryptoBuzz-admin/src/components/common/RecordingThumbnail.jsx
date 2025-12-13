import React, { useRef, useCallback } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";

const RecordingThumbnail = ({
    videoUrl,
    image,
    defaultImage,
    onRecordingClick,
}) => {
    const containerRef = useRef(null);
    const displayImage = image
        ? image
        : defaultImage
            ? defaultImage
            : toAbsoluteUrl("/media/images/2600x1600/live_banner.jpg");


    const handleClick = useCallback(() => {
        if (onRecordingClick) onRecordingClick();
        else if (videoUrl) window.open(videoUrl, "_blank");
    }, [onRecordingClick, videoUrl]);

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className="w-full h-[28vh] cursor-pointer bg-light flex justify-center items-center rounded-lg relative overflow-hidden"
        >
            {displayImage ? (
                <>
                    <img
                        src={displayImage}
                        alt="Thumbnail"
                        className="rounded-lg w-full h-[28vh] object-cover"
                    />
                    <div className="rounded-lg absolute inset-0 flex justify-center items-center bg-black/25">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex justify-center items-center rounded-lg bg-gray-200 animate-pulse">
                    {/* Skeleton loader */}
                    <div className="w-full h-full rounded-lg bg-gray-300" />
                </div>
            )}
        </div>
    );
};

export default RecordingThumbnail;
