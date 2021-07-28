import SVG, { Props as SVGProps } from "react-inlinesvg";

import React, { useEffect, useState } from "react";

export interface DynamicIconProps extends Omit<SVGProps, "src"> {
  icon: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon,
  width,
  height,
  ...props
}) => {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [icon]);
  return !error ? (
    <SVG
      width={width}
      height={height}
      src={`/icons/${icon}`}
      loader={<div style={{ width, height }} />}
      onError={() => setError(true)}
      {...props}
    />
  ) : (
    <SVG
      width={width}
      height={height}
      src={`/icons/@styled-icons/fluentui-system-regular/DocumentError`}
      loader={<div style={{ width, height }} />}
      {...props}
    />
  );
};

export const staticIcon =
  (icon: string): React.FC<Omit<DynamicIconProps, "icon">> =>
  (props) =>
    <DynamicIcon icon={icon} {...props} />;
