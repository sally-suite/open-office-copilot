import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import styles from './index.module.css';
import { Check, Crop, Undo2, X } from 'lucide-react';

const ScreenshotComponent = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [selection, setSelection] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const containerRef = useRef(null);

    const handleCaptureStart = () => {
        setIsCapturing(true);
    };

    const handleMouseDown = (e) => {
        if (isCapturing) {
            const startX = e.clientX;
            const startY = e.clientY;

            const handleMouseMove = (e) => {
                const width = Math.abs(e.clientX - startX);
                const height = Math.abs(e.clientY - startY);
                const left = Math.min(e.clientX, startX);
                const top = Math.min(e.clientY, startY);

                setSelection({ left, top, width, height });
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                // setConfirming(true);
                requestAnimationFrame(() => setConfirming(true));
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };
    const handleCancel = () => {
        setIsCapturing(false);
        setSelection(null);
        setConfirming(false);
    };
    const handleConfirm = () => {
        setTimeout(() => {
            html2canvas(containerRef.current, {
                x: selection.left,
                y: selection.top,
                width: selection.width,
                height: selection.height,
                useCORS: true, // 解决跨域问题
            }).then((canvas) => {
                const base64Image = canvas.toDataURL('image/png');
                // 处理截图结果，比如将base64Image传递给父组件或进行其他操作
                console.log(base64Image);
                // 重置状态
                // setIsCapturing(false);
                // setSelection(null);
                // setConfirming(false);
                setImageUrl(base64Image);
            });
        }, 0);
    };

    useEffect(() => {
        const handleEsc = (event: any) => {
            if (event.keyCode === 27) { // ESC key code
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.container}>
            <img src={imageUrl} alt="" />
            <div className={styles.icon} onClick={handleCaptureStart}>
                <Crop
                    height={28}
                    width={18}
                    className={styles.textGray}
                />
            </div>

            {isCapturing && (
                <div className={styles.mask} onMouseDown={handleMouseDown}>
                    {selection && (
                        <div
                            className={styles.selectionBox}
                            style={{
                                left: selection.left + 'px',
                                top: selection.top + 'px',
                                width: selection.width + 'px',
                                height: selection.height + 'px',
                            }}
                        >
                            {confirming && (
                                <div className={styles.toolbar}>
                                    <div className={styles.btn}>
                                        <X height={20} width={20} onClick={handleCancel} />
                                    </div>
                                    <div className={styles.btn}>
                                        <Check height={20} width={20} onClick={handleConfirm} />
                                    </div>
                                </div>

                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScreenshotComponent;
