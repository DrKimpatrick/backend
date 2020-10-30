import { Router } from 'express';
import skillController from './skills.controller';
import { validate } from '../../helpers/request-validation.helpers';
import { skillsRules } from '../../helpers/skills-validation.helper';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';

const adminRoles = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.COMPANY_ADMIN,
  USER_ROLES.HR_ADMIN,
  USER_ROLES.RECRUITMENT_ADMIN,
  USER_ROLES.TRAINNING_ADMIN,
];

const skillRouter = Router();
/**
 * @swagger
 * definition:
 *   Error:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         description: Error message
 *
 *   ValidationError:
 *     type: object
 *     properties:
 *       errors:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             value:
 *               type: string
 *             msg:
 *               type: string
 *             param:
 *               type: string
 *             location:
 *               type: string
 *
 *   Skill:
 *     type: object
 *     required:
 *       - skill
 *     properties:
 *       skill:
 *         type: string
 *         required: true
 *       level:
 *         type: string
 *       verificationStatus:
 *         type: string
 *
 */

/**
 * @swagger
 * /api/v1/skills:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
 *     description: Creates a  new skill-set to be used by talent users
 *     parameters:
 *       - in: body
 *         name: skill
 *         schema:
 *           $ref: '#/definitions/Skill'
 *
 *     responses:
 *       200:
 *         description: Skill set has been added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Skill'
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
skillRouter.post(
  '/',
  requireRoles(adminRoles, false),
  validate(skillsRules()),
  skillController.createSkills
);

/**
 * @swagger
 * /api/v1/skills:
 *   get:
 *     summary: Fetch all available skill sets
 *     tags: [Skills]
 *     description: Fetch Available Skills Profile
 *
 *     responses:
 *       200:
 *         description: A list of all skill sets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/Skill'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.get('/', skillController.fetchSkills);

/**
 * @swagger
 * /api/v1/skills/{id}:
 *   get:
 *     summary: Retrieve a single Skill
 *     tags: [Skills]
 *     description: Retrieve a single Skill Set
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *
 *     responses:
 *       200:
 *         description: Get a skill set
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Skill'
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.get('/:id', skillController.fetchSkills);

/**
 * @swagger
 * /api/v1/skills/{id}:
 *   delete:
 *     summary: Delete a single Skill
 *     tags: [Skills]
 *     description: Delete a single Skill Set
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *
 *     responses:
 *       204:
 *         description: Deleted successfully
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.delete('/:id', requireRoles(adminRoles, false), skillController.deleteSkills);

/**
 * @swagger
 * /api/v1/skills/{id}:
 *   patch:
 *     summary: Update a skill set
 *     tags: [Skills]
 *     description: Update a skill set
 *     parameters:
 *       - name: skill
 *         description: Skill details
 *         in: body
 *         schema:
 *           $ref: '#/definitions/Skill'
 *
 *     responses:
 *       200:
 *         description: Skill has been updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Skill'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 *
 */
skillRouter.patch(
  '/:id',
  requireRoles(adminRoles, false),
  validate(skillsRules()),
  skillController.updateSkills
);

export { skillRouter };
