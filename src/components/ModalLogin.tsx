import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalLogin: React.FC = () => {
    const [email, setEmail] = useState('reiidev@gmail.com');
    const [password, setPassword] = useState('1sampai8'); 
    const [alertVisible, setAlertVisible] = useState(false); 
    const [alertMessage, setAlertMessage] = useState(''); 
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement | null>(null); 

    const handleLogin = () => {
        const adminEmail = import.meta.env.VITE_APP_EMAIL_ADMIN;
        const adminPassword = import.meta.env.VITE_APP_PASSWORD_ADMIN;
        const guestEmail = import.meta.env.VITE_APP_EMAIL_GUEST;
        const guestPassword = import.meta.env.VITE_APP_PASSWORD_GUEST;

        if (email === adminEmail && password === adminPassword) {
            if (modalRef.current) {
                const modal = modalRef.current; 
                const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide(); 
                }
            }
            localStorage.setItem('isLogin', 'true'); 
            localStorage.setItem('role', 'admin'); 
            navigate('/dashboard');
        }
        else if (email === guestEmail && password === guestPassword) {
            if (modalRef.current) {
                const modal = modalRef.current; 
                const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide(); 
                }
            }

            localStorage.setItem('isLogin', 'true'); 
            localStorage.setItem('role', 'guest'); 

            navigate('/dashboard');
        } else {
            setAlertMessage('Invalid email or password. Please try again.'); 
            setAlertVisible(true); 
            setTimeout(() => {
                setAlertVisible(false);
            }, 3000);
        }
    };

    useEffect(() => {
        const handleModalHide = () => {
            setEmail('reiidev@gmail.com'); 
            setPassword('1sampai8');
            setAlertVisible(false);
            setAlertMessage('');
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalHide);

            return () => {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHide);
            };
        }
    }, []);

    return (
        <div
            className="modal fade"
            id="login"
            tabIndex={-1}
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">LOGIN</h1>
                        <button
                            type="button"
                            className="btn-close bg-light"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex justify-content-center py-5">
                            <img loading="lazy"
                                src="/assets/img/favicon.png"
                                alt="Thumbnail"
                                style={{ maxWidth: '150px' }}
                            />
                        </div>
                        {alertVisible && (
                            <div className="alert alert-dark border-secondary border-2 small rounded" role="alert">
                                {alertMessage}
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-light" onClick={handleLogin}>LOGIN</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalLogin;
