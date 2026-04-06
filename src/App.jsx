import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FaCameraRetro } from 'react-icons/fa';

function App() {
    const videoRef = useRef(null);
    const codeReaderRef = useRef(new BrowserMultiFormatReader());
    const [result, setResult] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    useEffect(() => {
        let mounted = true;

        const initCamera = async () => {
            try {
                const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
                if (!mounted) return;
                setDevices(videoInputDevices);
                if (videoInputDevices.length > 0) {
                    // デフォルトは背面カメラ（リストの最後になることが多い）
                    setSelectedDeviceId(videoInputDevices[videoInputDevices.length - 1].deviceId);
                }
            } catch (err) {
                console.error("Camera enumeration error:", err);
            }
        };
        initCamera();

        return () => {
            mounted = false;
            if (codeReaderRef.current) {
                codeReaderRef.current.releaseAllStreams();
            }
        };
    }, []);

    useEffect(() => {
        if (!selectedDeviceId || !videoRef.current) return;

        let controls = null;

        const startDecoding = async () => {
            try {
                if (codeReaderRef.current) {
                    codeReaderRef.current.releaseAllStreams();
                }

                // カメラを指定してストリームとデコードを開始
                controls = await codeReaderRef.current.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (res, err) => {
                        if (res) {
                            setResult(res.getText());
                            // 読み取り成功時のバイブレーション
                            if ('vibrate' in navigator) {
                                navigator.vibrate(50);
                            }
                        }
                        // NotFoundExceptionなどのフレームごとのエラーは無視
                    }
                );
            } catch (err) {
                console.error("Decoding error:", err);
            }
        };

        startDecoding();

        return () => {
            if (controls && controls.stop) {
                controls.stop();
            }
            codeReaderRef.current.releaseAllStreams();
        };
    }, [selectedDeviceId]);

    const handleDeviceChange = () => {
        if (devices.length > 1) {
            const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
            const nextIndex = (currentIndex + 1) % devices.length;
            setSelectedDeviceId(devices[nextIndex].deviceId);
        }
    };

    return (
        <div className="app-container">
            <div className="header">JANコードスキャナー</div>

            <div className="scanner-container">
                <video
                    ref={videoRef}
                    className="scanner-video"
                    muted
                    playsInline
                />
                <div className="scan-guide"></div>
            </div>

            {devices.length > 1 && (
                <button className="cam-toggle" onClick={handleDeviceChange}>
                    <FaCameraRetro /> カメラの切り替え
                </button>
            )}

            {result && (
                <div className="result-panel">
                    <h3>読み取り結果</h3>
                    <div className="jan-code">{result}</div>
                </div>
            )}
        </div>
    );
}

export default App;
