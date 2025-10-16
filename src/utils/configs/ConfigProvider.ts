import { Environment } from "../Environment";
import stageConfig from "./stage.json";
import prodConfig from "./prod.json";
import developConfig from "./develop.json";

export function jsonConfig(environment: Environment) {
  let config;
  switch (environment) {
    case Environment.DEV:
      config = developConfig;
      break;
    case Environment.STAGE:
      config = stageConfig;
      break;
    case Environment.PROD:
      config = prodConfig;
      break;
    default:
      throw new Error("Invalid Environment " + environment);
  }
  return config;
}
