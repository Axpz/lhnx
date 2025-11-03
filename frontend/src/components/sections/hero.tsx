"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n-routing";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const HERO_IMAGES = [
  {
    src: "https://cn-res.midea.com/content/dam/mideacn-aem/%E7%BE%8E%E7%9A%84%E9%A6%96%E9%A1%B5/%E9%A6%96%E9%A1%B5banner-%E4%B8%AD%E6%96%87-pc1920x900.jpg",
    alt: "Drone in forest",
    position: "center",
  },
  {
    src: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=2070&auto=format&fit=crop",
    alt: "Drone in forest",
    position: "center",
  },
  {
    src: "https://heatpatch.axpz.org/uploads/5f6b8906525ef447990da2f8456616d3.jpg",
    alt: "Drone flying over mountains",
    position: "center",
  },
];

export default function Hero() {
  const t = useTranslations("Home");
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const features = [
    "Dual-camera aerial mastery",
    "8K omni-directional capture",
    "ActiveTrack 360° flight path",
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 text-white group">
      {/* Swiper Background */}
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="absolute inset-0 h-full w-full"
      >
        {HERO_IMAGES.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className="object-cover animate-zoom"
                style={{ objectPosition: image.position }}
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-start pt-[60vh]">
        <div className="container px-4 md:px-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/90 backdrop-blur-sm">
                <span>LHNX</span>
                <div className="h-1 w-1 rounded-full bg-blue-400" />
                <span>Series</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
                {t("heroTitle")}
              </h1>
              <p className="max-w-2xl mx-auto lg:mx-0 text-base text-slate-100 md:text-lg drop-shadow-md">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <Link href="/products">
                    {t("viewProducts")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-white/30 px-8 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href="/about">
                    <Play className="mr-2 h-4 w-4" />
                    {t("learnMore")}
                  </Link>
                </Button>
              </div>

              {/* Features List */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-slate-200 pt-4">
                {features.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <span className="h-px w-6 bg-white/60" />
                    <span className="drop-shadow-md">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Slide Indicators - Hidden by default, show on hover */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    activeIndex === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden by default, show on hover */}
      {/* 左箭头 */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-32 w-32 rounded-full bg-white/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 hover:cursor-pointer transition-opacity duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      {/* 右箭头 */}
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-32 w-32 rounded-full bg-white/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 hover:cursor-pointer transition-opacity duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </section>
  );
}
