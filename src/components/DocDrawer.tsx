
import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocDrawerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  iconSize?: number;
  buttonText?: string;
}

export const DocDrawer = ({
  title,
  description,
  children,
  className,
  triggerClassName,
  iconSize = 16,
  buttonText = "Documentation",
}: DocDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2", triggerClassName)}
        >
          <BookOpen size={iconSize} />
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        <ScrollArea className="max-h-[80vh] px-4">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="p-4 pb-0">
            {children}
          </div>
        </ScrollArea>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DocDrawer;
