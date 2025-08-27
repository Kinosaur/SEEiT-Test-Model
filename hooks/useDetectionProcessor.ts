import { useRef } from 'react'
import type { Frame } from 'react-native-vision-camera'
import { useFrameProcessor } from 'react-native-vision-camera'
import { useSharedValue } from 'react-native-worklets-core'
import { detectAndClassifyObjects } from '../hooks/detector'
import type { Detection } from '../types/detection'
import { detectionsEqual } from '../types/detection'

export interface UseDetectionProcessorConfig {
    throttleFrames?: number
    minConfidence?: number
    maxDetections?: number
    sortByConfidence?: boolean
    enableDiff?: boolean
}

export function useDetectionProcessor(
    {
        throttleFrames = 2,
        minConfidence = 0,
        maxDetections,
        sortByConfidence = true,
        enableDiff = true
    }: UseDetectionProcessorConfig = {}
) {
    const sharedDetections = useSharedValue<Detection[]>([])
    const frameCountRef = useRef(0)

    const frameProcessor = useFrameProcessor((frame: Frame) => {
        'worklet'
        frameCountRef.current = (frameCountRef.current + 1) | 0
        if (throttleFrames > 1 && (frameCountRef.current % throttleFrames) !== 0) {
            return
        }

        let detections = detectAndClassifyObjects(frame)
        if (!Array.isArray(detections)) {
            // Defensive: ensure array invariant
            detections = []
        }

        if (detections.length === 0) {
            if (!enableDiff || sharedDetections.value.length !== 0) {
                sharedDetections.value = []
            }
            return
        }

        if (minConfidence > 0) {
            detections = detections.filter(d => (d?.topConfidence ?? 0) >= minConfidence)
            if (detections.length === 0) {
                if (!enableDiff || sharedDetections.value.length !== 0) {
                    sharedDetections.value = []
                }
                return
            }
        }

        if (sortByConfidence) {
            detections = detections
                .slice()
                .sort((a, b) => (b.topConfidence ?? 0) - (a.topConfidence ?? 0))
        }

        if (maxDetections && maxDetections > 0 && detections.length > maxDetections) {
            detections = detections.slice(0, maxDetections)
        }

        if (enableDiff) {
            const prev = sharedDetections.value
            if (detectionsEqual(prev, detections)) return
        }

        sharedDetections.value = detections
    }, [throttleFrames, minConfidence, maxDetections, sortByConfidence, enableDiff])

    return { sharedDetections, frameProcessor }
}