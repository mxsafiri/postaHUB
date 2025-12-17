import React from "react";

type VideoBackgroundProps = {
  src: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
};

export function VideoBackground({
  src,
  className,
  overlayClassName,
  children,
}: VideoBackgroundProps) {
  return (
    <div className={className}>
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className={overlayClassName} />
      <div className="relative">{children}</div>
    </div>
  );
}
