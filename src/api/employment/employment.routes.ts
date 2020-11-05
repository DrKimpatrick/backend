import { Router } from 'express';
import { validate } from '../../helpers/request-validation.helpers';
import { employmentHistoryRules } from '../../helpers/user-profile-validation.helper';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import employmentController from './employment.controller';

const employmentRouter = Router();

/**
 * @swagger
 * /api/v1/employment:
 *   post:
 *     summary: Add new Employment History
 *     tags: [Employment]
 *     description: Add new Employment History
 *     parameters:
 *       - in: body
 *         schema:
 *           $ref: '#definitions/EmploymentHistory'
 *
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#definitions/EmploymentHistory'
 *                 message:
 *                   $ref: '#definitions/SuccessMessage'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
employmentRouter.post(
  '/',
  requireRoles([USER_ROLES.TALENT]),
  validate(employmentHistoryRules()),
  employmentController.addEmploymentHistory
);

/**
 * @swagger
 * /api/v1/employment:
 *   get:
 *     summary: List user employment history
 *     tags: [Employment]
 *     description: List user employment history
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/EmploymentHistory'
 *
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
employmentRouter.get(
  '/',
  requireRoles([USER_ROLES.TALENT]),
  employmentController.listEmploymentHistory
);

/**
 * @swagger
 * /api/v1/employment/{id}:
 *   put:
 *     summary: Update Employment History
 *     tags: [Employment]
 *     description: Update Employment History
 *     parameters:
 *       - in: body
 *         schema:
 *           $ref: '#definitions/EmploymentHistory'
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#definitions/EmploymentHistory'
 *                 message:
 *                   $ref: '#definitions/SuccessMessage'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
employmentRouter.put(
  '/:id',
  requireRoles([USER_ROLES.TALENT, USER_ROLES.SUPER_ADMIN]),
  validate(employmentHistoryRules()),
  employmentController.updateEmploymentHistory
);

/**
 * @swagger
 * /api/v1/employment/{id}:
 *   delete:
 *     summary: Delete Employment History
 *     tags: [Employment]
 *     description: Delete Employment History
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/SuccessMessage'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
employmentRouter.delete(
  '/:id',
  requireRoles([USER_ROLES.TALENT]),
  employmentController.deleteEmploymentHistory
);

/**
 * @swagger
 * /api/v1/employment/{id}:
 *   get:
 *     summary: List user specific employment history
 *     tags: [Employment]
 *     description: List user specific employment history
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#definitions/EmploymentHistory'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
employmentRouter.get(
  '/:id',
  requireRoles([USER_ROLES.TALENT]),
  employmentController.listSpecificEmploymentHistory
);

export { employmentRouter };
