'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView, type Variants } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Clock, Leaf, ShieldCheck } from 'lucide-react';

// Static product data
const PRODUCTS = [
  {
    id: '1',
    name: 'WarmLife Body Patch',
    category: 'Body Care',
    description: 'Professional grade self-heating patch providing 12 hours of continuous warmth for daily comfort.',
    image: 'https://images.unsplash.com/photo-1605345778847-f5597711449e?q=80&w=2070&auto=format&fit=crop',
    features: ['12h Duration', '53°C Avg', 'Eco-friendly'],
    status: 'popular',
  },
  {
    id: '2',
    name: 'Steam Eye Mask',
    category: 'Wellness',
    description: 'Soothing steam therapy for tired eyes with natural lavender essence to help you relax.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop',
    features: ['40°C Gentle Heat', '25min Spa', 'Aromatherapy'],
    status: 'new',
  },
  {
    id: '3',
    name: 'CozyStep Insoles',
    category: 'Foot Care',
    description: 'Thin and comfortable heated insoles designed for outdoor activities and cold winters.',
    image: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=2070&auto=format&fit=crop',
    features: ['Full Foot Heat', 'Anti-slip', '8h Warmth'],
    status: 'seasonal',
  },
  {
    id: '4',
    name: 'Menstrual Relief Patch',
    category: 'Health',
    description: 'Targeted relief design with mugwort and ginger extracts for monthly comfort.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop',
    features: ['Herbal Formula', 'Ergonomic', 'Discreet'],
    status: 'care',
  },
  {
    id: '5',
    name: 'Hand Warmer Pack',
    category: 'Daily Care',
    description: 'Portable pocket-sized heat packs, perfect for commute and outdoor sports.',
    image: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=2070&auto=format&fit=crop',
    features: ['Instant Heat', '10h Duration', 'Portable'],
    status: 'essential',
  },
  {
    id: '6',
    name: 'Neck & Shoulder Patch',
    category: 'Therapy',
    description: 'Specialized shape for neck and shoulder contours to relieve muscle tension.',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2070&auto=format&fit=crop',
    features: ['Contour Fit', 'Muscle Relief', 'Deep Heat'],
    status: 'relief',
  },
];

const FEATURES_ICONS = [
  { icon: Thermometer, title: 'Constant Temperature', description: 'Advanced temperature control technology' },
  { icon: Clock, title: 'Long Duration', description: 'Up to 12 hours of effective heating' },
  { icon: Leaf, title: 'Natural Ingredients', description: 'Safe and eco-friendly materials' },
  { icon: ShieldCheck, title: 'Quality Safety', description: 'Multi-layer protection design' },
];

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

function AnimatedSection({
  children,
  variant = fadeInUp,
  className = '',
}: {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variant}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('Products');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1605345778847-f5597711449e?q=80&w=2070&auto=format&fit=crop"
            alt="Products"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white max-w-4xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            {t('title') || 'Premium Heat Products'}
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            {t('description') || 'Discover our range of advanced heating solutions for health and comfort'}
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-b from-background to-muted/20">
        <div className="container px-4 md:px-6 mx-auto max-w-9xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-stretch">
            {FEATURES_ICONS.map((feature, idx) => {
              const Icon = feature.icon;
              // 为每个特性分配不同的渐变色
              const colorVariants = [
                'from-orange-500 to-red-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-purple-500 to-pink-500',
              ];
              const colorClass = colorVariants[idx % colorVariants.length];
              
              return (
                <AnimatedSection key={feature.title} variant={scaleIn} className="h-full">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                    className="h-full"
                  >
                    <Card className="flex flex-col items-center text-center h-full">
                      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 w-full grow">
                        <div className={`p-5 rounded-2xl bg-linear-to-br ${colorClass} shadow-lg shrink-0`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2 grow flex flex-col justify-center">
                          <h3 className="font-bold text-lg md:text-xl text-foreground">{feature.title}</h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 container px-4 md:px-6 mx-auto max-w-9xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Product Lineup</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From daily care to specialized therapy, find the perfect warmth for your needs
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-9xl mx-auto items-stretch">
          {PRODUCTS.map((product, idx) => (
            <AnimatedSection
              key={product.id}
              variant={scaleIn}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden cursor-pointer group">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
                      {product.category}
                    </Badge>
                  </div>

                  <CardContent className="p-6 grow space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <button className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white transition-colors duration-200">
                      {t('viewDetails') || 'View Details'}
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
