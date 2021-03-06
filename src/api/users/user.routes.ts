import { Router } from 'express';
import multer from 'multer';
import userController from './user.controller';
import { userProfileRules } from '../../helpers/user-profile-validation.helper';
import { newBetaTesterRules } from '../../helpers/request-validation.helpers';
import { validate } from '../../middleware/request-validation.middleware';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import { cloudinaryStorage } from '../../config/cloudinary';

const userRouter = Router();

/**
 * @swagger
 * definition:
 *   Error:
 *     type: object
 *     properties:
 *       message:
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
 *       isCurrentEducation:
 *         type: boolean
 *         default: true
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
 *       isCurrentPosition:
 *         type: boolean
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
 *        employmentHistory:
 *          type: array
 *          items:
 *            $ref: '#/definitions/EmploymentHistory'
 *        educationHistory:
 *          type: array
 *          items:
 *            $ref: '#/definitions/EducationHistory'
 *
 *   SubscriptionPayment:
 *      type: object
 *      properties:
 *        paidOn:
 *          type: string
 *        featureChoice:
 *          type: string
 *        amount:
 *          type: number
 *        interval:
 *          type: string
 *        subscriptionPriceId:
 *          type: string
 *
 *   UserSubscription:
 *      type: object
 *      properties:
 *        userId:
 *          type: string
 *        year:
 *          type: number
 *        nextPaymentDate:
 *          type: string
 *        payment:
 *          type: array
 *          items:
 *            $ref: '#/definitions/SubscriptionPayment'
 *
 *   BetaTester:
 *     type: object
 *     properties:
 *       data:
 *         type: object
 *       message:
 *         type: string
 *
 *   SuccessMessage:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: get authed User profile
 *     tags: [Users]
 *     description: Fetch User Profile
 *     responses:
 *       200:
 *         description: Profile has been fetched
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
userRouter.get('/me', userController.getAuthenticatedUser);

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
 *                $ref: '#definitions/Error'
 *       404:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
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
 *           allOf:
 *             - $ref: '#/definitions/UserProfile'
 *             - type: object
 *               properties:
 *                 skills:
 *                   $ref: '#/definitions/UserSkill'
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
userRouter.get('/:id', userController.getUser);

/**
 * @swagger
 * /api/v1/users/?page={integer}&limit={integer}&roles={role,role}:
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
 * /api/v1/users/:userId/skills:
 *   get:
 *     summary: Fetch skills for a given user
 *     tags: [Users, Skills]
 *     description: Fetch skills for a given user
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
userRouter.get(
  '/:userId/skills',
  requireRoles(
    [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.RECRUITMENT_ADMIN,
      USER_ROLES.HR_ADMIN,
      USER_ROLES.COMPANY_ADMIN,
    ],
    false
  ),
  userController.fetchUserSkillsByUserId
);

/**
 * @swagger
 * /api/v1/users/upload:
 *   post:
 *     summary: Upload images
 *     tags: [Users]
 *     description: Upload images on cloudinary
 *     parameters:
 *       - name: image file
 *         description:
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: list of files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                 type: object
 *                 properties:
 *                   files:
 *                    type: object
 *                    properties:
 *                     fieldname:
 *                       type: string
 *                       description: fieldname
 *                     originalname:
 *                       type: string
 *                       description: avatar.png
 *                     encoding:
 *                       type: string
 *                       description: 7bit
 *                     path:
 *                      type: string
 *                      description: cloudinary link
 */

userRouter.post(
  '/upload',
  multer({ storage: cloudinaryStorage() }).array('images'),
  userController.uploadImage
);

/**
 * @swagger
 * /api/v1/users/list/recommendation:
 *   get:
 *     summary: Retrieve all recommended users
 *     tags: [Users]
 *     description: Retrieve all recommended users
 *
 *     responses:
 *       200:
 *         description: ok
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
userRouter.get('/list/recommendation', userController.getRecommendedUser);

/**
 * @swagger
 * /api/v1/users/subscription/{userId}:
 *   get:
 *     summary: Retrieve all user subscriptions
 *     tags: [Users]
 *     description: Retrieve all user subscriptions
 *
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSubscription'
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
userRouter.get('/subscription/:userId', userController.getMySubscription);

/**
 * @swagger
 * /api/v1/users/subscription/year/{year}:
 *   get:
 *     summary: Retrieve user subscription by year
 *     tags: [Users]
 *     description: Retrieve user subscription by year
 *
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSubscription'
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
userRouter.get('/subscription/year/:year', userController.getSubscriptionByYear);

/**
 * @swagger
 * /api/v1/users/subscription/recommendation/{userId}:
 *   get:
 *     summary: Retrieve subscription of user who recommended by me
 *     tags: [Users]
 *     description: Retrieve subscription of user who recommended by me
 *
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/UserSubscription'
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
userRouter.get(
  '/subscription/recommendation/:userId',
  userController.getSubscriptionOfRecommendedUser
);

export { userRouter };
