import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings2 } from 'lucide-react';
import Tryon from "./Tryon";

interface Product {
  image: string;
  link: string;
  price: number;
  title: string;
  rating: string;
  pid: string;
}

interface ToolCategory {
  toolcat: string;
  products: Product[];
}

const Tool: React.FC<ToolCategory> = ({ toolcat, products }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl" size="icon"><Settings2 size={20} strokeWidth={2} color="#3b82f6" /></Button>
      </SheetTrigger>
      <SheetContent className="w-[1000px]">
        <SheetHeader>
          <SheetTitle><p className='font-extrabold  text-xl hover:cursor-pointer drop-shadow-xl '><span className='text-yellow-400 italic'>Mr.</span><span className="text-primary italic">Sam</span> <span className="font-bold text-lg">Tools</span></p></SheetTitle>
          <SheetDescription>
            {toolcat}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4 h-full">
          <Tryon products={products} />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Okay</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Tool;
