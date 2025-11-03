'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { UserFilters, UserRole, UserStatus } from '@/lib/api-user'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: Partial<UserFilters>) => void
  className?: string
}

// 角色选项
const roleOptions = [
  { value: 'all', label: '全部角色' },
  { value: 'admin', label: '管理员' },
  { value: 'enterprise', label: '企业用户' },
  { value: 'user', label: '普通用户' },
]

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '未激活' },
  { value: 'banned', label: '已封禁' },
]

export function UserFiltersComponent({
  filters,
  onFiltersChange,
  className
}: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Helper function to create updated filters with current search input
  const createUpdatedFilters = useCallback((additionalFilters: Partial<UserFilters> = {}) => {
    const updatedFilters: Partial<UserFilters> = {
      ...filters,
      ...additionalFilters,
      offset: 0
    }

    // Only include search if it has a value
    if (searchInput.trim()) {
      updatedFilters.search = searchInput.trim()
    }

    return updatedFilters
  }, [filters, searchInput])

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSearchSubmit = useCallback(() => {
    onFiltersChange(createUpdatedFilters())
  }, [createUpdatedFilters, onFiltersChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }, [handleSearchSubmit])

  const handleRoleChange = useCallback((role: string) => {
    const additionalFilters: Partial<UserFilters> = {}

    // Only include role if it's not 'all'
    if (role !== 'all') {
      additionalFilters.role = role as UserRole
    }

    onFiltersChange(createUpdatedFilters(additionalFilters))
  }, [createUpdatedFilters, onFiltersChange])

  const handleStatusChange = useCallback((status: string) => {
    const additionalFilters: Partial<UserFilters> = {}

    // Only include status if it's not 'all'
    if (status !== 'all') {
      additionalFilters.status = status as UserStatus
    }

    onFiltersChange(createUpdatedFilters(additionalFilters))
  }, [createUpdatedFilters, onFiltersChange])

  const handleReset = useCallback(() => {
    setSearchInput('')
    onFiltersChange({ offset: 0 })
  }, [onFiltersChange])

  // Check if any filters are active (not default values)
  const hasActiveFilters = filters.search || filters.role || filters.status

  return (
    <Card className={cn("bg-white rounded-lg shadow-sm mb-6", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名或邮箱..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={filters.role || 'all'}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className='w-full px-4 py-2 border border-gray-300 rounded-md transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0'>
              <SelectValue placeholder="用户角色" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className='w-full px-4 py-2 border border-gray-300 rounded-md transition-colors duration-300 focus:border-primary focus:outline-none focus:ring-0'>
              <SelectValue placeholder="用户状态" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters - Only show when filters are active */}
          <div className="flex items-center justify-left">
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
      </CardContent>
    </Card>
  )
}