"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Category {
  id: string
  name: string
  count: number
}

interface CategoryTabsProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
      <TabsList className="w-full justify-start overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
            {category.name} ({category.count})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
} 