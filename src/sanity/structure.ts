import type {StructureResolver} from "sanity/structure";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      orderableDocumentListDeskItem({
        type: "raffleItem",
        title: "Raffle Items (drag to reorder)",
        S,
        context,
      }),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== "raffleItem",
      ),
    ]);
