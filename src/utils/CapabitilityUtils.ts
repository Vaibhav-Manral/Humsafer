import { Capability } from "../models/User";
import { Auth } from "./Auth";

function containsCapability(capabilites: Capability[] | undefined, requiredCapability: Capability) {
    if (capabilites === undefined) {
        return false;
    }

    return capabilites.includes(requiredCapability);
}

export function isAllowedToSetShipmentPriority() {
    const capabilites = Auth.getInstance().getUserSettings()?.capabilities;
    return containsCapability(capabilites, Capability.ALL)
        || containsCapability(capabilites, Capability.ALL_DMS_FEATURES)
        || containsCapability(capabilites, Capability.SET_SHIPMENT_PRIORITY)
}

export function isAllowedToSetShipmentStatus() {
    const capabilites = Auth.getInstance().getUserSettings()?.capabilities;
    return containsCapability(capabilites, Capability.ALL)
        || containsCapability(capabilites, Capability.ALL_DMS_FEATURES)
        || containsCapability(capabilites, Capability.SET_SHIPMENT_STATUS)
}

export function isAllowedToSwitchCompanies() {
    const capabilites = Auth.getInstance().getUserSettings()?.capabilities;
    return containsCapability(capabilites, Capability.ALL);
}
