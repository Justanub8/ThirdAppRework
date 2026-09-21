import { registerSheet } from 'react-native-actions-sheet';
import CommentSheet from './CommentSheet';
import CreateSheet from './CreateSheet';
import MediaSheet, { SelectedChatMedia } from './MediaSheet';

registerSheet("CommentSheet", CommentSheet);
registerSheet('CreateSheet', CreateSheet);
registerSheet('MediaSheet', MediaSheet);

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
    "MediaSheet": {
      payload?: {
        onSelectMedia?: (media: SelectedChatMedia) => void;
      };
      returnValue?: SelectedChatMedia;
    };
  }
}
