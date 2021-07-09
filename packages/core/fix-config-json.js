const fs = require("fs");
const filePath = process.argv.slice(2).join(" ");
if (!filePath) throw new Error("Please provide a file path");
console.log(`config-json-schema fixer running for file: [${filePath}]`);
const configSchemaBuffer = fs.readFileSync(filePath);

const newConfigSchema = JSON.stringify(
  JSON.parse(configSchemaBuffer.toString("utf-8"))
);

// const regex =
//   '\\{\\s*"allOf":\\s*\\[\\s*\\{\\s*"properties":\\s*\\{\\s*\\},\\s*"type":\\s*"object"\\s*\\},\\s*\\{\\s*"type":\\s*"string"\\s*\\}\\s*\\]s*\\}';
const regex =
  '\\{"allOf":\\[\\{"properties":\\{\\},"type":"object"\\},\\{"type":"string"\\}\\]\\}';
const regexp = new RegExp(regex, "g");
const matches = newConfigSchema.match(regexp)?.length;
if (!matches) {
  console.log("No matches found... Skipping...");
  return;
}
console.log(`Found ${matches} matches, replacing...`);
fs.writeFileSync(
  filePath,
  JSON.stringify(
    JSON.parse(newConfigSchema.replace(regexp, '{"type":"string"}')),
    null,
    4
  )
);
