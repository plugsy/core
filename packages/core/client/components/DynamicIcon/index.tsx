import SVG, { Props as SVGProps } from "react-inlinesvg";

import React from "react";

export interface DynamicIconProps extends Omit<SVGProps, "src"> {
  icon: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon,
  width,
  height,
  ...props
}) => {
  return (
    <SVG
      width={width}
      height={height}
      src={`/icons/${icon}`}
      loader={<div style={{ width, height }} />}
      onError={console.log}
      {...props}
    />
  );
};

export const staticIcon =
  (icon: string): React.FC<Omit<DynamicIconProps, "icon">> =>
  (props) =>
    <DynamicIcon icon={icon} {...props} />;
