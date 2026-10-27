import { QueryClient, QueryKey } from '@tanstack/react-query';

export interface OptimisticRollbackItem {
  queryKey: QueryKey;
  data: unknown;
}

export const getTargetQueryKeys = (targetType?: string): QueryKey[] => {
  switch (targetType) {
    case 'Reel':
      return [['Reel'], ['Reels'], ['user-reels']];
    case 'Comment':
      return [['comments']];
    case 'Story':
      return [['story'], ['stories'], ['my-story']];
    case 'Post':
    default:
      return [['Post'], ['Posts'], ['user-posts']];
  }
};

export const updateFeedEntityInCache = async (
  queryClient: QueryClient,
  targetQueryKeys: QueryKey[],
  updateItemFn: (item: any) => any,
): Promise<OptimisticRollbackItem[]> => {
  const previousDataMap: OptimisticRollbackItem[] = [];

  const updateItem = (item: any) => {
    if (!item) return item;
    return updateItemFn(item);
  };

  const updatePage = (page: any) => {
    if (!page) return page;
    if (Array.isArray(page)) {
      return page.map(updateItem);
    }
    const newPage = { ...page };
    if (Array.isArray(page.data)) {
      newPage.data = page.data.map(updateItem);
    }
    if (Array.isArray(page.stories)) {
      newPage.stories = page.stories.map(updateItem);
    }
    if (Array.isArray(page.reels)) {
      newPage.reels = page.reels.map(updateItem);
    }
    return newPage;
  };

  const updateData = (old: any) => {
    if (!old) return old;
    if (Array.isArray(old)) {
      return old.map(updateItem);
    }
    if (Array.isArray(old.pages)) {
      return {
        ...old,
        pages: old.pages.map(updatePage),
      };
    }
    return updatePage(old);
  };

  for (const baseKey of targetQueryKeys) {
    await queryClient.cancelQueries({ queryKey: baseKey });
    const matchingQueries = queryClient.getQueriesData({ queryKey: baseKey });

    for (const [qKey, previousData] of matchingQueries) {
      if (previousData !== undefined) {
        previousDataMap.push({ queryKey: qKey, data: previousData });
        queryClient.setQueryData(qKey, (old: any) => updateData(old));
      }
    }
  }

  return previousDataMap;
};

export const rollbackOptimisticUpdates = (
  queryClient: QueryClient,
  previousDataMap: OptimisticRollbackItem[],
) => {
  previousDataMap.forEach(({ queryKey, data }) => {
    queryClient.setQueryData(queryKey, data);
  });
};
