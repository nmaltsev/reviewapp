// Declaration of public Api

// TODO change any on normal definitions!

interface ISolidAuth {
    currentSession(Storage?): any;
    fetch(...any): Promise<any>;
    login(...any): any;
    logout(): Promise<any>;
    popupLogin(any): Promise<any>;
    trackSession(any): Promise<any>;
}

export interface ISolidRoot {
    auth: ISolidAuth;
}