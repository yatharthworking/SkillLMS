const axios = require('axios');
const fs = require('fs');

async function testFetch() {
  try {
    const response = await axios.get('http://localhost:8901/soul/studyMaterial/getCompletedMaterials?username=pulkitarora0611%40gmail.com&isCompleted=true');
    fs.writeFileSync('test_output.json', JSON.stringify(response.data, null, 2));
    console.log('Success!');
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

testFetch();
