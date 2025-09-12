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

  // Cleanup function
  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      mediaStreamRef.current = null
    }
    if (promptTimerRef.current) {
      window.clearInterval(promptTimerRef.current)
      promptTimerRef.current = null
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!autoStart || started) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode, 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          }, 
          audio: mode === 'video' 
        })
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        mediaStreamRef.current = stream
        if (videoRef.current) {
          await setupVideo(stream)
        }
        setStarted(true)
      } catch (e: any) {
        console.error('Auto-start camera error:', e)
        setError(e?.message || 'Camera access denied')
      }
    }
    init()
    return () => {
      cancelled = true
      cleanup()
    }
  }, [mode, autoStart, started, facingMode])

  const setupVideo = async (stream: MediaStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current
      if (!video) {
        reject(new Error('Video element not found'))
        return
      }

      // Set up event listeners before setting srcObject
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight)
        
        // Attempt to play the video
        const playPromise = video.play()
        if (playPromise) {
          playPromise
            .then(() => {
              console.log('Video playing successfully')
              resolve()
            })
            .catch((playError) => {
              console.error('Play failed:', playError)
              // Try again after a short delay
              setTimeout(() => {
                video.play()
                  .then(() => resolve())
                  .catch(() => reject(playError))
              }, 100)
            })
        } else {
          resolve()
        }
      }

      const handleError = (e: Event) => {
        console.error('Video error:', e)
        reject(new Error('Video loading failed'))
      }

      // Add event listeners
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
      video.addEventListener('error', handleError, { once: true })

      // Set video properties
      video.muted = true // Ensure muted for autoplay
      video.playsInline = true
      video.autoplay = true

      // Set the stream
      video.srcObject = stream

      // Fallback timeout
      setTimeout(() => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
          resolve()
        } else {
          reject(new Error('Video setup timeout'))
        }
      }, 5000)
    })
  }

  const startCamera = async () => {
    try {
      setError(null)
      cleanup() // Clean up any existing stream

      const supports = (navigator.mediaDevices as any).getSupportedConstraints?.() || {}
      const videoConstraints: MediaTrackConstraints = {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        ...(supports.aspectRatio ? { aspectRatio: 16/9 } : {}),
        ...(supports.frameRate ? { frameRate: { ideal: 30 } } : {}),
      }

      console.log('Requesting camera access with constraints:', videoConstraints)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: mode === 'video' 
      })

      console.log('Camera access granted, stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })))
      
      mediaStreamRef.current = stream

      if (videoRef.current) {
        await setupVideo(stream)
      }
      
      setStarted(true)
    } catch (e: any) {
      console.error('Camera error:', e)
      setError(e?.message || 'Camera access denied. Please check permissions and try again.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !mediaStreamRef.current) {
      setError('Camera not ready')
      return
    }
    
    const video = videoRef.current
    
    // Wait for video to have dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video not ready, please wait')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setError('Canvas not supported')
      return
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob)
      } else {
        setError('Failed to capture photo')
      }
    }, 'image/jpeg', 0.9)
  }

  const startRecording = () => {
    if (!mediaStreamRef.current) {
      setError('Camera not ready')
      return
    }
    
    const chunks: BlobPart[] = []
    
    // Check for MediaRecorder support and codec
    let mimeType = 'video/webm'
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'
      } else {
        setError('Video recording not supported')
        return
      }
    }
    
    const rec = new MediaRecorder(mediaStreamRef.current, { mimeType })
    mediaRecorderRef.current = rec
    
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data)
      }
    }
    
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      onCapture(blob)
      setRecording(false)
      
      // Clean up prompts
      if (promptTimerRef.current) {
        window.clearInterval(promptTimerRef.current)
        promptTimerRef.current = null
      }
    }
    
    rec.onerror = (e) => {
      console.error('MediaRecorder error:', e)
      setError('Recording failed')
      setRecording(false)
    }
    
    try {
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

      // Auto-stop recording after maxDurationMs
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, maxDurationMs)
    } catch (e) {
      console.error('Failed to start recording:', e)
      setError('Failed to start recording')
    }
  }

  return (
    <div className={`rounded-xl border bg-white p-3 sm:p-4 ${className}`}>
      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#000' }}
        />
        {mode === 'video' && enableLivenessPrompts && recording && (
          <div aria-live="polite" className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm animate-fadeIn">
            {prompts[promptIndex]}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-600">
          {error}
        </div>
      )}
      
      {!started && (
        <div className="mt-3">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            We need camera access to continue. On mobile, allow camera permission and keep your face centered.
          </p>
          <button 
            onClick={startCamera} 
            disabled={disabled} 
            className="w-full px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base transition-colors"
          >
            Enable Camera
          </button>
        </div>
      )}
      
      {started && (
        <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {mode === 'photo' ? (
            <button 
              disabled={disabled} 
              onClick={capturePhoto} 
              className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base transition-colors"
            >
              Capture Photo
            </button>
          ) : (
            <button 
              disabled={disabled || recording} 
              onClick={startRecording} 
              className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base transition-colors"
            >
              {recording ? 'Recording…' : 'Start Recording'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}