import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

console.log('🔧 S3 Configuration:');
console.log('Endpoint:', process.env.S3_ENDPOINT);
console.log('Bucket:', BUCKET_NAME);
console.log('Region:', process.env.S3_REGION);
console.log('Access Key:', process.env.S3_ACCESS_KEY?.substring(0, 5) + '...');
console.log('');

async function testS3Connection() {
  try {
    console.log('📋 Test 1: Listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Successfully connected to S3!');
    console.log('Available buckets:', listResponse.Buckets?.map(b => b.Name).join(', ') || 'None');
    console.log('');

    console.log('📤 Test 2: Uploading test file...');
    const testContent = `Test file uploaded at ${new Date().toISOString()}`;
    const testKey = `test/test-${Date.now()}.txt`;
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
      ACL: 'public-read',
    });
    
    await s3Client.send(putCommand);
    const fileUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${testKey}`;
    console.log('✅ File uploaded successfully!');
    console.log('File URL:', fileUrl);
    console.log('');

    console.log('📥 Test 3: Reading uploaded file...');
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
    });
    
    const getResponse = await s3Client.send(getCommand);
    const downloadedContent = await streamToString(getResponse.Body);
    console.log('✅ File downloaded successfully!');
    console.log('Content:', downloadedContent);
    console.log('');

    console.log('🗑️  Test 4: Deleting test file...');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
    });
    
    await s3Client.send(deleteCommand);
    console.log('✅ File deleted successfully!');
    console.log('');

    console.log('🎉 All tests passed! S3 is configured correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check that S3_ENDPOINT is correct');
    console.error('2. Verify S3_ACCESS_KEY and S3_SECRET_KEY are valid');
    console.error('3. Ensure the bucket exists and you have permissions');
    console.error('4. Check network connectivity to the S3 endpoint');
    process.exit(1);
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

testS3Connection();
