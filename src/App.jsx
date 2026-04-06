import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FaCameraRetro } from 'react-icons/fa';

function App() {
    const videoRef = useRef(null);
    const codeReaderRef = useRef(new BrowserMultiFormatReader());
    const [result, setResult] = useState('');
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const initCamera = async () => {
        try {
            setErrorMessage('');
            // Safari等で権限リクエストがサイレント失敗するのを防ぐため、事前に明示的にリクエスト
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

            const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
            setDevices(videoInputDevices);

            if (videoInputDevices.length > 0) {
                // ZXing用に一旦ストリームを解放する
                stream.getTracks().forEach(track => track.stop());

                let targetId = videoInputDevices[0].deviceId;
                // 名前に "back" や "背面" が含まれるカメラを優先
                const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('背面'));
                if (backCamera) {
                    targetId = backCamera.deviceId;
                } else if (videoInputDevices.length > 1) {
                    targetId = videoInputDevices[videoInputDevices.length - 1].deviceId;
                }

                setSelectedDeviceId(targetId);
                setIsCameraActive(true);
            } else {
                setErrorMessage("カメラデバイスが見つかりませんでした。");
            }
        } catch (err) {
            console.error("Camera init error:", err);
            // よくあるエラーについてのハンドリング
            if (err.name === 'NotAllowedError') {
                setErrorMessage("カメラのアクセスが拒否されています。ブラウザの設定（URL横の鍵マーク等）からカメラを「許可」にしてリロードしてください。");
            } else if (err.name === 'NotFoundError') {
                setErrorMessage("Webカメラが見つかりません。");
            } else if (!window.isSecureContext) {
                setErrorMessage("安全な通信（HTTPS または localhost）ではないため、カメラがブロックされました。");
            } else {
                setErrorMessage(`カメラの起動に失敗: ${err.message || err}`);
            }
        }
    };

    useEffect(() => {
        if (!isCameraActive || !selectedDeviceId || !videoRef.current) return;

        let controls = null;

        const startDecoding = async () => {
            try {
                if (codeReaderRef.current) {
                    codeReaderRef.current.releaseAllStreams();
                }

                setErrorMessage(''); // スキャン開始前に一旦エラーをリセット
                controls = await codeReaderRef.current.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (res, err) => {
                        if (res) {
                            setResult(res.getText());
                            if ('vibrate' in navigator) navigator.vibrate(50);
                        }
                    }
                );
            } catch (err) {
                console.error("Decoding error:", err);
                setErrorMessage(`スキャンエラー: ${err.message || err}`);
            }
        };

        startDecoding();

        return () => {
            if (controls && controls.stop) {
                controls.stop();
            }
            codeReaderRef.current.releaseAllStreams();
        };
    }, [isCameraActive, selectedDeviceId]);

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

            {!isCameraActive ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    {errorMessage && (
                        <div style={{ background: 'rgba(255,0,0,0.2)', padding: '1rem', borderRadius: '8px', color: '#ffb3b3', marginBottom: '1.5rem', border: '1px solid #ff4d4d' }}>
                            {errorMessage}
                        </div>
                    )}
                    <p style={{ marginBottom: '2rem' }}>ボタンを押してカメラを起動してください。</p>
                    <button className="cam-toggle" onClick={initCamera} style={{ fontSize: '1.2rem', padding: '15px 30px', margin: '0 auto' }}>
                        <FaCameraRetro /> カメラを起動する
                    </button>
                </div>
            ) : (
                <>
                    <div className="scanner-container">
                        <video ref={videoRef} className="scanner-video" muted playsInline />
                        <div className="scan-guide"></div>
                    </div>

                    {errorMessage && <p style={{ color: '#ffb3b3', marginTop: '1rem' }}>{errorMessage}</p>}

                    {devices.length > 1 && (
                        <button className="cam-toggle" onClick={handleDeviceChange} style={{ marginTop: '1.5rem' }}>
                            <FaCameraRetro /> カメラの切り替え
                        </button>
                    )}

                    {result && (
                        <div className="result-panel">
                            <h3>読み取り結果</h3>
                            <div className="jan-code">{result}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
