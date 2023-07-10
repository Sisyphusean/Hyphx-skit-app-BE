//express-validator
import { checkSchema } from 'express-validator';

//Validator js
import validator from 'validator';

//Regex
import { youtubeRegex, twitchRegex } from '../constants/regex';

// Custom validation function to check if the value is a valid date
function isValidDate(value: string) {
    const date = new Date(value);
    return !isNaN(date.getTime());
}


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

/**
 * This schema validates the endpoint used to update the details of Hx's Omegle tags
 */
export const updateOmegleStreamSchema = checkSchema({
    currentOmegleTags: {
        in: ['body'],
        isArray: {
            errorMessage: "Current omegle tags must only be an array of a string or strings",
            bail: true
        },
        notEmpty: {
            errorMessage: "Current omegle tags must not be empty",
            bail: true
        },
        custom: {
            options:
                //Custom function to check if the array contains only strings
                (value) => {

                    if (Array.isArray(value)) {

                        if(value.length == 0){
                            throw new Error("Current omegle tags must not be empty")
                        }

                        const isArrayValid = value.every(element => typeof element === 'string')

                        if (!isArrayValid) {
                            throw new Error("Current omegle tags must only be an array of a string or strings")
                        }

                        return value.map((element: string) => {
                            //Trim and escape each string
                            return validator.escape(validator.trim(element))
                        })
                    }

                    throw new Error("Current omegle tags must only be an array of a string or strings")
                }
        }
    }
})

export const saveFcmTokenSchema = checkSchema({
    token: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "The FCM token must be a token",
            bail: true
        },
        notEmpty: {
            errorMessage: "The FCM token must not be empty",
            bail: true
        }
    },

    platform: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "The user's platform must be a string",
            bail: true
        },
        notEmpty: {
            errorMessage: "The user's platform must not be empty",
            bail: true
        },
        isIn: {
            options: [['android', 'ios', 'macos', 'windows', 'linux', 'chromeos']],
            errorMessage: "The user's platform must be either android, ios, macos, windows, linux, or chromeos (case sensitive)",
            bail: true
        }
    }
})

export const validateFcmTokenSchema = checkSchema({
    token: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "The FCM token must be a token",
            bail: true
        },
        notEmpty: {
            errorMessage: "The FCM token must not be empty",
            bail: true
        }
    },
})

export const updateFcmTokenSchema = checkSchema({
    token: {
        in: ['body'],
        trim: true,
        escape: true,
        isString: {
            errorMessage: "The FCM token must be a token",
            bail: true
        },
        notEmpty: {
            errorMessage: "The FCM token must not be empty",
            bail: true
        }
    },

    messagelastreceivedon: {
        in: ['body'],
        trim: true,
        isString: {
            errorMessage: "The last message received date must be a date",
            bail: true
        },
        notEmpty: {
            errorMessage: "The last message received date must not be empty",
            bail: true
        },
        custom: {
            options: (value) => {
                const validDate = isValidDate(value)
                if (!validDate) {
                    throw new Error('The last message received date must be a valid date');
                }
                return true
            }
        }
    }
})