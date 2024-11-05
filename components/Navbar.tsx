'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl font-bold">
              <span className="text-blue-800">Fin</span>tool
            </span>
          </Link>
        </div>
        <a
          href="https://fintool.substack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium py-2 px-4 rounded-full hover:opacity-90 transition-opacity"
          >
            ✨ Subscribe
          </Button>
        </a>
      </div>
    </header>
  );
} 