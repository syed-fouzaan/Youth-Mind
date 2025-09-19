"use client";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Phone, AlertTriangle } from "lucide-react";

type CrisisDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CrisisDialog({ open, onOpenChange }: CrisisDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
             <AlertTriangle className="h-8 w-8 text-destructive" />
            <AlertDialogTitle className="text-2xl">It's okay to ask for help</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            It sounds like you're going through a lot right now. Please know that support is available and you don't have to go through this alone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <p className="font-semibold">Please reach out to an emergency helpline:</p>
          <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <p className="font-bold">India Helplines:</p>
              <a href="tel:9152987821" className="block text-primary hover:underline">9152987821</a>
              <a href="tel:18005990019" className="block text-primary hover:underline">1800-599-0019 (KIRAN)</a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            If you are in immediate danger, please call your local emergency services.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>I Understand</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
