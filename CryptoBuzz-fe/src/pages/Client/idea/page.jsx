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
import { useState } from "react";



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

  const cards = [
    {
      image: "https://shorturl.at/OR9px",
      avatar: "https://i.pravatar.cc/300",
      trader: "Oran Wright",
      market: "Forex",
      year: "2025",
      entry: "4204",
      invalidation: "4215.45",
      exits: ["4193.07", "4185.48", "4178.26"],
      tags: [
        { label: "SELL", type: "sell" },
        { label: "GOLD SELL", type: "pair" },
        { label: "Pending", type: "status" },
      ],
    },
    {
      image: "https://shorturl.at/B5dRG",
      avatar: "https://i.pravatar.cc/300",
      trader: "Sheriff Adeyemi",
      market: "Forex",
      year: "2025",
      entry: "180.957",
      invalidation: "180.484",
      exits: ["181.169", "181.429", "181.991"],
      tags: [
        { label: "BUY", type: "buy" },
        { label: "EURJPY", type: "pair" },
        { label: "Pending", type: "status" },
      ],
    },
    {
      image: "https://shorturl.at/JMZK9",
      avatar: "https://i.pravatar.cc/300",
      trader: "Delphine Njuguna",
      market: "Forex",
      year: "2025",
      entry: "47805",
      invalidation: "47950",
      exits: ["47770", "47772", "47650"],
      tags: [
        { label: "SELL", type: "sell" },
        { label: "US30", type: "pair" },
        { label: "Active", type: "status" },
      ],
    },
  ];

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Ideas" />
      </Toolbar>
      <div className="container ">
         
         <header className="mb-6">
            <h1 className="text-2xl font-semibold text-black dark:text-white">Trading Signals</h1>
            <p className="text-xs text-gray-500 mt-1">Home / Ideas</p>
          </header>

        {/* Responsive 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {cards.map((c, i) => (
            <Card
              key={i}
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
                  className="w-full h-52 object-cover border-0 group-hover:opacity-80 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

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
                        "bg-purple-200 text-purple-600"
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
                {/* USER ROW */}


                {/* PRICE ROWS */}
                <div className="space-y-2">
                  <div className='flex items-center justify-between'>
                    <p>Entry</p>
                    <div className='flex items-center gap-2 justify-between min-w-20'  >
                      <CopyIcon className='w-4' />
                      <p className='text-green-500'>  {c.entry}</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between '>
                    <p>Invalidation</p>
                    <div className='flex items-center gap-2 justify-between min-w-20'>
                      <CopyIcon className='w-4' />
                      <p className='text-red-500'>  {c.invalidation}</p>
                    </div>
                  </div>
                  {c.exits.map((exitVal, idx) => (
                    <div className='flex items-center justify-between'>
                      <p>{`Exit ${idx + 1}`}</p>
                      <div className='flex items-center gap-2 justify-between min-w-20'>
                        <CopyIcon className='w-4' />
                        <p className='text-red-500'>  {exitVal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* FOOTER */}
              <CardFooter className="p-5 pt-0">
                <button
                  onClick={() => setSelectedCard(c)}
                  className="btn bg-primary text-black w-full !flex items-center justify-center gap-2 mt-4 hover:scale-up transition-all duration-300"
                >
                  <Eye size={18} /> View Details
                </button>
              </CardFooter>
            </Card>
          ))}

        </div>
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
                    ${tag.type === "status" && "bg-purple-200 text-purple-600"}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

