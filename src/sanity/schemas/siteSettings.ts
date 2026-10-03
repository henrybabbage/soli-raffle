import { BellIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const banner = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  icon: BellIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Banner",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "bannerText",
      title: "Banner Text",
      description:
        "Shown in the banner at the very top of the site. Leave empty to hide the banner.",
      type: "string",
      initialValue:
        "The raffle has concluded. Winners will be drawn and contacted soon.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Banner" }),
  },
});

export default banner;
