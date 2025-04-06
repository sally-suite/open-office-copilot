import { Square, CheckSquare } from 'lucide-react';
import React from 'react';
import styles from './index.module.css';
import cn from 'classnames';

interface ICheckbox {
    className?: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
}
export default function Checkbox(props: ICheckbox) {
    const { checked, onChange, className = '' } = props;
    const handleChange = () => {
        onChange?.(!checked);
    }
    if (checked) {
        return (
            <div className={cn(styles.checkbox, className)}>
                <CheckSquare height={20} width={20} onClick={handleChange} color='#107732' />
            </div>
        )

    }
    return (
        <div className={cn(styles.checkbox, className)}>
            <Square height={20} width={20} onClick={handleChange} color='#828282' />
        </div>
    )
}
