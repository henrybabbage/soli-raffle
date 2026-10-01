import type {StructureResolver} from "sanity/structure";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import {
	BellIcon,
	DocumentTextIcon,
	PackageIcon,
	UsersIcon,
} from "@sanity/icons";

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
			S.listItem()
				.title("Banner")
				.id("banner")
				.icon(BellIcon)
				.child(
					S.document()
						.schemaType("banner")
						.documentId("banner")
						.title("Banner"),
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
				.title("Purchases")
				.icon(UsersIcon)
				.child(
					S.documentTypeList("purchase")
						.title("Purchases")
						.defaultOrdering([
							{field: "purchaseDate", direction: "desc"},
						]),
				),
			S.divider(),
			...S.documentTypeListItems().filter(
				(item) =>
					![
						"raffleAbout",
						"raffleItem",
						"banner",
						"purchase",
					].includes(item.getId() ?? ""),
			),
		]);
