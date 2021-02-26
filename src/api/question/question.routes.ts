import { Router } from 'express';
import questionController from './question.controller';
import questionHelper from '../../helpers/question.helper';
import { validate } from '../../middleware/request-validation.middleware';
import { requireRoles } from '../../middleware/auth.middleware';
import { USER_ROLES } from '../../constants';

const questionRouter = Router();
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
 *   Question:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        language:
 *          type: string
 *        question:
 *          type: string
 *        choice:
 *          type: array
 *          items:
 *             type: string
 *        solution:
 *          type: array
 *          items:
 *             type: string
 *        level:
 *          type: string
 *        expectedTime:
 *          type: string
 *        questionType:
 *          type: string
 *        testId:
 *          type: string
 *
 *   NewQuestionResponse:
 *      type: object
 *      properties:
 *        message:
 *          $ref: '#/definitions/SuccessMessage'
 *        data:
 *          $ref: '#/definitions/Question'
 *
 *   SuccessMessage:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/v1/question:
 *   post:
 *     summary: create question
 *     tags: [Question]
 *     description: create a new question
 *     parameters:
 *       - in: body
 *         name: question
 *         schema:
 *           $ref: '#/definitions/Question'
 *     responses:
 *       201:
 *         description: Question saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/NewQuestionResponse'
 *
 *       400:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */

questionRouter.post(
  '/mcq',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  validate(questionHelper.createMultipleChoiceRule()),
  questionController.createMultipleChoice
);

/**
 * @swagger
 * /api/v1/question/{id}:
 *   get:
 *     summary: Get a specific question
 *     tags: [Question]
 *     description: Get a specific question by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Question'
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 */
questionRouter.get('/:id', questionController.getOne);

/**
 * @swagger
 * /api/v1/question/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Question]
 *     description: Delete a specific question
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
questionRouter.delete('/:id', questionController.remove);

/**
 * @swagger
 * /api/v1/question/mcq/{id}:
 *   patch:
 *     summary: Update a question
 *     tags: [Question]
 *     description: Update a specific question
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/definitions/Question'
 *       404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/Error'
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#definitions/ValidationError'
 */
questionRouter.put(
  '/mcq/:id',
  requireRoles([USER_ROLES.SUPER_ADMIN]),
  validate(questionHelper.updateMultipleChoiceRule()),
  questionController.updateMultipleChoice
);

export { questionRouter };
