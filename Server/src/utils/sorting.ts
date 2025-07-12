
export interface SortableItem {
  id: string;
  title: string;
  price: string | number;
  submittedDate?: string;
  createdAt?: string;
  postedAt?: string;
  upvotes?: number;
}

export const sortItems = (items: SortableItem[], sortBy: string): SortableItem[] => {
  const sortedItems = [...items];

  switch (sortBy) {
    case 'newest':
      return sortedItems.sort((a, b) => {
        const dateA = new Date(a.submittedDate || a.createdAt || a.postedAt || '').getTime();
        const dateB = new Date(b.submittedDate || b.createdAt || b.postedAt || '').getTime();
        return dateB - dateA;
      });

    case 'oldest':
      return sortedItems.sort((a, b) => {
        const dateA = new Date(a.submittedDate || a.createdAt || a.postedAt || '').getTime();
        const dateB = new Date(b.submittedDate || b.createdAt || b.postedAt || '').getTime();
        return dateA - dateB;
      });

    case 'eco-points-high':
      return sortedItems.sort((a, b) => {
        const priceA = typeof a.price === 'string' ? parseInt(a.price) || 0 : a.price || 0;
        const priceB = typeof b.price === 'string' ? parseInt(b.price) || 0 : b.price || 0;
        return priceB - priceA;
      });

    case 'eco-points-low':
      return sortedItems.sort((a, b) => {
        const priceA = typeof a.price === 'string' ? parseInt(a.price) || 0 : a.price || 0;
        const priceB = typeof b.price === 'string' ? parseInt(b.price) || 0 : b.price || 0;
        return priceA - priceB;
      });

    case 'name-asc':
      return sortedItems.sort((a, b) => a.title.localeCompare(b.title));

    case 'name-desc':
      return sortedItems.sort((a, b) => b.title.localeCompare(a.title));

    case 'upvotes':
      return sortedItems.sort((a, b) => {
        const upvotesA = a.upvotes || 0;
        const upvotesB = b.upvotes || 0;
        return upvotesB - upvotesA;
      });

    default:
      return sortedItems;
  }
};
