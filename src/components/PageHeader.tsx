import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className="border-b border-[#EAE4D7] pb-5 mb-7">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {badge && (
            <span className="text-xs font-serif italic text-[#475344] block mb-1">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#232521] tracking-tight font-medium">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-[#363932]/80 font-serif italic mt-1.5 max-w-2xl text-balance leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
