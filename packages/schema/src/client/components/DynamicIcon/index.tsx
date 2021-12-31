import SVG, { Props as SVGProps } from "react-inlinesvg";
// We're using react-inlinesvg as the SVGs coming from '@svg-icons' is broken

import React, { useCallback, useEffect, useMemo, useState } from "react";

export interface DynamicIconProps extends Omit<SVGProps, "src" | "onError"> {
  icon: string;
}

export const DynamicImage: React.FC<
  DynamicIconProps & { onError: () => void }
> = ({ icon, onError, width, height }) => {
  return <img src={icon} width={width} height={height} onError={onError} />;
};

export const DynamicSVG: React.FC<DynamicIconProps & { onError: () => void }> =
  ({ icon, width, height, onError, ...props }) => {
    return (
      <SVG
        width={width}
        height={height}
        src={icon.startsWith('http') ? icon : `/icons/${icon}`}
        loader={<div style={{ width, height }} />}
        onError={onError}
        {...props}
      />
    );
  };

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon,
  width,
  height,
  ...props
}) => {
  const [error, setError] = useState(false);
  useEffect(() => setError(false), [icon]);
  const onError = useCallback(() => setError(true), []);
  const Component = useMemo(
    () =>
      icon.startsWith("http") && !icon.endsWith(".svg")
        ? DynamicImage
        : DynamicSVG,
    [icon]
  );
  return !error ? (
    <Component
      icon={icon}
      width={width}
      height={height}
      onError={onError}
      {...props}
    />
  ) : (
    <SVG
      width={width}
      height={height}
      src={`/icons/@svg-icons/fluentui-system-regular/DocumentError`}
      loader={<div style={{ width, height }} />}
      onError={() =>
        console.error(
          "Unable to load @svg-icons/fluentui-system-regular/DocumentError icon"
        )
      }
      {...props}
    />
  );
};

export const staticIcon =
  (icon: string): React.FC<Omit<DynamicIconProps, "icon">> =>
  (props) =>
    <DynamicIcon icon={icon} {...props} />;
