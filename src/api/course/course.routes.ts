import express from 'express';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';
import { courseValidator } from '../../helpers/user-profile-validation.helper';
import courseController from './course.controller';
import { validate } from '../../middleware/request-validation.middleware';

const courseRouter = express.Router();

/**
 * @swagger
 * definition:
 *   CourseSuccessResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         example: action performed successfully
 *
 *   CourseResponse:
 *     type: object
 *     properties:
 *       data:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: john
 *             instructor:
 *               type: string
 *               example: instructor name
 *
 *             languageTaught:
 *               type: string
 *               example: English
 *
 *             currentLangSpecsUpdated:
 *               type: boolean
 *               example: false
 *             existingCourseLink:
 *               type: string
 *               example: https://cover.com
 *
 *             coverImageLink:
 *               type: string
 *               example:  https://cover.com/image.jpeg
 *
 *   CourseSpecificResponse:
 *     type: object
 *     properties:
 *       name:
 *        type: string
 *        example: john
 *       instructor:
 *         type: string
 *         example: instructor name
 *
 *       languageTaught:
 *         type: string
 *         example: English
 *
 *       currentLangSpecsUpdated:
 *         type: boolean
 *         example: false
 *       existingCourseLink:
 *         type: string
 *         example: https://cover.com
 *
 *       coverImageLink:
 *       type: string
 *       example:  https://cover.com/image.jpeg
 *
 *   SuccessMessage:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Register a course
 *     tags: [Courses]
 *     description: Register a course
 *     parameters:
 *       - name: name
 *         description: name of course
 *         in: body
 *         required: true
 *         type: string
 *       - name: languageTaught
 *         description: language taught
 *         in: body
 *         required: true
 *         type: string
 *       - name: instructor
 *         description: name of instructor
 *         in: body
 *         required: true
 *         type: string
 *       - name: currentLangSpecsUpdated
 *         description: currentLangSpecsUpdated
 *         in: body
 *         required: true
 *         type: boolean
 *       - name: existingCourseLink
 *         description: course link
 *         in: body
 *         required: true
 *         type: string
 *       - name: coverImageLink
 *         description: cover image link
 *         in: body
 *         required: true
 *         type: string
 *       - name: verificationStatus
 *         description: verification status
 *         in: body
 *         required: false
 *         type: string
 *       - name: level
 *         description: level
 *         in: body
 *         required: true
 *         type: string
 *       - name: duration
 *         description: duration
 *         in: body
 *         required: true
 *         type: string
 *       - name: description
 *         description: description
 *         in: body
 *         required: true
 *         type: string
 *       - name: price
 *         description: price
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                  $ref: '#/definitions/CourseSpecificResponse'
 *                message:
 *                  $ref: '#definitions/SuccessMessage'
 *
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RegistrationError'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RegistrationError'
 */
courseRouter.post(
  '/',
  requireRoles([USER_ROLES.TRAINING_AFFILIATE]),
  validate(courseValidator()),
  courseController.registerCourse
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     description: Update a course
 *     parameters:
 *       - name: name
 *         description: name of course
 *         in: body
 *         required: true
 *         type: string
 *       - name: languageTaught
 *         description: language taught
 *         in: body
 *         required: true
 *         type: string
 *       - name: instructor
 *         description: name of instructor
 *         in: body
 *         required: true
 *         type: string
 *       - name: currentLangSpecsUpdated
 *         description: currentLangSpecsUpdated
 *         in: body
 *         required: true
 *         type: boolean
 *       - name: existingCourseLink
 *         description: course link
 *         in: body
 *         required: true
 *         type: string
 *       - name: coverImageLink
 *         description: cover image link
 *         in: body
 *         required: true
 *         type: string
 *       - name: verificationStatus
 *         description: verification status
 *         in: body
 *         required: false
 *         type: string
 *       - name: level
 *         description: level
 *         in: body
 *         required: true
 *         type: string
 *       - name: duration
 *         description: duration
 *         in: body
 *         required: true
 *         type: string
 *       - name: description
 *         description: description
 *         in: body
 *         required: true
 *         type: string
 *       - name: price
 *         description: price
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                  $ref: '#/definitions/CourseSpecificResponse'
 *                message:
 *                  $ref: '#definitions/SuccessMessage'
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RegistrationError'
 *       500:
 *          description: Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/RegistrationError'
 */
courseRouter.put(
  '/:id',
  requireRoles([USER_ROLES.SUPER_ADMIN, USER_ROLES.TRAINING_AFFILIATE]),
  validate(courseValidator()),
  courseController.updateCourse
);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Fetch all courses
 *     tags: [Courses]
 *     description: Fetch all courses
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CourseResponse'
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
courseRouter.get(
  '/',
  requireRoles([USER_ROLES.SUPER_ADMIN, USER_ROLES.TALENT, USER_ROLES.TRAINING_AFFILIATE]),
  courseController.listCourses
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Fetch specific course
 *     tags: [Courses]
 *     description: Fetch specific course
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                data:
 *                  $ref: '#/definitions/CourseSpecificResponse'
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
courseRouter.get(
  '/:id',
  requireRoles([USER_ROLES.SUPER_ADMIN, USER_ROLES.TALENT, USER_ROLES.TRAINING_AFFILIATE]),
  courseController.listSpecificCourse
);

/**
 * @swagger
 * /api/v1/courses/status/:status:
 *   get:
 *     summary: Fetch all courses by status
 *     tags: [Courses]
 *     description: Fetch all courses by status
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CourseResponse'
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

courseRouter.get(
  '/status/:status',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  courseController.listCoursesByStatus
);

/**
 * @swagger
 * /api/v1/courses/owner:
 *   get:
 *     summary: Fetch number of courses added by the course owner
 *     tags: [Courses]
 *     description: Fetch all courses by status
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: id
 *                 count:
 *                  type: string
 *                  description: 34
 *                 users:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      username:
 *                        type: string
 *                      profilePicture:
 *                        type: string
 *
 *
 *       401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
courseRouter.get('/group/owner', courseController.groupNumberOfCourseByOwner);

/**
 * @swagger
 * /api/v1/courses/affiliate/:id:
 *   get:
 *     summary: Fetch all courses of affiliate user
 *     tags: [Courses]
 *     description: Fetch all courses of affiliate user
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CourseResponse'
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
courseRouter.get('/affiliate/:id', courseController.listCourseOfAffiliateUser);

/**
 * @swagger
 * /api/v1/courses/sold/:userId:
 *   get:
 *     summary: Fetch all courses bought by a given user
 *     tags: [Courses]
 *     description: Fetch all courses bought by a given user
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CourseResponse'
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
courseRouter.get('/sold/:userId', courseController.fetchSoldCourses);

/**
 * @swagger
 * /api/v1/:courseId/customers:
 *   get:
 *     summary: Fetch all customers for a given courses
 *     tags: [Courses]
 *     description: Fetch all customers for a given courses
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CourseResponse'
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
courseRouter.get('/:courseId/customers', courseController.getCourseBuyers);

export { courseRouter };
