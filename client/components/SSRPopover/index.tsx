import React from "react";

import { Popover, PopoverProps } from "react-tiny-popover";

export const SSRPopover: React.FC<PopoverProps> = ({ children, ...props }) => {
  return typeof window === "undefined" ? (
    children
  ) : (
    <Popover {...props}>{children}</Popover>
  );
};
