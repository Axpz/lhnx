'use client';

import Image from 'next/image';
import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Product} from '@/lib/types';
import {cn} from '@/lib/utils';
import {motion} from 'framer-motion';
import {useTranslations} from 'next-intl';

interface ProductCardProps {
  product: Product;
  className?: string;
  onClick?: () => void;
}

export function ProductCard({product, className, onClick}: ProductCardProps) {
  const t = useTranslations('Products');
  const baseApi = process.env.NEXT_PUBLIC_API_URL || '';
  
  // Handle image URLs
  const imageUrls = product.info.image_urls?.split(';')
    .map(url => url.startsWith('http') ? url : new URL(url, baseApi).toString()) 
    || ['/file.svg']; // Fallback image
  
  // Ensure we always have a valid image URL
  const imageUrl = imageUrls[0] || '/file.svg';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn("overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow h-full flex flex-col cursor-pointer", className)}
        onClick={onClick}
      >
        <div className="relative aspect-square bg-secondary/20">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.info.status === 1 && (
             <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary">New</Badge>
          )}
        </div>
        
        <CardContent className="p-4 grow">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2" title={product.name}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.info.description || 'No description available'}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
           <span>{product.company?.info.name || 'LHNX'}</span>
           <span className="text-primary font-medium group-hover:underline">
             {t('viewDetails')}
           </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
