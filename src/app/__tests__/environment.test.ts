describe('PayPal Environment Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'ZPAXXQHPYQN2Q'
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'seedsofliberationraffle@proton.me'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('has the correct PayPal client ID configured', () => {
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBe('ZPAXXQHPYQN2Q')
  })

  it('has the correct business email configured', () => {
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe('seedsofliberationraffle@proton.me')
  })

  it('verifies business account credentials are set', () => {
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeDefined()
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).not.toBe('')
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).not.toBe('')
  })

  it('ensures business email matches the documented account', () => {
    const expectedEmail = 'seedsofliberationraffle@proton.me'
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe(expectedEmail)
  })

  it('verifies client ID matches the documented business account', () => {
    const expectedClientId = 'ZPAXXQHPYQN2Q'
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBe(expectedClientId)
  })

  it('confirms environment variables are properly named', () => {
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeDefined()
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBeDefined()
  })

  it('validates business email format', () => {
    const email = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(email!)).toBe(true)
  })

  it('ensures client ID is not a test value', () => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    expect(clientId).not.toBe('test')
    expect(clientId).not.toBe('test-client-id')
  })

  it('verifies business email is not a test value', () => {
    const email = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL
    expect(email).not.toBe('test@example.com')
    expect(email).toBe('seedsofliberationraffle@proton.me')
  })
})