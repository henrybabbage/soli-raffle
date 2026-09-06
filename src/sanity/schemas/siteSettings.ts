import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "bannerText",
      title: "Banner Text",
      description:
        "Shown in the banner at the very top of the site. Leave empty to hide the banner.",
      type: "string",
      initialValue: "Raffle on until 1st October",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
