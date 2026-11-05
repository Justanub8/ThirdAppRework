import { create } from 'zustand';

interface FeedState {
  /** Id of the post currently most visible in the home feed (plays its video). */
  activePostId: string | null;
  setActivePostId: (id: string | null) => void;
}

/**
 * Kept outside React state so changing the active post only re-renders the
 * two Post components whose `isActive` flips, not HomeScreen or the list.
 */
export const useFeedStore = create<FeedState>(set => ({
  activePostId: null,
  setActivePostId: id => set({ activePostId: id }),
}));
