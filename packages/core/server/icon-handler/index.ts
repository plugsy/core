import { readFileSync } from "fs";
import { Handler } from "express";
import { paramCase } from "change-case";
const EXAMPLES = ["@styled-icons/simple-icons/Plex"];

export const svgIconHandler: Handler = (req, res) => {
  const { iconPath } = req.params;
  let filteredIconPath = iconPath.split("/");
  if (filteredIconPath.length == 3) {
    const arr = iconPath.split("/");
    filteredIconPath = arr.slice(1, arr.length);
  }
  console.log(filteredIconPath, filteredIconPath.length);

  if (filteredIconPath.length != 2)
    return res
      .status(400)
      .json({
        message: `Invalid request URL, examples: ${EXAMPLES.join(", ")}`,
      })
      .end();

  const packageName = paramCase(filteredIconPath[0]);
  const iconName = paramCase(filteredIconPath[1]);

  const fullPackage = `@svg-icons/${packageName}/${iconName}.svg`;
  try {
    const packageLocation = require.resolve(fullPackage);
    const fileLocation = `${packageLocation}`;
    try {
      const file = readFileSync(fileLocation);
      res.set("Cache-Control", "public, max-age=31557600");
      res.status(200).type("svg").send(file);
      res.end();
    } catch (error) {
      res.status(500).json({
        message: `Couldn't read icon file.`,
        iconPath,
        filteredIconPath,
        fileLocation,
        fullPackage,
        packageName,
        iconName,
        error,
      });
    }
  } catch (error) {
    res.status(404).json({
      message: `Couldn't locate package`,
      fullPackage,
      filteredIconPath,
      iconPath,
      packageName,
      iconName,
      error,
    });
  }
};
