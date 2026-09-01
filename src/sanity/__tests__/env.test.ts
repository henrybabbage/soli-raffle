const DEFAULT_SANITY_DATASET = 'production'
const DEFAULT_SANITY_PROJECT_ID = 'aibflqfk'
const CUSTOM_SANITY_DATASET = 'staging'
const CUSTOM_SANITY_PROJECT_ID = 'customprojectid'

describe('sanity public env defaults', () => {
  const originalDataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const originalProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

  afterEach(() => {
    process.env.NEXT_PUBLIC_SANITY_DATASET = originalDataset
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = originalProjectId
    jest.resetModules()
  })

  it('uses the documented production project when env vars are unset', async () => {
    delete process.env.NEXT_PUBLIC_SANITY_DATASET
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    jest.resetModules()

    const env = await import('../env')

    expect(env.dataset).toBe(DEFAULT_SANITY_DATASET)
    expect(env.projectId).toBe(DEFAULT_SANITY_PROJECT_ID)
  })

  it('prefers explicitly configured Sanity env vars', async () => {
    process.env.NEXT_PUBLIC_SANITY_DATASET = CUSTOM_SANITY_DATASET
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = CUSTOM_SANITY_PROJECT_ID
    jest.resetModules()

    const env = await import('../env')

    expect(env.dataset).toBe(CUSTOM_SANITY_DATASET)
    expect(env.projectId).toBe(CUSTOM_SANITY_PROJECT_ID)
  })
})
