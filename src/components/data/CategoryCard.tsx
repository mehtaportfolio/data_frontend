import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ChevronRight } from 'lucide-react';
interface CategoryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  to: string;
  color: string;
}
export function CategoryCard({
  title,
  count,
  icon,
  to,
  color
}: CategoryCardProps) {
  return <Link to={to} className="block group">
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${color}`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-gray-900 dark:text-white`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {count} {count === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
      </Card>
    </Link>;
}