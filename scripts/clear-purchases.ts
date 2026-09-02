import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const projectId =
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aibflqfk'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

const client = createClient({
	projectId,
	dataset,
	apiVersion: '2024-01-01',
	useCdn: false,
	token,
})

const purchasesQuery = `*[_type == "purchase"] | order(purchaseDate asc) {
	_id,
	_rev,
	buyerEmail,
	buyerName,
	quantity,
	totalAmount,
	paypalTransactionId,
	paymentStatus,
	purchaseDate,
	notes,
	"raffleItemId": raffleItem._ref
}`

function parseArgs() {
	const args = process.argv.slice(2)
	const deleteFlag = args.includes('--delete')
	const beforeArg = args.find((arg) => arg.startsWith('--before='))
	const before = beforeArg ? beforeArg.split('=')[1] : undefined

	return { deleteFlag, before }
}

async function clearPurchases() {
	const { deleteFlag, before } = parseArgs()

	console.log('Soli Raffle — clear purchases')
	console.log(`Project: ${projectId}`)
	console.log(`Dataset: ${dataset}`)
	if (before) {
		console.log(`Filter: purchaseDate < ${before}`)
	}
	console.log(`Mode: ${deleteFlag ? 'DELETE' : 'dry run'}\n`)

	if (!token && deleteFlag) {
		console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
		process.exit(1)
	}

	const fetchClient = token
		? client
		: createClient({
				projectId,
				dataset,
				apiVersion: '2024-01-01',
				useCdn: false,
			})

	const filter = before
		? `*[_type == "purchase" && purchaseDate < "${before}"]`
		: `*[_type == "purchase"]`

	const purchases = await fetchClient.fetch<
		Array<{
			_id: string
			_rev: string
			buyerName: string
			buyerEmail: string
			purchaseDate: string
			quantity: number
			totalAmount: number
		}>
	>(`${filter} | order(purchaseDate asc) {
		_id,
		_rev,
		buyerName,
		buyerEmail,
		purchaseDate,
		quantity,
		totalAmount
	}`)

	if (purchases.length === 0) {
		console.log('No matching purchases found.')
		return
	}

	const totalTickets = purchases.reduce(
		(sum, purchase) => sum + (purchase.quantity || 0),
		0,
	)
	const totalRevenue = purchases.reduce(
		(sum, purchase) => sum + (purchase.totalAmount || 0),
		0,
	)
	const firstDate = purchases[0]?.purchaseDate
	const lastDate = purchases[purchases.length - 1]?.purchaseDate

	console.log(`Purchases: ${purchases.length}`)
	console.log(`Tickets: ${totalTickets}`)
	console.log(`Revenue: €${(totalRevenue / 100).toFixed(2)}`)
	console.log(`Date range: ${firstDate} → ${lastDate}\n`)

	if (!deleteFlag) {
		console.log('Dry run only. Re-run with --delete to remove these records.')
		console.log('Example: npm run clear:purchases -- --delete')
		return
	}

	const fullExport = await fetchClient.fetch(purchasesQuery.replace(
		'*[_type == "purchase"]',
		filter,
	))

	const backupDir = path.resolve(__dirname, '../backups')
	fs.mkdirSync(backupDir, { recursive: true })
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
	const backupPath = path.join(
		backupDir,
		`purchases-${timestamp}.json`,
	)
	fs.writeFileSync(backupPath, JSON.stringify(fullExport, null, '\t'))
	console.log(`Backup saved: ${backupPath}`)

	let deleted = 0
	for (const purchase of purchases) {
		await client.delete(purchase._id)
		deleted += 1
		process.stdout.write(`\rDeleted ${deleted}/${purchases.length}`)
	}

	console.log('\nDone.')
}

clearPurchases().catch((error: Error) => {
	console.error('Failed:', error.message)
	process.exit(1)
})
