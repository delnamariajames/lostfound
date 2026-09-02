import { Router, Request, Response } from 'express';
import { dbStore } from '../data/store.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { ItemCategory, ListingStatus, ListingType } from '../models/types.js';

const router = Router();

// GET /api/listings - Query with search & filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, status, type, userId, sort } = req.query;

    const data = await dbStore.getListings({
      search: search as string,
      category: category as string,
      status: status as string,
      type: type as string,
      userId: userId as string,
      sort: sort as string,
    });

    res.json(data);
  } catch (error) {
    console.error('Fetch listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve listings.' });
  }
});

// GET /api/listings/:id - Single listing
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await dbStore.getListingById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }
    res.json({ listing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve listing details.' });
  }
});

// POST /api/listings - Create listing (Protected)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, title, description, category, location, date, imageUrl, contactInfo } = req.body;

    if (!type || !title || !description || !category || !location || !date) {
      res.status(400).json({ error: 'Missing required listing fields.' });
      return;
    }

    const validCategories: ItemCategory[] = ['ID Card', 'Electronics', 'Bottle', 'Book', 'Stationery', 'Other'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
      return;
    }

    const validTypes: ListingType[] = ['lost', 'found'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Type must be either "lost" or "found".' });
      return;
    }

    const newListing = await dbStore.createListing({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      date,
      imageUrl: imageUrl || '',
      contactInfo: {
        name: contactInfo?.name || req.user.name,
        email: contactInfo?.email || req.user.email,
        phone: contactInfo?.phone || req.user.phone || '',
      },
      status: 'Open',
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing.' });
  }
});

// PUT /api/listings/:id - Update listing (Protected: owner or admin)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const listing = await dbStore.getListingById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    // Check ownership or admin
    if (listing.userId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to edit this listing.' });
      return;
    }

    const { title, description, category, location, date, imageUrl, contactInfo, status, type } = req.body;

    const updated = await dbStore.updateListing(req.params.id, {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(category && { category }),
      ...(location && { location: location.trim() }),
      ...(date && { date }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(contactInfo && { contactInfo }),
      ...(status && { status }),
      ...(type && { type }),
    });

    res.json({
      message: 'Listing updated successfully',
      listing: updated,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
});

// PATCH /api/listings/:id/status - Update listing status (Open / Claimed / Resolved)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status } = req.body;
    const validStatuses: ListingStatus[] = ['Open', 'Claimed', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const listing = await dbStore.getListingById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (listing.userId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Permission denied.' });
      return;
    }

    const updated = await dbStore.updateListing(req.params.id, { status });
    res.json({ message: 'Listing status updated', listing: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// DELETE /api/listings/:id - Delete listing (Protected: owner or admin)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const listing = await dbStore.getListingById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    if (listing.userId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to delete this listing.' });
      return;
    }

    await dbStore.deleteListing(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

export default router;
