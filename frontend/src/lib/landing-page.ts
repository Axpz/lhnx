/**
 * Landing Page 工具函数 - 简化版
 * 包含所有landing page相关的常量、类型和工具函数
 */

import { ProductGroup, ProductImage } from './types'

// ============ 常量配置 ============

export const LANDING_CONFIG = {
  // 产品组配置
  TOTAL_GROUPS: 4,
  IMAGES_PER_GROUP: 10,
  
  // 图片路径
  PRODUCT_BASE_PATH: '/linhangnuanxin',
  BUSINESS_LICENSE: '/linhangnuanxin/WechatIMG810.jpg',
  PLACEHOLDER: '/placeholder-image.jpg',
  
  // 产品组信息
  GROUP_NAMES: [
    '产品系列一',
    '产品系列二', 
    '产品系列三',
    '产品系列四'
  ],
  
  GROUP_DESCRIPTIONS: [
    '精选优质产品，展现卓越品质',
    '创新设计理念，引领行业潮流',
    '专业技术支持，保障产品性能',
    '完善服务体系，提供全方位支持'
  ]
} as const

// ============ 工具函数 ============

/**
 * 生成产品图片路径
 * @param groupId 产品组ID (1-4)
 * @param imageNumber 图片编号 (1-10)
 */
export function getProductImagePath(groupId: number, imageNumber: number): string {
  return `${LANDING_CONFIG.PRODUCT_BASE_PATH}/${groupId}/${groupId}-${imageNumber}.jpg`
}

/**
 * 生成工商营业执照图片路径
 */
export function getBusinessLicensePath(): string {
  return LANDING_CONFIG.BUSINESS_LICENSE
}

/**
 * 创建产品组数据
 */
export function createProductGroups(): ProductGroup[] {
  return Array.from({ length: LANDING_CONFIG.TOTAL_GROUPS }, (_, i) => {
    const groupId = i + 1
    const groupName = LANDING_CONFIG.GROUP_NAMES[i] || `产品系列${groupId}`
    const groupDescription = LANDING_CONFIG.GROUP_DESCRIPTIONS[i] || ''
    
    return {
      id: groupId,
      name: groupName,
      description: groupDescription,
      images: Array.from({ length: LANDING_CONFIG.IMAGES_PER_GROUP }, (_, j) => {
        const imageNumber = j + 1
        return {
          url: getProductImagePath(groupId, imageNumber),
          alt: `${groupName} - 图片${imageNumber}`,
          order: imageNumber
        }
      })
    }
  })
}

/**
 * 图片预加载
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
