const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;
let testPollId = null;
let testUserId = null;

// Test utilities
const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User'
};

const testPoll = {
    title: 'Test Poll',
    description: 'A test poll for API testing',
    options: ['Option 1', 'Option 2', 'Option 3'],
    settings: {
        allowMultipleVotes: false,
        requireAuthentication: true
    }
};

async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { response, data, status: response.status };
    } catch (error) {
        console.error(`Request failed for ${endpoint}:`, error.message);
        return { response: null, data: null, status: 0, error };
    }
}

// Test functions
async function testUserRegistration() {
    console.log('\n🧪 Testing User Registration...');

    const { status, data } = await makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });

    if (status === 201) {
        console.log('✅ User registration successful');
        testUserId = data.user?.id;
        return true;
    } else {
        console.log('❌ User registration failed:', data);
        return false;
    }
}

async function testUserLogin() {
    console.log('\n🧪 Testing User Login...');

    const { status, data } = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });

    if (status === 200 && data.session?.access_token) {
        console.log('✅ User login successful');
        authToken = data.session.access_token;
        return true;
    } else {
        console.log('❌ User login failed:', data);
        return false;
    }
}

async function testCreatePoll() {
    console.log('\n🧪 Testing Poll Creation...');

    const { status, data } = await makeRequest('/polls', {
        method: 'POST',
        body: JSON.stringify(testPoll)
    });

    if (status === 201 && data.poll?.id) {
        console.log('✅ Poll creation successful');
        testPollId = data.poll.id;
        return true;
    } else {
        console.log('❌ Poll creation failed:', data);
        return false;
    }
}

async function testGetPolls() {
    console.log('\n🧪 Testing Get Polls...');

    const { status, data } = await makeRequest('/polls');

    if (status === 200 && Array.isArray(data.polls)) {
        console.log('✅ Get polls successful');
        console.log(`   Found ${data.polls.length} polls`);
        return true;
    } else {
        console.log('❌ Get polls failed:', data);
        return false;
    }
}

async function testGetPollById() {
    console.log('\n🧪 Testing Get Poll by ID...');

    if (!testPollId) {
        console.log('❌ No test poll ID available');
        return false;
    }

    const { status, data } = await makeRequest(`/polls/${testPollId}`);

    if (status === 200 && data.poll?.id === testPollId) {
        console.log('✅ Get poll by ID successful');
        return true;
    } else {
        console.log('❌ Get poll by ID failed:', data);
        return false;
    }
}

async function testVoteOnPoll() {
    console.log('\n🧪 Testing Vote on Poll...');

    if (!testPollId) {
        console.log('❌ No test poll ID available');
        return false;
    }

    const { status, data } = await makeRequest(`/polls/${testPollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ option: testPoll.options[0] })
    });

    if (status === 201 && data.vote) {
        console.log('✅ Vote submission successful');
        return true;
    } else {
        console.log('❌ Vote submission failed:', data);
        return false;
    }
}

async function testGetUserPolls() {
    console.log('\n🧪 Testing Get User Polls...');

    if (!testUserId) {
        console.log('❌ No test user ID available');
        return false;
    }

    const { status, data } = await makeRequest(`/users/${testUserId}/polls`);

    if (status === 200 && Array.isArray(data.polls)) {
        console.log('✅ Get user polls successful');
        console.log(`   Found ${data.polls.length} polls for user`);
        return true;
    } else {
        console.log('❌ Get user polls failed:', data);
        return false;
    }
}

async function testUpdatePoll() {
    console.log('\n🧪 Testing Update Poll...');

    if (!testPollId) {
        console.log('❌ No test poll ID available');
        return false;
    }

    const updateData = {
        title: 'Updated Test Poll',
        description: 'Updated description'
    };

    const { status, data } = await makeRequest(`/polls/${testPollId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });

    if (status === 200 && data.poll?.title === updateData.title) {
        console.log('✅ Poll update successful');
        return true;
    } else {
        console.log('❌ Poll update failed:', data);
        return false;
    }
}

async function testDeletePoll() {
    console.log('\n🧪 Testing Delete Poll...');

    if (!testPollId) {
        console.log('❌ No test poll ID available');
        return false;
    }

    const { status, data } = await makeRequest(`/polls/${testPollId}`, {
        method: 'DELETE'
    });

    if (status === 200) {
        console.log('✅ Poll deletion successful');
        return true;
    } else {
        console.log('❌ Poll deletion failed:', data);
        return false;
    }
}

async function testErrorCases() {
    console.log('\n🧪 Testing Error Cases...');

    // Test invalid login
    const { status: loginStatus } = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'invalid@example.com',
            password: 'wrongpassword'
        })
    });

    if (loginStatus === 401) {
        console.log('✅ Invalid login properly rejected');
    } else {
        console.log('❌ Invalid login not properly handled');
    }

    // Test unauthorized poll creation
    const { status: createStatus } = await makeRequest('/polls', {
        method: 'POST',
        headers: {}, // No auth token
        body: JSON.stringify(testPoll)
    });

    if (createStatus === 401) {
        console.log('✅ Unauthorized poll creation properly rejected');
    } else {
        console.log('❌ Unauthorized poll creation not properly handled');
    }

    // Test invalid poll ID
    const { status: invalidIdStatus } = await makeRequest('/polls/invalid-id');

    if (invalidIdStatus === 404) {
        console.log('✅ Invalid poll ID properly handled');
    } else {
        console.log('❌ Invalid poll ID not properly handled');
    }

    return true;
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting API Test Suite...\n');

    const tests = [
        { name: 'User Registration', fn: testUserRegistration },
        { name: 'User Login', fn: testUserLogin },
        { name: 'Create Poll', fn: testCreatePoll },
        { name: 'Get Polls', fn: testGetPolls },
        { name: 'Get Poll by ID', fn: testGetPollById },
        { name: 'Vote on Poll', fn: testVoteOnPoll },
        { name: 'Get User Polls', fn: testGetUserPolls },
        { name: 'Update Poll', fn: testUpdatePoll },
        { name: 'Delete Poll', fn: testDeletePoll },
        { name: 'Error Cases', fn: testErrorCases }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passedTests++;
        } catch (error) {
            console.log(`❌ ${test.name} failed with error:`, error.message);
        }
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the output above for details.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    makeRequest,
    testUser,
    testPoll
}; 