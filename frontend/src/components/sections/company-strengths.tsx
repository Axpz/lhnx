'use client';

import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';

export default function CompanyStrengths() {
  const t = useTranslations('Home');

  const stats = [
    { key: 'years', value: '10+' },
    { key: 'countries', value: '50+' },
    { key: 'patents', value: '120+' },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6 max-w-9xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="space-y-6"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {t('companyStrengths')}
            </h2>
            <p className="text-muted-foreground text-lg">
              We are dedicated to pushing the boundaries of what is possible in aerial technology.
              Our commitment to innovation and quality has made us a leader in the industry.
            </p>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              {stats.map((stat) => (
                <div key={stat.key} className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-xl overflow-hidden bg-muted"
          >
            {/* Placeholder for company image/video */}
            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
               Company Image/Video
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

