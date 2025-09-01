# Office Nexus API Documentation

This directory contains the complete Swagger/OpenAPI specification for the Office Nexus backend API.

## Files

- **`swagger.yaml`** - Complete OpenAPI 3.0.3 specification
- **`SWAGGER_README.md`** - This file with usage instructions

## What's Included

The Swagger specification covers all major API endpoints:

### 🔐 Authentication
- User registration and login
- JWT token management
- Password reset and refresh tokens

### 👥 Users & Companies
- User profile management
- Company creation and management
- Multi-company support with role-based access

### 👷‍♀️ Employee Management
- Employee CRUD operations
- HR data management
- Company-specific employee lists

### 💰 Tax Management (Rwanda-specific)
- VAT, Corporate, Withholding, and RSSB tax types
- Tax calculation engine
- Tax return management
- Current tax rates

### 📋 Compliance & Reporting
- Regulatory compliance monitoring
- Compliance alerts and status
- Business intelligence reports
- Real-time notifications

## How to Use

### 1. View Online (Recommended)
Upload the `swagger.yaml` file to any Swagger UI viewer:

- **Swagger Editor**: https://editor.swagger.io/
- **Swagger UI**: https://petstore.swagger.io/
- **SwaggerHub**: https://app.swaggerhub.com/

### 2. Local Development
If you have Swagger tools installed locally:

```bash
# Install swagger-ui-express (if using Express)
npm install swagger-ui-express

# Or use swagger-codegen to generate client libraries
swagger-codegen generate -i swagger.yaml -l javascript
```

### 3. API Testing
Use the specification with tools like:

- **Postman** - Import the YAML file
- **Insomnia** - Import the YAML file
- **curl** - Reference the documented endpoints

## API Base URLs

- **Production**: `https://newbiceracing.onrender.com/api/v1`
- **Development**: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## Key Features

### 🏗️ Rwanda-Specific Business Logic
- Rwanda phone number validation (`+250780123456`)
- Rwanda business types (Ltd, SARL, Cooperative, etc.)
- Rwanda tax system (VAT 18%, Corporate 30%, RSSB)
- Rwanda address structure (District → Sector → Cell)

### 🔒 Security
- JWT-based authentication
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- CORS configuration for production

### 📊 Data Models
- Comprehensive schema definitions
- Validation rules and examples
- Response format standardization
- Error handling patterns

## Example Usage

### Register a New User
```bash
curl -X POST "https://newbiceracing.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "phone": "+250780123456"
  }'
```

### Create a Company
```bash
curl -X POST "https://newbiceracing.onrender.com/api/v1/companies" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation Ltd",
    "businessType": "Ltd",
    "tin": "123456789",
    "phone": "+250780123456",
    "email": "info@acme.com"
  }'
```

### Calculate VAT
```bash
curl -X POST "https://newbiceracing.onrender.com/api/v1/tax/calculate" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VAT",
    "amount": 1000000,
    "period": "2024-01"
  }'
```

## Development

### Adding New Endpoints
1. Add the endpoint to the `paths` section
2. Define request/response schemas in `components/schemas`
3. Update this README with new functionality

### Schema Updates
- Keep schemas consistent with your database models
- Add validation rules and examples
- Maintain backward compatibility when possible

## Support

For questions about the API specification:
1. Check the Swagger documentation first
2. Review the backend route files for implementation details
3. Test endpoints using the provided examples
4. Contact the development team for clarification

## Next Steps

1. **Deploy the Swagger UI** to your production environment
2. **Share with frontend developers** for API integration
3. **Use for API testing** and quality assurance
4. **Generate client libraries** for different programming languages
5. **Maintain documentation** as the API evolves

---

**Note**: This Swagger specification is automatically generated from your backend routes and models. Keep it updated as you add new features or modify existing endpoints.
