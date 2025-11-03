'use client';

import Hero from '@/components/sections/hero';
import TechAdvantages from '@/components/sections/tech-advantages';
import CompanyStrengths from '@/components/sections/company-strengths';
import Partnerships from '@/components/sections/partnerships';
import HistoryTimeline from '@/components/sections/history-timeline';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TechAdvantages />
      <CompanyStrengths />
      <HistoryTimeline />
      <Partnerships />
    </div>
  );
}

