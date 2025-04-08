import Layout from "./layout/Layout";
import { useState, useEffect } from "react";
import Head from "next/head";

const LibraryPage = () => {
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
  const [animeToDelete, setAnimeToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedAnimes = JSON.parse(localStorage.getItem("bookmarkedAnimes") || "[]");
    setBookmarkedAnimes(storedAnimes.map(anime => ({
      title: typeof anime === 'string' ? anime : anime.title || '',
      checked: false
    })));

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSelectAllChange = (event) => {
    setSelectAll(event.target.checked);
    const updatedAnimes = bookmarkedAnimes.map(anime => ({
      ...anime,
      checked: event.target.checked
    }));
    setBookmarkedAnimes(updatedAnimes);
  };

  const handleCheckboxChange = (event, index) => {
    const updatedAnimes = [...bookmarkedAnimes];
    updatedAnimes[index].checked = event.target.checked;
    setBookmarkedAnimes(updatedAnimes);
  };

  const totalPages = Math.ceil(bookmarkedAnimes.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredAnimes = bookmarkedAnimes.filter((anime) =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentData = filteredAnimes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const selectedAnimes = bookmarkedAnimes.filter((anime) => anime.checked);
  const showPagination = filteredAnimes.length > 0;
  const isDeleteButtonEnabled = selectedAnimes.length >= 2;

  const [showToast, setShowToast] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleDeleteSingleAnime = () => {
    const updatedAnimes = bookmarkedAnimes.filter((anime) => anime.title !== animeToDelete);
    setBookmarkedAnimes(updatedAnimes);
    localStorage.setItem("bookmarkedAnimes", JSON.stringify(updatedAnimes));
    document.getElementById("delete_library").close();

    setShowToast(true);
    setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  const handleDeleteMultipleAnimes = () => {
    const updatedAnimes = bookmarkedAnimes.filter((anime) => !anime.checked);
    setBookmarkedAnimes(updatedAnimes);
    localStorage.setItem("bookmarkedAnimes", JSON.stringify(updatedAnimes));
    document.getElementById("delete_library").close();

    setShowToast(true);
    setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  const getPaginationRange = () => {
    if (isMobile) {
      const start = Math.floor((currentPage - 1) / 5) * 5 + 1;
      return Array.from({ length: 5 }, (_, i) => start + i).filter(page => page <= totalPages);
    } else {
      const start = Math.floor((currentPage - 1) / 10) * 10 + 1;
      return Array.from({ length: 10 }, (_, i) => start + i).filter(page => page <= totalPages);
    }
  };

  const pageNumbers = getPaginationRange();

  return (
    <>
      <Head>
        <title>Your Library - ANIMEDAILY</title>
        <meta name="description" content="Browse and manage your anime collection in your personal library on ANIMEDAILY." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Your Library - ANIMEDAILY" />
        <meta property="og:description" content="Manage and explore your personal anime collection with ease on ANIMEDAILY's library page." />
        <meta property="og:image" content="https://animedaily.vercel.app/favicon.avif" />
        <meta property="og:url" content="https://animedaily.vercel.app/library" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="en" />
        <meta name="author" content="Rxvxn" />
        <link rel="canonical" href="https://animedaily.vercel.app/library" />
      </Head>
      <Layout>
        {showToast && (
          <div className={`toast toast-center mb-24 ${fadeOut ? 'fade-out' : ''}`}>
            <div className="alert bg-base-300 border-2 border-orange rounded-xl">
              <span>Delete Successful !</span>
            </div>
          </div>
        )}
        <dialog id="delete_library" className="modal">
          <div className="modal-box border-orange border-2 rounded-lg">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-lg">DELETE LIBRARY</h3>
            <p className="py-4">
              {isMultipleDelete
                ? "Are you sure you want to delete the selected data?"
                : "Are you sure you want to delete this data?"}
            </p>
            <div className="modal-action">
              <button
                onClick={isMultipleDelete ? handleDeleteMultipleAnimes : handleDeleteSingleAnime}
                className="btn bg-orange hover:bg-base-300 hover:text-orange rounded-lg btn-sm"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </dialog>
        <section className="py-8 mt-12">
          <div className="mx-auto px-6 lg:px-16">
            <div className="flex items-center gap-2 mb-3">
              <label className="input input-bordered flex items-center gap-2 input-sm border-2 border-orange bg-base-200 w-full">
                <input
                  type="text"
                  className="grow"
                  placeholder="Search Anime"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <i className="bi bi-search"></i>
              </label>
              <button
                onClick={() => {
                  setIsMultipleDelete(true);
                  document.getElementById("delete_library").showModal();
                }}
                className={`btn btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange ${isDeleteButtonEnabled ? '' : 'btn-disabled'}`}
                disabled={!isDeleteButtonEnabled}
                aria-label="Delete selected items"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-xs table-zebra">
                <thead>
                  <tr>
                    <th>
                      <label for="checkbox-header" class="sr-only">Select All</label>
                      <input id="checkbox-header"
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                      />
                    </th>
                    <th>TITLE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((anime, index) => (
                      <tr key={index}>
                        <td>
                          <div className="form-control">
                            <label className="cursor-pointer label">
                              <input
                                type="checkbox"
                                checked={selectAll || anime.checked}
                                onChange={(event) => handleCheckboxChange(event, index)}
                                className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                              />
                            </label>
                          </div>
                        </td>
                        <td className="truncate text-xs">{anime.title}</td>
                        <td>
                          <button
                            onClick={() => {
                              setIsMultipleDelete(false);
                              setAnimeToDelete(anime.title);
                              document.getElementById("delete_library").showModal();
                            }}
                            className="btn bg-orange hover:bg-base-300 btn-xs btn-square hover:text-orange"
                          >
                            <i className="bi bi-trash2 text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">No bookmarked animes found.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th>
                      <label for="checkbox-footer" class="sr-only">Footer Checkbox</label>
                      <input id="checkbox-footer"
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                      />
                    </th>
                    <th>TITLE</th>
                    <th>ACTION</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            {showPagination && (
              <div className="flex space-x-2 justify-center">
                <button
                  className="join-item btn btn-sm btn-square text-orange"
                  onClick={() => handlePageChange(1)}
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
                <button
                  className="join-item btn btn-sm btn-square text-orange"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`join-item btn btn-sm btn-square text-orange ${currentPage === pageNumber ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="join-item btn btn-sm btn-square text-orange"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
                <button
                  className="join-item btn btn-sm btn-square text-orange"
                  onClick={() => handlePageChange(totalPages)}
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default LibraryPage;