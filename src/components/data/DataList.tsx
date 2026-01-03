import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  filterFn: (item: T, query: string) => boolean;
  title: string;
  emptyMessage?: string;
}
export function DataList<T extends {
  id: string;
}>({
  data,
  renderItem,
  onAdd,
  onEdit,
  onDelete,
  filterFn,
  title,
  emptyMessage = 'No items found'
}: DataListProps<T>) {
  const [query, setQuery] = useState('');
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const filteredData = data.filter(item => filterFn(item, query));
  return <div className="space-y-6 pb-24">
      <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-black/95 backdrop-blur-sm py-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
              {filteredData.length}
            </span>
            <Link to="/">
              <Button size="icon" variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? filteredData.map(item => <motion.div key={item.id} layout initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95
        }} className="relative group">
                {/* Swipe Actions Background */}
                <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end px-6 mb-4">
                  <Trash2 className="text-white w-6 h-6" />
                </div>

                {/* Card Content */}
                <motion.div drag="x" dragConstraints={{
            left: -100,
            right: 0
          }} onDragEnd={(e, {
            offset
          }) => {
            if (offset.x < -50) {
              setSwipedItemId(item.id);
            } else {
              setSwipedItemId(null);
            }
          }} style={{
            x: swipedItemId === item.id ? -100 : 0
          }} className="relative bg-white dark:bg-gray-900 rounded-2xl z-10">
                  <div onClick={() => onEdit(item)} className="cursor-pointer">
                    {renderItem(item)}
                  </div>

                  {/* Desktop Actions (visible on hover) */}
                  <div className="absolute top-4 right-4 hidden md:flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" onClick={e => {
                e.stopPropagation();
                onEdit(item);
              }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="danger" onClick={e => {
                e.stopPropagation();
                onDelete(item);
              }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Mobile Swipe Action Button (revealed on drag) */}
                  <div className="absolute top-0 right-[-100px] w-[100px] h-full flex items-center justify-center">
                    <button onClick={() => onDelete(item)} className="w-full h-full flex items-center justify-center text-white">
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>) : <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {emptyMessage}
              </p>
              {query && <Button variant="ghost" onClick={() => setQuery('')} className="mt-2 text-blue-500">
                  Clear search
                </Button>}
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.div className="fixed bottom-6 right-6 z-30" initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} whileHover={{
      scale: 1.1
    }} whileTap={{
      scale: 0.9
    }}>
        <Button onClick={onAdd} className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-0 flex items-center justify-center">
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>
    </div>;
}