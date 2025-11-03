'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const PARTNERS = [
  {
    name: 'Global Logistics Co.',
    description: 'Strategic supply chain partner',
    icon: '/globe.svg', // Fallback icon since we don't have real logos
  },
  {
    name: 'TechHealth Inc.',
    description: 'Advanced material research',
    icon: '/file.svg',
  },
  {
    name: 'EcoMaterials Ltd.',
    description: 'Sustainable packaging solutions',
    icon: '/window.svg',
  },
  {
    name: 'Wellness Chain',
    description: 'Retail distribution network',
    icon: '/globe.svg',
  },
  {
    name: 'MediCare Group',
    description: 'Medical grade certification',
    icon: '/file.svg',
  },
];

export default function Partnerships() {
  const t = useTranslations('Home');

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
       {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6 max-w-9xl mx-auto space-y-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('partnerships')}
          </h2>
          <p className="text-lg text-muted-foreground">
            Collaborating with industry leaders to deliver excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PARTNERS.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4 h-full p-6">
                  <div className="relative w-16 h-16 p-3 rounded-full bg-primary/5 mb-2 transition-colors">
                    <Image
                      src={partner.icon}
                      alt={partner.name}
                      fill
                      className="object-contain p-2 opacity-70 transition-opacity"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">{partner.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

