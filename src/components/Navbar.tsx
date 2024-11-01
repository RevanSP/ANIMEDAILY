import ModalLogin from './ModalLogin';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavbarProps } from '../types/type';

const Navbar: React.FC<NavbarProps> = ({ searchQuery, handleSearchChange, totalAnimes }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error("Error attempting to enable fullscreen mode:", err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch((err) => {
                console.error("Error attempting to exit fullscreen mode:", err);
            });
        }
    };

    const handleAuthButtonClick = () => {
        const isLoggedIn = localStorage.getItem('isLogin') === 'true';
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            const modalToggleButton = document.querySelector('#login') as HTMLElement;
            if (modalToggleButton) {
                const modal = new window.bootstrap.Modal(modalToggleButton);
                modal.show();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('role');
        navigate('/');
    };

    const isLoggedIn = localStorage.getItem('isLogin') === 'true';
    const userRole = isLoggedIn ? (localStorage.getItem('role') || 'GUEST') : null;

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top py-3">
                <div className="container-fluid px-5">
                    <a className="navbar-brand border-0" href="#">ANIMEDAILY.</a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <form className="d-flex ms-auto mt-4 mt-sm-0">
                            <input
                                className="form-control me-2 py-2"
                                type="search"
                                placeholder={`Search Anime (${totalAnimes})`}
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <button
                                className="btn btn-light ms-2"
                                type="button"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                <i className={`bi ${isFullscreen ? 'bi-arrows-collapse' : 'bi-arrows-fullscreen'}`}></i>
                            </button>
                            {isLoggedIn ? (
                                <div className="dropdown ms-2">
                                    <button
                                        className="btn btn-dark border-light border-2 dropdown-toggle text-uppercase"
                                        type="button"
                                        id="dropdownMenuButton"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {userRole === 'admin' ? 'REIIV' : 'GUEST'}
                                        &nbsp;&nbsp;
                                        {userRole === 'admin' ? (
                                            <i className="bi bi-patch-check-fill text-primary"></i>
                                        ) : (
                                            <i className="bi bi-patch-exclamation-fill text-warning"></i>
                                        )}
                                        &nbsp;
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => navigate('/dashboard')}
                                            >
                                                DASHBOARD
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                LOGOUT
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <button
                                    className="btn btn-dark border-light border-2 ms-2"
                                    type="button"
                                    onClick={handleAuthButtonClick}
                                >
                                    LOGIN
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </nav>
            <ModalLogin />
        </>
    );
};

export default Navbar;
