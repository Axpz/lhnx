'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Cpu, Shield, Zap, Globe} from 'lucide-react';

const icons = {
  cpu: Cpu,
  shield: Shield,
  zap: Zap,
  globe: Globe,
};

export default function TechAdvantages() {
  const t = useTranslations('Home');
  
  // This would ideally come from a config or messages array, 
  // simplified here for the demo to match the 4 cards requirement.
  const advantages = [
    { icon: 'cpu', title: 'AI Flight Core', desc: 'Advanced processing power for real-time analysis.' },
    { icon: 'shield', title: 'Trusted Security', desc: 'Robust security protocols ensuring data integrity.' },
    { icon: 'zap', title: 'Efficient Power', desc: 'High-efficiency power management systems.' },
    { icon: 'globe', title: 'Global Connectivity', desc: 'Remote operations with low-latency streaming.' },
  ];

  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6 max-w-9xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t('techAdvantages')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch justify-items-center">
          {advantages.map((adv, index) => {
            const Icon = icons[adv.icon as keyof typeof icons];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{adv.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="grow flex items-center">
                    <p className="text-muted-foreground">
                      {adv.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

