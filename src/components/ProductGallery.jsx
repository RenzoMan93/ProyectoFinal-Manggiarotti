"use client";

import { useRef, useState } from "react";

export default function ProductGallery({ photos, alt }) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const trackRef = useRef(null);

  const total = photos.length;

  const goTo = (i) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
    setDragOffset(0);
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    setIsDragging(true);
    startX.current = e.clientX;
    trackRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setDragOffset(e.clientX - startX.current);
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const THRESHOLD = 45;
    if (Math.abs(dragOffset) > THRESHOLD) {
      goTo(dragOffset < 0 ? index + 1 : index - 1);
    } else if (Math.abs(dragOffset) < 8) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      goTo(tapX > rect.width / 2 ? index + 1 : index - 1);
    } else {
      goTo(index);
    }
  };

  if (total <= 1) {
    return (
      <div className="relative mb-5 aspect-square overflow-hidden rounded-2xl bg-cream">
        {photos[0] && <img src={photos[0]} alt={alt} className="h-full w-full object-cover" />}
      </div>
    );
  }

  return (
    <div
      className="relative mb-5 aspect-square touch-pan-y overflow-hidden rounded-2xl bg-cream"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragging.current = false;
        setIsDragging(false);
        goTo(index);
      }}
    >
      <div
        ref={trackRef}
        className="flex h-full cursor-grab"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform .32s cubic-bezier(.22,.8,.36,1)",
        }}
      >
        {photos.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full flex-none select-none object-cover"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {photos.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full bg-white/60 transition-all ${i === index ? "w-4 bg-white" : "w-1.5"}`}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/55 px-2.5 py-1 text-[10.5px] font-semibold text-white">
        {index + 1}/{total}
      </div>
    </div>
  );
}
