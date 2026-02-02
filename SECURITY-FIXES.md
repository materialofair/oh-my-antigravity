# Security Fixes for PR #135

## Summary

Fixed three critical security vulnerabilities in the permission handler system that could have allowed arbitrary command execution.

## Changes Made

### 1. Shell Metacharacter Injection Prevention (CRITICAL)

**File:** `src/hooks/permission-handler/index.ts`

**Problem:** The original `isSafeCommand()` only checked if commands started with safe patterns, but didn't prevent shell metacharacter injection. An attacker could bypass the safe pattern check with commands like:
- `git status; rm -rf /` (semicolon chaining)
- `git status && malicious` (AND chaining)
- `git status | sh` (pipe to shell)
- `git status $(whoami)` (command substitution)

**Fix:** Added `DANGEROUS_SHELL_CHARS` regex that rejects ANY command containing shell metacharacters:
```typescript
const DANGEROUS_SHELL_CHARS = /[;&|`$()<>\n\\]/;
```

This regex blocks:
- `;` - command chaining
- `&` - background execution and AND/OR operators
- `|` - pipe to other commands
- `` ` `` - command substitution (backticks)
- `$` - variable expansion and command substitution
- `()` - subshell execution
- `<>` - redirection operators
- `\n` - newline injection
- `\\` - escape sequences

### 2. Active Mode Blanket Auto-Approval Removed (CRITICAL)

**Problem:** The original code had TWO separate checks:
1. Auto-approve safe commands
2. Auto-approve ALL commands during active mode (autopilot/ralph/ultrawork)

This meant that during active mode, even dangerous commands like `rm -rf /` would be auto-approved without user confirmation.

**Fix:** Changed the active mode check to require BOTH conditions:
```typescript
// Before (INSECURE):
if (isActiveModeRunning(input.cwd)) {
  return { continue: true, decision: { behavior: 'allow' } };
}

// After (SECURE):
if (isActiveModeRunning(input.cwd) && isSafeCommand(command)) {
  return { continue: true, decision: { behavior: 'allow' } };
}
```

Now during active mode, only commands that pass the safe command check (including shell metacharacter validation) are auto-approved.

### 3. Removed Unsafe File Readers (HIGH)

**Problem:** The safe patterns included `cat`, `head`, and `tail` which allow reading arbitrary files including:
- `/etc/passwd` - system user information
- `/etc/shadow` - password hashes
- `~/.ssh/id_rsa` - private SSH keys
- `.env` files - environment secrets
- Any other sensitive files

**Fix:** Removed these patterns from `SAFE_PATTERNS`:
```typescript
// REMOVED:
/^cat /,
/^head /,
/^tail /,
```

These commands should go through the normal permission flow where users can approve/deny file access on a case-by-case basis.

## Testing

Created comprehensive test suite with 69 tests covering:

### Shell Injection Prevention (16 tests)
- Semicolon chaining variations
- Pipe chaining
- AND/OR operators
- Command substitution (backticks and `$()`)
- Variable expansion
- Redirection attacks
- Subshell execution
- Newline injection
- Backslash escapes

### Active Mode Security (4 tests)
- Safe commands are still auto-approved during active mode
- Dangerous commands are NOT auto-approved during active mode
- Shell injection is NOT auto-approved during active mode
- Removed unsafe commands are NOT auto-approved during active mode

### Removed Unsafe Commands (5 tests)
- `cat /etc/passwd`
- `cat ~/.ssh/id_rsa`
- `head /etc/shadow`
- `tail /var/log/auth.log`
- `cat secrets.env`

### Safe Commands (22 tests)
Verified that legitimate safe commands still work:
- Git read operations
- Test runners (npm, pnpm, yarn, pytest, cargo)
- Type checking and linting (tsc, eslint, prettier)
- Basic file listing (ls)

## Verification

```bash
# TypeScript compilation
npx tsc --noEmit
✓ No errors

# All tests pass
npm test
✓ 966 tests passed
✓ 0 failures

# Permission handler specific tests
npm test src/hooks/permission-handler/__tests__/index.test.ts
✓ 69 tests passed
```

## Impact

These fixes prevent:
1. **Command injection attacks** - Attackers cannot chain malicious commands to safe commands
2. **Privilege escalation** - Active modes no longer auto-approve dangerous commands
3. **Arbitrary file access** - Removed unsafe file reading commands from auto-approval

The permission system now properly validates ALL commands before auto-approval, ensuring that:
- Only truly safe commands are auto-approved
- Shell metacharacters are blocked entirely
- File access is controlled through the normal permission flow
- Active modes maintain security boundaries

## Files Changed

- `src/hooks/permission-handler/index.ts` - Security fixes
- `src/hooks/permission-handler/__tests__/index.test.ts` - Comprehensive test coverage (NEW)
- `SECURITY-FIXES.md` - This documentation (NEW)
