import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import styles from './index.module.css';
import { Check, Crop, X } from 'lucide-react';

interface IScreenShotProps {
    onScreenshot: (file: string) => void;
}

const ScreenshotComponent = (props: IScreenShotProps) => {
    const { onScreenshot } = props;
    const [isCapturing, setIsCapturing] = useState(false);
    const [selection, setSelection] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleEsc = (event: any) => {
            if (event.keyCode === 27) { // ESC key code
                setIsCapturing(false);
                setSelection(null);
                setConfirming(false);
            }
        };

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleCaptureStart = () => {
        setIsCapturing(true);
    };

    const handleMouseDown = (e) => {
        if (isCapturing) {
            const startX = e.clientX + window.scrollX;
            const startY = e.clientY + window.scrollY;

            const handleMouseMove = (e) => {
                const width = Math.abs(e.clientX + window.scrollX - startX);
                const height = Math.abs(e.clientY + window.scrollY - startY);
                const left = Math.min(e.clientX + window.scrollX, startX);
                const top = Math.min(e.clientY + window.scrollY, startY);

                setSelection({ left, top, width, height });
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
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
    }
    const handleConfirm = () => {
        // 使用 requestAnimationFrame 或 setTimeout 来避免 ResizeObserver 的问题
        requestAnimationFrame(() => {
            html2canvas(document.body, {
                // x: selection.left,
                // y: selection.top,
                // width: selection.width,
                // height: selection.height,
                // useCORS: true, // 解决跨域问题
                // scrollX: -window.scrollX,
                // scrollY: -window.scrollY
            }).then((canvas) => {
                const base64Image = canvas.toDataURL('image/png');
                // 处理截图结果，比如将base64Image传递给父组件或进行其他操作
                console.log(base64Image);
                // 重置状态
                setIsCapturing(false);
                setSelection(null);
                setConfirming(false);
                onScreenshot?.(base64Image)
            });
        });
    };

    return (
        <div ref={containerRef} className={styles.container}>
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
