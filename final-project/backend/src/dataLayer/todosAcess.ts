import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { TodoUpdate } from '../models/TodoUpdate';
var AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// DONE!: Implement the dataLayer logic. To add 50 more lines of code. 22:10 YT

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME

    ){}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get all todos function called')

        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
            ':userId': userId
            }
        })
        .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item function called')

        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
        logger.info('Todo item created', result)

        return todoItem as TodoItem
    }

    async updateTodoItem(
        userId: string,
        todoId: string,
        todoUpdate: TodoUpdate
    ): Promise<TodoUpdate> {
        logger.info('Update todo item function called')

        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
            todoId,
            userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeValues: {
                '#name': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        })
        .promise()

        return todoUpdate as TodoUpdate
    }
}