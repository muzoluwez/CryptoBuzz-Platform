import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGrantAccess } from "@/context/GrantAccessContext";
import ImageSlider from "@/components/common/ImageSlider";

import { CopyIcon } from "lucide-react";
import { toast } from 'sonner';

export default function ViewIdeaModel({ idea, isOpen, onClose }) {
  const { checkAccess } = useGrantAccess();

  const access = idea ? checkAccess({
    accessType: idea.accessType,
    allowedPlans: idea.allowedPlans,
  }) : { hasAccess: false };

  const isLocked = !access.hasAccess;

  // Copy to clipboard function

  const copyToClipboard = async (text, label) => {
    if (!text || text === '****') {
      toast.error('No value to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label || 'Value'} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-start">Trading Signal Details</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {idea && (
          <div className="space-y-6">

            {/* Trader Info */}
            <div className='flex items-center justify-between border-y border-gray-200 py-2'>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={idea.avatar} />
                  <AvatarFallback>TR</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{idea.trader}</h3>
                  <p className="text-gray-500">{idea.market}</p>
                </div>
              </div>
              {/* <p className=" font-medium">{idea.year}</p> */}
            </div>

            {/* Chart Image Slider */}
            <div className={`rounded-xl overflow-hidden ${isLocked ? 'blur-md pointer-events-none' : ''}`}>
              <ImageSlider
                images={
                  Array.isArray(idea.image)
                    ? idea.image
                    : idea.image_Url
                      ? [idea.image_Url]
                      : idea.image
                        ? [idea.image]
                        : []
                }
                description={idea.description || ""}
                descriptionLimit={95}
                showDescription={false}
                alt="Trading chart"
                height="h-64"
              />
            </div>


            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {idea.tags?.map((tag, idx) => (
                <Badge
                  key={idx}
                  className={`px-4 py-2 text-sm font-semibold
                      ${tag.type === "sell" && "bg-red-200 text-red-600"}
                      ${tag.type === "buy" && "bg-green-200 text-green-600"}
                      ${tag.type === "pair" && "bg-gray-200 text-gray-600"}
                      ${tag.type === "status" && "bg-purple-200 text-yellow-600"}
                    `}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>

            {/* Price Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Entry Price</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${!isLocked ? 'text-green-600' : 'text-gray-400'}`}>
                    {isLocked ? '****' : (idea?.entry || '0')}
                  </span>
                  <CopyIcon
                    className={`w-4 h-4 ${!isLocked ? 'cursor-pointer hover:text-primary' : 'cursor-not-allowed opacity-50'} transition-colors`}
                    onClick={() => !isLocked && copyToClipboard(idea?.entry, 'Entry price')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">Invalidation Level</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${!isLocked ? 'text-red-600' : 'text-gray-400'}`}>
                    {isLocked ? '****' : (idea?.invalidation || '0')}
                  </span>
                  <CopyIcon
                    className={`w-4 h-4 ${!isLocked ? 'cursor-pointer hover:text-primary' : 'cursor-not-allowed opacity-50'} transition-colors`}
                    onClick={() => !isLocked && copyToClipboard(idea?.invalidation, 'Invalidation level')}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <span className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Exit Targets</span>
                {idea?.exits?.map((exit, idx) => (
                  <div key={idx} className="flex items-center justify-between pl-4">
                    <span className="text-gray-600 dark:text-gray-400">Target {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${!isLocked ? '' : 'text-gray-400'}`}>
                        {isLocked ? '****' : (exit || '0')}
                      </span>
                      <CopyIcon
                        className={`w-4 h-4 ${!isLocked ? 'cursor-pointer hover:text-primary' : 'cursor-not-allowed opacity-50'} transition-colors`}
                        onClick={() => !isLocked && copyToClipboard(exit, `Exit target ${idx + 1}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                className={`flex-1 btn bg-primary text-black ${!isLocked ? 'hover:scale-up' : 'opacity-50 cursor-not-allowed'} transition-all duration-300`}
                onClick={() => {
                  if (isLocked) return;
                  const allPrices = [
                    `Entry: ${idea?.entry || '0'}`,
                    `Invalidation: ${idea?.invalidation || '0'}`,
                    ...(idea?.exits?.map((exit, idx) => `Exit ${idx + 1}: ${exit || '0'}`) || [])
                  ].join('\n');
                  copyToClipboard(allPrices, 'All prices');
                }}
              >
                {isLocked ? 'Login to Copy All' : 'Copy All Prices'}
              </button>
            </div>
          </div>

        )}
      </DialogContent>
    </Dialog>
  );
}

