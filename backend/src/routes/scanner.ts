import express from 'express';
import multer from 'multer';
import { DefaultReceiptIntelligenceEngine } from '@carbonsense/receipt-intelligence-engine';
import { CarbonScienceEngine } from '@carbonsense/carbon-science-engine';
import { providerRegistry } from '@carbonsense/ai-orchestration';
import { authMiddleware } from '../middleware/auth.js';
import { scannerRateLimiter } from '../middleware/rateLimit.js';
import '../services/geminiService.js'; // Force service registration

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post('/analyze',
  authMiddleware,
  scannerRateLimiter,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ data: null, error: 'No image file uploaded' });
      }

      const provider = providerRegistry.get();
      const carbonEngine = new CarbonScienceEngine();
      const scannerEngine = new DefaultReceiptIntelligenceEngine(provider, carbonEngine);

      const result = await scannerEngine.analyzeReceipt(req.file.buffer, req.file.mimetype);

      if (!result.success) {
        return res.status(500).json({ data: null, error: result.error.message });
      }

      return res.status(200).json({ data: result.value, error: null });
    } catch (err: any) {
      console.error('[ScannerRoute] Error in analyze receipt:', err);
      return res.status(500).json({ data: null, error: 'An unexpected error occurred during receipt analysis' });
    }
  }
);

export default router;
