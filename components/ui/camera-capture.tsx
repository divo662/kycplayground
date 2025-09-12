'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CameraCaptureProps {
  mode?: 'photo' | 'video'
  maxDurationMs?: number
  onCapture: (blob: Blob) => void
  disabled?: boolean
  className?: string
  enableLivenessPrompts?: boolean
  prompts?: string[]
  promptIntervalMs?: number
  autoStart?: boolean
  facingMode?: 'user' | 'environment'
}

export default function CameraCapture({
  mode = 'photo',
  maxDurationMs = 5000,
  onCapture,
  disabled = false,
  className = '',
  enableLivenessPrompts = false,
  prompts = ['Look straight', 'Turn head left', 'Turn head right', 'Blink', 'Smile'],
  promptIntervalMs = 1200,
  autoStart = false,
  facingMode = 'user'
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const promptTimerRef = useRef<number | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!autoStart || started) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: mode === 'video' })
        if (cancelled) return
        mediaStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStarted(true)
      } catch (e: any) {
        setError(e?.message || 'Camera access denied')
      }
    }
    init()
    return () => {
      cancelled = true
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [mode, autoStart, started, facingMode])

  const startCamera = async () => {
    try {
      setError(null)
      const supports = (navigator.mediaDevices as any).getSupportedConstraints?.() || {}
      const videoConstraints: MediaTrackConstraints = {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        ...(supports.aspectRatio ? { aspectRatio: 16/9 } : {}),
        ...(supports.frameRate ? { frameRate: { ideal: 30 } } : {}),
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: mode === 'video' 
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video loads and plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error)
        }
        // iOS Safari sometimes needs a nudge after setting srcObject
        await videoRef.current.play().catch(() => {})
      }
      setStarted(true)
    } catch (e: any) {
      console.error('Camera error:', e)
      setError(e?.message || 'Camera access denied')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => blob && onCapture(blob), 'image/jpeg', 0.9)
  }

  const startRecording = () => {
    if (!mediaStreamRef.current) return
    const chunks: BlobPart[] = []
    const rec = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm' })
    mediaRecorderRef.current = rec
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data)
    }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      onCapture(blob)
      setRecording(false)
    }
    rec.start()
    setRecording(true)

    // Liveness prompts
    if (enableLivenessPrompts && prompts.length > 0) {
      setPromptIndex(0)
      if (promptTimerRef.current) window.clearInterval(promptTimerRef.current)
      promptTimerRef.current = window.setInterval(() => {
        setPromptIndex((i) => (i + 1) % prompts.length)
      }, promptIntervalMs) as unknown as number
    }

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (promptTimerRef.current) {
        window.clearInterval(promptTimerRef.current)
        promptTimerRef.current = null
      }
    }, maxDurationMs)
  }

     return (
     <div className={`rounded-xl border bg-white p-3 sm:p-4 ${className}`}>
       <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
         <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
         {mode === 'video' && enableLivenessPrompts && recording && (
           <div aria-live="polite" className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm animate-fadeIn">
             {prompts[promptIndex]}
           </div>
         )}
       </div>
       {error && <p className="text-xs sm:text-sm text-red-600 mt-2">{error}</p>}
       {!started && (
         <div className="mt-3">
           <p className="text-xs sm:text-sm text-gray-600 mb-2">We need camera access to continue. On mobile, allow camera permission and keep your face centered.</p>
           <button onClick={startCamera} disabled={disabled} className="w-full px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base">Enable Camera</button>
         </div>
       )}
       {started && (
         <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
           {mode === 'photo' ? (
             <button disabled={disabled} onClick={capturePhoto} className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base">Capture Photo</button>
           ) : (
             <button disabled={disabled || recording} onClick={startRecording} className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base">{recording ? 'Recording…' : 'Start Recording'}</button>
           )}
         </div>
       )}
     </div>
   )
}


