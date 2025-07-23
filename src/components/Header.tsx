import React from 'react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={className}>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">Header</h1>
      </div>
    </header>
  );
}