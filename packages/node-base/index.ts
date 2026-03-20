import { predefinedCredentialsStructure, predefinedNodesStructure } from "./nodes-data/constants";

export const node = Object.values(predefinedNodesStructure).map((n) => n.type);
export const credential = Object.values(predefinedCredentialsStructure).map((n) => n.type);