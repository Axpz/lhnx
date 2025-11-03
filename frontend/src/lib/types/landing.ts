import type { Company } from './company'

// Landing Page 相关类型
export interface ProductImage {
  url: string
  alt: string
  order: number
}

export interface ProductGroup {
  id: number
  name: string
  description?: string
  images: ProductImage[]
}

export interface CompanyLandingData {
  company: Company
  productGroups: ProductGroup[]
  businessLicenseUrl: string
}

export interface LandingPageHeaderProps {
  companyId: string
  companyName: string
  companyLogo?: string
  description?: string
}

export interface ProductGalleryProps {
  productGroups: ProductGroup[]
}

export interface BusinessLicenseSectionProps {
  licenseImageUrl: string
  companyName: string
}

export interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  alt: string
  onClose: () => void
}

