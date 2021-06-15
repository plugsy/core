const path = require("path");
const fs = require("fs");
const TO_FOLDER = `./client/components/icons`;

const location = `./node_modules/`;
const package = "@react-icons/all-files";

try {
  console.warn("CLEANING ICON FILES...");
  fs.rmdirSync(TO_FOLDER, { recursive: true });
  fs.mkdirSync(TO_FOLDER);
} catch (error) {
  console.error(error);
}

if (process.env.NODE_ENV !== "production") {
  console.warn("-------------- GENERATING DEV ICONS --------------");
  const indexFileContent = `import type { IconBaseProps } from "@react-icons/all-files";
import { FiAlertTriangle } from "@react-icons/all-files/fi/FiAlertTriangle";

import React from "react";

export interface DynamicIconProps extends IconBaseProps {
  iconPack: string;
  icon: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  iconPack,
  ...props
}) => {
  return <FiAlertTriangle {...props} />;
};
  `;
  fs.writeFileSync(path.join(TO_FOLDER, `index.tsx`), indexFileContent, {
    encoding: "utf8",
    flag: "w",
  });
  return;
}
const fullLocation = path.dirname(require.resolve('@react-icons/all-files'));
console.log(fullLocation);

const files = fs.readdirSync(fullLocation);

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((dirName) => {
      switch (dirName) {
        case "lib":
          return false;
        default:
          return true;
      }
    });

const iconPackNames = getDirectories(fullLocation);

const iconPacks = iconPackNames.map((dir) => {
  const files = fs
    .readdirSync(path.join(fullLocation, dir))
    .filter((file) => file.indexOf(".d.ts") > -1);
  const casingDedupedFiles = files.reduce((result, element) => {
    const normalizedElement = element.toLowerCase();
    if (
      result.every(
        (otherElement) => otherElement.toLowerCase() !== normalizedElement
      )
    )
      result.push(element);
    return result;
  }, []);

  const fileContent =
    casingDedupedFiles.reduce(
      (acc, file) => {
        const fileName = file.split(".d.ts")[0];
        return `${acc}
  ${fileName}: dynamic(() => import("${package}/${dir}/${fileName}").then(mod => mod.${fileName})),`;
      },
      `
import type { IconBaseProps } from "@react-icons/all-files";
import dynamic from "next/dynamic";
import React, { ComponentType } from "react";

export interface IconPackProps extends IconBaseProps {
  icon: string;
}

export const IconPack: React.FC<IconPackProps> = ({ icon, ...props }) => {
  const Icon = dynamicIcons[icon];
  return <Icon {...props} />;
};

export const dynamicIcons: { [key: string]: ComponentType<IconBaseProps> } = {`
    ) +
    `
}`;
  return {
    fileContent,
    packName: dir,
  };
});

iconPacks.forEach(({ packName, fileContent }) => {
  fs.writeFileSync(path.join(TO_FOLDER, `${packName}.tsx`), fileContent, {
    encoding: "utf8",
    flag: "w",
  });
});

const indexFileContent =
  iconPackNames.reduce(
    (acc, fileName) => {
      return `${acc}
  ${fileName}: dynamic(() => import("./${fileName}").then(mod => mod.IconPack)),`;
    },
    `import dynamic from "next/dynamic";
import type { IconBaseProps } from "@react-icons/all-files";

import React from "react";

export interface DynamicIconProps extends IconBaseProps {
  iconPack: string;
  icon: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ iconPack, ...props }) => {
  const IconPack = dynamicIconPacks[iconPack];
  return <IconPack {...props} />;
};

const dynamicIconPacks: {
  [key: string]: React.ComponentType<{ icon: string } & IconBaseProps>;
} = {`
  ) +
  `
}`;

fs.writeFileSync(path.join(TO_FOLDER, `index.tsx`), indexFileContent, {
  encoding: "utf8",
  flag: "w",
});
