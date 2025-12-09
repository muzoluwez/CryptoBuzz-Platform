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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

export function InsightPage() {
  // data pulled from prompt
  const insights = [
    {
      id: '1',
      title: 'EURUSD – Wochenausblick',
      author: 'Florian Krauß',
      date: 'Dec 08, 2025, 01:00 AM',
      preview: 'Der Markt handelt erneut in der Zone, aus der zuletzt Schwäche entstanden ist...',
      full: `Der Markt handelt erneut in der Zone, aus der zuletzt Schwäche entstanden ist. Im Wochenverlauf erwarten wir weiterhin erhöhte Volatilität, solange kein klarer Ausbruch oberhalb des Widerstands erfolgt. Positionen sollten konservativ gemanagt werden; ein Rücksetzer in den Bereich um 1.0750 bietet kurzfristige Chancen, während ein nachhaltiger Bruch unter 1.0650 das Setup negiert.`,
      image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/1.png',
      category: 'Macro',
    },
    {
      id: '2',
      title: 'XAUUSD Potential Buy Reversal Zones',
      author: 'Delphine Njuguna',
      date: 'Dec 04, 2025, 10:25 AM',
      preview: 'We are expecting Gold to drop to our levels before pushing into higher zones...',
      full: `We are expecting Gold to drop to our levels before pushing into higher zones. The bias remains bullish intraday after the pullback, but risk management is key — watch the invalidation area closely. Targets are set incrementally and should be trailed as price confirms momentum. Consider scaling entries and using limit orders near the green zones.`,
      image: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/2.png',
      category: 'Commodities',
    },
    {
      id: '3',
      title: 'BTC 1H Intraday Buy Zonen',
      author: 'Jonathan Czwikla',
      date: 'Dec 04, 2025, 04:02 AM',
      preview: 'I am looking for a retracement in BTC to open up another long position...',
      full: `I am looking for a retracement in BTC to open up another long position. Key support zones around the moving averages should hold for the idea to remain valid. Use tight invalidation levels and scale into confirmed bounces. Keep an eye on derivatives flows as they may accelerate moves during the Asian session.`,
      image: 'https://images.unsplash.com/photo-1549410195-79b2d5d8f5de?q=80&w=1400&auto=format&fit=crop',
      avatar: '/media/avatars/3.png',
      category: 'Crypto',
    },
  ];

  const [selectedInsight, setSelectedInsight] = useState(null);

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Analysis" />
      </Toolbar>

      <div className="container py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Insight Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Latest market insights and analysis</p>
        </header>

        {/* Responsive grid: 1 → 2 → 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="bg-card border border-border overflow-hidden">
              {/* chart image */}
              <div className="w-full h-44 md:h-48 lg:h-44 overflow-hidden">
                <img
                  src={insight.image}
                  alt={insight.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardContent className="p-4">
                {/* author row */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={insight.avatar} alt={insight.author} />
                    <AvatarFallback>{insight.author.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">{insight.author}</p>
                        <p className="text-xs text-muted-foreground">{insight.date}</p>
                      </div>
                      <Badge className="ml-3">{insight.category}</Badge>
                    </div>
                  </div>
                </div>

                {/* title */}
                <h3 className="mt-4 text-lg font-bold text-primary">{insight.title}</h3>

                {/* preview */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{insight.preview}</p>

                <div className="mt-4">
                  <Button
                    onClick={() => setSelectedInsight(insight)}
                    className="w-full"
                    variant="ghost"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="text-xs text-muted-foreground">Published • {insight.date.split(',')[0]}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal / Dialog for details (UI dialog) */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => { if (!open) setSelectedInsight(null); }}>
        <DialogContent className="max-w-3xl w-full max-h-[85vh] p-0">
          <DialogHeader className="p-4 border-b border-border bg-background">
            <DialogTitle className="text-lg font-bold text-foreground">
              {selectedInsight?.title}
            </DialogTitle>
            <DialogClose asChild>
              <button aria-label="Close" className="ml-auto text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </DialogClose>
          </DialogHeader>

          {/* content area: scrollable on small screens */}
          <div className="bg-card p-4 overflow-y-auto max-h-[72vh]">
            {/* large chart */}
            <div className="w-full rounded-md overflow-hidden">
              <img
                src={selectedInsight?.image}
                alt={selectedInsight?.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* text and author */}
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{selectedInsight?.date} • {selectedInsight?.category}</p>
                <h2 className="text-2xl font-bold text-primary mt-2">{selectedInsight?.title}</h2>
              </div>

              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedInsight?.full}</p>
              </div>

              {/* author block */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedInsight?.avatar} alt={selectedInsight?.author} />
                  <AvatarFallback>{selectedInsight?.author?.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedInsight?.author}</p>
                  <p className="text-xs text-muted-foreground">{selectedInsight?.category}</p>
                </div>
              </div>

              {/* actions */}
              <div className="flex gap-3 mt-4">
                <Button className="flex-1" variant="primary">Save Insight</Button>
                <Button className="flex-1" variant="secondary" onClick={() => setSelectedInsight(null)}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

