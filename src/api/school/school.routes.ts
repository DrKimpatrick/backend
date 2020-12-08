import { Router } from 'express';
import { validate } from '../../helpers/request-validation.helpers';
import {
  companyAndSchoolRules as schoolRules,
  companyAndSchoolUpdateRules as schoolUpdateRules,
} from '../../helpers/company-school-validation.helpers';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import schoolController from './school.controller';

const schoolRouter = Router();

/**
 * @swagger
 * definition:
 *   School:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       address:
 *         type: string
 *       website:
 *         type: string
 *       accountManagerName:
 *         type: string
 *       email:
 *         type: string
 *       phone:
 *         type: string
 *   UnauthorizedError:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         description: Error message
 */

/**
 * @swagger
 * /api/v1/school:
 *   post:
 *     summary: Create a new school Record
 *     tags: [School]
 *     description: Creates a new school Record for training admin users
 *     parameters:
 *       - in: body
 *         name: school
 *         schema:
 *           $ref: '#/definitions/School'
 *
 *     responses:
 *       200:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/definitions/School'
 *       400:
 *          description: BadRequest
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
schoolRouter.post(
  '/',
  requireRoles([USER_ROLES.TRAINNING_ADMIN], false),
  validate(schoolRules()),
  schoolController.create
);

/**
 * @swagger
 * /api/v1/school/{id}:
 *   get:
 *     summary: Get a specific school
 *     tags: [School]
 *     description: Get a specific school by id
 *     responses:
 *       200:
 *         description: Fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/School'
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
schoolRouter.get('/:id', schoolController.getOne);

/**
 * @swagger
 * /api/v1/school/{id}:
 *   patch:
 *     summary: Update a school
 *     tags: [School]
 *     description: Update a specific school
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/School'
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/UnauthorizedError'
 */
schoolRouter.patch('/:id', validate(schoolUpdateRules()), schoolController.update);

/**
 * @swagger
 * /api/v1/school/{id}:
 *   delete:
 *     summary: Delete a school
 *     tags: [School]
 *     description: Delete a specific school
 *     responses:
 *       204:
 *         description: Deleted successfully
 *         content:
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/UnauthorizedError'
 */
schoolRouter.delete('/:id', schoolController.remove);

export { schoolRouter };
