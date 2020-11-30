import { Router } from 'express';
import skillController from './skills.controller';
import { validate } from '../../helpers/request-validation.helpers';
import {
  skillsRules,
  skillsUpdateRules,
  userSkillsRules,
  userSkillsUpdateRules,
} from '../../helpers/skills-validation.helper';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import { bodyArray, bodyNotArray } from '../../helpers/body-validators';
import { verificationStatusRule } from '../../helpers/user-profile-validation.helper';

const adminRoles = [USER_ROLES.SUPER_ADMIN];

const skillRouter = Router();
/**
 * @swagger
 * definition:
 *   Skill:
 *     type: object
 *     required:
 *       - skill
 *     properties:
 *       skill:
 *         type: string
 *         required: true
 *
 *   UserSkill:
 *     type: object
 *     required:
 *       - skill
 *     properties:
 *       id:
 *         type: string
 *       skill:
 *         type: string
 *         description: Skills IDs
 *         required: true
 *       user:
 *         type: string
 *         description: User IDs
 *       level:
 *         type: string
 *       verificationStatus:
 *         type: string
 *
 */

/**
 * @swagger
 * /api/v1/skills/me:
 *   get:
 *     summary: Retrieve Skills for a user
 *     tags: [Skills]
 *     description: Retrieve Skills for a user
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
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSkill'
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.get('/me', skillController.fetchUserSkills);

/**
 * @swagger
 * /api/v1/skills/me:
 *   post:
 *     summary: Create Skills for a user
 *     tags: [Skills]
 *     description: Create Skills for a user
 *     parameters:
 *       - name: skills
 *         in: body
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               skill:
 *                 type: string
 *                 description: Id of SKill
 *               level:
 *                 type: string
 *                 description: One of beginner|intermediate|advanced
 *               verificationStatus:
 *                 type: string
 *                 description: One of verified|inProgress|unverified
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
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSkill'
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.post(
  '/me',
  bodyArray('A list of User skills is expected'),
  validate(userSkillsRules()),
  skillController.createUserSkills
);

/**
 * @swagger
 * /api/v1/skills/me:
 *   patch:
 *     summary: Update Skills for a user
 *     tags: [Skills]
 *     description: Update Skills for a user
 *     parameters:
 *       - name: skills
 *         in: body
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userSkill:
 *                 type: string
 *                 description: Id of User SKill
 *               level:
 *                 type: string
 *                 description: One of beginner|intermediate|advanced
 *               verificationStatus:
 *                 type: string
 *                 description: One of verified|inProgress|unverified
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
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSkill'
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
skillRouter.patch(
  '/me',
  bodyArray('A list of User skills is expected'),
  validate(userSkillsUpdateRules()),
  skillController.updateUserSkills
);

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
 *           type: array
 *           items:
 *             $ref: '#/definitions/Skill'
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
  bodyArray('A list of skills is expected'),
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
 *   put:
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
skillRouter.put(
  '/:id',
  requireRoles(adminRoles, false),
  bodyNotArray(),
  validate(skillsUpdateRules()),
  skillController.updateSkills
);

/**
 * @swagger
 * /api/v1/skills/status/{id}:
 *   put:
 *     summary: change status
 *     tags: [Skills]
 *     description: Change userSkill status
 *     parameters:
 *       - name: verificationStatus
 *         description: verification status
 *         in: body
 *         schema:
 *           $ref: '#/definitions/Skill'
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
 *                   $ref: '#/definitions/Skill'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#definitions/Error'
 *
 */

skillRouter.put(
  '/status/:id',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  validate(verificationStatusRule()),
  skillController.changeUserSkillStatus
);

export { skillRouter };
