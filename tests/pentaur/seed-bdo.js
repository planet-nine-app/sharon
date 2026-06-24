#!/usr/bin/env node
/**
 * Seed BDO with test data for Pentaur tests
 *
 * This script creates test registrations in BDO so the Pentaur tests have data to work with.
 */

import sessionless from 'sessionless-node';
import bdo from 'bdo-js';

// Configure BDO - use direct connection (not proxy) for query endpoint access
const BDO_BASE_URL = process.env.BDO_BASE_URL || 'http://localhost:3003';
bdo.baseURL = BDO_BASE_URL.endsWith('/') ? BDO_BASE_URL : `${BDO_BASE_URL}/`;

console.log(`🌱 Seeding BDO at: ${bdo.baseURL}`);

// Test class ID (using the first product from Sanora)
const TEST_CLASS_ID = '6334aff10921188d5a18ca4c35d146c1b6dd3f9d69366ebc6e3b8e070313f8da';

// Test participant data
const testRegistration = {
    classId: TEST_CLASS_ID,
    className: 'Peace Love and Redistribution T-Shirt',
    participant: {
        firstName: 'Alice',
        lastName: 'Smith',
        dob: '2015-04-12',
        email: 'alice.smith@example.com',
        phone: '555-0100',
        emergencyContact: {
            name: 'Bob Smith',
            phone: '555-0101',
            relationship: 'Father'
        },
        medicalInfo: {
            allergies: 'Peanuts',
            medications: 'EpiPen',
            conditions: 'None'
        }
    },
    guardian: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        phone: '555-0101',
        address: {
            line1: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            zip: '62701'
        }
    },
    status: 'paid',
    registeredAt: new Date().toISOString(),
    type: 'camp-registration'
};

async function seedBDO() {
    try {
        // Generate keys for the registration
        let registrationKeys;
        const saveKeys = (keys) => { registrationKeys = keys; };
        const getKeys = () => registrationKeys;
        await sessionless.generateKeys(saveKeys, getKeys);

        // Create registration BDO
        const registrationUUID = await bdo.createUser(
            'Pentaur-Enrollment',
            testRegistration,
            saveKeys,
            getKeys
        );

        console.log(`✅ Created test registration: ${registrationUUID}`);
        console.log(`   Class: ${testRegistration.className}`);
        console.log(`   Participant: ${testRegistration.participant.firstName} ${testRegistration.participant.lastName}`);
        console.log(`   Status: ${testRegistration.status}`);

        return registrationUUID;
    } catch (error) {
        console.error('❌ Failed to seed BDO:', error);
        throw error;
    }
}

// Run the seed
seedBDO()
    .then(() => {
        console.log('\n🎉 BDO seeding complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 BDO seeding failed:', error.message);
        process.exit(1);
    });
