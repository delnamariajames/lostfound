import { Router, Request, Response } from 'express';
import { dbStore } from '../data/store.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/claims - Submit claim request
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { listingId, message, proofDetails, claimantPhone } = req.body;

    if (!listingId || !message) {
      res.status(400).json({ error: 'Listing ID and message/details are required.' });
      return;
    }

    const listing = await dbStore.getListingById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Target listing not found.' });
      return;
    }

    if (listing.userId === req.user._id) {
      res.status(400).json({ error: 'You cannot claim your own listing.' });
      return;
    }

    const claimType = listing.type === 'found' ? 'Claim' : 'This is Mine';

    const newClaim = await dbStore.createClaim({
      listingId: listing._id,
      listingTitle: listing.title,
      listingType: listing.type,
      listingImageUrl: listing.imageUrl || '',
      claimantId: req.user._id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      claimantPhone: claimantPhone || req.user.phone || '',
      posterId: listing.userId,
      claimType,
      message: message.trim(),
      proofDetails: proofDetails ? proofDetails.trim() : '',
    });

    res.status(201).json({
      message: 'Claim request submitted successfully. The poster has been notified.',
      claim: newClaim,
    });
  } catch (error) {
    console.error('Submit claim error:', error);
    res.status(500).json({ error: 'Failed to submit claim.' });
  }
});

// GET /api/claims/my-claims - Claims initiated by current user
router.get('/my-claims', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const claims = await dbStore.getClaimsByClaimant(req.user._id);
    res.json({ claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user claims.' });
  }
});

// GET /api/claims/received - Claims received by current user on their posts
router.get('/received', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const claims = await dbStore.getClaimsByPoster(req.user._id);
    res.json({ claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch received claims.' });
  }
});

// PATCH /api/claims/:id/status - Accept or Reject claim (Listing owner or admin)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, responseNote } = req.body;
    if (!status || !['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be "accepted" or "rejected".' });
      return;
    }

    const claim = await dbStore.getClaimById(req.params.id);
    if (!claim) {
      res.status(404).json({ error: 'Claim not found.' });
      return;
    }

    if (claim.posterId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'You are not authorized to respond to this claim.' });
      return;
    }

    const result = await dbStore.updateClaimStatus(req.params.id, status, responseNote);
    if (!result) {
      res.status(500).json({ error: 'Failed to update claim status.' });
      return;
    }

    res.json({
      message: `Claim has been ${status}.`,
      claim: result.claim,
      listing: result.listing,
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({ error: 'Failed to update claim.' });
  }
});

export default router;
