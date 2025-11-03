'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProvinces, getCitiesByProvinceName, Region } from '@/lib/china-regions'

interface RegionSelectProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RegionSelect({ value, onChange, placeholder = "选择地区", disabled }: RegionSelectProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')

  const provinces = getProvinces()
  const cities = selectedProvince ? getCitiesByProvinceName(selectedProvince) : []

  // 解析当前值
  const parseValue = (val: string) => {
    if (!val) return { province: '', city: '' }

    // 尝试匹配 "省份 城市" 格式
    const parts = val.split(' ')
    if (parts.length >= 2) {
      const province = parts[0]
      const city = parts.slice(1).join(' ')
      return { province, city }
    }

    // 如果只有一个部分，检查是否是省份
    const province = provinces.find(p => p.name === val)
    if (province) {
      return { province: val, city: '' }
    }

    return { province: '', city: '' }
  }

  // 初始化选中状态
  useEffect(() => {
    if (value) {
      const { province, city } = parseValue(value)
      setSelectedProvince(province || '')
      setSelectedCity(city || '')
    }
  }, [value])

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province)
    setSelectedCity('')

    // 如果是直辖市，直接设置值
    const provinceData = provinces.find(p => p.name === province)
    if (provinceData?.children?.length === 1 && provinceData.children[0]?.name === province) {
      onChange?.(province)
    } else {
      onChange?.(province)
    }
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    const fullValue = selectedProvince === city ? city : `${selectedProvince} ${city}`
    onChange?.(fullValue)
  }

  return (
    <div className="flex gap-2">
      <Select
        value={selectedProvince}
        onValueChange={handleProvinceChange}
        disabled={disabled || false}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="选择省份" />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((province) => (
            <SelectItem key={province.code} value={province.name}>
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProvince && cities.length > 1 && (
        <Select
          value={selectedCity}
          onValueChange={handleCityChange}
          disabled={disabled || false}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="选择城市" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.code} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}