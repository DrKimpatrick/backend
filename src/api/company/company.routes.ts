import { Router } from 'express';
import { validate } from '../../helpers/request-validation.helpers';
import {
  companyAndSchoolRules as companyRules,
  companyAndSchoolUpdateRules as companyUpdateRules,
} from '../../helpers/company-school-validation.helpers';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import companyController from './company.controller';

const companyRouter = Router();

/**
 * @swagger
 * definition:
 *   Company:
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
 * /api/v1/company:
 *   post:
 *     summary: Create a new Company Record
 *     tags: [Company]
 *     description: Creates a new Company Record for HR/Company/Recruitment admin users
 *     parameters:
 *       - in: body
 *         name: company
 *         schema:
 *           $ref: '#/definitions/Company'
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
 *                   $ref: '#/definitions/Company'
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
companyRouter.post(
  '/',
  requireRoles(
    [USER_ROLES.HR_ADMIN, USER_ROLES.RECRUITMENT_ADMIN, USER_ROLES.COMPANY_ADMIN],
    false
  ),
  validate(companyRules()),
  companyController.create
);

/**
 * @swagger
 * /api/v1/company/{id}:
 *   get:
 *     summary: Get a specific company
 *     tags: [Company]
 *     description: Get a specific company by id
 *     responses:
 *       200:
 *         description: Fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Company'
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
companyRouter.get('/:id', companyController.getOne);

/**
 * @swagger
 * /api/v1/company/{id}:
 *   patch:
 *     summary: Update a company
 *     tags: [Company]
 *     description: Update a specific company
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Company'
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
companyRouter.patch('/:id', validate(companyUpdateRules()), companyController.update);

/**
 * @swagger
 * /api/v1/company/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Company]
 *     description: Delete a specific company
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
companyRouter.delete('/:id', companyController.remove);

export { companyRouter };
