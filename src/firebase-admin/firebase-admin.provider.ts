import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FirebaseAdminProvider = {
  provide: 'FirebaseAdmin',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const credentials = {
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/gm, '\n'),
    };
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
      databaseURL: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    });
  },
};
