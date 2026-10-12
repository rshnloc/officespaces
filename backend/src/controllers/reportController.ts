import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ReportService } from '../services/reportService.js';

export class ReportController {
  public static dashboard(req: AuthenticatedRequest, res: Response) {
    const filter = (req.query.filter as string) || 'this_month';
    const summary = ReportService.getDashboardSummary(filter);

    return res.json({
      success: true,
      data: summary,
    });
  }

  public static charts(req: AuthenticatedRequest, res: Response) {
    const filter = (req.query.filter as string) || 'this_month';
    const charts = ReportService.getCharts(filter);

    return res.json({
      success: true,
      data: charts,
    });
  }
}
