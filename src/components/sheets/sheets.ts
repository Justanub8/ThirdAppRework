import { registerSheet } from 'react-native-actions-sheet';
import CommentSheet from '~/components/sheets/CommentSheet';
import CreateSheet from '~/components/sheets/CreateSheet';
import MediaSheet, { SelectedChatMedia } from '~/components/sheets/MediaSheet';

registerSheet('CommentSheet', CommentSheet);
registerSheet('CreateSheet', CreateSheet);
registerSheet('MediaSheet', MediaSheet);

export {};
declare module 'react-native-actions-sheet' {
  interface Sheets {
    CommentSheet: {
      payload: {
        targetId: string;
        targetType: 'Post' | 'Reel' | 'Story';
      };
    };
    CreateSheet: {
      payload: {};
    };
    MediaSheet: {
      payload?: {
        onSelectMedia?: (media: SelectedChatMedia) => void;
        mediaType?: 'all' | 'image' | 'video';
      };
      returnValue?: SelectedChatMedia;
    };
  }
}
