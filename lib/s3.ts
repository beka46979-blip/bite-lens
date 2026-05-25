import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Инициализация S3 клиента
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Необходимо для S3-совместимых хранилищ
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Загрузка файла в S3
 * @param file - File или Buffer
 * @param key - Путь к файлу в бакете (например, 'avatars/user-123.jpg')
 * @param contentType - MIME тип файла
 * @returns URL загруженного файла
 */
export async function uploadToS3(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Делаем файл публично доступным
    });

    await s3Client.send(command);

    // Возвращаем публичный URL
    return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Удаление файла из S3
 * @param key - Путь к файлу в бакете
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Получение подписанного URL для приватного файла
 * @param key - Путь к файлу в бакете
 * @param expiresIn - Время жизни ссылки в секундах (по умолчанию 1 час)
 * @returns Подписанный URL
 */
export async function getSignedS3Url(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Извлечение ключа файла из полного URL
 * @param url - Полный URL файла
 * @returns Ключ файла или null
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Удаляем пустую строку и название бакета
    pathParts.shift(); // Удаляем пустую строку
    pathParts.shift(); // Удаляем название бакета
    return pathParts.join('/');
  } catch {
    return null;
  }
}

/**
 * Генерация уникального имени файла
 * @param originalName - Оригинальное имя файла
 * @param prefix - Префикс для организации файлов (например, 'avatars', 'meals')
 * @returns Уникальное имя файла с префиксом
 */
export function generateS3Key(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${extension}`;
  
  return prefix ? `${prefix}/${fileName}` : fileName;
}
