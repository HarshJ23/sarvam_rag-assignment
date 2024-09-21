import React from 'react'
import { Shirt } from 'lucide-react';
import { CookingPot } from 'lucide-react';
import { Paintbrush } from 'lucide-react';
import { Heater } from 'lucide-react';
import Image from 'next/image';


export default function HomeStarter() {
  return (
    <div className='min-h-screen flex flex-col items-center'>
      <Image src="/sarvam.png" height={200} width={400} alt='sarvam'/>
      <p className='mt-2 font-semibold'>Assistant for NCERT textbook</p>

      <div className='flex flex-row gap-6 mt-10'>
        <div className='border-[1.2px] border-orange-700 text-gray-500 h-20 w-40 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-orange-100 hover:text-orange-500 transition-colors p-4 flex items-center justify-center'>
        {/* <Shirt size={15} color='#3e9392'/> */}
          <span className='text-sm font-medium text-center '>How bats use sound?</span>
        </div>
        <div className='border-[1.2px] border-orange-700 text-gray-500 h-20 w-40 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-orange-100 hover:text-orange-500 transition-colors p-4 flex items-center justify-center'>
        {/* <Shirt size={15} color='#3e9392'/> */}
          <span className='text-sm font-medium text-center '>list of speed of sound in solids?</span>
        </div>
        <div className='border-[1.2px] border-orange-700 text-gray-500 h-20 w-40 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-orange-100 hover:text-orange-500 transition-colors p-4 flex items-center justify-center'>
        {/* <Shirt size={15} color='#3e9392'/> */}
          <span className='text-sm font-medium text-center '>Describe and answer question 10 in exercise.</span>
        </div>
        <div className='border-[1.2px] border-orange-700 text-gray-500 h-20 w-40 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-orange-100 hover:text-orange-500 transition-colors p-4 flex items-center justify-center'>
        {/* <Shirt size={15} color='#3e9392'/> */}
          <span className='text-sm font-medium text-center'>please explain me 11.1 activity in detail</span>
        </div>
      </div>
    </div>
  )
}