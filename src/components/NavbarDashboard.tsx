import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLoader } from '../context/LoaderContext';

const NavbarDashboard: React.FC = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
    }, []);

    const { setIsLoading } = useLoader();

    const handleLogout = () => {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('role');
        setIsLoading(true);
        window.location.href = '/';
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top py-3">
                <div className="container-fluid px-5 d-flex justify-content-between align-items-center">
                    <Link className="navbar-brand border-0" to="/dashboard">ANIMEDAILY.</Link>
                    <div className="d-flex align-items-center">
                        <Link
                            className="btn btn-dark border-light border-2 me-2"
                            type="button"
                            to="/"
                            onClick={() => setIsLoading(false)}
                        >
                            <i className="bi bi-house-fill"></i>
                        </Link>
                        <div className="dropdown">
                            <button
                                className="btn btn-dark dropdown-toggle border-light border-2"
                                type="button"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {role === 'admin' ? 'REIIV' : 'GUEST'}
                                &nbsp;&nbsp;
                                {role === 'admin' ? (
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
                                        onClick={handleLogout}
                                    >
                                        LOGOUT
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavbarDashboard;
