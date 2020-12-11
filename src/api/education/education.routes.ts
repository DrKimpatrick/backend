import { Router } from 'express';
import educationController from './education.controller';
import { validate } from '../../middleware/request-validation.middleware';
import { educationRules, educationUpdateRules } from '../../helpers/education-validation.helper';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import { verificationStatusRule } from '../../helpers/user-profile-validation.helper';

const educationRouter = Router();

/**
 * @swagger
 * /api/v1/education:
 *   post:
 *     summary: Create a new Education Record
 *     tags: [Education]
 *     description: Creates a new Education Record for a talent user
 *     parameters:
 *       - in: body
 *         name: education
 *         schema:
 *           $ref: '#/definitions/EducationHistory'
 *
 *     responses:
 *       200:
 *         description: Education set has been added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/EducationHistory'
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
educationRouter.post('/', validate(educationRules()), educationController.create);

/**
 * @swagger
 * /api/v1/education:
 *   get:
 *     summary: Fetch all available Education Details for user
 *     tags: [Education]
 *     description: Fetch Available Education Profile
 *
 *     responses:
 *       200:
 *         description: A list of all Education history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/EducationHistory'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
educationRouter.get('/', educationController.get);

/**
 * @swagger
 * /api/v1/education/{userId}/{id}:
 *   get:
 *     summary: Retrieve a Education Detail
 *     tags: [Education]
 *     description: Retrieve a single  Education Detail
 *     parameters:
 *       - in: path
 *         name: userId
 *         type: string
 *         required: true
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
 *                   $ref: '#/definitions/EducationHistory'
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
educationRouter.get('/:userId/:id', educationController.get);

/**
 * @swagger
 * /api/v1/education/{id}:
 *   delete:
 *     summary: Delete an Education Detail for this user
 *     tags: [Education]
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
educationRouter.delete('/:id', educationController.remove);

/**
 * @swagger
 * /api/v1/education/{userId}/{id}:
 *   patch:
 *     summary: Update an Education Record
 *     tags: [Education]
 *     description: Update a skill set
 *     parameters:
 *       - in: path
 *         name: userId
 *         type: string
 *         required: true
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *       - name: skill
 *         description: Skill details
 *         in: body
 *         schema:
 *           $ref: '#/definitions/EducationHistory'
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
 *                   $ref: '#/definitions/EducationHistory'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 *
 */
educationRouter.patch('/:userId/:id', validate(educationUpdateRules()), educationController.update);

/**
 * @swagger
 * /api/v1/education/status/{id}:
 *   put:
 *     summary: Change Education status
 *     tags: [Education]
 *     description: Change Education status
 *     parameters:
 *       - name: verificationStatus
 *         description: verification status
 *         in: body
 *         schema:
 *           $ref: '#/definitions/EducationHistory'
 *
 *     responses:
 *       200:
 *         description: updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/EducationHistory'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 *
 */
educationRouter.put(
  '/status/:id',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  validate(verificationStatusRule()),
  educationController.changeEducationStatus
);

export { educationRouter };
