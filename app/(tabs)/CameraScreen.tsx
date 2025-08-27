import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import React, { useState } from 'react'
import { ActivityIndicator, Button, Linking, Platform, StyleSheet, Text, View } from 'react-native'
import { Camera, CameraPermissionStatus, CameraRuntimeError, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { DetectionDebugHUD } from '../../components/DetectionDebugHUD'
import { DetectionsOverlay } from '../../components/DetectionsOverlay'
import { useDetections } from '../../hooks/useDetection'

export default function CameraScreen() {
    const { hasPermission, requestPermission } = useCameraPermission()
    const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus | null>(null)
    const [initialized, setInitialized] = useState(false)
    const [error, setError] = useState<CameraRuntimeError | null>(null)

    const device = useCameraDevice('back')
    const isFocused = useIsFocused()
    const appState = useAppState()
    const isActive = isFocused && appState === 'active'

    const { detections, frameProcessor } = useDetections({
        throttleFrames: 2,
        minConfidence: 0.25,
        maxDetections: 5,
        sortByConfidence: true,
        enableDiff: true
    })

    React.useEffect(() => {
        setPermissionStatus(Camera.getCameraPermissionStatus())
    }, [])

    if (permissionStatus === null) return <LoadingScreen text="Checking camera permission..." />
    if (permissionStatus === 'denied' || permissionStatus === 'restricted') {
        return (
            <PermissionDeniedScreen requestPermission={async () => {
                await requestPermission()
                setPermissionStatus(Camera.getCameraPermissionStatus())
            }} />
        )
    }
    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text>Camera permission is required.</Text>
                <Button title="Request Permission" onPress={async () => {
                    await requestPermission()
                    setPermissionStatus(await Camera.getCameraPermissionStatus())
                }} />
            </View>
        )
    }
    if (!device) return <LoadingScreen text="Loading camera..." />
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Camera error: {error.code}</Text>
                <Text>{error.message}</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                onInitialized={() => setInitialized(true)}
                onError={setError}
                photo={false}
                video={false}
                frameProcessor={frameProcessor}
                pixelFormat="yuv"
            />
            <DetectionsOverlay detections={detections} />
            <DetectionDebugHUD detections={detections} />
            {!initialized && <LoadingScreen text="Initializing camera..." />}
        </View>
    )
}

function LoadingScreen({ text }: { text: string }) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{text}</Text>
        </View>
    )
}

function PermissionDeniedScreen({ requestPermission }: { requestPermission: () => void }) {
    return (
        <View style={styles.center}>
            <Text style={styles.text}>Camera permission is denied or restricted.</Text>
            <Button title="Request Permission" onPress={requestPermission} />
            <Button
                title="Open App Settings"
                onPress={() => {
                    if (Platform.OS === 'android') Linking.openSettings()
                    else Linking.openURL('app-settings:')
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 16, marginTop: 12, textAlign: 'center' }
})