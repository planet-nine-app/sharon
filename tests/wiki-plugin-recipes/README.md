# Recipes Plugin Tests

Integration tests for `wiki-plugin-recipes` - the distributed recipe platform for federated wiki using the Canicook feed specification.

## Overview

Recipes allows users to publish recipes through Federated Wiki. The plugin:

- Manages its own Sanora user account
- Parses ingredient and instruction text
- Formats durations as ISO 8601
- Calculates total time (prep + cook)
- Uploads recipes to Sanora as products
- Generates Canicook-compliant recipe feeds
- Proxies requests to Sanora service

## Test Coverage

### 1. Plugin Initialization ✅
- Plugin loaded and available
- Sanora credentials configured
- Endpoints registered

### 2. Feed Retrieval ✅
- Empty feed returns correctly
- Feed structure validation
- Recipe listing

### 3. Sanora Integration ✅
- Proxy routes working
- Service communication
- Error handling

### 4. Feed Validation ✅
- Canicook feed structure
- Recipe metadata
- JSON compliance

### 5. Recipe Structure ✅
- Ingredient format validation
- Instruction format validation
- Timing fields (prep, cook, total)

### 6. Duration Formatting ✅
- ISO 8601 format (PT15M, PT1H30M)
- Minutes to ISO conversion
- ISO to minutes parsing

### 7. Ingredient Parsing ✅
- Text to structured format
- Quantity/unit/item extraction
- Notes handling

### 8. Error Handling ✅
- Authentication requirements
- Required field validation

### 9. Recipe Metadata ✅
- Difficulty levels (easy, medium, hard)
- Cuisine types
- Course types

## Running Tests

```bash
# From sharon directory
npm run test:recipes

# Or with custom ports
WIKI_PORT=3000 SANORA_PORT=7243 npm run test:recipes

# With wiki proxy (test-wiki environment)
WIKI_PORT=5124 npm run test:recipes
```

## Test Requirements

### Services Running
- Federated Wiki with recipes plugin installed
- Sanora service (port 7243)

### Environment Variables
- `WIKI_PORT` - Wiki server port (default: 3000)
- `SANORA_PORT` - Sanora service port (default: 7243)

## Canicook Feed Specification

Recipes follows the Canicook specification:

- **Feed Format**: JSON
- **Duration Format**: ISO 8601 (PT15M = 15 minutes)
- **Metadata Fields**: name, servings, prep-time, cook-time, total-time, difficulty, cuisine
- **Structured Data**: ingredients (array), instructions (array)

## Plugin Endpoints

### POST `/plugin/recipes/publish`
Publish recipe (requires authentication)

**Request:**
```json
{
  "name": "Classic Tomato Basil Pasta",
  "summary": "A simple, delicious pasta dish",
  "prepTime": "PT15M",
  "cookTime": "PT20M",
  "servings": 4,
  "difficulty": "medium",
  "cuisine": ["Italian"],
  "course": "main",
  "ingredients": [
    {
      "item": "pasta",
      "quantity": 1,
      "unit": "pound",
      "notes": "spaghetti or linguine"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "text": "Bring a large pot of salted water to boil"
    }
  ],
  "tags": ["pasta", "italian", "vegetarian"]
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": "product_id",
    "name": "Classic Tomato Basil Pasta",
    "servings": 4,
    "totalTime": "PT35M",
    "difficulty": "medium",
    "published": "2026-02-05T12:00:00Z"
  }
}
```

### GET `/plugin/recipes/feed`
Get all published recipes

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "type": "recipe",
      "name": "Classic Tomato Basil Pasta",
      "servings": 4,
      "timing": {
        "prep-time": "PT15M",
        "cook-time": "PT20M",
        "total-time": "PT35M"
      },
      "difficulty": "medium"
    }
  ]
}
```

### Proxy Routes
- `/plugin/recipes/sanora/*` → Sanora service

## Data Structures

### Ingredient Object
```json
{
  "item": "pasta",
  "quantity": 1,
  "unit": "pound",
  "notes": "spaghetti or linguine",
  "section": "main"
}
```

### Instruction Object
```json
{
  "step": 1,
  "text": "Bring a large pot of salted water to boil"
}
```

### Duration Format (ISO 8601)
- `PT15M` = 15 minutes
- `PT1H` = 1 hour
- `PT1H30M` = 1 hour 30 minutes
- `PT2H` = 2 hours

## Metadata Options

### Difficulty Levels
- `easy` - Simple, quick recipes
- `medium` - Moderate skill required
- `hard` - Advanced techniques

### Course Types
- `appetizer` - Starters
- `main` - Main courses
- `dessert` - Sweet endings
- `side` - Side dishes
- `breakfast` - Morning meals
- `lunch` - Midday meals
- `dinner` - Evening meals
- `snack` - Light bites

### Common Cuisine Types
Italian, Mexican, Chinese, Indian, Mediterranean, American, French, Japanese, Thai, Korean, Greek, Spanish, etc.

## Future Test Coverage

- [ ] Actual recipe publishing tests (requires auth setup)
- [ ] Complex ingredient parsing
- [ ] Ingredient section support (e.g., "For the sauce:")
- [ ] Equipment list validation
- [ ] Nutrition information calculation
- [ ] Dietary tags (vegetarian, vegan, gluten-free)
- [ ] Recipe scaling (adjust servings)
- [ ] Unit conversion (metric ↔ imperial)
- [ ] Recipe variations/forks
- [ ] Shopping list generation
- [ ] Cross-plugin federation tests

## Related Documentation

- [Plugin CLAUDE.md](../../../third-party/wiki-plugin-recipes/CLAUDE.md)
- [Canicook Specification](../../../allyabase/specs/canicook.md)
- [Sanora Integration](../../../sanora/CLAUDE.md)

---

**Part of The Advancement** - Rebuilding platforms for communities 💚
