declare module "*.graphql" {
    import { DocumentNode } from "graphql";
    export default typeof DocumentNode;
  }
  