# Common Refactoring Patterns

## ROI-Optimized Refactoring Strategy

**Principle**: Fix high-impact, low-effort issues first

### Priority Matrix

| Impact \ Effort | Low Effort | Medium Effort | High Effort |
|----------------|------------|---------------|-------------|
| **High Impact** | **DO FIRST** | Do Second | Consider |
| **Medium Impact** | Do Second | Consider | Defer |
| **Low Impact** | Quick Wins | Defer | Avoid |

---

## Pattern 1: Extract Magic Numbers

**When**: Code has hardcoded values without explanation

**Example**:
```javascript
// Before (Poor - Clarity: 3, Maintainability: 2)
if (user.age >= 18 && user.accountBalance > 1000) {
  approveCredit();
}
```

**Refactored**:
```javascript
// After (Better - Clarity: 9, Maintainability: 8)
const MINIMUM_AGE = 18;
const MINIMUM_BALANCE_FOR_CREDIT = 1000;

if (user.age >= MINIMUM_AGE && user.accountBalance > MINIMUM_BALANCE_FOR_CREDIT) {
  approveCredit();
}
```

**Impact**: High (improves clarity, makes values discoverable)
**Effort**: Low (5-10 minutes)
**Quality Gain**: +6 Clarity, +6 Maintainability
**ROI**: ⭐⭐⭐⭐⭐

---

## Pattern 2: Extract Method

**When**: Function does multiple things or has complex logic

**Example**:
```javascript
// Before (Poor - Structure: 4, Clarity: 4, Maintainability: 3)
function processOrder(order) {
  // Validate
  if (!order.items || order.items.length === 0) {
    throw new Error('No items');
  }
  if (!order.shippingAddress) {
    throw new Error('No address');
  }

  // Calculate total
  let total = 0;
  for (let item of order.items) {
    total += item.price * item.quantity;
  }
  const tax = total * 0.08;
  const shipping = total > 50 ? 0 : 5.99;
  total = total + tax + shipping;

  // Save
  database.save(order);
  sendConfirmationEmail(order);

  return total;
}
```

**Refactored**:
```javascript
// After (Better - Structure: 9, Clarity: 9, Maintainability: 9)
function processOrder(order) {
  validateOrder(order);
  const total = calculateOrderTotal(order);
  saveAndNotify(order);
  return total;
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must contain items');
  }
  if (!order.shippingAddress) {
    throw new Error('Order must have shipping address');
  }
}

function calculateOrderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 5.99;
  return subtotal + tax + shipping;
}

function saveAndNotify(order) {
  database.save(order);
  sendConfirmationEmail(order);
}
```

**Impact**: High (improves structure, testability, readability)
**Effort**: Low-Medium (15-30 minutes)
**Quality Gain**: +5 Structure, +5 Clarity, +6 Maintainability
**ROI**: ⭐⭐⭐⭐⭐

---

## Pattern 3: Replace Conditional with Guard Clauses

**When**: Deep nesting due to conditional checks

**Example**:
```javascript
// Before (Poor - Clarity: 4, Maintainability: 3)
function calculateDiscount(user, order) {
  if (user) {
    if (user.isPremium) {
      if (order.total > 100) {
        return order.total * 0.2;
      } else {
        return order.total * 0.1;
      }
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
```

**Refactored**:
```javascript
// After (Better - Clarity: 8, Maintainability: 8)
function calculateDiscount(user, order) {
  if (!user || !user.isPremium) {
    return 0;
  }

  return order.total > 100 ? order.total * 0.2 : order.total * 0.1;
}
```

**Impact**: Medium (improves readability)
**Effort**: Low (5-10 minutes)
**Quality Gain**: +4 Clarity, +5 Maintainability
**ROI**: ⭐⭐⭐⭐

---

## Pattern 4: Introduce Parameter Object

**When**: Functions have too many parameters (> 4)

**Example**:
```javascript
// Before (Poor - Clarity: 4, Maintainability: 3, Structure: 4)
function createUser(firstName, lastName, email, phone, address, city, state, zip, country) {
  // Implementation
}

createUser('John', 'Doe', 'john@example.com', '555-1234', '123 Main St', 'Seattle', 'WA', '98101', 'USA');
```

**Refactored**:
```javascript
// After (Better - Clarity: 8, Maintainability: 9, Structure: 9)
function createUser(userDetails) {
  const { firstName, lastName, email, phone, address } = userDetails;
  // Implementation
}

createUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: {
    street: '123 Main St',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA'
  }
});
```

**Impact**: Medium-High (improves API usability, extensibility)
**Effort**: Medium (20-40 minutes)
**Quality Gain**: +4 Clarity, +6 Maintainability, +5 Structure
**ROI**: ⭐⭐⭐⭐

---

## Pattern 5: Replace Type Code with Polymorphism

**When**: Long if-else chains based on type codes

**Example**:
```javascript
// Before (Poor - Structure: 3, Maintainability: 3, Best Practices: 4)
function calculateShipping(order) {
  if (order.shippingMethod === 'standard') {
    return order.weight * 0.5;
  } else if (order.shippingMethod === 'express') {
    return order.weight * 1.5 + 10;
  } else if (order.shippingMethod === 'overnight') {
    return order.weight * 3 + 25;
  } else {
    throw new Error('Unknown shipping method');
  }
}
```

**Refactored**:
```javascript
// After (Better - Structure: 9, Maintainability: 9, Best Practices: 9)
class ShippingStrategy {
  calculate(order) {
    throw new Error('Must implement calculate()');
  }
}

class StandardShipping extends ShippingStrategy {
  calculate(order) {
    return order.weight * 0.5;
  }
}

class ExpressShipping extends ShippingStrategy {
  calculate(order) {
    return order.weight * 1.5 + 10;
  }
}

class OvernightShipping extends ShippingStrategy {
  calculate(order) {
    return order.weight * 3 + 25;
  }
}

const shippingStrategies = {
  'standard': new StandardShipping(),
  'express': new ExpressShipping(),
  'overnight': new OvernightShipping()
};

function calculateShipping(order) {
  const strategy = shippingStrategies[order.shippingMethod];
  if (!strategy) {
    throw new Error(`Unknown shipping method: ${order.shippingMethod}`);
  }
  return strategy.calculate(order);
}
```

**Impact**: High (extensibility, testability, follows OCP)
**Effort**: High (1-2 hours)
**Quality Gain**: +6 Structure, +6 Maintainability, +5 Best Practices
**ROI**: ⭐⭐⭐

---

## Pattern 6: Consolidate Duplicate Code

**When**: Same or similar code appears in multiple places

**Example**:
```javascript
// Before (Poor - Structure: 3, Maintainability: 2)
function sendWelcomeEmail(user) {
  const emailBody = `Welcome, ${user.name}!`;
  emailService.send(user.email, 'Welcome', emailBody);
  logger.log(`Sent welcome email to ${user.email}`);
}

function sendResetPasswordEmail(user) {
  const emailBody = `Reset your password: ${resetLink}`;
  emailService.send(user.email, 'Reset Password', emailBody);
  logger.log(`Sent reset password email to ${user.email}`);
}

function sendOrderConfirmationEmail(user, order) {
  const emailBody = `Order ${order.id} confirmed!`;
  emailService.send(user.email, 'Order Confirmation', emailBody);
  logger.log(`Sent order confirmation email to ${user.email}`);
}
```

**Refactored**:
```javascript
// After (Better - Structure: 8, Maintainability: 9)
function sendEmail(user, subject, body) {
  emailService.send(user.email, subject, body);
  logger.log(`Sent "${subject}" email to ${user.email}`);
}

function sendWelcomeEmail(user) {
  sendEmail(user, 'Welcome', `Welcome, ${user.name}!`);
}

function sendResetPasswordEmail(user, resetLink) {
  sendEmail(user, 'Reset Password', `Reset your password: ${resetLink}`);
}

function sendOrderConfirmationEmail(user, order) {
  sendEmail(user, 'Order Confirmation', `Order ${order.id} confirmed!`);
}
```

**Impact**: High (DRY, single source of truth)
**Effort**: Low-Medium (15-30 minutes)
**Quality Gain**: +5 Structure, +7 Maintainability
**ROI**: ⭐⭐⭐⭐⭐

---

## Pattern 7: Add Input Validation

**When**: Functions assume inputs are always valid

**Example**:
```javascript
// Before (Poor - Trigger Detection: 2, Best Practices: 3)
function divide(a, b) {
  return a / b;
}
```

**Refactored**:
```javascript
// After (Better - Trigger Detection: 9, Best Practices: 9)
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Arguments must be finite numbers');
  }
  return a / b;
}
```

**Impact**: High (prevents bugs, improves robustness)
**Effort**: Low (10-15 minutes)
**Quality Gain**: +7 Trigger Detection, +6 Best Practices
**ROI**: ⭐⭐⭐⭐⭐

---

## Pattern 8: Replace Nested Callbacks with Async/Await

**When**: Callback hell in asynchronous code

**Example**:
```javascript
// Before (Poor - Clarity: 3, Best Practices: 3, Maintainability: 2)
function processOrder(orderId, callback) {
  getOrder(orderId, function(err, order) {
    if (err) return callback(err);

    validateOrder(order, function(err, valid) {
      if (err) return callback(err);
      if (!valid) return callback(new Error('Invalid order'));

      chargePayment(order, function(err, receipt) {
        if (err) return callback(err);

        sendConfirmation(order, function(err) {
          if (err) return callback(err);
          callback(null, { success: true, receipt });
        });
      });
    });
  });
}
```

**Refactored**:
```javascript
// After (Better - Clarity: 9, Best Practices: 9, Maintainability: 9)
async function processOrder(orderId) {
  try {
    const order = await getOrder(orderId);
    const valid = await validateOrder(order);

    if (!valid) {
      throw new Error('Invalid order');
    }

    const receipt = await chargePayment(order);
    await sendConfirmation(order);

    return { success: true, receipt };
  } catch (error) {
    logger.error('Order processing failed', { orderId, error });
    throw error;
  }
}
```

**Impact**: Very High (readability, error handling, modern practices)
**Effort**: Medium (30-60 minutes)
**Quality Gain**: +6 Clarity, +6 Best Practices, +7 Maintainability
**ROI**: ⭐⭐⭐⭐⭐

---

## Pattern 9: Improve Error Messages

**When**: Error messages are vague or unhelpful

**Example**:
```javascript
// Before (Poor - Trigger Detection: 4, Examples: 3)
function validateEmail(email) {
  if (!email) {
    throw new Error('Invalid email');
  }
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  return true;
}
```

**Refactored**:
```javascript
// After (Better - Trigger Detection: 9, Examples: 8)
function validateEmail(email) {
  if (!email) {
    throw new Error('Email is required. Please provide an email address.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(
      `Invalid email format: "${email}". ` +
      'Email must contain "@" and a valid domain (e.g., user@example.com).'
    );
  }

  return true;
}
```

**Impact**: Medium (better debugging, user experience)
**Effort**: Low (10-15 minutes)
**Quality Gain**: +5 Trigger Detection, +5 Examples
**ROI**: ⭐⭐⭐⭐

---

## Pattern 10: Add Documentation and Examples

**When**: Code lacks usage examples or API documentation

**Example**:
```javascript
// Before (Poor - Examples: 1, Maintainability: 4)
function formatCurrency(amount, locale, currency) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
```

**Refactored**:
```javascript
// After (Better - Examples: 9, Maintainability: 8)
/**
 * Formats a number as currency according to locale and currency code.
 *
 * @param {number} amount - The numeric amount to format
 * @param {string} locale - BCP 47 language tag (e.g., 'en-US', 'de-DE', 'ja-JP')
 * @param {string} currency - ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
 * @returns {string} Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'en-US', 'USD')
 * // Returns: "$1,234.56"
 *
 * @example
 * formatCurrency(1234.56, 'de-DE', 'EUR')
 * // Returns: "1.234,56 €"
 *
 * @example
 * formatCurrency(1234, 'ja-JP', 'JPY')
 * // Returns: "¥1,234"
 */
function formatCurrency(amount, locale, currency) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('Amount must be a finite number');
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}
```

**Impact**: Medium (discoverability, onboarding)
**Effort**: Low-Medium (15-30 minutes)
**Quality Gain**: +8 Examples, +4 Maintainability
**ROI**: ⭐⭐⭐⭐

---

## Refactoring Decision Tree

```
Is the issue a security vulnerability?
├─ Yes → FIX IMMEDIATELY (Critical priority)
└─ No
    ├─ Is it causing production bugs?
    │   ├─ Yes → Fix urgently (High priority)
    │   └─ No
    │       ├─ Can it be fixed in < 30 minutes?
    │       │   ├─ Yes → Do it now (Quick win)
    │       │   └─ No
    │       │       ├─ Will it improve 2+ quality dimensions by 3+ points?
    │       │       │   ├─ Yes → Schedule for next sprint
    │       │       │   └─ No → Add to backlog (Low priority)
    │       └─ Continue to next issue
```

---

## Summary: Highest ROI Refactorings

1. **Extract Magic Numbers** - 5 min, +12 points
2. **Add Input Validation** - 10 min, +13 points
3. **Consolidate Duplicate Code** - 20 min, +12 points
4. **Replace Callbacks with Async/Await** - 45 min, +19 points
5. **Extract Method** - 25 min, +16 points

**Golden Rule**: If refactoring takes longer than 1 hour, break it into smaller steps or reconsider if it's worth it.
