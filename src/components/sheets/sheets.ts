import { registerSheet } from 'react-native-actions-sheet';
import CommentSheet from './CommentSheet';
import CreateSheet from './CreateSheet';
registerSheet("CommentSheet", CommentSheet);
registerSheet('CreateSheet', CreateSheet);

export {};
declare module "react-native-actions-sheet" {
  interface Sheets {
    "CommentSheet": {
      payload: {
        targetId: string;
        targetType: 'Post' | 'Reel' | 'Story';
      };
    };
    "CreateSheet": {
      payload: {

      }
    };
  }
}
