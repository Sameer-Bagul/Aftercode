# Contributing to Aftercode ⚡

Thank you for your interest in contributing to **Aftercode**! We welcome bug fixes, documentation improvements, feature additions, and custom AST analyzer modules.

## Getting Started

1. **Fork the Repository**: Create a fork of `Sameer-Bagul/aftercode` on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aftercode.git
   cd aftercode
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Build the Project**:
   ```bash
   npm run build
   ```

## Development & Testing

- **Run Unit Tests**:
  ```bash
  npm run test
  ```
- **Validate Schemas**:
  ```bash
  npm run validate
  ```
- **Test Local CLI**:
  ```bash
  npx . help
  ```

## Pull Request Guidelines

1. Ensure all Vitest tests pass (`npm run test`).
2. Verify TypeScript compiles without warnings (`npm run build`).
3. Maintain zero-emoji sanitization across synthesized metadata output.
4. Update `walkthrough.md` or documentation if adding new features or CLI commands.

Thank you for helping build Aftercode! 🚀
