import type {StructureResolver} from "sanity/structure";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import {CogIcon, DocumentTextIcon, PackageIcon} from "@sanity/icons";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Raffle Introduction")
        .icon(DocumentTextIcon)
        .child(
          S.document()
            .schemaType("raffleAbout")
            .documentId("raffleAbout")
            .title("Raffle Introduction"),
        ),
      S.divider(),
      orderableDocumentListDeskItem({
        type: "raffleItem",
        title: "Raffle Items (drag to reorder)",
        icon: PackageIcon,
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          !["raffleAbout", "raffleItem", "siteSettings"].includes(
            item.getId() ?? "",
          ),
      ),
    ]);
