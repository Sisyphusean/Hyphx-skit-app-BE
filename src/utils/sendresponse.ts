
import { responseTypes } from "../interfaces/types";

import { Response } from 'express';

/**
 * This Object contains the functions that are is used to send response to the client
 */
export const sendResponse = {

    /**
     * This function is used to send a successful 200 response to the client
     * @param res This is the response object used to send the message
     * @param message This is the message to be sent to the clients
     * @param status Default status here is 200
     * @param data This is an option data object to be sent to the client
     * @returns 
     */
    success: (
        res: Response,
        message: string,
        status: responseTypes["success"] = 200,
        data = {}) => {

        const response = {
            status,
            message,
            data
        };

        return res.status(status).json(response);
    },

    /**
     * This function is used to send a 400 response to the client
     * @param res This is the response object used to send the message
     * @param message This is the message to be sent to the client
     * @param status Default status here is 400
     * @param data This is an option data object to be sent to the client
     * @returns 
     */
    badRequest: (
        res: Response,
        message: string,
        status: responseTypes["badRequest"] = 400,
        data = {}) => {

        const response = {
            status,
            message,
            data
        };

        return res.status(status).json(response);
    },

    /**
     * This function is used to send a forbidden 403 response to the client
     * @param res This is the response object used to send the message
     * @param message This is the message to be sent to the client. It is set to Access Denied by default
     * @param status Default status here is 403
     * @returns 
     */
    forbidden: (
        res: Response,
        message: string = "Access Denied",
        status: responseTypes["forbidden"] = 403) => {

        const response = {
            status,
            message
        };

        return res.status(status).json(response);
    },

    notFound: (
        res: Response,
        message: string = "Resource not Found",
        status: responseTypes["notFound"] = 404) => {

        const response = {
            status,
            message
        };

        return res.status(status).json(response);
    },

    conflict: (
        res: Response,
        message: string = "Resource already exists",
        status: responseTypes["conflict"] = 409,
        data = {}
    ) => {
        const response = {
            status,
            message,
            data
        };

        res.status(status).json(response);
    },

    /**
    * This function is used to send an internal error with the status code of 500 to the client
    * @param res This is the response object used to send the message
    ** @param message This is the message to be sent to the client. It is set to Internal Server Error by default
    * @param status Default status here is 500
    * @returns 
    */
    internalError: (
        res: Response,
        message: string = "Internal Server Error",
        status: responseTypes["internalServerError"] = 500) => {

        const response = {
            status,
            message
        };

        return res.status(status).json(response);
    }
}