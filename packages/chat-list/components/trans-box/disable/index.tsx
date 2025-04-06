import React, { } from 'react';
// import useChromeStore from 'chat-list/hook/useChromeStore';
import Checkbox from '../checkbox';
import { useTranslation } from 'react-i18next';

export interface ISettingProps {
    value: {
        temporaryDisable: boolean;
        localDisable: boolean;
        globalDisable: boolean;
    }
    onClose?: () => void;
    onChange: (value: {
        temporaryDisable: boolean;
        localDisable: boolean;
        globalDisable: boolean;
    }) => void;
}

export default function Setting(props: ISettingProps) {
    const { onClose, value = { localDisable: false, globalDisable: false, temporaryDisable: false }, onChange } = props;
    const { t } = useTranslation('side')

    const onCheckChange = (name: string) => {
        const v: any = { ...value };
        v[name] = !v[name];
        onChange(v);
    }

    return (
        <div className="flex flex-col items-start w-full text-sm">
            {/* <div className="text-base font-bold mb-5">
                {t('disable_setting')}
            </div> */}
            <div className="flex flex-col items-start">
                <div className="flex flex-row items-center justify-center cursor-pointer" onClick={onCheckChange.bind(null, 'temporaryDisable')}>
                    <Checkbox checked={value.temporaryDisable} onChange={() => void 0} />
                    {t('hide_until_next_visit')}
                </div>
                <div className="flex flex-row items-center justify-center cursor-pointer" onClick={onCheckChange.bind(null, 'localDisable')}>
                    <Checkbox checked={value.localDisable} onChange={() => void 0} />
                    {t('disable_on_current_page')}
                </div>
                <div className="flex flex-row items-center justify-center cursor-pointer" onClick={onCheckChange.bind(null, 'globalDisable')}>
                    <Checkbox checked={value.globalDisable} onChange={() => void 0} />
                    {t('disable_globally')}
                </div>
            </div>
        </div>
    )
}
