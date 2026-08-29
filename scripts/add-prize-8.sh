#!/usr/bin/env bash
# Adds prize 8 (Personal Coaching) to Sanity and patches prize 7 with location + validity.
# Requires a Sanity write token via SANITY_API_WRITE_TOKEN env var.
set -euo pipefail

TOKEN="${SANITY_API_WRITE_TOKEN:?Set SANITY_API_WRITE_TOKEN to a Sanity write token}"
PROJECT_ID="aibflqfk"
DATASET="production"
API_VERSION="2025-08-10"
IMAGE_PATH="${IMAGE_PATH:-/Users/henrybabbage/Downloads/rafflewebsite/8.jpeg}"
CERAMICS_ID="UdqXNQAZ9Sg10Jlhwm8tLG"

BASE="https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}"
AUTH="Authorization: Bearer ${TOKEN}"

echo "==> Uploading image: ${IMAGE_PATH}"
UPLOAD_RESP=$(curl -s -f \
  -H "${AUTH}" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@${IMAGE_PATH}" \
  "${BASE}/assets/images/${DATASET}")

ASSET_ID=$(printf '%s' "$UPLOAD_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["_id"])')
echo "    asset id: ${ASSET_ID}"

echo "==> Creating prize 8 (Personal Coaching Short Program)"
CREATE_BODY=$(cat <<JSON
{
  "mutations": [
    {
      "create": {
        "_type": "raffleItem",
        "title": "Personal Coaching Short Program (4-6 sessions)",
        "description": "A personal coaching short program (4-6 sessions) to help you develop personally and find your way through moments of feeling stuck.",
        "instructor": "Rafael has a background in Psychosocial Communication Science and has worked for over ten years as a publicist, moving between culture and fashion. He has a strong personal interest in human rights, environmental, and queer advocacy. He recently completed a professional diploma in Coaching and Mentoring, aimed at helping individuals develop personally and find their way through moments of feeling stuck.",
        "details": "Personal Coaching Short Program (4-6 sessions). Rafael offers a supportive space to help you develop personally and find your way through moments of feeling stuck, drawing on his background in Psychosocial Communication Science and a professional diploma in Coaching and Mentoring.",
        "value": "280-420€",
        "validity": "6 months",
        "contact": [
          { "label": "Instagram", "href": "https://www.instagram.com/rafi__srg/" }
        ],
        "image": {
          "_type": "image",
          "asset": { "_type": "reference", "_ref": "${ASSET_ID}" }
        },
        "isActive": true,
        "order": 8,
        "slug": { "_type": "slug", "current": "personal-coaching-short-program" }
      }
    }
  ]
}
JSON
)
curl -s -f -H "${AUTH}" -H "Content-Type: application/json" \
  -d "${CREATE_BODY}" "${BASE}/data/mutate/${DATASET}" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("    created:", d["results"][0]["id"])'

echo "==> Patching prize 7 (ceramics) with location + validity"
PATCH_BODY=$(cat <<JSON
{
  "mutations": [
    {
      "patch": {
        "id": "${CERAMICS_ID}",
        "set": {
          "location": "Ceramic Kingdom in Neukölln",
          "validity": "6 months"
        }
      }
    }
  ]
}
JSON
)
curl -s -f -H "${AUTH}" -H "Content-Type: application/json" \
  -d "${PATCH_BODY}" "${BASE}/data/mutate/${DATASET}" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("    patched:", d["results"][0]["id"])'

echo "Done."
