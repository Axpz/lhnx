"use client";

import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import Image from "next/image";
import { History } from "lucide-react";
import { useRef } from "react";

// Animation variants
const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

// Reusable animated section component
function AnimatedSection({
  children,
  variant = fadeInLeft,
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variant}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const timeline = [
  {
    year: "2015",
    title: "Founded",
    description: "Started with a small team of passionate engineers.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    year: "2018",
    title: "First Product Launch",
    description: "Released our flagship drone series.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop",
  },
  {
    year: "2020",
    title: "Global Expansion",
    description: "Opened offices in Europe and North America.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop",
  },
  {
    year: "2023",
    title: "Innovation Award",
    description: "Recognized for breakthrough stabilization technology.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop",
  },
  {
    year: "2025",
    title: "Future Vision",
    description: "Continuing to redefine aerial possibilities.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function HistoryTimeline() {
  const t = useTranslations("About");

  return (
    <section className="py-20 container px-4 md:px-6 mx-auto max-w-9xl">
      <AnimatedSection className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <History className="h-8 w-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">{t("history")}</h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Our journey of innovation and growth
        </p>
      </AnimatedSection>

      <div className="max-w-4xl mx-auto space-y-12">
        {timeline.map((item, idx) => (
          <AnimatedSection
            key={idx}
            variant={idx % 2 === 0 ? fadeInLeft : fadeInRight}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div
                className={`relative aspect-video rounded-lg overflow-hidden shadow-lg ${
                  idx % 2 === 0 ? "md:order-1" : "md:order-2"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div
                className={`space-y-4 ${
                  idx % 2 === 0 ? "md:order-2" : "md:order-1"
                }`}
              >
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-2xl font-bold text-primary">
                    {item.year}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
