//express-validator
import { checkSchema, validationResult } from 'express-validator';

//Regex
import { youtubeRegex, twitchRegex } from '../constants/regex';

/**
 * This schema validates the endpoint used to update the details of Hx being live
 */
export const updateLiveStreamSchema = checkSchema({
    streamingOn: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "Platform being streamed on must be a string",
            bail: true
        },
        notEmpty: {
            errorMessage: "Platform being streamed on must not be empty",
            bail: true
        },
        isIn: {
            options: [['twitch', 'youtube', 'none']],
            errorMessage: "Platform being streamed on must be either Twitch, Youtube, or none (case sensitive)",
            bail: true
        }
    },


    streamingLink: {
        in: ['body'],
        isString: {
            errorMessage: "Streamlink must be a string",
            bail: true
        },
        optional: true,
        isURL: {
            options: {
                protocols: ['https'],
                require_protocol: true,
                require_host: true,
                host_whitelist: [youtubeRegex, twitchRegex],
            },
            errorMessage: "Streamlink must be a valid Youtube or Twitch URL",
            bail: true
        }

    },

    activityType: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "Activity type must be a string",
            bail: true
        },
        notEmpty: {
            errorMessage: "Activity type must not be empty",
            bail: true
        },
        isIn: {
            options: [['raid', 'nameskit', 'none']],
            errorMessage: "Activity type must be either raid, nameskit, or none (case sensitive)",
            bail: true
        }
    }
})