import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "default",
  title: "Soli Raffle",
  projectId: "aibflqfk",
  dataset: "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
