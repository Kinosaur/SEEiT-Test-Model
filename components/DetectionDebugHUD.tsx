import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Detection } from '../types/detection'

export function DetectionDebugHUD({ detections }: { detections: Detection[] }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Detections: {detections.length}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 8,
        top: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    text: { color: '#fff', fontSize: 12 }
})