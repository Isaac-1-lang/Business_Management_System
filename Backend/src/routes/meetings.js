/**
 * MEETINGS ROUTES - Meeting Minutes CRUD
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';
import { Meeting } from '../models/index.js';

const router = express.Router();

const meetingValidation = [
  body('title').isString().isLength({ min: 2 }),
  body('type').isString().isLength({ min: 2 }),
  body('date').isString(),
  body('time').isString(),
  body('location').isString().isLength({ min: 2 }),
  body('chairperson').isString().isLength({ min: 2 }),
  body('secretary').isString().isLength({ min: 2 }),
];

/** GET /meetings */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    status,
    startDate,
    endDate
  };
  
  const result = await Meeting.getByCompany(companyId, options);
  
  return successResponse(res, {
    meetings: result.rows.map(meeting => meeting.getPublicData()),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.count,
      pages: Math.ceil(result.count / limit)
    }
  }, 'Meetings retrieved successfully');
}));

/** POST /meetings */
router.post('/', meetingValidation, requireCompanyAccess, requireRole(['admin','owner','manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Map frontend meeting types to database ENUM values
  const typeMapping = {
    'Board Meeting': 'Board',
    'Team Meeting': 'Committee',
    'Shareholders Meeting': 'AGM',
    'Emergency Meeting': 'EGM',
    'Special Meeting': 'Special',
    'Committee Meeting': 'Committee'
  };
  
  // Map frontend status to database ENUM values
  const statusMapping = {
    'Scheduled': 'Scheduled',
    'In Progress': 'In Progress', 
    'Completed': 'Completed',
    'Cancelled': 'Cancelled'
  };
  
  const meeting = await Meeting.create({
    company_id: companyId,
    title: payload.title,
    type: typeMapping[payload.type] || 'Board', // Map to ENUM value or default
    date: payload.date,
    time: payload.time,
    location: payload.location,
    chairperson: payload.chairperson,
    secretary: payload.secretary,
    attendees: payload.attendees || [],
    agenda: payload.agenda || [],
    discussions: payload.discussions || '',
    decisions: payload.decisions || [],
    actionItems: payload.actionItems || [],
    nextMeetingDate: payload.nextMeetingDate || null,
    status: statusMapping[payload.status] || 'Scheduled' // Map to ENUM value or default
  });
  
  return successResponse(res, { meeting: meeting.getPublicData() }, 'Meeting created', 201);
}));

/** PUT /meetings/:id */
router.put('/:id', requireCompanyAccess, requireRole(['admin','owner','manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const meeting = await Meeting.findOne({
    where: { id: id, company_id: companyId }
  });
  
  if (!meeting) {
    return errorResponse(res, 'Meeting not found', 404, 'MEETING_NOT_FOUND');
  }
  
  await meeting.update({
    ...req.body,
    company_id: companyId // Ensure company_id doesn't change
  });
  
  return successResponse(res, { meeting: meeting.getPublicData() }, 'Meeting updated');
}));

/** DELETE /meetings/:id */
router.delete('/:id', requireCompanyAccess, requireRole(['admin','owner','manager']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const meeting = await Meeting.findOne({
    where: { id: id, company_id: companyId }
  });
  
  if (!meeting) {
    return errorResponse(res, 'Meeting not found', 404, 'MEETING_NOT_FOUND');
  }
  
  await meeting.destroy();
  
  return successResponse(res, {}, 'Meeting deleted');
}));

/** GET /meetings/statistics */
router.get('/statistics', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const statistics = await Meeting.getStatistics(companyId);
  
  return successResponse(res, statistics, 'Meeting statistics retrieved');
}));

export default router;


