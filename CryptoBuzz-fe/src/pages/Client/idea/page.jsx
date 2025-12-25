import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardHeading,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { CopyIcon, Eye, X } from "lucide-react";
import { AccessGate } from '@/components/common/AccessGate';
import { useAccessControl } from '@/hooks/use-access-control';
import { useState } from "react";
import { useGetIdeasQuery } from '@/store/client/clientIdeaApiSlice';



function Row({ label, value, green, red }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="">{label}</span>
      <span
        className={
          red
            ? "text-red-400 font-medium"
            : green
              ? "text-green-400 font-medium"
              : "text-gray font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function IdeaPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const { checkAccess } = useAccessControl();

  // Fetch ideas from API
  const { data, isLoading, error } = useGetIdeasQuery({
    page: 1,
    limit: 10,
  });

  // Transform API data to match component format
  const cards = data?.data?.map((idea) => {
    const educator = idea.educator || {};
    const educatorName = educator.first_name && educator.last_name
      ? `${educator.first_name} ${educator.last_name}`
      : educator.first_name || educator.last_name || "Unknown Trader";
    
    const categoryName = idea.category?.name || "Unknown Market";
    const year = idea.createdAt ? new Date(idea.createdAt).getFullYear().toString() : "2025";
    
    // Determine tag type based on idea type
    const typeTag = idea.type
      ? { label: idea.type.toUpperCase(), type: idea.type.toLowerCase() }
      : null;
    
    const statusTag = idea.status
      ? { label: idea.status, type: "status" }
      : { label: "Pending", type: "status" };
    
    const categoryTag = idea.category?.name
      ? { label: idea.category.name.toUpperCase(), type: "pair" }
      : null;

    const tags = [typeTag, categoryTag, statusTag].filter(Boolean);

    return {
      _id: idea._id,
      image: idea.image_Url || idea.image || "https://via.placeholder.com/400x300",
      avatar: educator.image || "https://i.pravatar.cc/300",
      trader: educatorName,
      market: categoryName,
      year: year,
      entry: idea.entry?.toString() || "0",
      invalidation: idea.invalidation?.toString() || "0",
      exits: Array.isArray(idea.exits) 
        ? idea.exits.map(exit => exit?.toString() || "0")
        : ["0"],
      tags: tags,
      accessType: idea.accessType || "PUBLIC",
      allowedPlans: idea.allowedPlans || [],
      uid: idea._id,
      ...idea, // Include all other idea properties
    };
  }) || [];

  return (
    <>
      <div className="container my-6">

        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">Trading Signals</h1>
          <p className="text-xs text-gray-500 mt-1">Home / Ideas</p>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-500">Loading ideas...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">Error loading ideas</p>
              <p className="text-gray-500 mt-2">
                {error?.data?.message || error?.error || "Something went wrong. Please try again later."}
              </p>
            </div>
          </div>
        )}

        {/* Responsive 3-Card Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {cards.length === 0 && !isLoading && !error && (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-gray-500">No ideas available at the moment.</p>
            </div>
          )}

          {cards.map((c, i) => {
            const access = checkAccess({
              accessType: c.accessType,
              allowedPlans: c.allowedPlans
            });
            const isLocked = !access.hasAccess;

            return (
              <Card
                key={c._id || i}
                className="rounded-2xl shadow-lg border border-gray-medium overflow-hidden animate-slideInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={c.avatar} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{c.trader}</p>
                        <p className="text-sm ">{c.market}</p>
                      </div>
                    </div>
                    <p className=" font-medium">{c.year}</p>
                  </div>
                </CardHeader>

                {/* TOP CHART IMAGE */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedImage(c.image)}
                >
                  <img
                    src={c.image}
                    className={`w-full h-52 object-cover border-0 transition-all duration-300 ${isLocked ? 'blur-md' : 'group-hover:opacity-80'}`}
                  />
                  {!isLocked && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="bg-black/60 p-2 rounded-full">
                        <CopyIcon className="w-6 h-6 text-white" />
                        {/* Using CopyIcon as generic lock/icon or maybe import Lock if available. Using provided CopyIcon for now to minimize errors, or just text */}
                      </div>
                    </div>
                  )}

                  {/* TAGS */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {c.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg
                      ${tag.type === "sell" &&
                          "bg-red-200 text-red-600"
                          }
                      ${tag.type === "buy" &&
                          "bg-green-200 text-green-600"
                          }
                      ${tag.type === "pair" &&
                          "bg-gray-200 text-gray-600"
                          }
                      ${tag.type === "status" &&
                          "bg-purple-200 text-yellow-600"
                          }
                    `}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CONTENT */}
                <CardContent className="p-5">
                  {/* PRICE ROWS */}
                  <div className="space-y-2">
                    <div className='flex items-center justify-between'>
                      <p>Entry</p>
                      <div className='flex items-center gap-2 justify-between min-w-20'  >
                        <CopyIcon className='w-4' />
                        <p className={!isLocked ? 'text-green-500' : 'text-gray-400'}>
                          {isLocked ? '****' : c.entry}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between '>
                      <p>Invalidation</p>
                      <div className='flex items-center gap-2 justify-between min-w-20'>
                        <CopyIcon className='w-4' />
                        <p className={!isLocked ? 'text-red-500' : 'text-gray-400'}>
                          {isLocked ? '****' : c.invalidation}
                        </p>
                      </div>
                    </div>
                    {c.exits.map((exitVal, idx) => (
                      <div key={idx} className='flex items-center justify-between'>
                        <p>{`Exit ${idx + 1}`}</p>
                        <div className='flex items-center gap-2 justify-between min-w-20'>
                          <CopyIcon className='w-4' />
                          <p className={!isLocked ? 'text-red-500' : 'text-gray-400'}>
                            {isLocked ? '****' : exitVal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="p-5 pt-0">
                  <button
                    onClick={() => setSelectedCard(c)}
                    className="btn bg-primary text-black w-full flex! items-center justify-center gap-2 mt-4 hover:scale-up transition-all duration-300"
                  >
                    {isLocked ? 'Unlock Content' : <><Eye size={18} /> View Details</>}
                  </button>
                </CardFooter>
              </Card>
            );
          })}

          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full h-full object-contain rounded-lg animate-slideInUp"
            />
          </div>
        </div>
      )}

      {/* Details Modal using UI Library */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Trading Signal Details</DialogTitle>
            <DialogClose />
          </DialogHeader>

          {selectedCard && (
            <AccessGate
              accessType={selectedCard.accessType}
              allowedPlans={selectedCard.allowedPlans}
              contentUid={selectedCard.uid}
            >
              <div className="space-y-6">

                {/* Trader Info */}
                <div className='flex items-center justify-between border-y border-gray-200 py-2'>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedCard.avatar} />
                      <AvatarFallback>TR</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{selectedCard.trader}</h3>
                      <p className="text-gray-500">{selectedCard.market}</p>
                    </div>
                  </div>
                  <p className=" font-medium">{selectedCard.year}</p>
                </div>

                {/* Chart Image */}
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={selectedCard.image}
                    alt="Trading chart"
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(selectedCard.image)}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {selectedCard.tags.map((tag, idx) => (
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
                      <span className="text-green-600 font-bold">{selectedCard.entry}</span>
                      <CopyIcon className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Invalidation Level</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">{selectedCard.invalidation}</span>
                      <CopyIcon className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                    <span className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Exit Targets</span>
                    {selectedCard.exits.map((exit, idx) => (
                      <div key={idx} className="flex items-center justify-between pl-4">
                        <span className="text-gray-600 dark:text-gray-400">Target {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{exit}</span>
                          <CopyIcon className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 btn bg-primary text-black hover:scale-up transition-all duration-300">
                    Copy All Prices
                  </button>
                  <button className="flex-1 btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 transition-colors">
                    Share Signal
                  </button>
                </div>
              </div>
            </AccessGate>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

