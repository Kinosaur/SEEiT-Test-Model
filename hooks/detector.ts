import { Frame, VisionCameraProxy } from 'react-native-vision-camera'
import type { Detection } from '../types/detection'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectAndClassifyObjects', {})

export function detectAndClassifyObjects(frame: Frame): Detection[] {
    'worklet'
    if (!plugin) return []
    let res: any
    try {
        res = plugin.call(frame)
    } catch {
        return []
    }
    if (!res) return []
    if (Array.isArray(res)) return res as Detection[]
    if (typeof res === 'object' && typeof res.length === 'number') {
        const out: any[] = []
        for (let i = 0; i < res.length; i++) out.push(res[i])
        return out as Detection[]
    }
    return []
}