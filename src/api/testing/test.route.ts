import { Router } from 'express';
import testController from './test.controller';
import testHelper from '../../helpers/test.helper';
import { validate } from '../../middleware/request-validation.middleware';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';

const testRouter = Router();
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
 *
 *   Test:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        description:
 *          type: string
 *        timePolicy:
 *          type: string
 *        dateRegistered:
 *          type: string
 *        createdAt:
 *          type: string
 *
 *   NewTestResponse:
 *      type: object
 *      properties:
 *        message:
 *          $ref: '#/definitions/SuccessMessage'
 *        data:
 *          $ref: '#/definitions/Test'
 *
 *   SuccessMessage:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/test:
 *   post:
 *     summary: create test
 *     tags: [Test]
 *     description: create a new test
 *     responses:
 *       201:
 *         description: Test saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/NewTestResponse'
 *
 *       400:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */

testRouter.post(
  '/',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  validate(testHelper.createTestRule()),
  testController.createTest
);

export { testRouter };
