'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n-routing';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'transparent';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'default',
  className 
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  const isTransparent = variant === 'transparent';

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'text-sm font-medium transition-all duration-200 cursor-pointer',
        isTransparent
          ? 'text-white/80 hover:text-white'
          : 'text-foreground/70 hover:text-foreground',
        className
      )}
      aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
      type="button"
    >
      {locale === 'en' ? 'EN / 中文' : '中文 / EN'}
    </button>
  );
}
