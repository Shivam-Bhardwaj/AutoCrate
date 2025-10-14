# AutoCrate Security Documentation

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication System](#authentication-system)
3. [API Security](#api-security)
4. [Input Validation](#input-validation)
5. [Security Headers](#security-headers)
6. [Rate Limiting](#rate-limiting)
7. [Environment Configuration](#environment-configuration)
8. [Security Best Practices](#security-best-practices)
9. [Vulnerability Reporting](#vulnerability-reporting)
10. [Security Audit History](#security-audit-history)

## Security Overview

AutoCrate implements a comprehensive security architecture designed to protect against common web application vulnerabilities while maintaining usability and performance.

### Security Stack

- **Authentication**: JWT-based server-side authentication with bcrypt password hashing
- **Rate Limiting**: Configurable per-endpoint rate limiting to prevent abuse
- **Input Validation**: Comprehensive server-side validation and sanitization
- **Security Headers**: Defense-in-depth HTTP security headers
- **HTTPS Only**: Strict Transport Security enforced in production
- **No Database**: Stateless architecture eliminates SQL injection risks

## Authentication System

### Server-Side Authentication

AutoCrate uses secure server-side authentication for protected routes (`/console` and `/terminal`).

#### Implementation Details

- **Password Storage**: Bcrypt hashed passwords stored in environment variables
- **Token Generation**: JWT tokens with expiration and IP verification
- **Cookie Security**: HttpOnly, Secure, SameSite cookies prevent XSS attacks
- **Session Management**: Server-side session validation on each request

#### Configuration

```bash
# Generate password hash
node -e "console.log(require('bcryptjs').hashSync('your-secure-password', 10))"

# Add to .env.local
CONSOLE_PASSWORD_HASH=$2a$10$your_hash_here
TERMINAL_PASSWORD_HASH=$2a$10$your_hash_here
JWT_SECRET=your-secure-random-string
```

#### API Endpoints

- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/verify` - Verify authentication status
- `POST /api/auth/logout` - Clear authentication cookie

## API Security

### Protected Endpoints

All API routes implement:

1. **Rate Limiting**: Prevents DoS attacks
2. **Input Validation**: Sanitizes and validates all inputs
3. **Error Handling**: Generic error messages prevent information leakage
4. **CORS Protection**: Same-origin policy by default

### API Rate Limits

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| Authentication | 5 requests | 15 minutes | Prevent brute force |
| General API | 30 requests | 1 minute | Normal operations |
| Heavy Operations | 5 requests | 5 minutes | Resource-intensive tasks |

### Example API Implementation

```typescript
// Protected API route with validation and rate limiting
export async function POST(request: NextRequest) {
  return apiRateLimit(request, async (req) => {
    const body = await req.json()

    // Validate inputs
    const validated = validateRequestBody(body, {
      dimensions: validateDimensions,
      weight: validateWeight
    })

    // Process request...
  })
}
```

## Input Validation

### Validation Library

Located at `src/lib/input-validation.ts`, provides:

- **Type Validation**: Ensures correct data types
- **Range Checking**: Validates numeric ranges
- **String Sanitization**: Removes XSS payloads
- **Object Sanitization**: Prevents prototype pollution
- **Custom Validators**: Domain-specific validation logic

### Validation Functions

```typescript
// Dimension validation (1-10000mm range)
validateDimensions(input)

// Weight validation (0.1-100000kg)
validateWeight(input)

// String sanitization (XSS prevention)
sanitizeString(input, maxLength)

// Enum validation
validateEnum(value, field, allowedValues)

// Email validation
validateEmail(email)

// URL validation (blocks local/private IPs)
validateUrl(url)
```

### Common Attack Prevention

- **XSS**: HTML tags and JavaScript removed from strings
- **SQL Injection**: No database = no SQL injection risk
- **Command Injection**: No user input in system commands
- **Path Traversal**: File operations use validated paths only
- **Prototype Pollution**: Object keys sanitized and filtered

## Security Headers

### Middleware Headers

Applied via `src/middleware.ts`:

```typescript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Content Security Policy

Production CSP configuration:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
```

## Rate Limiting

### Implementation

Rate limiting uses an in-memory store (upgradeable to Redis):

```typescript
// Authentication endpoints (strict)
authRateLimit: 5 requests per 15 minutes

// General API endpoints
apiRateLimit: 30 requests per minute

// Heavy operations (STEP export)
heavyRateLimit: 5 requests per 5 minutes
```

### Headers

Rate limit information in response headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 60 (on 429 responses)
```

## Environment Configuration

### Required Variables

```bash
# Authentication (REQUIRED)
JWT_SECRET=<strong-random-string>
CONSOLE_PASSWORD_HASH=<bcrypt-hash>
TERMINAL_PASSWORD_HASH=<bcrypt-hash>

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Security Guidelines

1. **Never commit .env files** - Use .env.example as template
2. **Use strong passwords** - Minimum 16 characters
3. **Rotate secrets regularly** - Every 90 days
4. **Different passwords per environment** - Dev/Staging/Production
5. **Monitor failed authentications** - Check logs for attacks

## Security Best Practices

### Development

1. **Dependency Management**
   - Run `npm audit` before each deployment
   - Keep dependencies updated
   - Review dependency licenses

2. **Code Review**
   - Security review for auth changes
   - Validate all user inputs
   - Avoid eval() and dynamic code execution

3. **Testing**
   - Include security tests in CI/CD
   - Test rate limiting
   - Verify authentication flows

### Deployment

1. **Production Checklist**
   - [ ] HTTPS enabled with valid certificate
   - [ ] Environment variables configured
   - [ ] Rate limiting active
   - [ ] Security headers verified
   - [ ] Passwords changed from defaults
   - [ ] Debug mode disabled
   - [ ] Error messages generic

2. **Monitoring**
   - Track authentication failures
   - Monitor rate limit violations
   - Review security logs
   - Set up alerts for anomalies

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **Email**: security@autocrate.com (or contact repository owner)
3. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Vulnerability assessment
- **7 days**: Fix development and testing
- **30 days**: Public disclosure (after fix deployed)

## Security Audit History

### Latest Audit (Issue #61)

**Date**: 2024

**Findings & Resolutions**:

| Finding | Severity | Status | Resolution |
|---------|----------|--------|------------|
| Client-side authentication | HIGH | ✅ FIXED | Implemented server-side JWT auth |
| Customer data in git | HIGH | ✅ FIXED | Removed files, updated .gitignore |
| No rate limiting | MEDIUM | ✅ FIXED | Added configurable rate limiters |
| Missing security headers | MEDIUM | ✅ FIXED | Added comprehensive headers |
| Limited input validation | MEDIUM | ✅ FIXED | Created validation library |
| No CORS configuration | LOW | ✅ FIXED | Configured CORS policy |

### Continuous Security Improvements

- Regular dependency updates
- Quarterly security reviews
- Automated vulnerability scanning
- Security training for contributors

## Security Contact

For security concerns, contact the repository maintainer or create a private security advisory on GitHub.

---

*Last Updated: 2024*
*Version: 1.0.0*