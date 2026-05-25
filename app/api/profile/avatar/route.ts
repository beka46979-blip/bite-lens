import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { uploadToS3, deleteFromS3, extractS3Key, generateS3Key } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Avatar file is required' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Проверка размера файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    console.log('Updating avatar for user:', currentUser.userId);

    // Получаем текущего пользователя для удаления старого аватара
    const existingUser = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { avatar: true },
    });

    // Удаляем старый аватар из S3, если он существует
    if (existingUser?.avatar) {
      const oldKey = extractS3Key(existingUser.avatar);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
          // Продолжаем выполнение, даже если удаление не удалось
        }
      }
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const key = generateS3Key(file.name, 'avatars');

    // Загружаем новый аватар в S3
    const avatarUrl = await uploadToS3(buffer, key, file.type);

    // Обновляем аватар пользователя в БД
    const user = await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        avatar: avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    console.log('Avatar updated successfully for user:', user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Deleting avatar for user:', currentUser.userId);

    // Получаем текущего пользователя для удаления аватара из S3
    const existingUser = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { avatar: true },
    });

    // Удаляем аватар из S3, если он существует
    if (existingUser?.avatar) {
      const key = extractS3Key(existingUser.avatar);
      if (key) {
        try {
          await deleteFromS3(key);
        } catch (error) {
          console.error('Failed to delete avatar from S3:', error);
          // Продолжаем выполнение, даже если удаление не удалось
        }
      }
    }

    // Удаляем аватар пользователя из БД
    const user = await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        avatar: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    console.log('Avatar deleted successfully for user:', user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
