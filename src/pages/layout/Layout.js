import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from "next/image";
import { BsHouseDoor, BsHouseDoorFill, BsBookmark, BsBookmarkFill, BsPlayBtn, BsFillPlayBtnFill, BsLock, BsEnvelope, BsGithub, BsInstagram, BsFacebook, BsInfoCircleFill, BsPersonCheck, BsPersonLock, BsMoonStars, BsBrightnessHigh } from 'react-icons/bs';

const Layout = ({ children }) => {
  const [theme, setTheme] = useState("black");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedInDeveloper, setIsLoggedInDeveloper] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/layout/Layout') {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

    setIsLoggedIn(cookies.isLoggedIn === "true");
    setIsLoggedInDeveloper(cookies.isLoggedInDeveloper === "true");

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "black";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "black" ? "lofi" : "black";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const isActive = (path) => router.pathname === path;

  const socialLinks = [
    { icon: BsGithub, href: "https://github.com/RevanSP", label: "Github" },
    { icon: BsInstagram, href: "https://www.instagram.com/m9nokuro/", label: "Instagram" },
    { icon: BsFacebook, href: "https://web.facebook.com/profile.php?id=100082958149027&_rdc=1&_rdr", label: "Facebook" },
  ];

  const isHomePage = router.pathname === "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("LOGIN");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setButtonText(<span className="loading loading-dots loading-xs"></span>);

    setTimeout(() => {
      if (
        email === process.env.NEXT_PUBLIC_EMAILDEV &&
        password === process.env.NEXT_PUBLIC_PASSWORDDEV
      ) {
        document.cookie = "isLoggedInDeveloper=true; path=/; max-age=3600";

        document.cookie = `email=${email}; path=/; max-age=3600`;

        setButtonText("LOGIN");
        setIsLoading(false);

        window.location.href = "/dev/dashboard";
      } else {
        setButtonText("Failed");
        setTimeout(() => {
          setButtonText("LOGIN");
        }, 3000);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    document.cookie = "isLoggedInDeveloper=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    setIsLoggedInDeveloper(false);
    router.push('/');
  };

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

        const reinstallListener = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          window.removeEventListener('beforeinstallprompt', reinstallListener);
        };
        window.addEventListener('beforeinstallprompt', reinstallListener);
      });
    }
  };

  const footerMarginClass = router.pathname === '/dev/dashboard' ? '' : 'mb-16';

  return (
    <>
      <dialog id="login" className="modal">
        <div className="modal-box border-orange border-2 rounded-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-orange">✕</button>
          </form>
          <h3 className="font-bold text-lg">LOGIN | DEV ZONE</h3>
          <div className="flex items-center justify-center mb-6 mt-3">
            <Image unoptimized
              src="/favicon.avif"
              className="w-48" alt="Logo"
              width={0}
              height={0}
              sizes="100vw"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <label className="input input-bordered flex items-center gap-2 border-orange bg-base-200 border-2 w-full mb-4">
              <BsEnvelope className="text-orange" />
              <input
                type="email"
                className="grow"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 border-orange bg-base-200 border-2 w-full mb-4">
              <BsLock className="text-orange" />
              <input
                type="password"
                className="grow"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="btn bg-orange hover:bg-base-200 w-full mt-4"
              disabled={isLoading}
            >
              {buttonText}
            </button>
          </form>
        </div>
      </dialog>
      <div className="flex flex-col min-h-screen">
        <div className="navbar bg-base-200 fixed top-0 left-0 w-full z-50">
          <div className="navbar-start">
            <button
              className="btn btn-ghost btn-circle"
              onClick={toggleTheme}
              aria-label={theme === "black" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "black" ? (
                <BsBrightnessHigh className="text-orange" />
              ) : (
                <BsMoonStars className="text-orange" />
              )}
            </button>
          </div>
          <div className="navbar-center">
            <Link className="btn btn-ghost text-xl text-orange" href="/" aria-label="Go to homepage">ANIMEDAILY.</Link>
          </div>
          <div className="navbar-end">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn text-orange btn-ghost btn-circle"
                aria-label={isLoggedIn || isLoggedInDeveloper ? "Profile settings" : "Login"}
              >
                {isLoggedIn || isLoggedInDeveloper ? (
                  <BsPersonCheck className="text-orange" />
                ) : (
                  <BsPersonLock className="text-orange" />
                )}
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-300 rounded-box z-[1] w-40 p-2 mr-2">
                {isLoggedIn || isLoggedInDeveloper ? (
                  <>
                    {router.pathname === '/dev/dashboard' ? (
                      <li><Link href="/" aria-label="Go to homepage">HOME</Link></li>
                    ) : (
                      <li><Link href="/dev/dashboard" aria-label="Go to dashboard">DASHBOARD</Link></li>
                    )}
                    <li><button onClick={handleLogout} aria-label="Logout">LOGOUT</button></li>
                  </>
                ) : (
                  <li>
                    <button onClick={() => document.getElementById('login').showModal()} aria-label="Open login modal">LOGIN</button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        {isHomePage && (
          <div className="hero relative mt-16" style={{ backgroundImage: "url(/herosection.avif)" }}>
            <div className="absolute inset-0 bg-black opacity-75"></div>
            <div className="py-14 hero-content text-neutral-content text-center relative">
              <div className="max-w-md">
                <h1 className="mb-3 text-3xl font-bold text-orange">ANIMEDAILY.</h1>
                <p className="mb-6 text-xl">
                  The best place for the latest and most complete information about your favorite anime. Explore genres, find the latest anime lists, and enjoy an amazing viewing experience.
                </p>
                <div className="join">
                  <button className="btn join-item bg-orange border-none hover:bg-gray-800 text-black rounded-lg" onClick={handleInstallClick}>
                    DOWNLOAD APP NOW !
                  </button>
                  <button
                    className="btn join-item border-orange border-2 bg-base-100 tooltip tooltip-left before:w-[12rem] before:content-[attr(data-tip)] rounded-lg"
                    data-tip="Works only on certain browsers, e.g., Chrome."
                    aria-label="Information about browser compatibility"
                  >
                    <BsInfoCircleFill className="text-orange" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex-grow">
          {children}
        </div>
        <footer className={`footer footer-center bg-base-200 text-base-content rounded p-6 ${footerMarginClass}`}>
          <nav>
            <div className="grid grid-flow-col gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  className="btn bg-orange btn-circle hover:bg-base-300 border-none hover:text-orange"
                  href={social.href}
                  aria-label={social.label}
                >
                  <social.icon className="text-xl" />
                </a>
              ))}
            </div>
          </nav>
          <aside>
            <p>
              Copyright © {new Date().getFullYear()} - All rights reserved by <span className="text-orange">ReiivanTheOnlyOne .</span>
            </p>
          </aside>
        </footer>
        {router.pathname !== '/dev/dashboard' && (
          <div className="btm-nav btm-nav-md bg-base-300 !z-50">
            <Link href="/library" className={isActive('/library') ? 'active text-orange' : ''}>
              {isActive('/library') ? <BsBookmarkFill /> : <BsBookmark />}
              <span className="btm-nav-label">LIBRARY</span>
            </Link>

            <a
              href="#"
              onClick={() => {
                window.location.href = '/';
              }}
              className={isActive('/') ? 'active text-orange' : ''}>
              {isActive('/') ? <BsHouseDoorFill /> : <BsHouseDoor />}
              <span className="btm-nav-label">HOME</span>
            </a>

            <Link href="/anime" className={isActive('/anime') ? 'active text-orange' : ''}>
              {isActive('/anime') ? <BsFillPlayBtnFill /> : <BsPlayBtn />}
              <span className="btm-nav-label">ANIME</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;