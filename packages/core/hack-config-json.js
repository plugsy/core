const fs = require("fs");

const configSchemaBuffer = fs.readFileSync("./server/config-schema.before.json");

const newConfigSchema = JSON.stringify(
  JSON.parse(configSchemaBuffer.toString("utf-8"))
);

// const regex =
//   '\\{\\s*"allOf":\\s*\\[\\s*\\{\\s*"properties":\\s*\\{\\s*\\},\\s*"type":\\s*"object"\\s*\\},\\s*\\{\\s*"type":\\s*"string"\\s*\\}\\s*\\]s*\\}';
const regex =
  '\\{"allOf":\\[\\{"properties":\\{\\},"type":"object"\\},\\{"type":"string"\\}\\]\\}';
const regexp = new RegExp(regex, "g");

console.log("found", newConfigSchema.match(regexp).length);
fs.writeFileSync(
  "./server/config-schema.json",
  JSON.stringify(
    JSON.parse(newConfigSchema.replace(regexp, '{"type":"string"}')),
    null,
    4
  )
);
