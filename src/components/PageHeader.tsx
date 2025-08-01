import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  gradient?: 'gallery' | 'palette' | 'marketplace' | 'statistics' | 'settings';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  className = '',
  gradient
}) => {
  const gradientClass = gradient ? `${gradient}-header` : '';
  
  return (
    <header className={`page-header ${gradientClass} ${className}`}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};
