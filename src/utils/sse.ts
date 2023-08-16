//Types
import { Request, Response, response } from 'express';

export const sendSseEvent = (eventType: string, arrayOfSSEResponses: Response[], data: any = '') => {

    const preparedData = {
        trigger: eventType,
        data: data
    }

    arrayOfSSEResponses.forEach((res) => {
        res.write(`data: ${JSON.stringify(preparedData)}\n\n`)
    })
}