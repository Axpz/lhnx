'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView, type Variants } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, History, Mail, MapPin, Phone, Award, Users, TrendingUp, Zap } from 'lucide-react';
import { useRef } from 'react';
import HistoryTimeline from '@/components/sections/history-timeline';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Reusable animated section component
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

export default function AboutPage() {
  const t = useTranslations('About');

  

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'Constantly pushing boundaries in aerial technology',
      color: 'text-blue-500',
    },
    {
      icon: Users,
      title: 'Teamwork',
      description: 'Collaborative spirit drives our success',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      title: 'Excellence',
      description: 'Commitment to quality in every product',
      color: 'text-purple-500',
    },
    {
      icon: Zap,
      title: 'Agility',
      description: 'Rapid response to market needs',
      color: 'text-orange-500',
    },
  ];

  const stats = [
    { label: 'Products', value: '50+', icon: Award },
    { label: 'Countries', value: '30+', icon: MapPin },
    { label: 'Team Members', value: '200+', icon: Users },
    { label: 'Years', value: '10+', icon: History },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop"
            alt="About LHNX"
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            We are a team of dreamers, engineers, and creators dedicated to pushing the boundaries of aerial technology.
          </p>
        </motion.div>
      </section>

      {/* Company Introduction */}
      <section className="py-20 container px-4 md:px-6 mx-auto max-w-9xl">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <AnimatedSection variant={fadeInLeft}>
            <div className="relative aspect-4/3 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
                alt="Our Team"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>
          
          <AnimatedSection variant={fadeInRight} className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded in 2015, LHNX has grown from a small startup to a global leader in aerial technology. 
              Our mission is to empower people to see the world from a new perspective through innovative 
              drone solutions that combine cutting-edge technology with intuitive design.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With offices spanning across multiple continents and a team of passionate engineers, 
              designers, and visionaries, we continue to push the boundaries of what&apos;s possible 
              in aerial innovation.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-9xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <AnimatedSection
                  key={stat.label}
                  variant={scaleIn}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 container px-4 md:px-6 mx-auto max-w-9xl">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-stretch">
          <AnimatedSection variant={fadeInLeft} className="h-full">
            <Card className="h-full flex flex-col">
              <CardContent className="p-8 space-y-6 flex flex-col justify-center grow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t('mission')}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To democratize aerial photography and industrial solutions through accessible, 
                  high-quality, and intelligent drone technology that empowers creativity and 
                  enhances productivity across industries.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection variant={fadeInRight} className="h-full">
            <Card className="h-full flex flex-col">
              <CardContent className="p-8 space-y-6 flex flex-col justify-center grow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t('vision')}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To be the world&apos;s most trusted partner in aerial innovation, creating tools 
                  that inspire creativity and enhance productivity while maintaining the highest 
                  standards of quality and safety.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-9xl">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <AnimatedSection
                  key={value.title}
                  variant={scaleIn}
                  className="h-full"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col">
                      <CardContent className="p-6 text-center space-y-4 flex flex-col items-center justify-center grow">
                        <div className={`inline-flex p-4 rounded-full bg-muted ${value.color}`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-lg">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* History Timeline with Images */}
      <HistoryTimeline />

      {/* Contact Info */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-9xl">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground text-lg">
              Get in touch with our team
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {[
              { icon: MapPin, title: 'Address', content: '123 Innovation Drive\nTech District, SZ 518000' },
              { icon: Phone, title: 'Phone', content: '+86 755 1234 5678' },
              { icon: Mail, title: 'Email', content: 'contact@lhnx.com' },
            ].map((contact) => {
              const Icon = contact.icon;
              return (
                <AnimatedSection
                  key={contact.title}
                  variant={scaleIn}
                  className="h-full"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col">
                      <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-4 grow">
                        <div className="p-4 rounded-full bg-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">{contact.title}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contact.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
