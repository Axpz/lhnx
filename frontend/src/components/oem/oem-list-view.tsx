'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
} from 'lucide-react'
import { OEMFilters } from '@/lib/types'
import { OEMFiltersComponent } from '@/components/oem/oem-filters'
import { useOEMList } from '@/hooks/useOEM'
import { getStatusBadge } from '@/lib/badge-utils'
import { ViewOEMDialog } from '@/components/oem/view-oem-dialog'
import { EditOEMDialog } from '@/components/oem/edit-oem-dialog'

// 操作菜单项配置
interface ActionMenuItem {
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  className?: string
  onClick?: () => void
  disabled?: boolean
}

interface OEMListViewProps {
  filters: OEMFilters
  onFiltersChange: (filters: Partial<OEMFilters>) => void
  actionMenuItems: (request: any) => ActionMenuItem[]
  cardTitle?: string
  showDateFilters?: boolean
}

export function OEMListView({
  filters,
  onFiltersChange,
  actionMenuItems,
  cardTitle = 'OEM需求列表',
  showDateFilters = false,
}: OEMListViewProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [editRequest, setEditRequest] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: oemData, isLoading, error, refetch } = useOEMList(filters)

  // 从 API 获取的 OEM 数据
  const oemRequests = oemData?.data || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 处理操作菜单点击
  const handleActionClick = (action: ActionMenuItem, request: any) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.label === '查看详情') {
      setSelectedRequest(request)
    } else if (action.label === '编辑需求') {
      setEditRequest(request)
      setIsEditDialogOpen(true)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <OEMFiltersComponent
              filters={filters}
              onFiltersChange={onFiltersChange}
              showDateFilters={showDateFilters}
            />
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              正在加载需求数据...
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="text-center py-8 text-red-500">
              加载失败：{error.message}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => refetch()}
              >
                重试
              </Button>
            </div>
          )}

          {/* OEM 需求表格 */}
          {!isLoading && !error && (
            <>
              {oemRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {filters.search || filters.status || filters.user_type ? '没有找到匹配的需求' : '暂无OEM需求'}
                  </h3>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-muted-foreground font-medium">
                        产品需求
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        需求方
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        联系信息
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        采购数量
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        状态
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        提交时间
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        更新时间
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oemRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-muted/30 border-b border-border/50"
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {request.product_type}
                          </div>
                          {request.special_needs && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {request.special_needs}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getStatusBadge(request.user_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {request.contact_person}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.contact_info}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {request.quantity?.toLocaleString()} 片
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(request.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(request.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {actionMenuItems(request).map((item, index) => {
                              const Icon = item.icon
                              return (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 px-2 ${item.className || ''}`}
                                  disabled={item.disabled}
                                  onClick={() => handleActionClick(item, request)}
                                  title={item.label}
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              )
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View OEM Dialog */}
      <ViewOEMDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />

      {/* Edit OEM Dialog */}
      <EditOEMDialog
        request={editRequest}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          refetch()
          setEditRequest(null)
        }}
      />
    </>
  )
}