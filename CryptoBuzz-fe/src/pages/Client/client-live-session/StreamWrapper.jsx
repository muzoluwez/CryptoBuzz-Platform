import { useState } from "react";
import { StreamCall } from "@stream-io/video-react-sdk";
import { toAbsoluteUrl } from "../../../lib/helpers";


const makeClickableLinks = (htmlOrText) => {
  if (!htmlOrText) return "";
  return htmlOrText.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
    const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
    return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" className="text-yellow-600 underline hover:text-blue-800">${url}</a>`;
  });
};

const ShowMoreLess = ({
  text = "",
  html = "",
  limit = 120,
  showMoreText = " Show More",
  showLessText = " Show Less",
  className = "text-sm text-gray-700 leading-relaxed",
}) => {
  const [expanded, setExpanded] = useState(false);
  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? content.replace(/<[^>]+>/g, "") : text;
  const isLong = plainText.length > limit;

  return (
    <div className={className}>
      <div
        className={`${!expanded && isLong ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-yellow-600 cursor-pointer hover:underline font-medium"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

const StreamWrapper = ({ call, children, bannerImage, educatorData }) => {
  const safeHtml = makeClickableLinks(educatorData || "");
  
  if (!call)
    return (
      <div className="">
        <div className="grid grid-cols-12 gap-6">
          {/* Image Section */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card rounded-none rounded-b-xl">
              <img
                src={
                  bannerImage
                    ? bannerImage
                    : toAbsoluteUrl('/media/images/2600x1600/bg-img.webp')
                }
                alt=""
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="card rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
              <div className="bg-primary px-4 py-3 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-white font-semibold text-sm">About Me </h3>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                  {educatorData && (
                    <ShowMoreLess
                      html={safeHtml}
                      limit={500}
                      className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return <StreamCall call={call}>{children}</StreamCall>;
};

export default StreamWrapper;