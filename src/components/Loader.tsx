import React, { useEffect, useState } from 'react';
import { useLoader } from '../context/LoaderContext';

const Loader: React.FC = () => {
    const { isLoading, setIsLoading } = useLoader();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setFadeOut(true);
            }, 1300);

            const loadingTimer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);

            return () => {
                clearTimeout(timer);
                clearTimeout(loadingTimer);
            };
        } else {
            setFadeOut(false);
        }
    }, [isLoading, setIsLoading]);

    return (
        <>
            {isLoading && (
                <div className={`loader-wrapper ${fadeOut ? 'fade-out' : ''}`}>
                    <span className="loader"></span>
                </div>
            )}
        </>
    );
};

export default Loader;
