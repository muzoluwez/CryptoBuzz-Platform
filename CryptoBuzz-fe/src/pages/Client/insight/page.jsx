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
import { useState } from "react";

export function InsightPage() {

  // ------------------- INSIGHTS DATA -------------------
  const insights = [
    {
      id: '1',
      title: 'EURUSD – Wochenausblick',
      author: 'Florian Krauß',
      date: 'Dec 08, 2025, 01:00 AM',
      preview: 'Der Markt handelt erneut in der Zone...',
      full: `Der Markt handelt erneut in der Zone...`,
      image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/1.png',
      category: 'Forex',
    },
    {
      id: '2',
      title: 'XAUUSD Potential Buy Reversal Zones',
      author: 'Delphine Njuguna',
      date: 'Dec 04, 2025, 10:25 AM',
      preview: 'We are expecting Gold to drop to our levels...',
      full: `We are expecting Gold to drop...`,
      image: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/2.png',
      category: 'Forex',
    },
    {
      id: '3',
      title: 'BTC 1H Intraday Buy Zonen',
      author: 'Jonathan Czwikla',
      date: 'Dec 04, 2025, 04:02 AM',
      preview: 'I am looking for a retracement in BTC...',
      full: `I am looking for a retracement...`,
      image: 'https://images.unsplash.com/photo-1549410195-79b2d5d8f5de?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/3.png',
      category: 'Crypto',
    },
  ];

  // ------------------- STATE -------------------
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // ------------------- FILTER LOGIC -------------------
  const filteredInsights =
    activeTab === "All"
      ? insights
      : insights.filter((item) => item.category === activeTab);

  return (
    <>
      <div className="container py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Insight Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Latest market insights and analysis</p>
        </header>

        {/* ------------------- TABS ------------------- */}
        <div className="flex gap-3 mb-6">
          {["All", "Forex", "Crypto"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg
                transition cursor-pointer
                ${activeTab === tab
                  ? "bg-yellow-500 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ------------------- GRID ------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="bg-card border border-border overflow-hidden">

              {/* image */}
              <div className="w-full h-44 overflow-hidden">
                <img
                  src={insight.image}
                  alt={insight.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardContent className="p-4">

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={insight.avatar} alt={insight.author} />
                    <AvatarFallback>{insight.author[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate">{insight.author}</p>
                        <p className="text-xs text-muted-foreground">{insight.date}</p>
                      </div>
                      <Badge>{insight.category}</Badge>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-bold text-primary">{insight.title}</h3>

                {/* Preview */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {insight.preview}
                </p>

                {/* Button */}
                <div className="mt-4">
                  <Button
                    onClick={() => setSelectedInsight(insight)}
                    className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    View Details
                  </Button>
                </div>

              </CardContent>

              <CardFooter className="p-4">
                <div className="text-sm text-muted-foreground">
                  Published • {insight.date.split(',')[0]}
                </div>
              </CardFooter>

            </Card>
          ))}
        </div>

      </div>

      {/* ------------------- MODAL ------------------- */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-xl w-full max-h-[85vh] p-0">
          <DialogHeader className="p-4 border-b bg-background">
            <DialogTitle className="text-lg font-bold">
              {selectedInsight?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
            {/* Image */}
            <img
              src={selectedInsight?.image}
              className="w-full h-64 object-cover rounded-md"
            />

            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedInsight?.date} • {selectedInsight?.category}
              </p>

              <h2 className="text-2xl font-bold">{selectedInsight?.title}</h2>

              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedInsight?.full}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedInsight?.avatar} />
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{selectedInsight?.author}</p>
                  <p className="text-xs text-muted-foreground">{selectedInsight?.category}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                  Save Insight
                </Button>

                <Button
                  className="flex-1 bg-gray-200"
                  onClick={() => setSelectedInsight(null)}
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
