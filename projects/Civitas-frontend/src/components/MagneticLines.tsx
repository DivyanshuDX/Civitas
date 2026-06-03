import { useEffect, useRef, useCallback } from 'react'

const COLS = 45
const ROWS = 8
const LINE_LENGTH = 10
const LINE_WIDTH = 2
const MAGNETIC_RADIUS = 300
const LERP_SPEED = 0.1

interface LineState {
  angle: number
  opacity: number
}

export function MagneticLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const linesRef = useRef<LineState[]>([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const totalLines = COLS * ROWS
    if (linesRef.current.length !== totalLines) {
      linesRef.current = Array.from({ length: totalLines }, () => ({
        angle: 0,
        opacity: 0.7,
      }))
    }

    ctx.clearRect(0, 0, rect.width, rect.height)

    const spacingX = rect.width / (COLS + 1)
    const spacingY = rect.height / (ROWS + 1)
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    for (let row = 1; row <= ROWS; row++) {
      for (let col = 1; col <= COLS; col++) {
        const idx = (row - 1) * COLS + (col - 1)
        const line = linesRef.current[idx]
        const x = col * spacingX
        const y = row * spacingY

        const dx = mx - x
        const dy = my - y
        const dist = Math.sqrt(dx * dx + dy * dy)

        let targetAngle = 0
        let targetOpacity = 0.7

        if (dist < MAGNETIC_RADIUS) {
          const strength = 1 - dist / MAGNETIC_RADIUS
          targetAngle = Math.atan2(dy, dx)
          targetOpacity = 0.7 + strength * 0.3
        }

        let angleDiff = targetAngle - line.angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        line.angle += angleDiff * LERP_SPEED
        line.opacity += (targetOpacity - line.opacity) * LERP_SPEED

        const halfLen = LINE_LENGTH / 2
        const x1 = x - Math.cos(line.angle) * halfLen
        const y1 = y - Math.sin(line.angle) * halfLen
        const x2 = x + Math.cos(line.angle) * halfLen
        const y2 = y + Math.sin(line.angle) * halfLen

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity})`
        ctx.lineWidth = LINE_WIDTH
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

  return (
    <section className="relative z-10 bg-primary overflow-hidden pt-16 pb-12 px-6 md:px-12 lg:px-20 hidden md:block">
      <div className="max-w-6xl mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height: '220px', display: 'block' }}
        />
      </div>
    </section>
  )
}
