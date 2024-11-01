import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-light py-4">
            <div className="container-fluid px-5">
                <div className="row align-items-center">
                    <div className="col-6 text-start">
                        <p className="mb-0">ReiivanTheOnlyOne.</p>
                    </div>
                    <div className="col-6 text-end">
                        <a
                            href="https://github.com/RevanSP"
                            className="text-light me-3"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-github"></i>
                        </a>
                        <a
                            href="https://www.instagram.com/m9nokuro"
                            className="text-light me-3"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-instagram"></i>
                        </a>
                        <a
                            href="https://web.facebook.com/profile.php?id=100082958149027&_rdc=1&_rdr"
                            className="text-light"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="bi bi-facebook"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
