'use client';

import {Link} from '@/lib/i18n-routing';
import {useTranslations} from 'next-intl';

export default function Footer() {
  const t = useTranslations('Navigation');
  
  const footerSections = [
    {
      title: 'Product Categories',
      links: [
        { name: t('products'), href: '/products' },
        { name: 'Consumer', href: '#' },
        { name: 'Professional', href: '#' },
        { name: 'Enterprise', href: '#' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Product Support', href: '#' },
        { name: 'Help Center', href: '#' },
        { name: 'Download Center', href: '#' },
        { name: 'Service Policies', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: t('about'), href: '/about' },
        { name: t('news'), href: '/news' },
        { name: 'Careers', href: '#' },
        { name: 'Contact Us', href: '#' },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Forum', href: '#' },
        { name: 'Developer', href: '#' },
        { name: 'Media Center', href: '#' },
        { name: 'Blog', href: '#' },
      ]
    },
  ];

  return (
    <footer className="bg-slate-950 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-9xl px-6 pb-8 pt-16 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold leading-6 text-white mb-4">
                {section.title}
              </h3>
              <ul role="list" className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">LHNX</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LHNX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
