# 👨‍💻 Development Guide

This guide is for developers contributing to the Drug Inventory System.

## Project Setup

### Prerequisites
- Node.js 18+ with npm
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone repository**
```bash
git clone <repo-url>
cd Drug-Inventory-System
```

2. **Backend setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed
npm run dev
```

3. **Frontend setup** (new terminal)
```bash
cd client
npm install
npm start
```

4. **Verify setup**
- Backend running: http://localhost:5000
- Frontend running: http://localhost:3000
- API docs: http://localhost:5000/api-docs

## Code Structure

### Backend Structure
```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/           # Business logic
│   ├── authController.js
│   ├── stockController.js
│   ├── orderController.js
│   ├── consumeController.js
│   ├── shipmentController.js
│   ├── notificationController.js
│   └── auditController.js
├── middleware/            # Express middleware
│   ├── auth.js            # JWT & RBAC
│   ├── errorHandler.js    # Error handling
│   └── validators.js      # Input validation
├── models/                # Mongoose schemas
│   ├── Headquarters.js
│   ├── Hospital.js
│   ├── Vendor.js
│   ├── StockItem.js
│   ├── SupplyOrder.js
│   ├── ShipmentTracking.js
│   ├── ConsumptionLog.js
│   ├── Notification.js
│   └── AuditLog.js
├── routes/                # API routes
│   ├── authRoutes.js
│   ├── stockRoutes.js
│   ├── orderRoutes.js
│   ├── consumeRoutes.js
│   ├── shipmentRoutes.js
│   ├── notificationRoutes.js
│   └── auditRoutes.js
├── scripts/               # Utilities
│   └── seedDB.js          # Database seeding
├── .env                   # Environment variables
├── package.json
└── server.js              # App entry point
```

### Frontend Structure
```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.js
│   │   └── Sidebar.js
│   ├── pages/             # Page components
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── StockManagement.js
│   │   ├── OrderManagement.js
│   │   ├── ShipmentTracking.js
│   │   ├── AuditLogs.js
│   │   ├── NotificationsPage.js
│   │   └── ProfilePage.js
│   ├── services/          # API clients
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env                   # Environment variables
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Development Workflow

### 1. Creating a New Feature

**Backend:**
1. Create model in `models/`
2. Create controller in `controllers/`
3. Create validation rules in `middleware/validators.js`
4. Create routes in `routes/`
5. Add Swagger documentation comments
6. Test with API client (Postman, etc.)

**Frontend:**
1. Create service method in `services/api.js`
2. Create page/component in `pages/` or `components/`
3. Add route in `App.js`
4. Add to sidebar/navigation
5. Test in browser

### 2. Code Style

**JavaScript/Node.js:**
- Use `const` by default, `let` when needed
- Use arrow functions
- Use async/await over promises
- Add JSDoc comments for functions
- Follow ES6+ best practices

**React:**
- Functional components with hooks
- Use custom hooks for logic reuse
- Props destructuring
- Conditional rendering with ternary operators
- Use `useEffect` for side effects

**CSS/Tailwind:**
- Use Tailwind utility classes first
- Minimal custom CSS
- Mobile-first responsive design
- Use semantic class names

### 3. Git Workflow

```bash
# Create feature branch
git checkout -b feature/auth-improvements

# Make changes and commit
git add .
git commit -m "feat: improve auth error messages"

# Push and create PR
git push origin feature/auth-improvements
```

**Commit Message Format:**
```
feat: add inventory search feature
fix: resolve database connection leak
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for validators
chore: update dependencies
```

## Testing

### Backend Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd client
npm test
npm run test:coverage
```

### Manual Testing

**Login credentials:**
- HQ Admin: admin@hq.com / admin123
- Hospital: city@hospital.com / hospital123
- Vendor: supply1@pharma.com / vendor123

**Test scenarios:**
1. Login with different roles
2. Add/edit/delete stock items
3. Create supply orders
4. Update order status
5. Check notifications
6. View audit logs

## Database Management

### Seed Database
```bash
npm run seed
```

### Connect to MongoDB
```bash
# Atlas
mongo "mongodb+srv://user:pass@cluster.mongodb.net/db"

# Local
mongo localhost/drug-inventory
```

### Common MongoDB Queries
```javascript
// List collections
show collections

// View documents
db.stockitems.find().pretty()

// Count documents
db.stockitems.count()

// Clear collection
db.stockitems.deleteMany({})

// Update document
db.stockitems.updateOne({_id: ObjectId("...")}, {$set: {currentLevel: 100}})
```

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Tasks

### Add New API Endpoint

1. **Create controller function** in `controllers/newController.js`
2. **Add validation rules** in `middleware/validators.js`
3. **Create route** in `routes/newRoutes.js`
4. **Add to server.js** `app.use('/api/new', require('./routes/newRoutes'))`
5. **Add Swagger docs** to route file
6. **Test** with API client

### Add New Frontend Page

1. **Create page** in `pages/NewPage.js`
2. **Import in App.js** and add route
3. **Add navigation** in Sidebar.js
4. **Create API service** methods in `services/api.js`
5. **Style with Tailwind** classes

### Add Field to Database

1. **Update model** in `models/Model.js`
2. **Update controllers** that use the field
3. **Update routes** validation if applicable
4. **Update frontend** forms/displays
5. **Migration** for existing data in seed script

## Debugging

### Backend Debugging

```javascript
// Add debug logs
console.log('Debug:', variable);

// Or use Node debugger
node --inspect-brk server.js
# Then open chrome://inspect

// Check MongoDB connection
db.adminCommand({ping: 1})
```

### Frontend Debugging

```javascript
// React DevTools browser extension
// Console logs
console.log('State:', state);

// Redux DevTools (if using Redux)
// Network tab to inspect API calls
```

### Common Issues

**MongoDB Connection Error**
- Check MONGO_URI in .env
- Verify network access in MongoDB Atlas
- Check username/password

**CORS Error**
- Verify CORS_ORIGIN matches frontend URL
- Check request headers in browser

**JWT Invalid**
- Token might be expired
- Check JWT_SECRET matches between login and verification
- Check localStorage for token

**npm start fails**
- Delete node_modules and run `npm install` again
- Check Node.js version (should be 18+)

## Performance Tips

### Backend
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use projection to return only needed fields
- Monitor N+1 query problems

### Frontend
- Code splitting with React.lazy()
- Memoization with useMemo, useCallback
- Virtual scrolling for large lists
- Image optimization
- Minimize bundle size

## Security Best Practices

- Never commit .env files with secrets
- Use HTTPS in production
- Validate all user inputs
- Use proper RBAC
- Hash passwords with bcrypt
- Use JWT with expiration
- Implement rate limiting
- Add CSRF protection
- Sanitize database queries
- Regular security audits

## Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)

## Support & Questions

- Create issues in GitHub for bugs
- Discussion forum for questions
- Contact team lead for major decisions
