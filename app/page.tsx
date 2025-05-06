"use client"

import { useEffect, useRef } from "react"
import { exampleImages } from "@/lib/demo-images"
import { motion, stagger, useAnimate } from "framer-motion"

import Floating, { FloatingElement } from "@/components/Floating"
import VariableFontAndCursor from "@/components/VariableFontAndCursor"

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    // Wait for next frame to ensure elements are mounted
    requestAnimationFrame(() => {
      if (scope.current) {
        animate(
          "img",
          { opacity: [0, 1] },
          { duration: 0.5, delay: stagger(0.15) }
        )
      }
    })
  }, [animate])

  return (
    <div
      className="flex w-dvw h-dvh justify-center items-center bg-black overflow-hidden"
      ref={containerRef}
    >
      <motion.div
        className="z-50 text-center space-y-4 items-center flex flex-col"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, delay: 1.5 }}
      >
        <VariableFontAndCursor
          label="schmitz.photos"
          className="text-5xl md:text-7xl z-50 text-white font-inter"
          containerRef={containerRef}
          fontVariationMapping={{
            y: { name: "wght", min: 100, max: 900 },
            x: { name: "slnt", min: 0, max: -10 },
          }}
        />
      </motion.div>

      <div ref={scope}>
        <Floating sensitivity={1} className="overflow-hidden">
          <FloatingElement depth={0.5} className="top-[10%] left-[15%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[0].url}
              className="w-32 h-32 md:w-48 md:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[15%] left-[30%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[1].url}
              className="w-40 h-40 md:w-56 md:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[5%] left-[50%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[2].url}
              className="w-48 h-64 md:w-72 md:h-96 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[10%] left-[70%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[3].url}
              className="w-40 h-40 md:w-64 md:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>

          <FloatingElement depth={1} className="top-[35%] left-[10%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[4].url}
              className="w-48 h-48 md:w-72 md:h-72 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[50%] left-[65%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[5].url}
              className="w-48 h-48 md:w-72 md:h-96 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>

          <FloatingElement depth={4} className="top-[60%] left-[20%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[6].url}
              className="w-64 md:w-96 h-full object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[65%] left-[45%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[7].url}
              className="w-40 h-40 md:w-64 md:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform"
            />
          </FloatingElement>
        </Floating>
      </div>
    </div>
  )
}

export default Home
