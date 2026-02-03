import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function PlanCard({ plan, purchased = false, onClick }) {
  const image = plan?.hotmartProductDetails?.image || plan?.image || '';
  const priceLabel = plan?.price > 0 ? `${plan?.currency || '$'}${plan.price.toFixed(2)}` : 'Free';

  return (
    <Card className="p-4 flex flex-col justify-between h-full">
      <div>
        {image ? (
          <div className="w-full h-[25vh] overflow-hidden rounded-md mb-4 bg-gray-100">
            <img
              src={image}
              alt={plan?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-[25vh] rounded-md mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500" style={{ display: 'none' }}>
              <span>Image not available</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-[25vh] rounded-md mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
            <span>No image</span>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">{plan?.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{plan?.description}</p>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">Price</div>
          <div className="text-xl font-bold">{priceLabel}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {purchased ? (
            <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded">Purchased</span>
          ) : (
            <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded">Available</span>
          )}
          <Button onClick={() => onClick(plan)} className={cn('min-w-[110px]')}>View</Button>
        </div>
      </div>
    </Card>
  );
}
