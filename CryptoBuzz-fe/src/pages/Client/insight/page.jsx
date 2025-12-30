import { useMemo, useState } from 'react';
import ImageViewer from '@/components/common/ImageViewer';
import ImageSlider from '@/components/common/ImageSlider';
import ImageCarousel from '@/components/common/ImageCarousel';
import { useGetTradeAnalysisQuery } from '@/store/client/clientTradeAnalysisApiSlice';
import { Lock } from 'lucide-react';
import {
  convertRtkEditorToDisplayFormat,
  convertRtkEditorToFormattedPlainText,
} from '@/lib/rtkEditorUtils';
import { useAccessControl } from '@/hooks/use-access-control';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessGate } from '@/components/common/AccessGate';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

export function InsightPage() {
  const { checkAccess } = useAccessControl();

  // ------------------- STATE -------------------
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  // ------------------- API CALL -------------------
  const { data, isLoading, error } = useGetTradeAnalysisQuery({
    page: 1,
    limit: 50, // Get more items for filtering
  });

  // ------------------- TRANSFORM API DATA -------------------
  const insights = useMemo(() => {
    if (!data?.data) return [];

    return data?.data?.map((insight) => {
      const createdBy = insight?.createdBy || {};
      const authorName =
        createdBy?.first_name && createdBy?.last_name
          ? `${createdBy?.first_name || ''} ${createdBy?.last_name || ''}`.trim()
          : createdBy?.first_name || createdBy?.last_name || 'Unknown Author';

      const categoryName = insight?.category?.name || 'Uncategorized';

      // Format date
      const date = insight?.createdAt
        ? new Date(insight.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

      // Get formatted plain text - converts HTML and \r\n to proper plain text
      const plainTextDescription = insight?.description
        ? convertRtkEditorToFormattedPlainText(insight.description, true)
        : '';

      // Get display format with clickable links for full view
      const fullDisplayHtml = insight?.description
        ? convertRtkEditorToDisplayFormat(insight.description, true, true)
        : '';

      // For preview: get single line version (no line breaks) and limit to 2 lines worth
      const singleLineText = insight?.description
        ? convertRtkEditorToFormattedPlainText(insight.description, false)
        : '';

      // Calculate approximate characters for 2 lines (assuming ~50 chars per line)
      const maxChars = 100;
      const preview = singleLineText
        ? singleLineText.length > maxChars
          ? singleLineText.substring(0, maxChars) + '...'
          : singleLineText
        : 'No description available.';

      // Get image from photos array or use placeholder
      const image =
        insight?.photos && insight.photos?.length > 0
          ? insight.photos[0]
          : 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop';

      // Get avatar from createdBy
      const avatar = createdBy?.image || '/media/avatars/1.png';

      return {
        id: insight?._id,
        _id: insight?._id,
        title: insight?.title || 'Untitled Insight',
        author: authorName,
        date: date,
        preview: preview,
        full: plainTextDescription || 'No content available.',
        fullDisplayHtml: fullDisplayHtml || '', // HTML with clickable links and line breaks
        fullHtml: insight.description || '', // Keep original HTML for reference if needed
        image: image,
        avatar: avatar,
        accessType: insight.accessType || 'PUBLIC',
        allowedPlans: insight.allowedPlans || [],
        url: insight.url,
        data: insight.data,
        photos: insight.photos || [],
        ...insight, // Include all other properties
        category: categoryName, // Override category with string name after spread
      };
    });
  }, [data]);

  // ------------------- FILTER LOGIC -------------------
  const filteredInsights = useMemo(() => {
    if (activeTab === 'All') {
      return insights;
    }
    return insights.filter((item) => item.category === activeTab);
  }, [insights, activeTab]);

  // ------------------- GET UNIQUE CATEGORIES -------------------
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      insights.map((insight) => insight.category),
    );
    return ['All', ...Array.from(uniqueCategories).filter(Boolean)];
  }, [insights]);

  return (
    <>
      <div className="container py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Insight Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest market insights and analysis
          </p>
        </header>

        {/* ------------------- LOADING STATE ------------------- */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        )}

        {/* ------------------- ERROR STATE ------------------- */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">
                Error loading insights
              </p>
              <p className="text-muted-foreground mt-2">
                {error?.data?.message ||
                  error?.error ||
                  'Something went wrong. Please try again later.'}
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
                  ${
                    activeTab === tab
                      ? 'bg-yellow-500 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
            {filteredInsights.length === 0 && !isLoading && !error && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No insights available at the moment.
                </p>
              </div>
            )}

            {filteredInsights.map((insight) => {
              const { hasAccess } = checkAccess({
                accessType: insight.accessType,
                allowedPlans: insight.allowedPlans,
              });

              return (
                <Card
                  key={insight?._id || insight?.id}
                  className="bg-card border border-border overflow-hidden"
                >
                  {/* image */}
                  <div className="w-full h-44 overflow-hidden relative">
                    {!hasAccess && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none">
                        <Lock className="w-8 h-8 text-white/80" />
                      </div>
                    )}
                    <ImageCarousel
                      images={
                        insight?.photos && Array.isArray(insight.photos) && insight.photos.length > 0
                          ? insight.photos
                          : insight?.image
                          ? [insight.image]
                          : []
                      }
                      alt={insight?.title || "Trade insight"}
                      height="h-44"
                      showViewButton={hasAccess}
                      className={!hasAccess ? "blur-sm pointer-events-none" : ""}
                    />
                  </div>

                  <CardContent className="p-4">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={insight?.avatar}
                          alt={insight?.author || "Author"}
                        />
                        <AvatarFallback>{insight?.author?.[0] || "A"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">
                              {insight?.author || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {insight?.date || ""}
                            </p>
                          </div>
                          <Badge>{insight?.category || ""}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-lg font-bold text-primary">
                      {insight?.title || "Untitled"}
                    </h3>

                    {/* Preview - 2 lines max */}
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {hasAccess
                        ? insight?.preview || ""
                        : 'This content is locked. Upgrade your plan or log in to view full insights.'}
                    </p>

                    {/* Button */}
                    <div className="mt-4">
                      <Button
                        onClick={() => setSelectedInsight(insight)}
                        className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                      >
                        {hasAccess ? 'View Details' : 'Unlock Insight'}
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Published • {insight?.date?.split(',')?.[0] || ""}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------- MODAL ------------------- */}
      <Dialog
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
      >
        <DialogContent className="max-w-xl w-full max-h-[85vh] p-0">
          <DialogHeader className="p-4 border-b bg-background">
            <DialogTitle className="text-lg font-bold">
              {selectedInsight?.title}
            </DialogTitle>
          </DialogHeader>

          {/* AccessGate protects the Detail View */}
          <AccessGate
            accessType={selectedInsight?.accessType}
            allowedPlans={selectedInsight?.allowedPlans}
          >
            <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
              {/* Image Slider */}
              <ImageSlider
                images={
                  selectedInsight?.photos && Array.isArray(selectedInsight.photos) && selectedInsight.photos.length > 0
                    ? selectedInsight.photos
                    : selectedInsight?.image
                    ? [selectedInsight.image]
                    : []
                }
                description={selectedInsight?.fullDisplayHtml || selectedInsight?.full || ""}
                descriptionLimit={95}
                showDescription={false}
                alt="Trade insight chart"
                height="h-64"
              />

              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedInsight?.date} • {selectedInsight?.category}
                </p>

                <h2 className="text-2xl font-bold">{selectedInsight?.title}</h2>

                {/* Full description with clickable links and line breaks preserved */}
                <div
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedInsight?.fullDisplayHtml ||
                      selectedInsight?.full ||
                      'No content available.',
                  }}
                />

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedInsight?.avatar} />
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedInsight?.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedInsight?.category}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                {/* <div className="flex gap-3 mt-4">
                  <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Save Insight
                  </Button>

                  <Button
                    className="flex-1 bg-gray-200"
                    onClick={() => setSelectedInsight(null)}
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
          selectedInsight?.photos && Array.isArray(selectedInsight.photos) && selectedInsight.photos.length > 0
            ? selectedInsight.photos
            : selectedInsight?.image
            ? [selectedInsight.image]
            : selectedImage
            ? [selectedImage]
            : []
        }
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Trade insight chart"
      />
    </>
  );
}
