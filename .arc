@app
testapp

@tables
hashids
  id *String

accounts
  id *String

accounts-identities
  accountID *String

accounts-verify-tokens
  id *String
  ttl TTL

accounts-password-reset-tokens
  id *String
  ttl TTL
