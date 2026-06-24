# Sawyer Camp Registration Service Tests

Comprehensive integration tests for Sawyer - Planet Nine's camp and class registration service.

## Overview

These tests validate the complete camp registration workflow including:
- Service health and availability
- Class listings with enrollment tracking
- Registration form processing
- Document signing with sessionless authentication
- Roster management
- Communication blasts
- Admin verification with galactic nineum
- Data integrity

## Test Coverage

### Service Health (2 tests)
- ✅ Health check endpoint
- ✅ Static file serving

### Class Listings (4 tests)
- ✅ List all available classes
- ✅ Enrollment calculations
- ✅ Retrieve specific class by ID
- ✅ Handle non-existent classes

### Registration Flow (4 tests)
- ✅ Register participant for class
- ✅ Reject incomplete registrations
- ✅ Increment enrollment count
- ✅ Store registration in BDO

### Document Signing (4 tests)
- ✅ Retrieve required documents
- ✅ Sign document with sessionless signature
- ✅ Reject invalid signatures
- ✅ Track document signing status

### Roster Management (3 tests)
- ✅ Retrieve class roster
- ✅ Include medical information
- ✅ Include emergency contacts

### Communication Blasts (2 tests)
- ✅ Send communication blast
- ✅ Validate blast requirements

### Admin Verification (2 tests)
- ✅ Require galactic nineum for admin access
- ✅ Reject invalid admin signatures

### Data Integrity (2 tests)
- ✅ Maintain participant data integrity
- ✅ Calculate participant ages correctly

**Total: 23 comprehensive tests**

## Running the Tests

### Prerequisites
1. **Start Docker allyabase** (Base 1):
```bash
cd /path/to/allyabase/deployment/docker
./spin-up-bases.sh --bases=1
```

2. **Start Sawyer**:
```bash
cd /path/to/sawyer
npm start
```

### All Sawyer Tests
```bash
cd /path/to/sharon
npm run test:sawyer
```

Tests automatically use Docker proxy (Base 1 on port 5124):
- All services accessed via `/plugin/allyabase/{service}` paths
- BDO: `http://localhost:5124/plugin/allyabase/bdo`
- Sanora: `http://localhost:5124/plugin/allyabase/sanora`
- Fount: `http://localhost:5124/plugin/allyabase/fount`
- Minnie: `http://localhost:5124/plugin/allyabase/minnie`

To use a different base or proxy port:
```bash
PROXY_BASE_URL=http://localhost:5224 npm run test:sawyer  # Use Base 2
```

## Requirements

### Docker Services (**REQUIRED**)

⚠️ **NO MOCKING POLICY**: Pentaur follows Planet Nine's central development commandment - no mocking in code. Tests **must** have real services running or they will fail with clear error messages.

Tests require Docker allyabase proxy to access all services:
- **Proxy** on port 5126 (Base 1) - routes to all services
- **BDO** - accessed via `/plugin/allyabase/bdo` (storage)
- **Sanora** - accessed via `/plugin/allyabase/sanora` (class data)
- **Fount** - accessed via `/plugin/allyabase/fount` (admin verification)
- **Minnie** - accessed via `/plugin/allyabase/minnie` (email blasts)

**Start Docker services before running tests**:
```bash
cd /path/to/allyabase/deployment/docker
./spin-up-bases.sh --bases=1
```

The proxy automatically starts on port 5126 and routes wiki-style paths to services.

### Data Source
Tests use **real Sanora product data** from the Docker environment. If services are unavailable, tests will fail with 503 errors indicating exactly which service is missing and how to start it.

## Test Flow

The tests execute in order and build upon each other:

1. **Health Check** - Verify Sawyer is running
2. **Class Listings** - Verify classes are available
3. **Registration** - Create a test registration
4. **Documents** - Sign required documents
5. **Roster** - Verify registration appears in roster
6. **Blasts** - Send communication to participants
7. **Admin** - Test admin verification
8. **Integrity** - Verify data consistency

## Test Data

### Test Participant
- **Name**: Alice Smith
- **DOB**: April 12, 2015 (age 10)
- **Allergies**: Peanuts
- **Medications**: EpiPen

### Test Guardian
- **Name**: Bob Smith
- **Email**: bob.smith@example.com
- **Phone**: 555-0101
- **Address**: 123 Main St, Springfield, IL 62701

### Emergency Contact
- **Name**: Bob Smith
- **Phone**: 555-0101
- **Relationship**: Father

## Expected Output

```
Sawyer Camp Registration Service Tests

  Service Health
    ✅ Sawyer service healthy (v1.0.0)
    ✅ Static file serving working

  Class Listings
    ✅ Found 3 classes
    ✅ Enrollment calculations correct
    ✅ Retrieved class: Summer Adventure Camp 2025
       Enrolled: 1/20
    ✅ Non-existent class handling correct

  Registration Flow
    ✅ Registration created: abc123-uuid-here
       Status: unpaid
       Class: Summer Adventure Camp 2025
    ✅ Incomplete registration rejected
    ✅ Enrollment count updated: 1
    ✅ Registration stored in BDO

  Document Signing
    ✅ Retrieved 3 required documents
       - Liability Waiver (Required)
       - Medical Consent Form (Required)
       - Photo/Video Release (Optional)
    ✅ Document signed: liability-waiver
       Signed document ID: def456-uuid-here
    ✅ Invalid signature rejected
    ✅ Signed documents tracked: 1/3

  Roster Management
    ✅ Roster retrieved: 1 participants
       First participant: Alice Smith
    ✅ Medical information included in roster
    ✅ Emergency contacts included in roster

  Communication Blasts
    ✅ Communication blast sent: 1/1 emails
    ✅ Blast validation working

  Admin Verification
    ✅ Admin verification requires galactic nineum
    ✅ Invalid admin signature rejected

  Data Integrity
    ✅ Participant data integrity maintained
    ✅ Age calculations correct

🏕️  SAWYER CAMP REGISTRATION TESTS COMPLETE
===========================================
✅ Service health verified
✅ Class listings functional
✅ Registration flow working
✅ Document signing operational
✅ Roster management functional
✅ Communication blasts working
✅ Admin verification tested
✅ Data integrity confirmed

📝 Test registration ID: abc123-uuid-here

  23 passing (15s)
```

## Troubleshooting

### Tests Failing with 503 Service Unavailable Errors
This is the expected behavior when Docker services aren't running. The error message will tell you:
- **Which service is missing** (Sanora, BDO, Minnie, or Fount)
- **The exact URL** where it's trying to connect
- **How to fix it**: Start Docker allyabase services

**Example error**:
```json
{
  "success": false,
  "error": "Sanora service unavailable",
  "details": "Cannot connect to Sanora at http://localhost:5126/plugin/allyabase/sanora. Please ensure Docker allyabase services are running.",
  "serviceUrl": "http://localhost:5126/plugin/allyabase/sanora"
}
```

**Solution**:
```bash
cd /path/to/allyabase/deployment/docker
./spin-up-bases.sh --bases=1
```

### Tests Failing with Connection Errors
- Verify Pentaur is running: `curl http://localhost:3013/health`
- Check Pentaur logs for startup errors
- Ensure port 3013 is not in use by another process

### Registration Tests Failing
- Verify Docker allyabase is running (see above)
- Check BDO service is accessible via proxy
- Verify sessionless-node dependency is installed

### Document Signing Tests Failing
- Ensure sessionless authentication is working
- Check that document templates exist in server.js
- Verify BDO can store signed documents

### Communication Blast Tests Failing
- Verify Minnie is running: `curl http://localhost:2525/health`
- Check Minnie email configuration
- Ensure guardian email addresses are valid

### Admin Verification Always Failing
- This is expected unless you have a user with galactic nineum
- The test verifies rejection works correctly
- To test admin approval, grant galactic nineum via Fount

## Integration with Other Services

Sawyer integrates with:
- **BDO**: Registration and document storage (hash: `Sawyer-Enrollment`, `Sawyer-SignedDocument`)
- **Fount**: Admin verification via galactic nineum balance
- **Minnie**: Email confirmations and communication blasts
- **Addie**: Payment processing (not yet tested)
- **Sanora**: Class listings (fallback to mock data in tests)
- **Joan**: User authentication (not yet tested)

## Future Test Enhancements

Planned additions:
- [ ] Payment processing tests (Stripe via Addie)
- [ ] Joan authentication flow tests
- [ ] Sanora integration tests (real product data)
- [ ] Payment plan tests
- [ ] Refund processing tests
- [ ] Waiting list tests
- [ ] Multi-class registration tests
- [ ] Calendar integration tests

## Last Updated
December 12, 2025 - Initial comprehensive test suite created with 23 tests covering core Sawyer functionality.
