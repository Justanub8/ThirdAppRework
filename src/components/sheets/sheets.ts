import { registerSheet } from 'react-native-actions-sheet';
import CommentSheet from './CommentSheet';
registerSheet("CommentSheet", CommentSheet);

export {};
declare module "react-native-actions-sheet" {
  interface Sheets {
    "CommentSheet": {
      payload: {
        targetId: string;
        targetType: 'Post' | 'Reel' | 'Story';
      };
    };
  }
}
