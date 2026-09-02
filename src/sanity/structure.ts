import type {StructureResolver} from "sanity/structure";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Raffle Introduction")
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
        S,
        context,
      }),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !["raffleAbout", "raffleItem"].includes(item.getId() ?? ""),
      ),
    ]);
