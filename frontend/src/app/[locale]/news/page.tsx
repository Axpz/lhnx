'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Search, Calendar, ArrowRight} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

// Mock Data

const NEWS_DATA = [
  {
    id: 1,
    title: 'LHNX Launches Revolutionary Drone Series',
    category: 'Product',
    date: '2025-05-15',
    excerpt: 'The new series features extended flight time and advanced obstacle avoidance.',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Strategic Partnership with Global Logistics Giant',
    category: 'Corporate',
    date: '2025-04-22',
    excerpt: 'Exploring new frontiers in autonomous delivery systems.',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Sustainability Report 2024 Released',
    category: 'CSR',
    date: '2025-03-10',
    excerpt: 'Our commitment to eco-friendly manufacturing and operations.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Upcoming Developer Conference',
    category: 'Events',
    date: '2025-02-05',
    excerpt: 'Join us for a deep dive into our SDK and open platform.',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Firmware Update v2.0 Available',
    category: 'Product',
    date: '2025-01-20',
    excerpt: 'Includes performance optimizations and new flight modes.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2070&auto=format&fit=crop'
  },
   {
    id: 6,
    title: 'Awarded "Best Innovation" at TechExpo',
    category: 'Awards',
    date: '2024-12-15',
    excerpt: 'Recognizing our contributions to aerial imaging technology.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'
  }
];

const CATEGORIES = ['All', 'Product', 'Corporate', 'CSR', 'Events', 'Awards'];

export default function NewsPage() {
  const t = useTranslations('News');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter Logic
  const filteredNews = NEWS_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container px-4 md:px-6 py-12 pt-24 min-h-screen max-w-9xl mx-auto">
      <div className="flex flex-col space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements, product releases, and stories from LHNX.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map(cat => (
              <Badge 
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder={t('search')} 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 bg-background"
             />
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence mode='popLayout'>
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card className="group h-full flex flex-col overflow-hidden bg-white/10">
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5">
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="px-0 text-primary hover:text-primary">
                        {t('readMore')} <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 text-muted-foreground"
              >
                No news found matching your criteria.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

