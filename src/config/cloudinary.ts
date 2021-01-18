import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { environment } from './environment';

export const cloudinaryStorage = (folderName?: string) => {
  cloudinary.config({
    cloud_name: environment.cloudinaryName,
    api_key: environment.cloudinaryApiKey,
    api_secret: environment.cloudinaryApiSecret,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: folderName || 'uploads' },
  });

  return storage;
};
