import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({
  size = 40,
  className = '',
  showText = false,
  textClassName = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 overflow-hidden rounded-xl shadow-md transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/favicon.svg"
          alt="شعار منصة رتّل"
          width={size}
          height={size}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`text-xl font-bold text-on-surface tracking-wide leading-none group-hover:text-primary transition-colors ${textClassName}`}
          >
            رَتِّلْ
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5">
            الصوت هو البطل
          </span>
        </div>
      )}
    </div>
  );
}
