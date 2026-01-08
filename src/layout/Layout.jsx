import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BsHouseDoor, BsHouseDoorFill, BsBookmark, BsBookmarkFill, BsPlayBtn, BsFillPlayBtnFill, BsGithub, BsInstagram, BsFacebook, BsInfoCircleFill, BsMoonStars, BsBrightnessHigh } from 'react-icons/bs';
import { useTheme } from './../contexts/ThemeContext';
import heroImage from '/src/assets/herosection.avif';

const Layout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const socialLinks = [
        { icon: BsGithub, href: "https://github.com/RevanSP", label: "Github" },
        { icon: BsInstagram, href: "https://www.instagram.com/m9nokuro/", label: "Instagram" },
        { icon: BsFacebook, href: "https://web.facebook.com/profile.php?id=100082958149027&_rdc=1&_rdr", label: "Facebook" },
    ];

    const isHomePage = location.pathname === "/";

    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                console.log(choiceResult.outcome === 'accepted' ? 'User accepted the A2HS prompt' : 'User dismissed the A2HS prompt');
                setDeferredPrompt(null);
            });
        }
    };

    const footerMarginClass = location.pathname === '/dev/dashboard' ? '' : 'mb-16';

    return (
        <div className="flex flex-col min-h-screen">
            <div className="navbar bg-base-200 fixed top-0 left-0 w-full z-50">
                <div className="navbar-start">
                    <Link className="btn btn-ghost text-xl text-orange" to="/">ANIMEDAILY.</Link>
                </div>
                <div className="navbar-end">
                    <button className="btn btn-ghost btn-circle" onClick={toggleTheme}>
                        {theme === "black" ? <BsBrightnessHigh className="text-orange" /> : <BsMoonStars className="text-orange" />}
                    </button>
                </div>
            </div>

            {isHomePage && (
                <div className="hero relative mt-16" style={{ backgroundImage: `url(${heroImage})` }}>
                    <div className="absolute inset-0 bg-black opacity-75"></div>
                    <div className="py-14 hero-content text-neutral-content text-center relative">
                        <div className="max-w-md">
                            <h1 className="mb-3 text-3xl font-bold text-orange">ANIMEDAILY.</h1>
                            <p className="mb-6 text-xl">The best place for the latest and most complete information about your favorite anime.</p>
                            <div className="join">
                                <button className="btn join-item bg-orange border-none hover:bg-gray-800 text-black rounded-lg" onClick={handleInstallClick}>
                                    DOWNLOAD APP NOW !
                                </button>
                                <button className="btn join-item border-orange border-2 bg-base-100 tooltip tooltip-left before:w-[12rem] before:content-[attr(data-tip)] rounded-lg" data-tip="Works only on certain browsers, e.g., Chrome.">
                                    <BsInfoCircleFill className="text-orange" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow">{children}</div>

            <footer className={`footer footer-center bg-base-200 text-base-content rounded p-6 ${footerMarginClass}`}>
                <nav>
                    <div className="grid grid-flow-col gap-4">
                        {socialLinks.map((social, index) => (
                            <a key={index} className="btn bg-orange btn-circle hover:bg-base-300 border-none hover:text-orange" href={social.href}>
                                <social.icon className="text-xl" />
                            </a>
                        ))}
                    </div>
                </nav>
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All rights reserved by <span className="text-orange">ReiivanTheOnlyOne .</span></p>
                </aside>
            </footer>

            {location.pathname !== '/dev/dashboard' && (
                <div className="btm-nav btm-nav-md bg-base-300 !z-50">
                    <Link to="/library" className={isActive('/library') ? 'active text-orange' : ''}>
                        {isActive('/library') ? <BsBookmarkFill /> : <BsBookmark />}
                        <span className="btm-nav-label">LIBRARY</span>
                    </Link>

                    <Link to="/" className={isActive('/') ? 'active text-orange' : ''}>
                        {isActive('/') ? <BsHouseDoorFill /> : <BsHouseDoor />}
                        <span className="btm-nav-label">HOME</span>
                    </Link>

                    <Link to="/anime" className={isActive('/anime') ? 'active text-orange' : ''}>
                        {isActive('/anime') ? <BsFillPlayBtnFill /> : <BsPlayBtn />}
                        <span className="btm-nav-label">ANIME</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Layout;