import { Auth } from "../../utils/Auth";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { HumsaferError } from "../../models/HumsaferError";
import { BACKEND_URL_V1, post } from "../../utils/Api";
import { IInitiateAuthSessionResponse } from "../../api/AuthApi";

export const validatePhone = async (
  phoneNumber: string
): Promise<HumsaferError | IInitiateAuthSessionResponse> => {

  if (!isPossiblePhoneNumber(phoneNumber)) {
    return new HumsaferError("Invalid phone number");
  }

  try {
    const response = await post<void>(
      `${BACKEND_URL_V1}/validate/login/${phoneNumber}`
    );

    if (response.ok) {
      return await Auth.getInstance().signInWithPhoneNumberV2(phoneNumber);
    }

    if (response.status === 400) {
      return new HumsaferError("Phone number is not allowed to access portal, please contact your administrator.");
    }
  } catch (err) {
    console.log(err);
  }

  return new HumsaferError("Something went wrong");
};
