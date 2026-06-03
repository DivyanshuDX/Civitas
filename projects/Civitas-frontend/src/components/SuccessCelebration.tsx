import React, { useEffect, useState, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  speed: number
  size: number
  color: string
  rotation: number
  rotSpeed: number
  shape: 'circle' | 'square' | 'strip'
  opacity: number
  drift: number
}

interface SuccessCelebrationProps {
  show: boolean
  title: string
  subtitle?: string
  variant?: 'celebrate' | 'success' | 'rejected'
  onComplete?: () => void
}

const COLORS = [
  '#6366f1', '#818cf8', '#a5b4fc', // indigo
  '#3b82f6', '#60a5fa', '#93c5fd', // blue
  '#22c55e', '#4ade80',            // green
  '#f59e0b', '#fbbf24',            // amber
  '#ec4899', '#f472b6',            // pink
  '#8b5cf6', '#a78bfa',            // violet
]

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ show, title, subtitle, variant = 'celebrate', onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(false)
  const [checkDone, setCheckDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = 3 + Math.random() * 8
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 10,
        y: 45 + (Math.random() - 0.5) * 10,
        angle,
        speed,
        size: 4 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        shape: (['circle', 'square', 'strip'] as const)[Math.floor(Math.random() * 3)],
        opacity: 1,
        drift: (Math.random() - 0.5) * 2,
      })
    }
    return newParticles
  }, [])

  useEffect(() => {
    if (!show) return

    setVisible(true)
    setCheckDone(false)
    setFadeOut(false)
    if (variant === 'celebrate') {
      const burst = createParticles()
      setParticles(burst)
    } else {
      setParticles([])
    }

    // Animate checkmark after slight delay
    const checkTimer = setTimeout(() => setCheckDone(true), 300)

    // Start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 2800)

    // Cleanup
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setParticles([])
      onComplete?.()
    }, 3300)

    return () => {
      clearTimeout(checkTimer)
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [show, createParticles, onComplete])

  // Animate particles with physics
  useEffect(() => {
    if (particles.length === 0) return

    let frame: number
    let elapsed = 0
    const animate = () => {
      elapsed += 16
      setParticles(prev =>
        prev.map(p => {
          const gravity = 0.15
          const t = elapsed / 1000
          const vx = Math.cos(p.angle) * p.speed * Math.pow(0.97, elapsed / 16) + p.drift
          const vy = Math.sin(p.angle) * p.speed * Math.pow(0.97, elapsed / 16) + gravity * elapsed / 16
          return {
            ...p,
            x: p.x + vx * 0.3,
            y: p.y + vy * 0.3,
            rotation: p.rotation + p.rotSpeed,
            opacity: Math.max(0, 1 - t * 0.5),
          }
        })
      )
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [particles.length > 0])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop — no dimming, just captures pointer events */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
              transition: 'none',
            }}
          >
            {p.shape === 'circle' ? (
              <div
                className="rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                }}
              />
            ) : p.shape === 'square' ? (
              <div
                className="rounded-sm"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                }}
              />
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: p.size * 0.4,
                  height: p.size * 2,
                  background: p.color,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Center card */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-8 py-10 rounded-3xl bg-base-100 border border-base-content/[0.08] shadow-2xl max-w-xs mx-4 transition-all duration-500 ${
          fadeOut ? 'scale-95' : 'scale-100'
        }`}
        style={{ animation: 'celebration-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setFadeOut(true)
            setTimeout(() => {
              setVisible(false)
              setParticles([])
              onComplete?.()
            }, 300)
          }}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-base-content/40 hover:text-base-content/70 hover:bg-base-content/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* Animated checkmark */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{
            background: variant === 'rejected'
              ? 'linear-gradient(135deg, oklch(var(--er)), oklch(var(--er) / 0.7))'
              : 'linear-gradient(135deg, oklch(var(--p)), oklch(var(--p) / 0.7))',
            animation: 'celebration-ring-pulse 1.5s ease-out both',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {variant === 'rejected' ? (
              <>
                <line
                  x1="18" y1="6" x2="6" y2="18"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: checkDone ? 0 : 20,
                    transition: 'stroke-dashoffset 0.4s cubic-bezier(0.65, 0, 0.35, 1) 0.2s',
                  }}
                />
                <line
                  x1="6" y1="6" x2="18" y2="18"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: checkDone ? 0 : 20,
                    transition: 'stroke-dashoffset 0.4s cubic-bezier(0.65, 0, 0.35, 1) 0.35s',
                  }}
                />
              </>
            ) : (
              <polyline
                points="20 6 9 17 4 12"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: checkDone ? 0 : 30,
                  transition: 'stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.2s',
                }}
              />
            )}
          </svg>
        </div>

        {/* Glow ring */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: variant === 'rejected'
              ? 'radial-gradient(circle, oklch(var(--er) / 0.2), transparent 70%)'
              : 'radial-gradient(circle, oklch(var(--p) / 0.2), transparent 70%)',
            animation: 'celebration-glow 1.5s ease-out both',
          }}
        />

        <h3
          className="text-lg font-bold text-base-content mb-1"
          style={{ animation: 'celebration-text-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-sm text-base-content/50 leading-relaxed"
            style={{ animation: 'celebration-text-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default SuccessCelebration
