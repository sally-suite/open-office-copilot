import React from 'react';
import styles from './index.module.css';
import cn from 'classnames'
interface SwitchProps {
    className?: string;
    checked?: boolean;
    onChange?: () => void;
}

const Switch: React.FC<SwitchProps> = ({ className = '', checked, onChange }) => {
    return (
        <label className={cn(styles.switch, className)}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
            <span className={styles.slider}></span>
        </label>
    );
};

export default Switch;
