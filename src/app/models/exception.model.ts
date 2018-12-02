export interface IError {
    readonly message: string;
    readonly stack: string;
}

export interface IHttpError<Response> extends IError {
    response: Response;
    status: number;
    statusText: string;
}