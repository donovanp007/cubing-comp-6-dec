'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square, Play, Pause, Upload } from 'lucide-react'

interface VoiceRecorderProps {
  onAudioRecorded: (audioBlob: Blob) => void
  onTranscriptionComplete?: (text: string) => void
  disabled?: boolean
  className?: string
}

export default function VoiceRecorder({ 
  onAudioRecorded, 
  onTranscriptionComplete,
  disabled = false,
  className = "" 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for microphone permission on component mount
  useEffect(() => {
    checkMicrophonePermission()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setHasPermission(result.state === 'granted')
      
      result.onchange = () => {
        setHasPermission(result.state === 'granted')
      }
    } catch (err) {
      console.warn('Could not check microphone permission:', err)
      // Try to access microphone to test permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setHasPermission(true)
      } catch (mediaErr) {
        setHasPermission(false)
      }
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      
      mediaRecorderRef.current = mediaRecorder
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' 
        })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        onAudioRecorded(blob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setHasPermission(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please check permissions.')
      setHasPermission(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioURL && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setAudioURL(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  if (hasPermission === false) {
    return (
      <div className={`p-4 border rounded-lg bg-yellow-50 border-yellow-200 ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-800">
          <MicOff className="h-5 w-5" />
          <span className="text-sm font-medium">Microphone Access Required</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Please allow microphone access to use voice recording.
        </p>
        <Button 
          size="sm" 
          className="mt-2" 
          onClick={checkMicrophonePermission}
        >
          Check Permission
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-3">
        {!isRecording && !audioBlob ? (
          <Button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="h-4 w-4" />
            <span>Start Recording</span>
          </Button>
        ) : isRecording ? (
          <div className="flex items-center space-x-3">
            <Button
              onClick={stopRecording}
              disabled={disabled}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-red-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              onClick={isPlaying ? pauseRecording : playRecording}
              variant="outline"
              size="sm"
              disabled={disabled}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-gray-600">
              {formatTime(recordingTime)}
            </span>
            <Button
              onClick={clearRecording}
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-red-600 hover:text-red-700"
            >
              Clear
            </Button>
            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              disabled={disabled}
              className="flex items-center space-x-1"
            >
              <Mic className="h-4 w-4" />
              <span>Record Again</span>
            </Button>
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Recording status */}
      {isRecording && (
        <div className="text-sm text-gray-600">
          <p>🎤 Recording in progress... Speak clearly about your tasks or project needs.</p>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="text-sm text-green-600">
          <p>✅ Recording complete! Ready to process with AI.</p>
        </div>
      )}
    </div>
  )
}