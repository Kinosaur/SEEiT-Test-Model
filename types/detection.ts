export interface DetectionBox {
    x: number
    y: number
    width: number
    height: number
}

export interface DetectionLabel {
    label: string
    confidence: number
}

export interface Detection {
    trackingId: number
    box: DetectionBox
    topLabel?: string
    topConfidence?: number
    labels: DetectionLabel[]
}

/**
 * Shallow equality for detection arrays to reduce unnecessary SharedValue writes.
 * Compares length + each detection's trackingId + topLabel + rounded topConfidence + box coordinates.
 * Adjust comparison strictness as needed.
 */
export function detectionsEqual(a: Detection[], b: Detection[]): boolean {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        const da = a[i]
        const db = b[i]
        if (da.trackingId !== db.trackingId) return false
        if (da.topLabel !== db.topLabel) return false
        if (Math.round((da.topConfidence ?? 0) * 1000) !== Math.round((db.topConfidence ?? 0) * 1000)) return false
        const ba = da.box
        const bb = db.box
        if (ba.x !== bb.x || ba.y !== bb.y || ba.width !== bb.width || ba.height !== bb.height) return false
    }
    return true
}