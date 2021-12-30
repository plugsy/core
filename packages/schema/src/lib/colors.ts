function pad(number: string, length: number) {
  let str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

type RGB = {
  red: number;
  green: number;
  blue: number;
};

function hexToRGB(colorValue: string) {
  return {
    red: parseInt(colorValue.substr(0, 2), 16),
    green: parseInt(colorValue.substr(2, 2), 16),
    blue: parseInt(colorValue.substr(4, 2), 16),
  };
}

function intToHex(rgbint: number) {
  return pad(Math.min(Math.max(Math.round(rgbint), 0), 255).toString(16), 2);
}

function rgbToHex(rgb: RGB) {
  return intToHex(rgb.red) + intToHex(rgb.green) + intToHex(rgb.blue);
}

function rgbShade(rgb: RGB, i: number) {
  return {
    red: rgb.red * (1 - 0.1 * i),
    green: rgb.green * (1 - 0.1 * i),
    blue: rgb.blue * (1 - 0.1 * i),
  };
}

function rgbTint(rgb: RGB, i: number) {
  return {
    red: rgb.red + (255 - rgb.red) * i * 0.1,
    green: rgb.green + (255 - rgb.green) * i * 0.1,
    blue: rgb.blue + (255 - rgb.blue) * i * 0.1,
  };
}

export function calculateShadesAndTints(colorValue: string) {
  const color = hexToRGB(colorValue);
  return {
    _100: rgbToHex(rgbTint(color, 8)),
    _200: rgbToHex(rgbTint(color, 6)),
    _300: rgbToHex(rgbTint(color, 4)),
    _400: rgbToHex(rgbTint(color, 2)),
    _500: colorValue,
    color: colorValue,
    _600: rgbToHex(rgbShade(color, 2)),
    _700: rgbToHex(rgbShade(color, 4)),
    _800: rgbToHex(rgbShade(color, 6)),
    _900: rgbToHex(rgbShade(color, 8)),
  };
}
