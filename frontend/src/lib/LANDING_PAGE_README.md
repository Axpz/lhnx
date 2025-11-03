# Landing Page 实现说明

## 简化后的结构

之前的实现分散在 4 个文件中，现在统一到一个文件：

```
frontend/src/lib/
└── landing-page.ts          # 所有 landing page 相关的代码
```

## 使用方式

### 1. 基础导入

```typescript
import { 
  LANDING_CONFIG,           // 配置常量
  getProductImagePath,      // 获取产品图片路径
  getBusinessLicensePath,   // 获取营业执照路径
  createProductGroups,      // 创建产品组数据
  preloadImage              // 图片预加载
} from '@/lib/landing-page'
```

### 2. 创建产品组数据

```typescript
const productGroups = createProductGroups()
// 返回 4 个产品组，每组 10 张图片
```

### 3. 获取图片路径

```typescript
// 产品图片
const imagePath = getProductImagePath(1, 1)  // '/linhangnuanxin/1/1-1.jpg'

// 营业执照
const licensePath = getBusinessLicensePath()  // '/linhangnuanxin/WechatIMG810.jpg'
```

### 4. 配置常量

```typescript
LANDING_CONFIG.TOTAL_GROUPS        // 4 个产品组
LANDING_CONFIG.IMAGES_PER_GROUP    // 每组 10 张图片
LANDING_CONFIG.PRODUCT_BASE_PATH   // '/linhangnuanxin'
LANDING_CONFIG.PLACEHOLDER         // 占位图路径
LANDING_CONFIG.GROUP_NAMES         // 产品组名称数组
LANDING_CONFIG.GROUP_DESCRIPTIONS  // 产品组描述数组
```

## 与之前的对比

### 之前（复杂）
- `landing-page-constants.ts` - 100+ 行常量定义
- `landing-page-utils.ts` - 200+ 行工具函数
- `landing-page-validation.ts` - 150+ 行验证函数
- `landing-page-verification.ts` - 200+ 行测试代码

**总计：650+ 行代码分散在 4 个文件**

### 现在（简洁）
- `landing-page.ts` - 80 行，包含所有必要功能

**总计：80 行代码在 1 个文件**

## 优势

1. **简单直观** - 所有代码在一个文件，容易理解和维护
2. **减少复杂度** - 移除了过度设计的验证和配置
3. **保持功能** - 核心功能完全保留
4. **更好的性能** - 更少的模块导入和解析
5. **易于测试** - 简化的 API 更容易编写测试

## 迁移指南

如果你的代码使用了旧的导入：

```typescript
// 旧的导入
import { generateProductImagePath } from '@/lib/landing-page-utils'
import { PRODUCT_GROUPS_CONFIG } from '@/lib/landing-page-constants'

// 新的导入
import { getProductImagePath, LANDING_CONFIG } from '@/lib/landing-page'
```

主要变化：
- `generateProductImagePath` → `getProductImagePath`
- `generateBusinessLicenseImagePath` → `getBusinessLicensePath`
- `PRODUCT_GROUPS_CONFIG` → `LANDING_CONFIG`
- `IMAGE_PATHS` → `LANDING_CONFIG`
- 移除了复杂的验证函数（不需要）
- 移除了过度的配置选项（保持简单）
