import { predefinedCredentialsStructure } from "@workspace/node-base";
import { NodeCredentialsName } from "@workspace/types";

export const availableCredentialsObj = predefinedCredentialsStructure;

export const getCredentialByType = (credentialType: NodeCredentialsName) => {
    return availableCredentialsObj[credentialType];
}

export const getAllCredentials = () => {
    const credentials = Object.keys(availableCredentialsObj).map((key) => {
        const cred = availableCredentialsObj[key as NodeCredentialsName];
        return {
            name: cred.name,
            displayName: cred.displayName,
            properties: cred.properties
        }
    })
    return credentials;
}

export const availableCredentials = getAllCredentials();