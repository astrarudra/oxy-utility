import { messageLogger, welcomeMessage } from "./helper";

function OxyLocker(obj, unlockFn, windowVariable = "Oxy") {
    return {
        unlock: async (input) => {
            console.log("Validating...");
            if (await unlockFn(input)) {
                console.log("Initilizing - ")
                await new Promise((resolve) => setTimeout(resolve, 1000));
                window[windowVariable] = obj;
                messageLogger(welcomeMessage)
            } else {
                console.log("Validation Failed");
            }
        },
    };
}

export { OxyLocker };
