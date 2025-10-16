import { jsonConfig } from "./configs/ConfigProvider";
import { Environment } from "./Environment";

export class Config {
  private static instance: Config;
  private config: ReturnType<typeof jsonConfig>;
  private environment: Environment;

  private constructor() {
    const reactEnv = process.env.REACT_APP_ENV as
      | "dev"
      | "stage"
      | "prod"
      | undefined;
    switch (reactEnv) {
      case "dev":
        this.environment = Environment.DEV;
        break;
      case "stage":
        this.environment = Environment.STAGE;
        break;
      case "prod":
        this.environment = Environment.PROD;
        break;
      default:
        this.environment = Environment.DEV;
        break;
    }

    this.config = jsonConfig(this.environment);
  }

  public static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public getHost() {
    return this.config.server.host;
  }

  public getFirebaseConfig() {
    return this.config.firebase;
  }

  public getMapKeyConfig() {
    return this.config.mapKey.key;
  }

  public getEnvironment() {
    return this.environment;
  }

  public getFEHost() {
    return this.environment === Environment.DEV
      ? "https://devportal.humsafer.co.in/"
      : this.environment === Environment.STAGE
      ? "https://stageportal.humsafer.co.in/"
      : "https://portal.humsafer.co.in/";
  }

  public themeConfig() {
    return {
      primaryColor: "#ed731d",
      primaryTextColor: "#595959", //"#ffffff",
      selectedColor: "#F06B24", // "#d5671a",
      primaryBgColor: "#F06B240F",
      logoDark: "/assets/humsaferLogo.png",
      logoLight: "/assets/humsaferLogoWhite.png",
      logo: "/assets/logo.png",
      collapseLogo:'/assets/collapsLogo.png',
      smallLogo: "/assets/smallLogo.png",
      logoBg: "/assets/loginbg.png",
      shipmentBg: "/assets/shipmentBg.png",
      favIcon: "/assets/favicon.ico",
      sourceIcon: "/assets/sourceIcon.svg",
      destinationIcon: "/assets/destinationIcon.svg",
      intermediateIcon: "/assets/intermediateIcon.svg",
      fastagLogo: "/assets/fastagLogo.png",
      fuelStopIcon: "/assets/fuelStation.svg",
      currentLocationIcon: "/assets/currentLocation.svg",
    };
  }

  public getSupportedCountries() {
    // Order is important, do not change
    return [
      {
        countryCode: "IN",
        prefix: "+91",
      },
    ];
  }
}
