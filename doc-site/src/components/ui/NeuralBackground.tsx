'use client'

import { useEffect, useRef } from 'react'

interface Node {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    phase: number
    glowSpeed: number
}

interface Pulse {
    x: number
    y: number
    targetX: number
    targetY: number
    progress: number
    speed: number
    color: string
}

export function NeuralBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let nodes: Node[] = []
        let pulses: Pulse[] = []
        let animationFrameId: number
        let width = 0
        let height = 0

        const colors = [
            'rgba(147, 51, 234, 1)', // Purple
            'rgba(59, 130, 246, 1)', // Blue
            'rgba(236, 72, 153, 1)', // Pink
            'rgba(245, 158, 11, 1)', // Amber/Orange
        ]

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
            initNodes()
        }

        const initNodes = () => {
            nodes = []
            const nodeCount = Math.floor((width * height) / 15000) // Density based on area

            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 1,
                    phase: Math.random() * Math.PI * 2,
                    glowSpeed: 0.02 + Math.random() * 0.03
                })
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height)

            // Update and draw nodes
            nodes.forEach(node => {
                node.x += node.vx
                node.y += node.vy
                node.phase += node.glowSpeed

                // Bounce off walls
                if (node.x < 0 || node.x > width) node.vx *= -1
                if (node.y < 0 || node.y > height) node.vy *= -1

                // Calculate pulse
                const glowIntensity = (Math.sin(node.phase) + 1) / 2 // 0 to 1
                const baseOpacity = 0.3
                const dynamicOpacity = baseOpacity + glowIntensity * 0.5 // 0.3 to 0.8

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${dynamicOpacity})`
                ctx.shadowBlur = 5 + glowIntensity * 10 // Dynamic glow 5-15px
                ctx.shadowColor = `rgba(255, 255, 255, ${dynamicOpacity})`
                ctx.fill()
                ctx.shadowBlur = 0 // Reset for other elements
            })

            // Draw connections
            nodes.forEach((nodeA, i) => {
                nodes.slice(i + 1).forEach(nodeB => {
                    const dx = nodeA.x - nodeB.x
                    const dy = nodeA.y - nodeB.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const maxDistance = 150

                    if (distance < maxDistance) {
                        ctx.beginPath()
                        ctx.moveTo(nodeA.x, nodeA.y)
                        ctx.lineTo(nodeB.x, nodeB.y)

                        // Dynamic line opacity based on distance and average node glow
                        const glowFactor = ((Math.sin(nodeA.phase) + 1) + (Math.sin(nodeB.phase) + 1)) / 4 // 0 to 1
                        const opacity = (1 - distance / maxDistance) * (0.15 + glowFactor * 0.3)

                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
                        ctx.stroke()

                        // Randomly spawn a pulse
                        if (Math.random() < 0.0005) {
                            pulses.push({
                                x: nodeA.x,
                                y: nodeA.y,
                                targetX: nodeB.x,
                                targetY: nodeB.y,
                                progress: 0,
                                speed: 0.02 + Math.random() * 0.03,
                                color: colors[Math.floor(Math.random() * colors.length)]
                            })
                        }
                    }
                })
            })

            // Update and draw pulses
            pulses = pulses.filter(pulse => {
                pulse.progress += pulse.speed

                const currentX = pulse.x + (pulse.targetX - pulse.x) * pulse.progress
                const currentY = pulse.y + (pulse.targetY - pulse.y) * pulse.progress

                ctx.beginPath()
                ctx.arc(currentX, currentY, 3, 0, Math.PI * 2)
                ctx.fillStyle = pulse.color

                // Intensify glow
                ctx.shadowBlur = 15
                ctx.shadowColor = pulse.color
                ctx.fill()
                ctx.shadowBlur = 0

                return pulse.progress < 1
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        resize()
        window.addEventListener('resize', resize)
        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    )
}
