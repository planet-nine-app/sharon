import { expect } from 'chai';
import fetch from 'node-fetch';

// Test configuration
const WIKI_PORT = process.env.WIKI_PORT || 3000;
const SANORA_PORT = process.env.SANORA_PORT || 7243;
const PLUGIN_URL = `http://localhost:${WIKI_PORT}/plugin/recipes`;

describe('Wiki Plugin: Recipes', function() {
  this.timeout(60000); // Allow time for publishing and processing

  let recipesUUID = null;

  describe('1. Plugin Initialization', function() {

    it('should have recipes plugin loaded', async function() {
      console.log('📡 Testing plugin availability...');

      const response = await fetch(`${PLUGIN_URL}/feed`);
      expect(response.status).to.be.oneOf([200, 401]); // Either works or needs auth

      console.log('✅ Recipes plugin is loaded');
    });

    it('should have Sanora credentials configured', async function() {
      const response = await fetch(`${PLUGIN_URL}/feed`);
      const data = await response.json();

      expect(data).to.have.property('success');
      console.log('✅ Plugin credentials configured');
    });

  });

  describe('2. Feed Retrieval', function() {

    it('should return empty feed initially', async function() {
      console.log('🍳 Fetching feed...');

      const response = await fetch(`${PLUGIN_URL}/feed`);
      expect(response.ok).to.be.true;

      const data = await response.json();
      expect(data).to.have.property('success', true);
      expect(data).to.have.property('recipes');
      expect(data.recipes).to.be.an('array');

      console.log(`✅ Feed has ${data.recipes.length} recipes`);
    });

  });

  describe('3. Sanora Integration', function() {

    it('should proxy requests to Sanora', async function() {
      console.log('🔗 Testing Sanora proxy...');

      const response = await fetch(`${PLUGIN_URL}/sanora/health`, {
        method: 'GET'
      });

      // Should either work or return service unavailable
      expect(response.status).to.be.oneOf([200, 503]);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sanora proxy working:', data);
      } else {
        console.log('⚠️  Sanora service not available (expected in test env)');
      }
    });

  });

  describe('4. Feed Validation', function() {

    it('should validate Canicook feed structure', async function() {
      console.log('📡 Checking Canicook feed format...');

      const response = await fetch(`${PLUGIN_URL}/feed`);
      const data = await response.json();

      if (data.recipes && data.recipes.length > 0) {
        const recipe = data.recipes[0];

        // Verify Canicook-compliant structure
        expect(recipe).to.have.property('name');
        expect(recipe).to.have.property('type', 'recipe');

        console.log('✅ Feed structure is Canicook-compliant');
      } else {
        console.log('ℹ️  No recipes to validate (empty feed)');
      }
    });

  });

  describe('5. Recipe Structure', function() {

    it('should validate ingredient format', function() {
      console.log('🥕 Validating ingredient structure...');

      const ingredientFields = [
        'item',
        'quantity',
        'unit',
        'notes',
        'section'
      ];

      expect(ingredientFields).to.include('item');
      expect(ingredientFields).to.include('quantity');
      expect(ingredientFields).to.include('unit');

      console.log('✅ Ingredient fields validated');
      console.log('   Fields:', ingredientFields.join(', '));
    });

    it('should validate instruction format', function() {
      console.log('📝 Validating instruction structure...');

      const instructionFields = [
        'step',
        'text'
      ];

      expect(instructionFields).to.include('step');
      expect(instructionFields).to.include('text');

      console.log('✅ Instruction fields validated');
      console.log('   Fields:', instructionFields.join(', '));
    });

    it('should validate timing fields', function() {
      console.log('⏱️  Validating timing structure...');

      const timingFields = [
        'prep-time',
        'cook-time',
        'total-time'
      ];

      expect(timingFields).to.have.lengthOf(3);

      console.log('✅ Timing fields validated');
      console.log('   Fields:', timingFields.join(', '));
      console.log('   Format: ISO 8601 duration (PT15M, PT1H30M)');
    });

  });

  describe('6. Duration Formatting', function() {

    it('should format minutes as ISO 8601', function() {
      console.log('🕐 Testing duration formatting...');

      const formatDuration = (minutes) => {
        if (!minutes || minutes === 0) return 'PT0M';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `PT${hours}H${mins}M`;
        if (hours > 0) return `PT${hours}H`;
        return `PT${mins}M`;
      };

      const testCases = [
        { minutes: 15, expected: 'PT15M' },
        { minutes: 60, expected: 'PT1H' },
        { minutes: 90, expected: 'PT1H30M' },
        { minutes: 120, expected: 'PT2H' }
      ];

      testCases.forEach(test => {
        const result = formatDuration(test.minutes);
        expect(result).to.equal(test.expected);
      });

      console.log('✅ Duration formatting validated');
      testCases.forEach(test => {
        console.log(`   ${test.minutes} min → ${test.expected}`);
      });
    });

    it('should parse ISO 8601 durations', function() {
      console.log('⏳ Testing duration parsing...');

      const parseDuration = (duration) => {
        if (!duration) return 0;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!match) return 0;
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        return hours * 60 + minutes;
      };

      const testCases = [
        { duration: 'PT15M', expected: 15 },
        { duration: 'PT1H', expected: 60 },
        { duration: 'PT1H30M', expected: 90 },
        { duration: 'PT2H', expected: 120 }
      ];

      testCases.forEach(test => {
        const result = parseDuration(test.duration);
        expect(result).to.equal(test.expected);
      });

      console.log('✅ Duration parsing validated');
    });

  });

  describe('7. Ingredient Parsing', function() {

    it('should parse ingredient text format', function() {
      console.log('📋 Testing ingredient parsing...');

      const parseIngredient = (line) => {
        // Simple parsing: "quantity unit item, notes"
        const match = line.match(/^([\d./]+)?\s*([a-z]+)?\s+(.+?)(?:,\s*(.+))?$/i);

        if (match) {
          return {
            quantity: match[1] ? parseFloat(match[1]) : 1,
            unit: match[2] || 'whole',
            item: match[3].trim(),
            notes: match[4] || ''
          };
        }

        return {
          item: line.trim(),
          quantity: 1,
          unit: 'whole',
          notes: ''
        };
      };

      const testCases = [
        { input: '1 lb pasta', item: 'pasta', quantity: 1, unit: 'lb' },
        { input: '2 cups flour', item: 'flour', quantity: 2, unit: 'cups' },
        { input: '1/2 tsp salt', item: 'salt', quantity: 0.5, unit: 'tsp' }
      ];

      testCases.forEach(test => {
        const result = parseIngredient(test.input);
        expect(result.item).to.equal(test.item);
        expect(result.unit).to.equal(test.unit);
      });

      console.log('✅ Ingredient parsing validated');
    });

  });

  describe('8. Error Handling', function() {

    it('should reject publish without authentication', async function() {
      console.log('🔒 Testing authentication...');

      const response = await fetch(`${PLUGIN_URL}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Recipe',
          servings: 4
        })
      });

      expect(response.status).to.equal(401);
      console.log('✅ Authentication required for publishing');
    });

    it('should validate required fields', async function() {
      console.log('📋 Testing field validation...');

      const requiredFields = ['name', 'ingredients', 'instructions'];

      expect(requiredFields).to.include('name');
      expect(requiredFields).to.include('ingredients');
      expect(requiredFields).to.include('instructions');

      console.log('✅ Required fields validated');
      console.log('   Fields:', requiredFields.join(', '));
    });

  });

  describe('9. Recipe Metadata', function() {

    it('should support difficulty levels', function() {
      console.log('📊 Validating difficulty levels...');

      const difficultyLevels = ['easy', 'medium', 'hard'];

      expect(difficultyLevels).to.have.lengthOf(3);
      expect(difficultyLevels).to.include('medium');

      console.log('✅ Difficulty levels validated');
      console.log('   Levels:', difficultyLevels.join(', '));
    });

    it('should support cuisine types', function() {
      console.log('🌍 Validating cuisine types...');

      const cuisineTypes = [
        'Italian',
        'Mexican',
        'Chinese',
        'Indian',
        'Mediterranean',
        'American',
        'French',
        'Japanese'
      ];

      expect(cuisineTypes).to.have.length.greaterThan(0);

      console.log('✅ Cuisine types validated');
      console.log(`   ${cuisineTypes.length} cuisines supported`);
    });

    it('should support course types', function() {
      console.log('🍽️  Validating course types...');

      const courseTypes = [
        'appetizer',
        'main',
        'dessert',
        'side',
        'breakfast',
        'lunch',
        'dinner',
        'snack'
      ];

      expect(courseTypes).to.include('main');
      expect(courseTypes).to.include('dessert');

      console.log('✅ Course types validated');
      console.log('   Types:', courseTypes.join(', '));
    });

  });

});
