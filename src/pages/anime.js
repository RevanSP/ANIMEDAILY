import useAOS from "@/hooks/AOS";
import Layout from "./layout/Layout";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs } from "@/lib/firebase";

const AnimePage = ({ initialAnimeData, defaultItemsPerPage }) => {
  useAOS();

  const [animeData, setAnimeData] = useState(initialAnimeData);
  const [bookmarked, setBookmarked] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [maxPageButtons, setMaxPageButtons] = useState(defaultItemsPerPage === 18 ? 5 : 15);

  useEffect(() => {
    setBookmarked(JSON.parse(localStorage.getItem('bookmarkedAnimes')) || []);
    setTotalAnimes(calculateTotalAnimes(initialAnimeData));
  }, [initialAnimeData]);

  const [totalAnimes, setTotalAnimes] = useState(0);

  const calculateTotalAnimes = (data) => {
    return data.filter(anime => {
      const title = anime.title ||
        anime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
        anime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim();
      return !!title;
    }).length;
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setItemsPerPage(isMobile ? 18 : 21);
      setMaxPageButtons(isMobile ? 5 : 15);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(animeData.length / itemsPerPage);
  const currentItems = animeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleBookmark = (title) => {
    const updatedBookmarks = bookmarked.includes(title)
      ? bookmarked.filter(item => item !== title)
      : [...bookmarked, title];
    localStorage.setItem('bookmarkedAnimes', JSON.stringify(updatedBookmarks));
    setBookmarked(updatedBookmarks);
  };

  const handlePageChange = (pageNumber) => {
    const newPage = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(newPage);

    const newPageGroup = Math.ceil(newPage / maxPageButtons);
    if (newPageGroup !== pageGroup) {
      setPageGroup(newPageGroup);
    }
  };

  const handlePageGroupChange = (direction) => {
    let newPageGroup = pageGroup;

    if (direction === 'next' && pageGroup * maxPageButtons < totalPages) {
      newPageGroup = pageGroup + 1;
    }
    if (direction === 'prev' && pageGroup > 1) {
      newPageGroup = pageGroup - 1;
    }

    setPageGroup(newPageGroup);

    const newStartPage = (newPageGroup - 1) * maxPageButtons + 1;
    const newEndPage = Math.min(newPageGroup * maxPageButtons, totalPages);

    if (currentPage < newStartPage || currentPage > newEndPage) {
      setCurrentPage(newStartPage);
    }
  };

  const startPage = (pageGroup - 1) * maxPageButtons + 1;
  const endPage = Math.min(pageGroup * maxPageButtons, totalPages);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const genres = [
    'Action', 'Adventure', 'Cars', 'Comedy', 'Demons', 'Drama', 'Ecchi', 'Fantasy',
    'Game', 'Gore', 'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'Live Action',
    'Martial Arts', 'Mecha', 'Military', 'Modern', 'Mystery', 'Police', 'Parody',
    'Psychological', 'Reincarnation', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Showbiz',
    'Showgate', 'Shounen', 'Shoujo', 'Slice of Life', 'Space', 'Sports', 'Super Power',
    'Supernatural', 'Thriller', 'Vampire', 'Warner Bros', 'Mythology', 'Infinite'
  ]

  const [originalAnimeData, setOriginalAnimeData] = useState(initialAnimeData);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      setAnimeData(originalAnimeData);
      return;
    }

    const filteredData = originalAnimeData.filter((anime) => {
      const title = anime.title ||
        anime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
        anime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim();

      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setAnimeData(filteredData);
  };

  const [selectedLetter, setSelectedLetter] = useState('');

  const AlphaNumericButtons = () => (
    <div className="flex space-x-1 lg:space-x-3 lg:justify-start">
      <button
        className="btn btn-square bg-orange hover:bg-base-300 btn-sm hover:text-orange"
        onClick={() => {
          setSelectedLetter('');
          setSearchQuery('');
          setSelectedGenre('');
          setSelectedStatus('');
          setSelectedType('');
          setAnimeData(originalAnimeData);
          setCurrentPage(1);
        }}
      >
        <i className="bi bi-arrow-clockwise"></i>
      </button>

      {Array.from({ length: 26 }, (_, i) => {
        const letter = String.fromCharCode(65 + i);
        return (
          <button
            key={i}
            className={`btn btn-square btn-sm ${selectedLetter === letter
              ? 'bg-base-300 text-orange'
              : 'bg-orange hover:bg-base-300 hover:text-orange'
              }`}
            onClick={() => filterByLetter(letter)}
          >
            {letter}
          </button>
        );
      })}

      <div className="flex space-x-1 lg:space-x-3 ml-auto">
        {Array.from({ length: 10 }, (_, i) => {
          const number = String(i);
          return (
            <button
              key={i + 26}
              className={`btn btn-square btn-sm ${selectedLetter === number
                ? 'bg-base-300 text-orange'
                : 'bg-orange hover:bg-base-300 hover:text-orange'
                }`}
              onClick={() => filterByLetter(number)}
            >
              {number}
            </button>
          );
        })}
      </div>
    </div>
  );

  const applyFilters = useCallback(() => {
    let filteredData = originalAnimeData;

    if (selectedLetter) {
      filteredData = filteredData.filter((anime) => {
        const title = anime.title ||
          anime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
          anime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim() || '';

        if (!title) return false;

        if (selectedLetter.match(/[A-Z]/)) {
          return title.charAt(0).toUpperCase() === selectedLetter;
        }

        if (selectedLetter.match(/[0-9]/)) {
          return title.charAt(0).match(/[0-9]/) && title.charAt(0) === selectedLetter;
        }

        return false;
      });
    }

    if (selectedGenre) {
      filteredData = filteredData.filter((anime) => {
        const genreInfo = anime.infoItems?.find(item => item.startsWith("Genre:"))?.split(":")[1]?.trim() || '';
        const genres = genreInfo.split(", ");
        return genres.includes(selectedGenre);
      });
    }

    if (selectedStatus) {
      filteredData = filteredData.filter((anime) => {
        const statusInfo = anime.infoItems?.find(item => item.startsWith("Status:"))?.split(":")[1]?.trim();
        return statusInfo?.toUpperCase() === selectedStatus;
      });
    }

    if (selectedType) {
      filteredData = filteredData.filter((anime) => {
        const typeInfo = anime.infoItems?.find(item => item.startsWith("Tipe:"))?.split(":")[1]?.trim();
        return typeInfo === selectedType;
      });
    }

    setAnimeData(filteredData);
    setCurrentPage(1);
  }, [selectedLetter, selectedGenre, selectedStatus, selectedType, originalAnimeData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setCurrentPage(1);
  };

  const filterByLetter = (letter) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const iframeRef = useRef(null);

  const handleAnimeClick = (anime) => {
    setSelectedAnime(anime);
    document.getElementById('animes').showModal();
  };

  const handleEpisodeChange = (e) => setSelectedEpisodeIndex(e.target.value);

  useEffect(() => {
    const modal = document.getElementById('animes');
    const handleDialogClose = () => {
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
    };

    modal?.addEventListener('close', handleDialogClose);
    return () => modal?.removeEventListener('close', handleDialogClose);
  }, []);

  return (
    <Layout>
      <dialog id="animes" className="modal">
        <div className="modal-box border-orange border-2 rounded-lg w-11/12 max-w-full p-4">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-orange">✕</button>
          </form>
          {selectedAnime && (
            <>
              <h3 className="font-bold text-lg mb-4 text-orange">
                {selectedAnime.title ||
                  selectedAnime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
                  selectedAnime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim()}
              </h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 bg-base-300 p-3 rounded-lg">
                  <div className="relative w-full pt-[56.25%]">
                    {selectedAnime.episodes && selectedAnime.episodes.length > 0 ? (
                      <iframe
                        ref={iframeRef}
                        src={selectedAnime.episodes[selectedEpisodeIndex]?.iframeSrc}
                        frameBorder="0"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      ></iframe>
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-base-100 flex items-center justify-center">
                        <p className="text-orange">No episodes available</p>
                      </div>
                    )}
                  </div>
                  <select
                    className="select select-bordered w-full mt-3 rounded-lg border-none bg-base-100 text-orange"
                    value={selectedEpisodeIndex}
                    onChange={handleEpisodeChange}
                  >
                    <option disabled>Select Episode</option>
                    {selectedAnime.episodes?.map((episode, index) => (
                      <option key={index} value={index}>
                        Episode {selectedAnime.episodes.length - index}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 bg-base-300 p-4 rounded-lg">
                  <div className="flex">
                    <div className="w-32 h-48 flex-shrink-0 relative">
                      <Image
                        src={selectedAnime.coverImg}
                        alt="Cover"
                        fill
                        sizes="100vw"
                        className="rounded-lg border-2 border-orange object-cover"
                      />
                    </div>
                    <div className="ml-4 flex flex-col flex-1 overflow-y-auto">
                      <p className="text-xs sm:text-sm">
                        STATUS : {selectedAnime.infoItems?.find(item => item.startsWith("Status:"))?.split(":")[1]?.trim() || "-"}
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        DURATION : {selectedAnime.infoItems?.find(item => item.startsWith("Durasi:"))?.split(":")[1]?.trim() || "-"}
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        SEASON : {selectedAnime.infoItems?.find(item => item.startsWith("Season:"))?.split(":")[1]?.trim() || "-"}
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        TYPE : {selectedAnime.infoItems?.find(item => item.startsWith("Tipe:"))?.split(":")[1]?.trim() || "-"}
                      </p>
                      <p className="text-xs sm:text-sm mt-1">
                        EPISODE : {selectedAnime.infoItems?.find(item => item.startsWith("Episodes:"))?.split(":")[1]?.trim() || "-"}
                      </p>
                      <p className="text-xs sm:text-sm mt-1 mb-1">GENRE :</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedAnime.infoItems
                          ?.find(item => item.startsWith("Genre:"))
                          ?.split(":")[1]
                          ?.trim()
                          ?.split(", ")
                          .map((genre, index) => (
                            <div key={index} className="badge uppercase badge-xs p-2 rounded-lg text-xs bg-orange">
                              {genre}
                            </div>
                          )) || <div className="badge uppercase rounded-lg text-xs bg-gray-400">-</div>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">SYNOPSIS :</p>
                    <p className="text-xs ">{selectedAnime.sinopsis}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </dialog>
      <section className="py-8 mt-14">
        <div className="mx-auto px-6">
          <div className="mb-3 lg:px-6">
            <div className="flex items-center gap-2">
              <label className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 flex-grow">
                <input
                  type="text"
                  className="grow text-xs"
                  placeholder={`Search (${totalAnimes.toLocaleString()} Animes)`}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <i className="bi bi-search"></i>
              </label>
              <button
                className="btn btn-square bg-orange hover:bg-base-300 hover:text-orange"
                onClick={handleSearchSubmit}
              >
                <i className="bi bi-check2-circle"></i>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <select
                className="select select-bordered border-2 border-orange bg-base-200 text-xs w-full"
                value={selectedGenre}
                onChange={handleGenreChange}
              >
                <option value="">GENRE</option>
                {genres.map((genre, index) => (
                  genre && <option key={index} value={genre}>{genre}</option>
                ))}
              </select>
              <select
                className="select select-bordered border-2 text-xs border-orange bg-base-200 "
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="">STATUS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="HIATUS">HIATUS</option>
              </select>
              <select
                className="select select-bordered border-2 text-xs border-orange bg-base-200"
                value={selectedType}
                onChange={handleTypeChange}
              >
                <option value="">TYPE</option>
                <option value="TV">TV</option>
                <option value="Movie">MOVIE</option>
                <option value="OVA">OVA</option>
              </select>
            </div>
          </div>
          <div className="lg:px-6 mb-6">
            <div className="card w-full bg-base-200 border-2 border-orange">
              <div className="card-body p-4">
                <div className="overflow-x-auto">
                  <div className="flex space-x-1 lg:space-x-3 lg:justify-start">
                    <AlphaNumericButtons />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto sm:px-6 lg:px-6">
            {currentItems.length === 0 ? (
              <div role="alert" className="alert border-2 border-orange bg-base-200 text-orange" data-aos="fade-up">
                <i className="bi bi-info-circle"></i>
                <span>NOT FOUND</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-6 2xl:grid-cols-7">
                {currentItems.map((anime, index) => {
                  const title =
                    anime.title ||
                    anime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
                    anime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim();
                  const tipe = anime.infoItems?.find(item => item.startsWith("Tipe:"))?.split(":")[1]?.trim();
                  const isBookmarked = bookmarked.includes(title);
                  return (
                    <div
                      key={index}
                      className="flex flex-col bg-base-200 relative border-2 border-orange"
                      data-aos="fade-up"
                      data-aos-delay={`${index * 100}`}
                    >
                      {tipe && (
                        <span className="badge bg-base-200 uppercase absolute top-2 left-2 z-10 text-xs badge-lg text-orange">{tipe}</span>
                      )}
                      <button
                        className="btn bg-orange hover:bg-base-300 btn-square btn-sm absolute top-2 right-2 z-10 border-orange hover:border-orange hover:text-orange"
                        onClick={() => toggleBookmark(title)}
                      >
                        <i className={`bi ${isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                      </button>
                      <div className="relative aspect-[2/3] w-full overflow-hidden" onClick={() => handleAnimeClick(anime)}>
                        {anime.coverImg && (
                          <Image
                            alt={`Cover for ${title}`}
                            src={anime.coverImg}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                            className="object-cover object-center transition-transform duration-300 ease-in-out transform hover:scale-110 hover:rotate-3"
                            priority
                          />
                        )}
                        <div className="absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-75">
                          <h3 className="text-white text-xs font-medium truncate">{title}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {currentItems.length > 0 && (
            <div className="flex space-x-2 lg:px-8 mt-6 justify-center">
              <button
                className="join-item btn btn-sm btn-square text-orange"
                onClick={() => handlePageGroupChange("prev")}
                disabled={pageGroup === 1}
              >
                <i className="bi bi-chevron-double-left"></i>
              </button>

              <button
                className="join-item btn btn-sm btn-square text-orange"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNum = startPage + i;
                return (
                  <button
                    key={pageNum}
                    className={`join-item btn btn-sm btn-square text-orange ${currentPage === pageNum ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="join-item btn btn-sm btn-square text-orange"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>

              <button
                className="join-item btn btn-sm btn-square text-orange"
                onClick={() => handlePageGroupChange("next")}
                disabled={pageGroup * maxPageButtons >= totalPages}
              >
                <i className="bi bi-chevron-double-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AnimePage;

export async function getStaticProps() {
  try {
    const animeCollection = collection(db, 'anime');
    const animeSnapshot = await getDocs(animeCollection);
    const animeData = animeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const getTitle = (anime) => {
      return anime.title ||
        anime.infoItems?.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() ||
        anime.infoItems?.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim();
    };

    const sortedAnimeData = animeData.sort((a, b) =>
      getTitle(a).localeCompare(getTitle(b), undefined, { sensitivity: 'base' })
    );

    const defaultItemsPerPage = 18;

    return {
      props: {
        initialAnimeData: sortedAnimeData,
        defaultItemsPerPage,
      },
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { props: { initialAnimeData: [], defaultItemsPerPage: 18 } };
  }
}