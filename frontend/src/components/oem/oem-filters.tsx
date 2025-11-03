'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { OEMFilters } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Search, X, Calendar } from 'lucide-react'

interface OEMFiltersProps {
  filters: OEMFilters
  onFiltersChange: (filters: OEMFilters) => void
  className?: string
  showDateFilters?: boolean
}

// OEM 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'rejected', label: '已拒绝' },
]

// 用户类型选项
const userTypeOptions = [
  { value: 'all', label: '全部类型' },
  { value: '品牌方', label: '品牌方' },
  { value: '渠道商', label: '渠道商' },
  { value: '电商', label: '电商' },
  { value: '创业者', label: '创业者' },
]

export function OEMFiltersComponent({
  filters,
  onFiltersChange,
  className,
  showDateFilters = false
}: OEMFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchInput, offset: 0 })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()  
    }
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      search: searchInput, // 保持搜索输入的内容
      status: status === 'all' ? undefined : status,
      offset: 0
    })
  }

  const handleUserTypeChange = (userType: string) => {
    onFiltersChange({
      ...filters,
      search: searchInput, // 保持搜索输入的内容
      user_type: userType === 'all' ? undefined : userType,
      offset: 0
    })
  }

  const handleStartDateChange = (startDate: string) => {
    onFiltersChange({
      ...filters,
      start_date: startDate || undefined,
      offset: 0
    })
  }

  const handleEndDateChange = (endDate: string) => {
    onFiltersChange({
      ...filters,
      end_date: endDate || undefined,
      offset: 0
    })
  }

  const handleReset = () => {
    setSearchInput('')
    onFiltersChange({
      search: undefined,
      status: undefined,
      user_type: undefined,
      start_date: undefined,
      end_date: undefined,
      offset: 0
    })
  }

  // Check if any filters are active (not default values)
  const hasActiveFilters = filters.search || filters.status || filters.user_type || filters.start_date || filters.end_date

  return (
    <Card className={cn("bg-white rounded-lg shadow-sm mb-6", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* First Row: Search and Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索产品类型、联系人..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className='w-full px-4 py-2 border border-gray-300 rounded-md transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0'>
                <SelectValue placeholder="处理状态" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* User Type Filter */}
            <Select
              value={filters.user_type || 'all'}
              onValueChange={handleUserTypeChange}
            >
              <SelectTrigger className='w-full px-4 py-2 border border-gray-300 rounded-md transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0'>
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <span
                  onClick={handleReset}
                  className="flex items-center text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  清除
                </span>
              )}
            </div>
          </div>

          {/* Second Row: Date Filters (Optional) */}
          {showDateFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">时间范围：</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">开始日期</label>
                <Input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">结束日期</label>
                <Input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">当前筛选：</span>

              {filters.search && (
                <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                  <span>搜索: {filters.search}</span>
                  <button
                    onClick={() => {
                      setSearchInput('')
                      onFiltersChange({ ...filters, search: undefined, offset: 0 })
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.status && (
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                  <span>状态: {statusOptions.find(o => o.value === filters.status)?.label}</span>
                  <button
                    onClick={() => onFiltersChange({ ...filters, status: undefined, offset: 0 })}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.user_type && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                  <span>类型: {filters.user_type}</span>
                  <button
                    onClick={() => onFiltersChange({ ...filters, user_type: undefined, offset: 0 })}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {(filters.start_date || filters.end_date) && (
                <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                  <span>
                    时间: {filters.start_date || '开始'} ~ {filters.end_date || '结束'}
                  </span>
                  <button
                    onClick={() => onFiltersChange({
                      ...filters,
                      start_date: undefined,
                      end_date: undefined,
                      offset: 0
                    })}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}