import { Router } from 'express';
import userController from './user.controller';
import { userProfileRules } from '../../helpers/user-profile-validation.helper';
import { newBetaTesterRules, validate } from '../../helpers/request-validation.helpers';

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
 *
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
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Edit User profile
 *     tags: [Users]
 *     description: Edit User Profile, pass in any attributes that exist in the User profile Object
 *     parameters:
 *       - name: id
 *         in: path
 *         type: integer
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
 *               $ref: '#/definitions/UserProfile'
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

export { userRouter };
