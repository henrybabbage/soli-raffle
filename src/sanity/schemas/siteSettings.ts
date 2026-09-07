/* eslint-disable @typescript-eslint/no-explicit-any */

const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    {
      name: "bannerText",
      title: "Banner Text",
      description:
        "Shown in the banner at the very top of the site. Leave empty to hide the banner.",
      type: "string",
      initialValue: "Raffle on until 1st October",
    },
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
};

export default siteSettings;
