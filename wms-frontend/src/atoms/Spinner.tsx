import React from 'react';

export const Spinner: React.FC<{size?:number; color?:string}> = ({ size=24, color='var(--brand-500)' }) => (
  <div style={{
    width:size, height:size, border:`2px solid var(--border)`,
    borderTopColor:color, borderRadius:'50%', animation:'spin 0.7s linear infinite',
  }} />
);
