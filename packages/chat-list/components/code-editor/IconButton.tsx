import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { icons } from 'lucide-react';
import Loading from './Loading';

interface IIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name?: keyof typeof icons;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
}

export default function IconButton(props: IIconButtonProps) {
  const { name, icon, className = '', onClick, loading: defautLoading = false, ...rest } = props;
  const [loading, setLoading] = useState(false);
  const onBtnClick = async (e: any) => {
    try {
      setLoading(true);
      await onClick?.(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(defautLoading);
  }, [defautLoading]);
  return (
    <button
      className={`flex flex-row items-center text-sm ${className}`}
      disabled={loading}
      onClick={onBtnClick}
      {...rest}
    >
      {loading && <Loading />}
      {!loading && icon && icon}
      {!loading && !icon && <Icon size={16} name={name} />}

      {
        props.children && (
          <span className="ml-1">{props.children}</span>
        )
      }
    </button>
  );
}
