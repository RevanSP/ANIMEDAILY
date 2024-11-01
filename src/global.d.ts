/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_EMAIL: string;
            REACT_APP_PASSWORD: string;
        }
    }

    interface Window {
        bootstrap: {
            Modal: {
                getInstance(element: HTMLElement): any; 
                new (element: HTMLElement): {
                    show(): void; 
                    hide(): void;
                };
            };
        };
    }

    declare const bootstrap: any; 
}

export {};
