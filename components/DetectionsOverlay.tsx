import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Detection } from '../types/detection'

interface Props {
    detections?: Detection[]      // make optional for defensive use
    color?: string
    showLabels?: boolean
}

export const DetectionsOverlay = memo(function DetectionsOverlay({
    detections = [],              // default to []
    color = '#00FF66',
    showLabels = true
}: Props) {
    if (!Array.isArray(detections) || detections.length === 0) {
        return null
    }
    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {detections.map(d => {
                if (!d || !d.box) return null
                const { box, trackingId, topLabel, topConfidence } = d
                return (
                    <View
                        key={(trackingId ?? -1) + ':' + (topLabel ?? '')}
                        style={[
                            styles.box,
                            {
                                left: box.x,
                                top: box.y,
                                width: box.width,
                                height: box.height,
                                borderColor: color
                            }
                        ]}
                    >
                        {showLabels && topLabel && (
                            <View style={styles.labelContainer}>
                                <Text style={styles.labelText}>
                                    {topLabel} {(topConfidence ?? 0).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>
                )
            })}
        </View>
    )
})

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        borderWidth: 2
    },
    labelContainer: {
        position: 'absolute',
        left: 0,
        top: -18,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 4,
        paddingVertical: 2
    },
    labelText: {
        fontSize: 10,
        color: '#fff'
    }
})