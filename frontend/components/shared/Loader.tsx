import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"


export default function Loader() {
  return (
    <div className="flex items-center">
    <div className="space-y-2 ">
      <div className="flex flex-row">
    <Skeleton className="h-12 w-12 rounded-full  bg-slate-200" />

<div className="flex flex-col gap-4 mx-2">
<Skeleton className="h-4 w-[250px]   bg-slate-200" />

      <Skeleton className="h-4 w-[200px]  bg-slate-200" />
</div>
      </div>
      
      <div className="flex flex-row gap-28 mx-4">

      <div className="flex flex-col ">
      <Skeleton className="h-28 w-[150px] mt-6 bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      </div>

      <div className="flex flex-col ">
      <Skeleton className="h-28 w-[150px] mt-6 bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      </div>

      <div className="flex flex-col ">
      <Skeleton className="h-28 w-[150px] mt-6 bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      <Skeleton className="h-6 mt-3 w-[150px] bg-slate-200"/>
      </div>
    
      </div>


    </div>
    <div>

    </div>
  </div>
  )
}
