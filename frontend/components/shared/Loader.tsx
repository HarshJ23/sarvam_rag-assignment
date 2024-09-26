"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Loader() {

const [step, setStep] = useState(0)
  const steps = ['Thinking', 'Searching the doc', 'Generating answer']
  const timeIntervals = [5000, 10000, 12000];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStep((prevStep) => (prevStep + 1) % steps.length);
    }, timeIntervals[step]);

    return () => clearTimeout(timeout); 
  }, [step]);

  return (
    <div className="flex items-center">
    
 {/* new loader component */}
    {/* <div className="flex items-center justify-center min-h-screen"> */}
    <div className="flex flex-row">
    <Avatar>
    <AvatarImage src={"./user2.png"} />  
    </Avatar>  
    </div>
      <div className="bg-white p-4 rounded-lg ">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" aria-hidden="true" />
          <div className="relative overflow-hidden w-[180px] h-[24px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center"
              >
                <div 
                  className="text-base font-medium whitespace-nowrap"
                  style={{
                    color: '#c2410c',
                  }}
                >
                  {steps[step]}...
                </div>
              </motion.div>
            </AnimatePresence>
            <div 
              className="absolute top-0 left-0 h-full w-full"
              style={{
                background: 'linear-gradient(90deg, #ffffff 0%, #c2410c 100%)',
                animation: 'moveShade 2s linear infinite',
                mixBlendMode: 'color',
              }}
            />
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {`${steps[step].toLowerCase()}`}
        </span>
      </div>
      <style jsx>{`
        @keyframes moveShade {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  // </div>
  )
}
