import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, Eye } from "lucide-react";
import { useAccessControl } from '@/hooks/use-access-control';
import { useState } from "react";
import { useGetIdeasQuery } from '@/store/client/clientIdeaApiSlice';
import ImageViewer from '@/components/common/ImageViewer';
import ImageCarousel from '@/components/common/ImageCarousel';
import { toast } from 'sonner';
import ViewIdeaModel from '@/components/models/ViewIdeaModel';

export default function IdeaPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const { checkAccess } = useAccessControl();

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

  // Fetch ideas from API
  const { data, isLoading, error } = useGetIdeasQuery({
    page: 1,
    limit: 10,
  });

  // Transform API data to match component format
  const cards = data?.data?.map((idea) => {
    const educator = idea?.educator || {};
    const educatorName = educator?.first_name && educator?.last_name
      ? `${educator?.first_name || ''} ${educator?.last_name || ''}`.trim()
      : educator?.first_name || educator?.last_name || "Unknown Trader";
    
    const categoryName = idea?.category?.name || "Unknown Market";

    const year = idea?.createdAt ? new Date(idea.createdAt).getFullYear().toString() : "2025";
    
    // Determine tag type based on idea type
    const typeTag = idea?.type
      ? { label: idea.type.toUpperCase(), type: idea.type.toLowerCase() }
      : null;
    
    const statusTag = idea?.status
      ? { label: idea.status, type: "status" }
      : { label: "Pending", type: "status" };
    
    const categoryTag = idea?.category?.name
      ? { label: idea.category.name.toUpperCase(), type: "pair" }
      : null;

    const name = idea?.name
      ? { label: idea.name, type: "name" }
      : null;

    const tags = [typeTag, name, statusTag].filter(Boolean);

    // Handle images - can be array or single string
    const images = idea?.image 
      ? (Array.isArray(idea.image) ? idea.image : [idea.image])
      : idea?.image_Url 
      ? [idea.image_Url] 
      : ["https://via.placeholder.com/400x300"];

    return {
      _id: idea?._id,
      image: images, // Keep as array for ImageCarousel
      image_Url: idea?.image_Url, // Keep for backward compatibility
      avatar: educator?.image || "https://i.pravatar.cc/300",
      trader: educatorName,
      market: categoryName,
      year: year,
      entry: idea?.entry?.toString() || "0",
      invalidation: idea?.invalidation?.toString() || "0",
      exits: Array.isArray(idea?.exits) 
        ? idea.exits.map(exit => exit?.toString() || "0")
        : ["0"],
      tags: tags,
      accessType: idea?.accessType || "PUBLIC",
      allowedPlans: idea?.allowedPlans || [],
      uid: idea?._id,
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
                    {/* <p className=" font-medium">{c.year}</p> */}
                  </div>
                </CardHeader>

                {/* TOP CHART IMAGE CAROUSEL */}
                <div className="relative">
                  {isLocked ? (
                    <div className="relative">
                      <ImageCarousel
                        images={Array.isArray(c.image) ? c.image : [c.image || c.image_Url]}
                        alt={c.name || "Trading idea"}
                        height="h-52"
                        showViewButton={false}
                        className={isLocked ? "blur-md" : ""}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-30 pointer-events-none">
                        <div className="bg-black/60 p-2 rounded-full">
                          <CopyIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ImageCarousel
                      images={Array.isArray(c.image) ? c.image : [c.image || c.image_Url]}
                      alt={c.name || "Trading idea"}
                      height="h-52"
                      showViewButton={true}
                    />
                  )}

                  {/* TAGS */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {c.tags.map((tag, idx) => {
                      console.log('Rendering tag:', tag);
                      const base = "px-3 py-1 text-sm font-semibold rounded-lg";

                      // Buy/Sell tags
                      if (tag.type === "buy" || tag.type === "sell") {
                        const buySellClass = tag.type === "buy" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
                        return (
                          <Badge key={idx} className={`${base} ${buySellClass}`}>
                            {tag.label?.toString().toUpperCase()}
                          </Badge>
                        );
                      }

                      // Market / Pair tag
                      if (tag.type === "pair") {
                        return (
                          <Badge key={idx} className={`${base} bg-gray-200 text-gray-600`}>
                            {tag.label}
                          </Badge>
                        );
                      }

                      // Status tag - map to branded colors
                      if (tag.type === "status") {
                        const statusClassMap = {
                          active: "bg-cyan-700 text-white",
                          pending: "bg-purple-700 text-white",
                          win: "bg-emerald-500 text-white",
                          loss: "bg-red-500 text-white",
                          partialWin: "bg-purple-500 text-white",
                          breakEven: "bg-blue-500 text-white",
                        };
                        const statusKey = (tag.label || "").toString();
                        const statusClass = statusClassMap[statusKey] || "bg-gray-200 text-gray-700";

                        // Pretty label for statuses
                        const pretty =
                          statusKey === "win"
                            ? `WIN ${c?.pips ? `+${c.pips}` : ""}`
                            : statusKey === "loss"
                            ? `LOSS ${c?.pips ? `-${c.pips}` : ""}`
                            : statusKey === "partialWin"
                            ? `PARTIAL ${c?.pips ?? ""}`
                            : statusKey === "breakEven"
                            ? "BREAK EVEN"
                            : statusKey?.toUpperCase();

                        return (
                          <Badge key={idx} className={`${base} ${statusClass}`}>
                            {pretty}
                          </Badge>
                        );
                      }

                      // Fallback
                      return (
                        <Badge key={idx} className={`${base} bg-gray-200 text-gray-600`}>
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* CONTENT */}
                <CardContent className="p-5">
                  {/* PRICE ROWS */}
                  <div className="space-y-2">
                    <div className='flex items-center justify-between'>
                      <p>Entry</p>
                      <div className='flex items-center gap-2 justify-between min-w-20'  >
                        <CopyIcon 
                          className={`w-4 ${!isLocked && c?.entry ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                          onClick={() => !isLocked && copyToClipboard(c?.entry, 'Entry price')}
                        />
                        <p className={!isLocked ? 'text-green-500' : 'text-gray-400'}>
                          {isLocked ? '****' : c?.entry || '0'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between '>
                      <p>Invalidation</p>
                      <div className='flex items-center gap-2 justify-between min-w-20'>
                        <CopyIcon 
                          className={`w-4 ${!isLocked && c?.invalidation ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                          onClick={() => !isLocked && copyToClipboard(c?.invalidation, 'Invalidation level')}
                        />
                        <p className={!isLocked ? 'text-red-500' : 'text-gray-400'}>
                          {isLocked ? '****' : c?.invalidation || '0'}
                        </p>
                      </div>
                    </div>
                    {c?.exits?.map((exitVal, idx) => (
                      <div key={idx} className='flex items-center justify-between'>
                        <p>{`Exit ${idx + 1}`}</p>
                        <div className='flex items-center gap-2 justify-between min-w-20'>
                          <CopyIcon 
                            className={`w-4 ${!isLocked && exitVal ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                            onClick={() => !isLocked && copyToClipboard(exitVal, `Exit target ${idx + 1}`)}
                          />
                          <p className={!isLocked ? 'text-red-500' : 'text-gray-400'}>
                            {isLocked ? '****' : exitVal || '0'}
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
      <ImageViewer
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Trading signal chart"
      />

      {/* Details Modal using UI Library */}
      <ViewIdeaModel
        idea={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}

