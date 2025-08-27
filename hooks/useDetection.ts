import { useEffect, useState } from 'react'
import { Worklets, useRunOnJS } from 'react-native-worklets-core'
import type { Detection } from '../types/detection'
import { useDetectionProcessor } from './useDetectionProcessor'

/**
 * Poll-based bridge (interval). Ensures we never set undefined.
 */
export function useDetections(options?: Parameters<typeof useDetectionProcessor>[0]) {
    const { sharedDetections, frameProcessor } = useDetectionProcessor(options)
    const [detections, setDetections] = useState<Detection[]>([])

    const pushToJS = useRunOnJS((data: Detection[]) => {
        if (Array.isArray(data)) {
            setDetections(data)
        } else {
            setDetections([])
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        const loop = async () => {
            const context = Worklets.defaultContext
            while (!cancelled) {
                await context.runAsync(() => {
                    'worklet'
                    const current = sharedDetections.value
                    pushToJS(current)
                })
                await new Promise(res => setTimeout(res, 100))
            }
        }
        loop()
        return () => {
            cancelled = true
        }
    }, [sharedDetections, pushToJS])

    return { detections, frameProcessor }
}