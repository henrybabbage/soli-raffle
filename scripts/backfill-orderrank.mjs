import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { LexoRank } = require("lexorank");

const TOKEN = process.env.SANITY_WRITE_TOKEN;
const PROJECT = "aibflqfk";
const DATASET = "production";
const API = `https://${PROJECT}.api.sanity.io/v2021-06-07/data/mutate/${DATASET}`;

if (!TOKEN) {
  console.error("Set SANITY_WRITE_TOKEN env var");
  process.exit(1);
}

const query = encodeURIComponent(
  `*[_type == "raffleItem"] | order(order asc) {_id, order, isActive}`
);
const res = await fetch(
  `https://${PROJECT}.api.sanity.io/v2021-06-07/data/query/${DATASET}?query=${query}`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const { result } = await res.json();

const sorted = [...result].sort(
  (a, b) => a.order - b.order || a._id.localeCompare(b._id)
);

let rank = LexoRank.min();
const patches = sorted.map((doc) => {
  rank = rank.genNext().genNext();
  return { id: doc._id, set: { orderRank: rank.toString() } };
});

const body = {
  mutations: patches.map((p) => ({ patch: p })),
};

const mutateRes = await fetch(API, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
  body: JSON.stringify(body),
});

const text = await mutateRes.text();
console.log("mutate status:", mutateRes.status);
console.log(text);

const orderRankValues = patches.map((p) => p.set.orderRank);
console.log("assigned ranks (first 3 / last 3):");
console.log(orderRankValues.slice(0, 3));
console.log(orderRankValues.slice(-3));
