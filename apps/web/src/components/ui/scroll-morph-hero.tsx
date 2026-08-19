"use client";
import { API_BASE_URL } from '../../config';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import axios from 'axios';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({
    src,
    index,
    target,
}: FlipCardProps) {
    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`hero-${index}`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                </div>

                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-stone-900 flex flex-col items-center justify-center p-4 border border-stone-700"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center">
                        <p className="text-[8px] font-bold text-orange-200 uppercase tracking-widest mb-1">View</p>
                        <p className="text-xs font-medium text-white">Details</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Constants ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 1000; 

const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
    "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
    "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
    "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
    "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80",
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function ScrollMorphHero() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<string[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/settings/hero-images`);
                if (res.data.data && Array.isArray(res.data.data)) {
                    const merged = DEFAULT_IMAGES.map((defImg, idx) => {
                        const fetched = res.data.data[idx];
                        return (fetched && fetched.trim()) ? fetched : defImg;
                    });
                    setImages(merged);
                } else {
                    setImages(DEFAULT_IMAGES);
                }
            } catch (error) {
                console.error('Failed to fetch hero images', error);
                setImages(DEFAULT_IMAGES);
            } finally {
                setImagesLoaded(true);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };
        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });
        return () => observer.disconnect();
    }, []);

    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0); 

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if ((scrollRef.current === 0 && e.deltaY < 0) || (scrollRef.current === MAX_SCROLL && e.deltaY > 0)) {
                return; // Let the browser scroll normally
            }
            e.preventDefault();
            const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            
            if ((scrollRef.current === 0 && deltaY < 0) || (scrollRef.current === MAX_SCROLL && deltaY > 0)) {
                return; // Let the browser scroll normally
            }
            
            e.preventDefault();
            touchStartY = touchY;

            const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
        };
    }, [virtualScroll]);

    const morphProgress = useTransform(virtualScroll, [0, 300], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 100, damping: 25 });

    const scrollRotate = useTransform(virtualScroll, [300, 1000], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 100, damping: 25 });

    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    useEffect(() => {
        if (!imagesLoaded) return;
        
        setIntroPhase("scatter");
        const timer1 = setTimeout(() => setIntroPhase("line"), 300);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 1200);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, [imagesLoaded]);

    const activeImages = useMemo(() => {
        const uploaded = images.filter(img => img && img.trim() !== "" && !img.includes("unsplash.com"));
        if (uploaded.length === 0) return images;
        
        const repeated: string[] = [];
        for (let i = 0; i < 20; i++) {
            repeated.push(uploaded[i % uploaded.length]);
        }
        return repeated;
    }, [images]);

    const numImages = activeImages.length;

    const [scatterPositions, setScatterPositions] = useState<any[]>([]);

    useEffect(() => {
        const isMobile = containerSize.width > 0 && containerSize.width < 768;
        const spreadX = isMobile ? containerSize.width * 0.8 : 1200;
        const spreadY = isMobile ? containerSize.height * 0.6 : 800;

        setScatterPositions(activeImages.map(() => ({
            x: (Math.random() - 0.5) * spreadX,
            y: (Math.random() - 0.5) * spreadY,
            rotation: (Math.random() - 0.5) * 180,
            scale: isMobile ? 0.4 : 0.6,
            opacity: 0,
        })));
    }, [activeImages, containerSize]);

    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

    const isMobileView = containerSize.width > 0 && containerSize.width < 768;

    return (
        <div ref={containerRef} className="relative w-full h-[520px] sm:h-[650px] md:h-[800px] bg-[#FDFBF7] overflow-hidden -mt-14 sm:-mt-20">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-orange-100 rounded-full blur-[120px] opacity-60 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-stone-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
            </div>

            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000 relative z-10 overflow-hidden">
                
                {/* Intro Text (Fades out) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 w-full px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="flex flex-col items-center max-w-full"
                    >
                        <span className="px-3 py-1 rounded-full border border-stone-200 text-[9px] sm:text-xs font-bold tracking-widest uppercase mb-2 sm:mb-4 inline-block bg-white/80 backdrop-blur-md text-stone-800 shadow-xs">
                          Preserve the moment
                        </span>
                        <h1 className="text-xs sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-4 w-full max-w-[195px] sm:max-w-md lg:max-w-lg mx-auto leading-tight sm:leading-[1.1] text-stone-900">
                          Artfully crafted frames for your <span className="italic text-stone-500 font-serif">finest</span> memories.
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.5 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-2 sm:mt-6 text-[9px] sm:text-xs font-bold tracking-[0.2em] text-stone-500"
                    >
                        SCROLL TO EXPLORE
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[28%] sm:top-[22%] md:top-[20%] z-20 flex flex-col items-center justify-center text-center px-4 w-full pointer-events-none"
                >
                    <p className="text-xs sm:text-lg md:text-xl text-stone-700 font-medium sm:font-light mb-4 sm:mb-10 max-w-[280px] sm:max-w-2xl mx-auto leading-relaxed px-2">
                        Elevate your space with premium, museum-quality frames customized to perfectly showcase the moments that matter most.
                    </p>
                    <div className="flex items-center justify-center pointer-events-auto">
                        <Link href="/shop" className="group flex items-center gap-2 bg-stone-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
                            Shop Collection
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* Main Container for 3D Morph Images */}
                <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                    {activeImages.map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        const isMobile = containerSize.width > 0 && containerSize.width < 768;

                        if (introPhase === "scatter") {
                            target = scatterPositions[i] || { x: 0, y: 0, rotation: 0, scale: isMobile ? 0.35 : 0.6, opacity: 0 };
                        } else if (introPhase === "line") {
                            const lineSpacing = isMobile ? Math.max(12, Math.min(22, (containerSize.width || 360) / (numImages + 1))) : 70; 
                            const lineTotalWidth = numImages * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: isMobile ? 0.4 : 1, opacity: imagesLoaded ? 1 : 0 };
                        } else {
                            const minDimension = Math.min(containerSize.width, containerSize.height);
                            const circleRadius = isMobile ? Math.min(containerSize.width * 0.44, 160) : Math.min(minDimension * 0.42, 420);
                            const circleAngle = (i / numImages) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.2 : 1.1);

                            const arcApexY = containerSize.height * (isMobile ? 0.38 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;

                            const spreadAngle = isMobile ? 85 : 130;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / Math.max(1, numImages - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                            const maxRotation = spreadAngle * 0.8; 
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 0.65 : 1.8, 
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(isMobile ? 0.42 : 1, arcPos.scale, morphValue),
                                opacity: imagesLoaded ? 1 : 0,
                            };
                        }

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={numImages}
                                phase={introPhase}
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
