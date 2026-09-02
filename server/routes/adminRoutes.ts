import { Router, Response } from 'express';
import { dbStore } from '../data/store.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Overview statistics
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listings } = await dbStore.getListings({});
    const users = await dbStore.getAllUsers();
    const claims = await dbStore.getAllClaims();

    const openCount = listings.filter((l) => l.status === 'Open').length;
    const claimedCount = listings.filter((l) => l.status === 'Claimed').length;
    const resolvedCount = listings.filter((l) => l.status === 'Resolved').length;
    const lostCount = listings.filter((l) => l.type === 'lost').length;
    const foundCount = listings.filter((l) => l.type === 'found').length;

    res.json({
      stats: {
        totalListings: listings.length,
        openCount,
        claimedCount,
        resolvedCount,
        lostCount,
        foundCount,
        totalUsers: users.length,
        totalClaims: claims.length,
        pendingClaims: claims.filter((c) => c.status === 'pending').length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// GET /api/admin/listings - List all items for moderation
router.get('/listings', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, status, type, sort } = req.query;
    const data = await dbStore.getListings({
      search: search as string,
      category: category as string,
      status: status as string,
      type: type as string,
      sort: sort as string,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings for admin.' });
  }
});

// GET /api/admin/users - User directory
router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await dbStore.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// POST /api/admin/auto-resolve - Mark old unresolved posts as "Resolved" after X days
router.post('/auto-resolve', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.body;
    const daysNum = Math.max(1, parseInt(days, 10) || 30);
    const result = await dbStore.autoResolveOldListings(daysNum);

    res.json({
      message: `Successfully auto-resolved ${result.resolvedCount} listing(s) older than ${daysNum} days.`,
      resolvedCount: result.resolvedCount,
      daysThreshold: daysNum,
    });
  } catch (error) {
    console.error('Auto resolve error:', error);
    res.status(500).json({ error: 'Failed to execute auto-resolve.' });
  }
});

// DELETE /api/admin/listings/:id - Force delete spam / inappropriate post
router.delete('/listings/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await dbStore.deleteListing(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }
    res.json({ message: 'Listing permanently removed by admin moderation.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

export default router;
