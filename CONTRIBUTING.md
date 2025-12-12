# Contributing to AutoNinja

First off, thank you for considering contributing to AutoNinja! It's people like you that make AutoNinja such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Safari]
 - Node Version: [e.g. 20.10.0]
 - AutoNinja Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request**

## Development Process

### Setting Up Your Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/autoninja.git
cd autoninja

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-user-profiles`)
- `fix/` - Bug fixes (e.g., `fix/search-filter-bug`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-search`)
- `test/` - Adding tests (e.g., `test/add-api-tests`)

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

**Examples:**
```bash
feat(search): add debouncing to search filters

Add 500ms debounce to search inputs to reduce API calls
and improve performance.

Closes #123

---

fix(upload): handle large image uploads correctly

Previously, uploads over 10MB would fail silently.
Added proper validation and error messages.

Fixes #456
```

## Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, descriptive names
interface CarListingData {
  make: string;
  model: string;
  year: number;
  price: number;
}

async function createCarListing(data: CarListingData): Promise<Car> {
  // Implementation
}

// ❌ Bad: Any types, unclear names
async function create(d: any): Promise<any> {
  // Implementation
}
```

### React Component Guidelines

```typescript
// ✅ Good: Typed props, clear structure, JSDoc
interface SearchFiltersProps {
  /** Initial filter values */
  initialFilters?: CarFilters;
  /** Callback when filters change */
  onFilterChange: (filters: CarFilters) => void;
}

/**
 * SearchFilters component provides UI for filtering car listings
 *
 * @example
 * <SearchFilters
 *   initialFilters={{ make: 'BMW' }}
 *   onFilterChange={handleFilterChange}
 * />
 */
export function SearchFilters({ initialFilters, onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState(initialFilters || {});

  const handleChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  return (
    // Component JSX
  );
}
```

### Validation Standards

**Always validate user input:**

```typescript
// ✅ Good: Comprehensive validation
const handleSubmit = async () => {
  // Validate required fields
  if (!formData.email || !formData.price) {
    toast({
      title: "Missing Information",
      description: "Email and price are required",
      variant: "destructive"
    });
    return;
  }

  // Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast({
      title: "Invalid Email",
      description: "Please enter a valid email address",
      variant: "destructive"
    });
    return;
  }

  // Validate ranges
  if (formData.price <= 0) {
    toast({
      title: "Invalid Price",
      description: "Price must be greater than 0",
      variant: "destructive"
    });
    return;
  }

  try {
    await submitForm(formData);
  } catch (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to submit form",
      variant: "destructive"
    });
  }
};
```

### Error Handling Standards

```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error("API call failed:", error);

  if (error instanceof ValidationError) {
    throw new Error(`Validation failed: ${error.message}`);
  }

  if (error.response?.status === 404) {
    throw new Error("Resource not found");
  }

  throw new Error("An unexpected error occurred");
}

// ❌ Bad: Silent failures
try {
  await apiCall();
} catch {}
```

### Performance Guidelines

```typescript
// ✅ Good: Memoization and debouncing
const SearchPage = () => {
  const [filters, setFilters] = useState({});
  const debouncedFilters = useDebounce(filters, 500);

  const sortedCars = useMemo(() => {
    return cars.sort((a, b) => a.price - b.price);
  }, [cars]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return <SearchResults cars={sortedCars} />;
};

// ❌ Bad: No optimization
const SearchPage = () => {
  const [filters, setFilters] = useState({});

  // Sorts on every render
  const sortedCars = cars.sort((a, b) => a.price - b.price);

  // Creates new function on every render
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return <SearchResults cars={sortedCars} />;
};
```

## Testing Guidelines

### Running Tests

```bash
# Type checking
npm run check

# Build test
npm run build
```

### Writing Tests (when test framework is added)

```typescript
describe('SearchFilters', () => {
  it('should update filters when user changes input', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = render(
      <SearchFilters onFilterChange={handleChange} />
    );

    const makeInput = getByLabelText('Make');
    fireEvent.change(makeInput, { target: { value: 'BMW' } });

    expect(handleChange).toHaveBeenCalledWith({ make: 'BMW' });
  });
});
```

## Documentation Guidelines

### Code Comments

```typescript
/**
 * Extracts vehicle information from logbook images using OpenAI Vision API
 *
 * @param imageUrl - Base64 encoded image or file path
 * @param mimeType - MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns Extracted logbook data with confidence score
 * @throws {Error} If OCR extraction fails
 *
 * @example
 * ```typescript
 * const data = await extractLogbookData(base64Image, 'image/jpeg');
 * console.log(data.make); // "BMW"
 * console.log(data.confidence); // 95
 * ```
 */
export async function extractLogbookData(
  imageUrl: string,
  mimeType: string
): Promise<LogbookData> {
  // Implementation
}
```

### README Updates

When adding new features, update the README.md:

1. Add feature to appropriate section
2. Update tech stack if needed
3. Add new environment variables
4. Update API documentation

## Pull Request Process

1. **Ensure your code follows our standards**
   - Run `npm run check` to verify TypeScript
   - Run `npm run build` to ensure it builds
   - Test your changes thoroughly

2. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments to new functions
   - Update API docs if you changed endpoints

3. **Create detailed PR description**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## How Has This Been Tested?
   Describe your testing process

   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code where needed
   - [ ] I have updated the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have tested my changes
   ```

4. **Wait for review**
   - Address reviewer comments
   - Make requested changes
   - Re-request review when ready

## Questions?

Feel free to open an issue or reach out to the maintainers.

## Thank You!

Your contributions make AutoNinja better for everyone. We appreciate your time and effort! 🎉
