import { Router } from 'express';
import userController from './user.controller';
import { userProfileRules } from '../../helpers/user-profile-validation.helper';
import { newBetaTesterRules, validate } from '../../helpers/request-validation.helpers';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';

const userRouter = Router();

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
 *   Error404:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: Error message
 *   EducationHistory:
 *     type: object
 *     required:
 *       - schoolName
 *       - startDate
 *       - endDate
 *     properties:
 *       schoolName:
 *         type: string
 *       level:
 *         type: string
 *       degreeOrCertification:
 *         type: string
 *       specializations:
 *         type: array
 *         items:
 *           type: string
 *       startDate:
 *         type: string
 *         format: "YYYY-MM-DD"
 *       endDate:
 *         type: string
 *         format: "YYYY-MM-DD"
 *       accomplishments:
 *         type: array
 *         items:
 *           type: string
 *       verificationStatus:
 *         type: string
 *
 *   EmploymentHistory:
 *     type: object
 *     required:
 *       - companyName
 *       - title
 *       - startDate
 *       - endDate
 *     properties:
 *       companyName:
 *         type: string
 *       supervisor:
 *         type: string
 *       title:
 *         type: string
 *       startDate:
 *         type: string
 *         format: "YYYY-MM-DD"
 *       endDate:
 *         type: string
 *         format: "YYYY-MM-DD"
 *       skillsUsed:
 *         type: array
 *         items:
 *           type: string
 *       responsibilities:
 *         type: array
 *         items:
 *           type: string
 *       accomplishments:
 *         type: array
 *         items:
 *           type: string
 *       favoriteProject:
 *         type: string
 *       verificationStatus:
 *         type: string
 *
 *   UserProfile:
 *      type: object
 *      properties:
 *        role:
 *          type: string
 *        featureChoice:
 *          type: string
 *        paymentStatus:
 *          type: string
 *        profileStatus:
 *          type: string
 *        verified:
 *          type: boolean
 *        firstName:
 *          type: string
 *        lastName:
 *          type: string
 *        email:
 *          type: string
 *        skills:
 *          type: array
 *          items:
 *            type: string
 *        employmentHistory:
 *          $ref: '#/definitions/EmploymentHistory'
 *        educationHistory:
 *          $ref: '#/definitions/EducationHistory'
 *
 *   BetaTester:
 *     type: object
 *     properties:
 *       data:
 *         type: object
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/users/talent?skills=id,id or ?subscription=premium|standard|basic:
 *   get:
 *     summary: Retrieve talents based on skills or subscription
 *     tags: [Users]
 *     description: Fetch talents Users based on skills
 *     responses:
 *       200:
 *         description: talents profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserProfile'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       403:
 *          description: Forbidden
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error404'
 *       404:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error404'
 */
userRouter.get(
  '/talent',
  requireRoles(
    [USER_ROLES.RECRUITMENT_ADMIN, USER_ROLES.HR_ADMIN, USER_ROLES.COMPANY_ADMIN],
    false
  ),
  userController.getTalents
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Edit User profile
 *     tags: [Users]
 *     description: Edit User Profile, pass in any attributes that exist in the User profile Object
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *       - in: body
 *         name: profile
 *         schema:
 *           $ref: '#/definitions/UserProfile'
 *
 *     responses:
 *       200:
 *         description: Profile haas been edited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/definitions/UserProfile'
 *       400:
 *          description: BadRequest
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       404:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
userRouter.patch('/:id', validate(userProfileRules()), userController.profileEdit);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Edit User profile
 *     tags: [Users]
 *     description: Fetch User Profile
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
 *
 *     responses:
 *       200:
 *         description: Profile haas been edited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/definitions/UserProfile'
 *
 *       404:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
userRouter.get('/:id', requireRoles([USER_ROLES.SUPER_ADMIN]), userController.getUser);

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     summary: Retrieve all Users profile
 *     tags: [Users]
 *     description: Fetch All Users
 *
 *     responses:
 *       200:
 *         description: Profile haas been edited
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserProfile'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
userRouter.get('/', requireRoles([USER_ROLES.SUPER_ADMIN]), userController.listUsers);

/**
 * @swagger
 * /api/v1/users/beta-testers:
 *   post:
 *     summary: Register for beta programme
 *     tags: [Users]
 *     description: Saves users information for beta testing
 *     parameters:
 *       - name: email
 *         description: user email
 *         in: body
 *         required: true
 *         type: string
 *       - name: name
 *         description: User's full name
 *         in: body
 *         required: true
 *         type: string
 *       - name: accountType
 *         description: Desired account type
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Beta tester information saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/BetaTester'
 */
userRouter.post('/beta-testers', validate(newBetaTesterRules()), userController.addBetaTester);

/**
 * @swagger
 * /api/v1/users/{id}/education:
 *   get:
 *     summary: Fetch User Education History
 *     tags: [Users]
 *     description: Fetch User Education History
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
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
 *                     $ref: '#/definitions/EducationHistory'
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
userRouter.get('/:id/education', userController.educationHistory);

/**
 * @swagger
 * /api/v1/users/{id}/employment:
 *   get:
 *     summary: Fetch User Employment History
 *     tags: [Users]
 *     description: Fetch User Employment History
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         required: true
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
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
userRouter.get('/:id/employment', userController.employmentHistory);

export { userRouter };
