import Image from "next/image";
import React from "react";

interface PayPalIconProps
  extends Omit<
    React.ComponentPropsWithoutRef<"img">,
    "src" | "alt" | "width" | "height"
  > {
  width?: number;
  height?: number;
}

export function PayPalIcon({
  width = 24,
  height = 24,
  ...props
}: PayPalIconProps) {
  return (
    <Image
      src="/paypal.svg"
      alt="PayPal"
      width={width}
      height={height}
      {...props}
    />
  );
}
