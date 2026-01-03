import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface CardProps extends HTMLMotionProps<'div'> {
  noPadding?: boolean;
}
export function Card({
  children,
  className = '',
  noPadding = false,
  ...props
}: CardProps) {
  return <motion.div className={`
        bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
        shadow-sm dark:shadow-none overflow-hidden
        ${noPadding ? '' : 'p-5'}
        ${className}
      `} {...props}>
      {children}
    </motion.div>;
}