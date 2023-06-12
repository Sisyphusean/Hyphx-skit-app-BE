import bcrypt from 'bcrypt';

// Function to hash the password
export const hashPassword = (password: string): Promise<string | Error> => {

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (error, salt) => {
            if (error) {
                reject(error)
            }

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(error)
                }

                resolve(hash)
            })
        })
    })

};

// Function to compare the provided password with the hashed password
export const comparePassword = (enteredPassword: string, databasePassword: string): Promise<boolean | Error> => {

    return new Promise((resolve, reject) => {
        bcrypt.compare(enteredPassword, databasePassword, (error, isMatched) => {
            if (error) {
                reject(error)
            }

            resolve(isMatched)
        })
    })

};
