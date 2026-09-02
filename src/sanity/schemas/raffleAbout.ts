import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "raffleAbout",
  title: "Raffle Introduction",
  type: "document",
  icon: DocumentTextIcon,
  initialValue: {
    fundraisingDetails:
      "This online raffle is raising funds for families in Gaza to help meet basic needs, including food, shelter, clothing, medicine, and hygiene products. Our goal is to raise 500€ for each of three families, for a total of 1.500€. Any additional funds raised will be distributed in 50-100€ amounts to support other families.",
    contactIntroduction:
      "If you would like to learn more about the families receiving the funds, please email Lilith at",
    contactEmail: "lilith.spink@proton.me",
    entryInstructions:
      "To enter the raffle, simply select the ticket below the prize(s) you would like to win and purchase as many entries as you wish. Each ticket costs 10€, with payment via PayPal.",
    drawIntroduction: "The winners will be drawn live on Lilith's Instagram",
    instagramHandle: "lilith__llllllll",
    instagramUrl: "https://www.instagram.com/lilith__llllllll/",
    drawConclusion: "on the 1st October using an online random name selector.",
    closingMessage: "Good luck!",
  },
  fields: [
    defineField({
      name: "fundraisingDetails",
      title: "Fundraising details",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactIntroduction",
      title: "Contact introduction",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "entryInstructions",
      title: "How to enter",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "drawIntroduction",
      title: "Winner announcement introduction",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram handle",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "drawConclusion",
      title: "Winner announcement conclusion",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "closingMessage",
      title: "Closing message",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});
