import { BrainCircuit } from 'lucide-react';
import React from 'react';

export default function YouthMindLogo() {
  return (
    <div className="flex items-center gap-2" title="YouthMind">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
        YouthMind
      </h1>
    </div>
  );
}
