/* eslint-disable react/react-in-jsx-scope */
import React from 'react';
import { SVGProps } from 'react';
import './svg-icons-register';
interface IProps {
  width?: number;
  height?: number;
  name: string;
  prefix?: string;
}

function containsEmoji(str: string) {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
  return emojiRegex.test(str);
}

const SvgIcon: React.FC<SVGProps<SVGSVGElement> & IProps> = ({
  name,
  width,
  height,
  prefix = 'icon',
  ...props
}) => {
  if (containsEmoji(name)) {
    return <span
      style={{
        fill: 'currentColor',
        overflow: 'hidden',
        ...props.style,
      }}
    >{name}</span>;
  }

  const symbolId = `#${prefix}-${name}`;

  return (
    <svg
      {...props}
      aria-hidden="true"
      style={{
        width: width || '1em',
        height: height || '1em',
        verticalAlign: '-0.15em',
        fill: 'currentColor',
        overflow: 'hidden',
        ...props.style,
      }}
    >
      <use xlinkHref={symbolId} />
    </svg>
  );
};

export default SvgIcon;
