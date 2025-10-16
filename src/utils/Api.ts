import { HumsaferError } from "../models/HumsaferError";
import { IHumsaferServerError } from "../models/HumsaferServerError";
import { Auth } from "./Auth";
import { Config } from "./Config";

const HUMSAFER_BACKEND = Config.getInstance().getHost();
const VERSION1 = "v1";
export const BACKEND_URL_V1 = `${HUMSAFER_BACKEND}/api/portal/${VERSION1}`;
export const BACKEND_URL_V2 = `${HUMSAFER_BACKEND}/${VERSION1}`;
interface HttpResponse<T> extends Response {
    parsedBody?: T;
    serverError?: IHumsaferServerError;
}

async function http<T>(
    path: string,
    args: RequestInit,
    processSucessResponse: boolean = true,
    processErrorResponse: boolean = true,
    retries: number = 1
): Promise<HttpResponse<T>> {
    const tokenOrError = await Auth.getInstance().getToken();
    const newHeaders = new Headers(args.headers);
    if (tokenOrError && !(tokenOrError instanceof HumsaferError)) {
        newHeaders.set("Authorization", `Bearer ${tokenOrError}`);
    }
    args.headers = newHeaders;
    const request = new Request(path, args);
    const response: HttpResponse<T> = await fetch(request);

    if (response.ok) {
        if (!processSucessResponse) {
            return response;
        }
        try {
            response.parsedBody = await response.json();
        } catch (ex) {
            // may error if there is no body
        }
        return response;
    }

    if (response.status === 401 && retries > 0) {
        await Auth.getInstance().refreshToken();
        return http<T>(
            path,
            args,
            processSucessResponse,
            processErrorResponse,
            retries - 1
        );
    }

    if (response.status === 401 || response.status === 403) {
        // logout user if even after retry we get a 401 or 403 from server
        Auth.getInstance().logout();
    } else {
        if (!processErrorResponse) {
            return response;
        }

        try {
            response.serverError = await response.json();
        } catch (ex) {
            // may error if there is no body
            console.log(ex);
        }
    }

    return response;
}

export async function get<T>(
    path: string,
    processSucessResponse?: boolean,
    args: RequestInit = { method: "get" }
): Promise<HttpResponse<T>> {
    return await http<T>(path, args, processSucessResponse);
}

export async function post<T>(
    path: string,
    body?: any,
    args: RequestInit = {
        method: "post",
        body: JSON.stringify(body),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    },
    processErrorResponse?: boolean
): Promise<HttpResponse<T>> {
    return await http<T>(path, args, true, processErrorResponse);
}

// 'delete' is a reserved word, so just adding an extra 'e' at the end
export async function deletee<T>(
    path: string,
    body?: any,
    args: RequestInit = { method: "delete", body: JSON.stringify(body) }
): Promise<HttpResponse<T>> {
    return await http<T>(path, args);
}
