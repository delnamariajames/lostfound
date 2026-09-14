// LocalStorage-based Mock Data Store for zero-setup hosting
const getLocalStorageData = (key: string, defaultData: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
};

const saveLocalStorageData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed initial mock listings if none exist
if (!localStorage.getItem('mock_listings')) {
  saveLocalStorageData('mock_listings', [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      description: 'Found near the library cafeteria. Black color.',
      status: 'found',
      category: 'Electronics',
      location: 'Campus Library',
      date: new Date().toISOString(),
      reporter: 'John Doe'
    },
    {
      id: '2',
      title: 'Leather Wallet',
      description: 'Lost brown leather wallet containing student ID card.',
      status: 'lost',
      category: 'Personal Belongings',
      location: 'Block C Parking Lot',
      date: new Date().toISOString(),
      reporter: 'Jane Smith'
    }
  ]);
}

export const api = {
  listings: {
    getAll: async (params?: any) => {
      let listings = getLocalStorageData('mock_listings', []);
      if (params?.sort === 'newest') {
        listings = [...listings].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return { data: listings };
    },
    getById: async (id: string) => {
      const listings = getLocalStorageData('mock_listings', []);
      const item = listings.find((l: any) => l.id === id);
      return { data: item };
    },
    create: async (data: any) => {
      const listings = getLocalStorageData('mock_listings', []);
      const newListing = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        ...data
      };
      listings.push(newListing);
      saveLocalStorageData('mock_listings', listings);
      return { data: newListing };
    }
  },
  claims: {
    getPendingCount: async () => {
      return { data: { count: 0 } };
    }
  }
};
