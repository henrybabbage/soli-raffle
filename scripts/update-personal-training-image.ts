#!/usr/bin/env tsx

/**
 * Uploads the Personal Training Session photo and patches the Sanity document.
 * Requires SANITY_API_WRITE_TOKEN in .env.local
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aibflqfk'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const DOCUMENT_ID = 'eknesC02warlyjGQfJxGR9'
const IMAGE_PATH = path.resolve(
	process.cwd(),
	process.env.PERSONAL_TRAINING_IMAGE_PATH ||
		'public/images/4_.jpg'
)

const client = createClient({
	projectId: PROJECT_ID,
	dataset: DATASET,
	apiVersion: '2024-01-01',
	useCdn: false,
	token: process.env.SANITY_API_WRITE_TOKEN,
})

async function updatePersonalTrainingImage() {
	if (!process.env.SANITY_API_WRITE_TOKEN) {
		console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
		process.exit(1)
	}

	if (!fs.existsSync(IMAGE_PATH)) {
		console.error(`Image not found: ${IMAGE_PATH}`)
		process.exit(1)
	}

	console.log(`Uploading image: ${IMAGE_PATH}`)
	const asset = await client.assets.upload('image', fs.createReadStream(IMAGE_PATH), {
		filename: path.basename(IMAGE_PATH),
	})

	console.log(`Patching document: ${DOCUMENT_ID}`)
	await client
		.patch(DOCUMENT_ID)
		.set({
			image: {
				_type: 'image',
				asset: {
					_type: 'reference',
					_ref: asset._id,
				},
			},
		})
		.commit()

	console.log('Personal Training Session image updated successfully.')
	console.log(`Asset URL: ${asset.url}`)
}

updatePersonalTrainingImage().catch((error: Error) => {
	console.error('Failed to update Personal Training Session image:', error.message)
	process.exit(1)
})
