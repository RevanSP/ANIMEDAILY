/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Genre from '../components/Genre';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import Paginate from '../components/Paginate';
import PaginateNumber from '../components/PaginateNumber';
import TableFavorite from '../components/TableFavorite';
import PaginateFavorite from '../components/PaginateFavorite';

const genres = [
    "Action", "Adventure", "Comedy", "Demons", "Drama", "Ecchi", "Fantasy", "Game",
    "Harem", "Historical", "Horror", "Josei", "Magic", "Martial Arts", "Mecha",
    "Military", "Music", "Mystery", "Psychological", "Parody", "Police", "Romance",
    "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo", "Shounen", "Slice of Life",
    "Sports", "Space", "Super Power", "Supernatural", "Thriller", "Vampire"
];

const filterOptions = [
    '<i class="bi bi-arrow-repeat"></i>',
    '<i class="bi bi-star"></i>',
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    ...Array.from({ length: 10 }, (_, i) => i.toString())
];

const Index: React.FC = () => {
    const [animes, setAnimes] = useState<any[]>([]);
    const [currentFilter, setCurrentFilter] = useState<string>('<i class="bi bi-arrow-repeat"></i>');
    const [currentGenre, setCurrentGenre] = useState<string>('<i class="bi bi-arrow-repeat"></i>');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);
    const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set());
    const [favoriteSearchQuery, setFavoriteSearchQuery] = useState<string>('');

    const handleFavoriteSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFavoriteSearchQuery(event.target.value);
    };
    const handleSelectAllFavorites = (isSelected: boolean) => {
        if (isSelected) {
            const allSelected = new Set(favorites);
            setSelectedFavorites(allSelected);
        } else {
            setSelectedFavorites(new Set());
        }
    };

    const handleDeleteSelectedFavorites = () => {
        const updatedFavorites = favorites.filter(fav => !selectedFavorites.has(fav));
        setFavorites(updatedFavorites);
        setSelectedFavorites(new Set());
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const baseURL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://anime-daily-express.vercel.app';

    useEffect(() => {
        const fetchData = async () => {
            const apiKey = import.meta.env.VITE_API_KEY;

            try {
                const response = await fetch(`${baseURL}/data/anime?apikey=${apiKey}`);
                const data = await response.json();
                setAnimes(data);
            } catch (error) {
                console.error('Error fetching the anime data:', error);
            }
        };

        fetchData();
    }, [baseURL]);

    const genreCounts = genres.reduce((acc, genre) => {
        acc[genre] = animes.filter(anime => {
            const animeGenres = anime.infoItems.find((item: string) => item.startsWith('Genre:'))?.split(': ')[1] || '';
            return animeGenres.includes(genre);
        }).length;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(21);
            } else {
                setItemsPerPage(30);
            }
        };

        updateItemsPerPage();

        window.addEventListener('resize', updateItemsPerPage);

        return () => {
            window.removeEventListener('resize', updateItemsPerPage);
        };
    }, []);

    const handleGenreClick = (genre: string) => {
        if (genre === 'All') {
            setCurrentGenre('<i class="bi bi-arrow-repeat"></i>');
        } else {
            setCurrentGenre(genre);
        }

        setCurrentPage(1);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (currentFilter === '<i class="bi bi-star"></i>') {
            handleFilterClick('<i class="bi bi-arrow-repeat"></i>');
        }
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const getAnimeTitle = (anime: any): string => {
        return anime.title || anime.infoItems.find((item: string) => item.startsWith('Judul:'))?.split(': ')[1] || 'Unknown';
    };

    const filteredAnimes = animes.filter((anime) => {
        const title = getAnimeTitle(anime).toUpperCase();
        const firstChar = title[0];
        const animeGenres = anime.infoItems.find((item: string) => item.startsWith('Genre:'))?.split(': ')[1] || 'Unknown';
        const matchesSearch = title.includes(searchQuery.toUpperCase());

        if (currentFilter === '<i class="bi bi-arrow-repeat"></i>' && currentGenre === '<i class="bi bi-arrow-repeat"></i>') {
            return matchesSearch;
        }

        if (currentFilter === '0-9') {
            return /^[0-9]/.test(firstChar) && (currentGenre === '<i class="bi bi-arrow-repeat"></i>' || animeGenres.includes(currentGenre));
        }

        return (currentFilter === firstChar || currentFilter === '<i class="bi bi-arrow-repeat"></i>') && (currentGenre === '<i class="bi bi-arrow-repeat"></i>' || animeGenres.includes(currentGenre));
    });

    const paginatedAnimes = filteredAnimes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredAnimes.length / itemsPerPage);

    const isFavorite = (anime: any): boolean => {
        const title = getAnimeTitle(anime);
        return favorites.includes(title);
    };

    const [showFavorites, setShowFavorites] = useState<boolean>(false);

    const [favorites, setFavorites] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    });

    const handleFavoriteToggle = (anime: any) => {
        const title = getAnimeTitle(anime);
        if (favorites.includes(title)) {
            const updatedFavorites = favorites.filter(fav => fav !== title);
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } else {
            const updatedFavorites = [...favorites, title];
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    };
    const handleFilterClick = (filter: string) => {
        setCurrentFilter(filter);

        if (filter === '<i class="bi bi-arrow-repeat"></i>') {
            setCurrentGenre('<i class="bi bi-arrow-repeat"></i>');
            setShowFavorites(false);
        } else if (filter === '<i class="bi bi-star"></i>') {
            setShowFavorites(true);
            refreshFavorites();
        } else {
            setShowFavorites(false);
        }

        setCurrentPage(1);
    };

    const handleDeleteFavorite = (title: string) => {
        const updatedFavorites = favorites.filter(fav => fav !== title);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };


    const totalAnimes = animes.length;

    const toggleSelect = (title: string) => {
        setSelectedFavorites(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(title)) {
                newSelected.delete(title);
            } else {
                newSelected.add(title);
            }
            return newSelected;
        });
    };

    const [favorit, setFavorit] = useState<string[]>([]);
    const [halamanSaatIni, setHalamanSaatIni] = useState<number>(1);
    const itemPerHalaman = 20;

    useEffect(() => {
        const favoritTersimpan = localStorage.getItem('favorites');
        if (favoritTersimpan) {
            setFavorit(JSON.parse(favoritTersimpan));
        }
    }, []);

    const totalHalaman = Math.ceil(favorit.length / itemPerHalaman);

    const paginasi = (nomorHalaman: number) => {
        setHalamanSaatIni(nomorHalaman);
    };

    const favoritSaatIni = favorit.slice((halamanSaatIni - 1) * itemPerHalaman, halamanSaatIni * itemPerHalaman);

    const refreshFavorites = () => {
        const favoritTersimpan = localStorage.getItem('favorites');
        if (favoritTersimpan) {
            setFavorit(JSON.parse(favoritTersimpan));
        }
        setSelectedFavorites(new Set());
    };

    const renderFavoritesTable = () => {
        return (
            <div className="mt-3 card rounded" id="card-genre" data-aos="fade-up">
                <div className="card-body mt-3">
                    {favorites.length === 0 ? (
                        <div className="alert alert-dark text-center">NO FAVORITES ADDED</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center">
                                <input
                                    className="form-control py-2 w-25"
                                    type="search"
                                    placeholder="Favorite Anime ..."
                                    aria-label="Search"
                                    onChange={handleFavoriteSearchChange}
                                />
                                <div className="btn-group">
                                    <button
                                        className={`btn rounded-end-0 ${selectedFavorites.size === favorites.length ? 'btn-light border-light border-2 rounded' : 'btn-dark border-light border-2 rounded'}`}
                                        onClick={() => handleSelectAllFavorites(selectedFavorites.size !== favorites.length)}
                                    >
                                        <i className="bi bi-check-all"></i>
                                    </button>
                                    <button
                                        className="btn rounded-start-0 btn-danger border-2 rounded border"
                                        onClick={handleDeleteSelectedFavorites}
                                        disabled={selectedFavorites.size === 0}
                                    >
                                        DELETE SELECTED
                                    </button>
                                </div>
                            </div>
                            <TableFavorite
                                favorites={favoritSaatIni}
                                selectedFavorites={selectedFavorites}
                                setSelectedFavorites={setSelectedFavorites}
                                handleDeleteFavorite={handleDeleteFavorite}
                                favoriteSearchQuery={favoriteSearchQuery}
                                toggleSelect={toggleSelect}
                            />
                            {totalHalaman > 1 && (
                                <PaginateFavorite
                                    totalHalaman={totalHalaman}
                                    halamanSaatIni={halamanSaatIni}
                                    paginasi={paginasi}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <Loader />
            <Navbar searchQuery={searchQuery} handleSearchChange={handleSearchChange} totalAnimes={totalAnimes} />
            <Hero />
            <div className="container-fluid px-3 my-4">
                <div className="row">
                    <div className="col-lg-10">
                        <div className="row">
                            <h1 className="mb-4 d-block d-md-none text-center"><u>Animes</u></h1>
                            <h1 className="mb-4 d-none d-md-block text-left"><u>Animes</u></h1>
                            <Paginate
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                filterOptions={filterOptions}
                                currentFilter={currentFilter}
                                onFilterClick={handleFilterClick}
                            />
                            <center>
                                {showFavorites ? (
                                    renderFavoritesTable()
                                ) : filteredAnimes.length === 0 ? (
                                    <div className="container-fluid mt-3">
                                        <div className="alert mt-2 alert-dark text-center" role="alert">
                                            No results found for the selected filter.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row mt-3">
                                        {paginatedAnimes.map((anime, index) => {
                                            const title = getAnimeTitle(anime) || 'N/A';
                                            const status = anime.infoItems.find((item: string) => item.startsWith('Status:'))?.split(': ')[1] || 'N/A';
                                            const genre = anime.infoItems.find((item: string) => item.startsWith('Genre:'))?.split(': ')[1] || 'N/A';
                                            const durasi = anime.infoItems.find((item: string) => item.startsWith('Durasi:'))?.split(':')[1]?.trim() || 'N/A';
                                            const season = anime.infoItems.find((item: string) => item.startsWith('Season:'))?.split(':')[1]?.trim() || 'N/A';
                                            const tipe = anime.infoItems.find((item: string) => item.startsWith('Tipe:'))?.split(':')[1]?.trim() || 'N/A';
                                            const episodes = anime.episodes || 'N/A';
                                            const sinopsis = anime.sinopsis || 'N/A';

                                            let badgeClass = 'badge bg-secondary small';
                                            if (status === 'Completed') {
                                                badgeClass = 'badge bg-success small';
                                            } else if (status === 'Ongoing') {
                                                badgeClass = 'badge bg-danger small';
                                            }
                                            return (
                                                <div className="col-4 col-md-4 col-lg-2" key={index}>
                                                    <div data-aos="fade-up">
                                                        <div className="card mb-3 d-flex align-items-stretch rounded border-3">
                                                            <div className="img-container position-relative rounded-top" >
                                                                <img src={anime.coverImg} className="card-img-top rounded" loading="lazy" alt={title} data-bs-toggle="modal" data-bs-target={`#modal-${index}`} />
                                                                <button
                                                                    className="btn btn-dark border border-light border-2 rounded btn-sm small position-absolute bottom-0 start-0 m-2"
                                                                    style={{ zIndex: 1 }}
                                                                    onClick={() => handleFavoriteToggle(anime)}
                                                                >
                                                                    <i className={`bi ${isFavorite(anime) ? 'bi-star-fill' : 'bi-star'} small text-warning`}></i>
                                                                </button>
                                                            </div>
                                                            <div className="card-body d-flex flex-column h-100" data-bs-toggle="modal" data-bs-target={`#modal-${index}`}>
                                                                <p className="card-title text-truncate w-100 text-center small card-title-grid">{title}</p>
                                                                <p className="card-text small">
                                                                    <span className={`badge small border-dark border border-2 ${badgeClass}`}>{status}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Modal
                                                        id={`modal-${index}`}
                                                        title={title}
                                                        imageUrl={anime.coverImg}
                                                        status={status}
                                                        genre={genre}
                                                        durasi={durasi}
                                                        season={season}
                                                        tipe={tipe}
                                                        episodes={episodes}
                                                        sinopsis={sinopsis}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </center>
                            {filteredAnimes.length > 0 && !showFavorites && (
                                <PaginateNumber
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </div>
                    <div className="col-lg-2">
                        <Genre
                            genres={genres}
                            currentGenre={currentGenre}
                            handleGenreClick={handleGenreClick}
                            genreCounts={genreCounts}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Index;
