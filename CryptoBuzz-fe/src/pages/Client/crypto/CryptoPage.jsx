import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { AccessGate } from "@/components/common/AccessGate";
import { useAccessControl } from "@/hooks/use-access-control";
import { Lock } from "lucide-react";
import { useGetCryptosQuery } from "@/store/client/clientCryptoApiSlice";
import { convertRtkEditorToFormattedPlainText, convertRtkEditorToDisplayFormat } from "@/lib/rtkEditorUtils";
import ImageViewer from "@/components/common/ImageViewer";
import ImageSlider from "@/components/common/ImageSlider";
import ImageCarousel from "@/components/common/ImageCarousel";

export default function CryptoPage() {
  const { checkAccess } = useAccessControl();

  // ------------------- STATE -------------------
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // ------------------- API CALL -------------------
  const { data, isLoading, error } = useGetCryptosQuery({
    page: 1,
    limit: 50, // Get more items for filtering
  });

  // ------------------- TRANSFORM API DATA -------------------
  const cryptos = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((crypto) => {
      const createdBy = crypto.createdBy || {};
      const authorName = createdBy.first_name && createdBy.last_name
        ? `${createdBy.first_name} ${createdBy.last_name}`
        : createdBy.first_name || createdBy.last_name || "Unknown Author";
      
      const categoryName = crypto.category?.name || "Uncategorized";
      
      // Format date
      const date = crypto.createdAt
        ? new Date(crypto.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

      // Get formatted plain text - converts HTML and \r\n to proper plain text
      const plainTextDescription = crypto.description 
        ? convertRtkEditorToFormattedPlainText(crypto.description, true)
        : "";
      
      // Get display format with clickable links for full view
      const fullDisplayHtml = crypto.description
        ? convertRtkEditorToDisplayFormat(crypto.description, true, true)
        : "";
      
      // For preview: get single line version (no line breaks) and limit to 2 lines worth
      const singleLineText = crypto.description
        ? convertRtkEditorToFormattedPlainText(crypto.description, false)
        : "";
      
      // Calculate approximate characters for 2 lines (assuming ~50 chars per line)
      const maxChars = 100;
      const preview = singleLineText
        ? (singleLineText.length > maxChars
            ? singleLineText.substring(0, maxChars) + "..."
            : singleLineText)
        : "No description available.";

      // Get image from photos array or use placeholder
      const image = crypto?.photos && crypto.photos?.length > 0
        ? crypto.photos[0]
        : 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop';

      // Get avatar from createdBy
      const avatar = createdBy?.image || '/media/avatars/1.png';

      return {
        id: crypto?._id,
        _id: crypto?._id,
        title: crypto?.title || "Untitled Crypto Analysis",
        author: authorName,
        date: date,
        preview: preview,
        full: plainTextDescription || "No content available.",
        fullDisplayHtml: fullDisplayHtml || "", // HTML with clickable links and line breaks
        fullHtml: crypto?.description || "", // Keep original HTML for reference if needed
        image: image,
        avatar: avatar,
        accessType: crypto?.accessType || "PUBLIC",
        allowedPlans: crypto?.allowedPlans || [],
        url: crypto?.url,
        data: crypto?.data,
        photos: crypto?.photos || [],
        ...crypto, // Include all other properties
        category: categoryName, // Override category with string name after spread
      };
    });
  }, [data]);

  // ------------------- FILTER LOGIC -------------------
  const filteredCryptos = useMemo(() => {
    if (activeTab === "All") {
      return cryptos;
    }
    return cryptos.filter((item) => item.category === activeTab);
  }, [cryptos, activeTab]);

  // ------------------- GET UNIQUE CATEGORIES -------------------
  const categories = useMemo(() => {
    const uniqueCategories = new Set(cryptos.map(crypto => crypto.category));
    return ["All", ...Array.from(uniqueCategories).filter(Boolean)];
  }, [cryptos]);

  return (
    <>
      <div className="container py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Crypto Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Latest cryptocurrency insights and analysis</p>
        </header>

        {/* ------------------- LOADING STATE ------------------- */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-muted-foreground">Loading crypto analysis...</p>
            </div>
          </div>
        )}

        {/* ------------------- ERROR STATE ------------------- */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">Error loading crypto analysis</p>
              <p className="text-muted-foreground mt-2">
                {error?.data?.message || error?.error || "Something went wrong. Please try again later."}
              </p>
            </div>
          </div>
        )}

        {/* ------------------- TABS ------------------- */}
        {!isLoading && !error && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  transition cursor-pointer
                  ${activeTab === tab
                    ? "bg-yellow-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ------------------- GRID ------------------- */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCryptos.length === 0 && !isLoading && !error && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">No crypto analysis available at the moment.</p>
              </div>
            )}

            {filteredCryptos.map((crypto) => {
              const { hasAccess } = checkAccess({
                accessType: crypto.accessType,
                allowedPlans: crypto.allowedPlans
              });

              return (
                <Card key={crypto?._id || crypto?.id} className="bg-card border border-border overflow-hidden">

                {/* image */}
                <div className="w-full h-44 overflow-hidden relative">
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none">
                      <Lock className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                  <ImageCarousel
                    images={
                      crypto?.photos && Array.isArray(crypto.photos) && crypto.photos.length > 0
                        ? crypto.photos
                        : crypto?.image
                        ? [crypto.image]
                        : []
                    }
                    alt={crypto?.title || "Crypto analysis"}
                    height="h-44"
                    showViewButton={hasAccess}
                    className={!hasAccess ? "blur-sm pointer-events-none" : ""}
                  />
                </div>

                <CardContent className="p-4">

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={crypto?.avatar} alt={crypto?.author || "Author"} />
                      <AvatarFallback>{crypto?.author?.[0] || "A"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium truncate">{crypto?.author || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{crypto?.date || ""}</p>
                        </div>
                        <Badge>{crypto?.category || ""}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-lg font-bold text-primary">{crypto?.title || "Untitled"}</h3>

                  {/* Preview - 2 lines max */}
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {hasAccess ? crypto?.preview || "" : "This content is locked. Upgrade your plan or log in to view full analysis."}
                  </p>

                  {/* Button */}
                  <div className="mt-4">
                    <Button
                      onClick={() => setSelectedCrypto(crypto)}
                      className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      {hasAccess ? "View Details" : "Unlock Analysis"}
                    </Button>
                  </div>

                </CardContent>

                <CardFooter className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Published • {crypto?.date?.split(',')?.[0] || ""}
                  </div>
                </CardFooter>

              </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* ------------------- MODAL ------------------- */}
      <Dialog open={!!selectedCrypto} onOpenChange={(open) => !open && setSelectedCrypto(null)}>
        <DialogContent className="max-w-xl w-full max-h-[85vh] p-0">
          <DialogHeader className="p-4 border-b bg-background">
            <DialogTitle className="text-lg font-bold">
              {selectedCrypto?.title}
            </DialogTitle>
          </DialogHeader>

          {/* AccessGate protects the Detail View */}
          <AccessGate
            accessType={selectedCrypto?.accessType}
            allowedPlans={selectedCrypto?.allowedPlans}
          >
            <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
              {/* Image Slider */}
              <ImageSlider
                images={
                  selectedCrypto?.photos && Array.isArray(selectedCrypto.photos) && selectedCrypto.photos.length > 0
                    ? selectedCrypto.photos
                    : selectedCrypto?.image
                    ? [selectedCrypto.image]
                    : []
                }
                description={selectedCrypto?.fullDisplayHtml || selectedCrypto?.full || ""}
                descriptionLimit={95}
                showDescription={false}
                alt="Crypto analysis chart"
                height="h-64"
              />

              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedCrypto?.date} • {selectedCrypto?.category}
                </p>

                <h2 className="text-2xl font-bold">{selectedCrypto?.title}</h2>

                {/* Full description with clickable links and line breaks preserved */}
                <div 
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ 
                    __html: selectedCrypto?.fullDisplayHtml || selectedCrypto?.full || "No content available." 
                  }}
                />

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedCrypto?.avatar} />
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{selectedCrypto?.author}</p>
                    <p className="text-xs text-muted-foreground">{selectedCrypto?.category}</p>
                  </div>
                </div>

                {/* Buttons */}
                {/* <div className="flex gap-3 mt-4">
                  <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Save Analysis
                  </Button>

                  <Button
                    className="flex-1 bg-gray-200"
                    onClick={() => setSelectedCrypto(null)}
                  >
                    Close
                  </Button>
                </div> */}
              </div>

            </div>
          </AccessGate>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage}
        images={
          selectedCrypto?.photos && Array.isArray(selectedCrypto.photos) && selectedCrypto.photos.length > 0
            ? selectedCrypto.photos
            : selectedCrypto?.image
            ? [selectedCrypto.image]
            : selectedImage
            ? [selectedImage]
            : []
        }
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Crypto analysis chart"
      />
    </>
  );
}

