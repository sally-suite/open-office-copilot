/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Ban, MessagesSquare, MoveVertical, PanelRightClose, Wrench, X } from 'lucide-react'
import Icon from 'chat-list/components/icon';
import useLocalStore from 'chat-list/hook/useLocalStore';
import styles from './content.module.css';
import Container from 'chat-list/components/trans-box/container';
// import { IPagePlugin } from 'chat-list/components/trans-box/plugins/types';
import plugins from 'chat-list/components/trans-box/plugins'
import { Settings } from 'lucide-react'
import Toolbar, { CloseType } from 'chat-list/components/trans-box/toolbar';
import Setting from 'chat-list/components/trans-box/setting';
import DisableSetting from 'chat-list/components/trans-box/disable';
import useChromeStore from 'chat-list/hook/useChromeStore';
import { IPagePlugin, SelectedRange } from 'chat-list/components/trans-box/plugins/types';
import { SALLY_ROOT_ID, SALLY_ROOT_TAG } from 'chat-list/config/side';
import i18n from 'chat-list/locales/i18n';
import { getChromeStore, getToken, setLicenseConfig, setToken } from 'chat-list/local/local';
import { useTranslation } from 'react-i18next';
import { Input } from 'chat-list/components/ui/input';
import userApi from '@api/user';
import Button from 'chat-list/components/trans-box/button';
import { useSelection, SelectionProvider } from 'chat-list/components/trans-box/store/useSelection';
// import { tag } from 'chat-list/apps/side/shadow-dom';

const LatexSites = ['overleaf.com', 'keepresearch.com', 'sharelatex.com']

function showLatex() {
    // 判断当前站点是否在LatexSites中
    const isLatexSite = LatexSites.some((site) => window.location.host.includes(site));
    return isLatexSite;
}

const initTools = () => {
    if (!showLatex()) {
        return [{ id: 'translation' }, { id: 'chat' }, { id: 'writing' }]
    } else {
        return [{ id: 'translation' }, { id: 'chat' }, { id: 'latex' }]
    }
}

const App = () => {
    // const [plugins, setPlugins] = useState<IPagePlugin[]>(plgs)
    const { t } = useTranslation(['side'])

    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [initialTop, setInitialTop] = useState(0);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const [barVisible, setBarVisible] = useState(false);
    const [enable, setEnable] = useState(true)
    const pathname = window.location.pathname;
    const [temporaryDisable, setTemporaryDisable] = useState<boolean>(false);
    const { value: localDisable, setValue: setLocalDisable } = useLocalStore<boolean>('sally-box-local-disalbe_' + pathname, false);
    const { value: globalDisable, setValue: setGlobalDisable } = useChromeStore<boolean>('sally-box-global-disalbe', false);
    const [settingVisible, setSettingVisible] = useState(false);
    const [disableVisible, setDisableVisible] = useState(false);
    const [isPined, setIsPined] = useState(false)
    const { value: list, setValue: setList } = useChromeStore<{ id: string }[]>('sally-tool-setting', initTools());
    const { value: position, setValue: setPosition } = useLocalStore<{ top: number, right: number }>(`trans-pos`, { top: 500, right: 4 });
    const [boxVisible, setBoxVisible] = useState<{ [x: string]: { params: any, visible: boolean } }>({})
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 })
    const [barPosition, setBarPosition] = useState({ top: 0, right: 0 })
    // const [selectedText, setSelectedText] = useState('');
    // const [selectedRange, setSelectedRange] = useState<SelectedRange>(null);
    const { selectedText, setSelectedText, selectedRange, setSelectedRange } = useSelection();
    const [activePlugins, setActivePlugins] = useState<IPagePlugin[]>([])
    const [isAuth, setIsAuth] = useState(true);
    const [licenseKey, setLicenseKey] = useState('');

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartY(e.pageY);
        setInitialTop(editorRef.current.offsetTop);
    };

    const handleMouseMove = (e: MouseEvent) => {

        if (!isDragging) return;


        const deltaY = e.pageY - startY;

        editorRef.current.style.top = `${initialTop + deltaY}px`;
        editorRef.current.style.bottom = 'auto'
        // 加入边界检查，禁止拖拽到屏幕外
        if (editorRef.current.offsetLeft < 0) {
            editorRef.current.style.left = '0px';
        }
        if (editorRef.current.offsetTop < 0) {
            editorRef.current.style.top = '0px';
        }
        if (editorRef.current.offsetLeft + editorRef.current.offsetWidth > window.innerWidth) {
            editorRef.current.style.left = `${window.innerWidth - editorRef.current.offsetWidth}px`;
        }
        if (editorRef.current.offsetTop + editorRef.current.offsetHeight > window.innerHeight) {
            editorRef.current.style.top = `${window.innerHeight - editorRef.current.offsetHeight}px`;
        }

    }

    const handleMouseUp = () => {
        setIsDragging(false);
        setPosition({
            top: editorRef.current.offsetTop,
            right: 4
        });
    };

    // 当鼠标离开编辑器区域时，也停止拖动
    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const onClose = () => {
        setBarVisible(false);
        setBoxVisible({})
        setSelectedText('');
        setSelectedRange(null);
        setIsPined(false);
    }
    const onToolbarClose = (type: CloseType) => {
        if (type === 'hide_until_next_visit') {
            setTemporaryDisable(true)
        } else if (type === 'disable_on_current_page') {
            setLocalDisable(true)
        } else if (type === 'disable_globally') {
            setGlobalDisable(true)
        }
        setBarVisible(false);
        if (!isPined) {
            setBoxVisible({})
        }
        setSelectedText('');
        setSelectedRange(null);
    }
    function openSidePanel() {
        //@ts-ignore
        chrome?.storage?.local?.set({ selectedText });
        //@ts-ignore
        chrome?.runtime?.sendMessage({ action: "openSidePanel" });
    }
    function onPinPlugin(id: string) {

        // if (boxVisible[id]) {
        //     setBoxVisible({ ...boxVisible, [id]: false })
        // } else {
        //     setBoxVisible({ ...boxVisible, [id]: true })
        // }
        if (list.findIndex(p => p.id === id) === -1) {
            setList(list.concat({ id }))
        } else {
            setList(list.filter(p => p.id !== id))
        }
    }
    function getCenterPosition(popupWidth = 300, popupHeight = 300) {
        // 获取浏览器窗口的宽度和高度
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 计算居中位置
        const left = (windowWidth - popupWidth) / 2;
        const top = (windowHeight - popupHeight) / 2;

        return { left, top };
    }
    function onScreenshot(file: string) {
        //eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        chrome?.runtime?.sendMessage({ type: 'image', src: file });
    }

    function setBoxVisibleByKey(key: string, params: any, e: Event) {
        e?.preventDefault();
        e?.stopPropagation();

        // boxVisible 中
        if (!plugins.some(p => boxVisible[p.id])) {

            const target = e?.currentTarget as HTMLElement;
            if (target) {
                const { top, left, height, width } = target.parentElement.getBoundingClientRect();

                // 假设弹窗的高度为 550，宽度为 450
                const boxHeight = 600;
                const boxWidth = 450;

                // 计算弹窗的初始位置
                let topPosition = top + height + 10;
                let leftPosition = left + 4;

                // 确保弹窗不超出视口
                const windowHeight = window.innerHeight;
                const windowWidth = window.innerWidth;

                // 检查弹窗是否会超出底部，如果超出，调整位置
                if (topPosition + boxHeight > windowHeight) {
                    topPosition = windowHeight - boxHeight - 10;
                }

                // 检查弹窗是否会超出右侧，如果超出，调整位置
                if (leftPosition + boxWidth > windowWidth) {
                    leftPosition = windowWidth - boxWidth - 10;
                }

                // 设置弹窗位置
                setBoxPosition({
                    top: topPosition,
                    left: leftPosition,
                });
            } else {
                const { top, left } = getCenterPosition();
                setBoxPosition({
                    top,
                    left,
                });
            }
            // 隐藏侧边栏
            setBarVisible(false);
        }

        // 显示弹窗
        setBoxVisible({
            [key]: {
                params,
                visible: true,
            },
        });
    }

    function onPositionChange(position: any) {
        setBoxPosition(position)
    }
    const onPinPanel = (pined: boolean) => {
        setIsPined(pined);
    }

    function showSetting(e: any) {
        e?.preventDefault();
        e?.stopPropagation();
        // const target = e.currentTarget as HTMLElement;
        const { left, top } = getCenterPosition(500, 500);
        setBoxPosition({
            top: top,
            left: left,
        })
        setSettingVisible(true)
    }
    function showToolbar(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const { top, left, height } = target.parentElement.getBoundingClientRect();
        setBarPosition({
            top: top + -10 - height,
            // left: left - 200,
            right: left + 200,
        })
        setBarVisible(true)

    }
    function showChat(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const { left, top } = getCenterPosition(500, 300);
        setBoxPosition({
            top: top,
            left: left,
        })
        setBoxVisible({
            chat: {
                params: {

                },
                visible: true,
            },
        })
    }
    function showDisableSetting(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const { top, left, height } = target.parentElement.getBoundingClientRect();
        setBoxPosition({
            top: top + height + 10 - 300,
            left: left + 4,
        })
        setDisableVisible(true)
    }

    const initLanguage = async () => {
        const lang: string = await getChromeStore('sally-extention-language') as string;
        i18n.changeLanguage(lang);
    }


    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
        setTimeout(() => {
            containerRef.current.style.display = 'block';
        }, 1000);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseleave', handleMouseLeave);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isDragging]);

    // 添加快捷键监听器
    useEffect(() => {
        const handleKeyDown = (e: any) => {

            if ((e.ctrlKey || e.metaKey)) {

                const plg = activePlugins.find(p => p?.shortcut?.toLowerCase() == e.key)

                if (plg) {
                    e.preventDefault();
                    e.stopPropagation();
                    setBoxPosition({
                        top: 20,
                        left: window.innerWidth - 400,
                    })
                    setBoxVisible({
                        [plg.id]: {
                            visible: !boxVisible[plg.id],
                            params: {}
                        }
                    });
                    setIsPined(true);
                }
            }
        };


        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

        };
    }, [boxVisible, activePlugins]);
    // 判断父元素是否有id为sally-input的元素
    const isParentContain = (element: any, id: string): boolean => {
        if (!element) return false;
        if (element.id === id) return true;
        return isParentContain(element.parentElement, id);
    }

    const isShowAuth = () => {

        return !isAuth && plugins.filter(p => {
            return boxVisible[p.id]?.visible
        }).length > 0;
    }

    async function checkAuth() {
        const token = await getToken();
        if (!token) {
            setIsAuth(false);
        } else {
            setIsAuth(true);
        }
    }

    const onLogin = async () => {
        const token = await userApi.login(licenseKey);
        // console.log(token)
        await setToken(token);
        await setLicenseConfig(licenseKey || '');
        setIsAuth(true);
    }

    const onGoogleLogin = async () => {
        if (!window.chrome) {
            return;
        }
        window.chrome.runtime.sendMessage({ action: "google_login" }, (response) => {
            console.log('Login Response:', response);
        });
    }

    const onSetting = () => {
        console.log('setting')
        setSettingVisible(false);
    }

    useEffect(() => {
        checkAuth();
    }, []);

    // 添加快捷键监听器
    useEffect(() => {
        const handleMouseUp = (e: any) => {
            if (temporaryDisable) {
                return;
            }

            if (globalDisable) {
                return;
            }

            if (localDisable) {
                return;
            }

            const isContainer = isParentContain(e.target, SALLY_ROOT_TAG);

            if (isContainer) {
                return;
            }
            setTimeout(() => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                // console.log('selectedText', selectedText)
                if (!selectedText || selectedText.length < 2) {
                    if (barVisible) {
                        if (!isPined) {
                            onClose();
                        }
                        setBarVisible(false);
                        return;
                    }

                    // set focus element
                    const activeElement = document.activeElement as HTMLElement;
                    let range;
                    if (activeElement.isContentEditable) {
                        const selection = document.getSelection();
                        if (selection.rangeCount > 0) {
                            range = selection.getRangeAt(0).cloneRange();
                        }
                        setSelectedRange(range);
                        setSelectedText('');
                    } else if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                        range = {
                            element: activeElement,
                            start: (activeElement as HTMLInputElement).selectionStart,
                            end: (activeElement as HTMLInputElement).selectionEnd
                        };
                        setSelectedRange(range);
                        setSelectedText('');
                    } else {
                        if (!isPined) {
                            onClose();
                        }
                    }
                    return;
                } else {
                    setSelectedText(selectedText);
                    const activeElement = document.activeElement as HTMLElement;
                    let range;
                    if (activeElement.isContentEditable) {
                        const selection = document.getSelection();
                        if (selection.rangeCount > 0) {
                            range = selection.getRangeAt(0).cloneRange();
                        }
                    } else if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                        range = {
                            element: activeElement,
                            start: (activeElement as HTMLInputElement).selectionStart,
                            end: (activeElement as HTMLInputElement).selectionEnd
                        };
                    }

                    setSelectedRange(range);
                    if (!isPined) {
                        setBarVisible(true);
                        const toolWidth = (activePlugins.length + 2) * 32;
                        const left = window.innerWidth - toolWidth;
                        const top = e.clientY + 20;
                        const bottomEdge = window.innerHeight - 40; // 20 是工具条底部与窗口底部的距离
                        const adjustedTop = Math.min(top, bottomEdge - 40); // 确保工具条不会超出窗口底部

                        setBarPosition({
                            top: adjustedTop > 0 ? adjustedTop : 20,
                            // left: e.clientX > left ? left : e.clientX,
                            right: e.clientX > left ? 0 : (window.innerWidth - e.clientX - toolWidth),
                        });
                    }
                }

            }, 200)

        };
        const handleMouseDown = (e) => {
            if (globalDisable) {
                return;
            }

            if (localDisable) {
                return;
            }

            const isContainer = isParentContain(e.target, SALLY_ROOT_TAG);
            if (isContainer) {
                return;
            }
            setBarVisible(false);
        }
        const handleKeyDown = (e: any) => {
            if (e.key === 'Escape') {
                setBarVisible(false);
            }
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            if (!selectedText) {
                setBarVisible(false);
            }
        }
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keyup', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keyup', handleKeyDown);
        };
    }, [barVisible, localDisable, globalDisable, isPined]);

    useEffect(() => {
        const ls = list.map(p => plugins.find(plg => plg.id === p.id)).filter(p => !!p);
        setActivePlugins(ls);
    }, [list])

    useEffect(() => {
        initLanguage();
    }, []);


    // useEffect(() => {

    //     const onSelection = (e: any) => {
    //         console.log(e)
    //         const activeElement = document.activeElement;
    //         if (activeElement.id == SALLY_ROOT_ID) {
    //             return;
    //         }
    //         const selectedText = window.getSelection().toString().trim();
    //         console.log(selectedText)
    //         if (!selectedText) {
    //             return;
    //         }
    //         setSelectedText(selectedText);
    //     }

    //     document.addEventListener('selectionchange', onSelection)

    //     return () => {
    //         document.removeEventListener('selectionchange', onSelection)
    //     };
    // }, []);

    if (!enable) return null;

    return (
        <div onSelect={(e) => e.stopPropagation()} ref={containerRef} style={{ display: 'none' }} >
            {
                barVisible && (
                    <div
                        id="sally-toolbar"
                        style={{
                            position: 'fixed',
                            top: barPosition.top,
                            right: barPosition.right,
                        }}>
                        <Toolbar
                            selectedText={selectedText}
                            selectedRange={selectedRange}
                            onClose={onToolbarClose}
                            onChangeActive={setBoxVisibleByKey}
                            plugins={plugins}
                            pinPlugins={activePlugins}
                            openSidePanel={openSidePanel}
                            active={''}
                            onPin={onPinPlugin}
                            onSetting={showSetting}
                        />
                    </div>
                )
            }

            {
                isAuth && plugins.filter(p => {
                    return boxVisible[p.id]?.visible
                }).map((plg) => {
                    const Comp = plg.component;
                    return (
                        <Comp
                            params={boxVisible[plg.id]?.params}
                            onClose={onClose}
                            key={plg.id}
                            pin={isPined}
                            onPin={onPinPanel}
                            selectedText={selectedText}
                            selectedRange={selectedRange}
                            position={boxPosition}
                            onPositionChange={onPositionChange}
                        />
                    )
                })
            }

            <div ref={editorRef}
                onMouseDown={handleMouseDown}
                className={cn(styles.sidebar)}
                style={{
                    top: `${position.top}px`,
                    right: `${position.right}px`,
                    overflow: "hidden",
                }}
            >
                <div className={styles.barItem} onClick={showSetting} >
                    <Settings height={16}
                        width={16} className={styles.textGray} />
                </div>
                <div className={styles.barItem} onClick={showChat} >
                    <MessagesSquare height={16}
                        width={16} className={styles.textGray} />
                </div>
                <div className={styles.barItem} onClick={openSidePanel}>
                    <PanelRightClose height={16}
                        width={16} className={styles.textGray} />
                </div>
                <div className={styles.barItem} >
                    <Icon
                        name="logo"
                        style={{
                            display: 'flex',
                            height: 24,
                            width: 24,
                            flexShrink: 0,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                </div>

            </div>

            <Container
                isVisible={isShowAuth()}
                title={t('base:common.login')}
                position={boxPosition}
                onClose={() => {
                    setSettingVisible(false);
                }}
            >
                <div className='pb-2 flex flex-col items-center'>

                    <div className='flex flex-row space-x-1 py-2 w-full'>
                        <Input className='h-8 flex-1' placeholder={t('base:common.license.input_placeholder')}
                            value={licenseKey}
                            onChange={(event) => {
                                setLicenseKey(event.target.value);
                            }}
                        />
                        <Button className='h-8' onClick={onLogin}>
                            {t('base:common.login')}
                        </Button>
                    </div>
                    <div>
                        <p className="px-1 text-sm" dangerouslySetInnerHTML={{
                            __html: t('base:common.license.desc')
                        }}>
                        </p>
                    </div>
                </div>
            </Container>
            <Container
                isVisible={settingVisible}
                title={t('setting')}
                position={boxPosition} onClose={() => {
                    setSettingVisible(false);
                }}
                showSelectBar={false}
            >
                <Setting
                    list={list}
                    onChange={(value) => {
                        setList(value);
                    }}
                    onClose={() => {
                        setSettingVisible(false);
                    }}
                    disableSetting={{ localDisable, globalDisable }}
                    onDisableSetting={(value) => {
                        setLocalDisable(value.localDisable);
                        setGlobalDisable(value.globalDisable);
                    }}
                />
            </Container>

        </div>
    );
};

export default function Side() {
    return (
        <SelectionProvider>
            <App />
        </SelectionProvider>
    )
}
