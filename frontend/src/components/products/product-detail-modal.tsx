'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Product} from '@/lib/types';
import Image from 'next/image';
import {Badge} from '@/components/ui/badge';
import {useTranslations} from 'next-intl';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({product, open, onOpenChange}: ProductDetailModalProps) {
  const t = useTranslations('Products');
  const baseApi = process.env.NEXT_PUBLIC_API_URL || '';

  if (!product) return null;

  const imageUrls = product.info.image_urls?.split(';')
    .map(url => url.startsWith('http') ? url : new URL(url, baseApi).toString()) 
    || ['/file.svg'];
  
  // Ensure we always have a valid image URL
  const mainImageUrl = imageUrls[0] || '/file.svg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
             {product.company?.info.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={mainImageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnail gallery could go here */}
            {imageUrls.length > 1 && (
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {imageUrls.slice(1).map((url, i) => {
                   const thumbnailUrl = url || '/file.svg';
                   return (
                     <div key={i} className="relative w-16 h-16 rounded overflow-hidden shrink-0 bg-muted">
                       <Image src={thumbnailUrl} alt={`${product.name} ${i}`} fill className="object-cover" />
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.info.description || 'No description available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground block">Heating Time</span>
                  <span className="font-medium">{product.info.heating_time || '-'} Hours</span>
               </div>
               <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <Badge variant={product.info.status === 1 ? 'default' : 'secondary'} className="mt-1">
                    {product.info.status === 1 ? 'Available' : 'Unavailable'}
                  </Badge>
               </div>
            </div>

            {/* Additional details */}
            <div className="border-t pt-4">
               <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                     <dt className="text-muted-foreground">Views</dt>
                     <dd>{product.info.view_count}</dd>
                  </div>
                  <div className="flex justify-between">
                     <dt className="text-muted-foreground">Sales</dt>
                     <dd>{product.info.sales_count}</dd>
                  </div>
               </dl>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

