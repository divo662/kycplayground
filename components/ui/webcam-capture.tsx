'use client'

import React, { useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'

interface WebcamCaptureProps {
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

export default function WebcamCapture({
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
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const promptTimerRef = useRef<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode,
    aspectRatio: 16/9
  }

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) {
      setError('Camera not ready')
      return
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        // Convert data URL to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            onCapture(blob)
          })
          .catch(err => {
            console.error('Error converting image to blob:', err)
            setError('Failed to capture photo')
          })
      } else {
        setError('Failed to capture photo')
      }
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture photo')
    }
  }, [onCapture])

  const startRecording = useCallback(() => {
    if (!webcamRef.current) {
      setError('Camera not ready')
      return
    }

    try {
      const stream = webcamRef.current.video?.srcObject as MediaStream
      if (!stream) {
        setError('No video stream available')
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

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        onCapture(blob)
        setRecording(false)
        
        // Clean up prompts
        if (promptTimerRef.current) {
          window.clearInterval(promptTimerRef.current)
          promptTimerRef.current = null
        }
      }

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e)
        setError('Recording failed')
        setRecording(false)
      }

      recorder.start()
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

    } catch (err) {
      console.error('Recording error:', err)
      setError('Failed to start recording')
    }
  }, [onCapture, enableLivenessPrompts, prompts, promptIntervalMs, maxDurationMs])

  const handleUserMedia = useCallback(() => {
    setIsStarted(true)
    setError(null)
  }, [])

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error)
    setError(typeof error === 'string' ? error : 'Camera access denied. Please check permissions and try again.')
    setIsStarted(false)
  }, [])

  return (
    <div className={`rounded-xl border bg-white p-3 sm:p-4 ${className}`}>
      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={mode === 'video'}
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="w-full h-full object-cover"
          screenshotFormat="image/jpeg"
          screenshotQuality={0.9}
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
      
      {!isStarted && (
        <div className="mt-3">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            We need camera access to continue. On mobile, allow camera permission and keep your face centered.
          </p>
          <p className="text-xs text-gray-500 mb-3">
            If camera doesn't start automatically, please refresh the page and allow camera access when prompted.
          </p>
          
          {/* Fallback file upload option */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Camera not working? Upload a photo instead:</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onCapture(file)
                }
              }}
              className="hidden"
              id="fallback-upload"
            />
            <label
              htmlFor="fallback-upload"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer text-sm"
            >
              Choose Photo File
            </label>
          </div>
        </div>
      )}
      
      {isStarted && (
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
