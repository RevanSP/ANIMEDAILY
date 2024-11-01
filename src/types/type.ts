export interface LoaderContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export interface Anime {
    title: string;
    url: string;
    coverImg: string;
    sinopsis: string;
    infoItems: string[];
    otherEpisodes: { title: string; url: string }[];
    episodes: { title: string; iframeSrc: string }[];
}

export interface AddFormProps {
    title: string;
    setTitle: (title: string) => void;
    url: string;
    setUrl: (url: string) => void;
    coverImgUrl: string;
    setCoverImgUrl: (url: string) => void;
    sinopsis: string;
    setSinopsis: (sinopsis: string) => void;
    infoItems: string[];
    updateInfoItem: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    handleDeleteInfoItem: (index: number) => void;
    otherEpisodes: { title: string; url: string }[];
    updateOtherEpisode: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    handleDeleteOtherEpisode: (index: number) => void;
    isFormValid: () => boolean;
    userRole: string | null;
}

export interface EditFormProps {
    editedAnime: Anime | null;
    userRole: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Anime) => void;
    handleInfoItemChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    handleOtherEpisodeChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void; // Keep this
    handleEditSubmit: (e: React.FormEvent) => Promise<void>;
    hasChanges: () => boolean;
    onRemoveInfoItem: (index: number) => void;
    onRemoveOtherEpisode: (index: number) => void;
}

export interface GenreProps {
    genres: string[];
    currentGenre: string;
    handleGenreClick: (genre: string) => void;
    genreCounts: Record<string, number>;
}

export interface Episode {
    title: string;
    url: string;
    iframeSrc: string;
    options: Array<{
        text: string;
        value: string;
    }>;
}

export interface ModalProps {
    id: string;
    title: string;
    imageUrl: string;
    status: string;
    genre: string;
    durasi: string;
    season: string;
    tipe: string;
    episodes: Episode[];
    sinopsis: string;
}

export interface NavbarProps {
    searchQuery: string;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    totalAnimes: number;
}

export interface PaginateProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    filterOptions: string[];
    currentFilter: string;
    onFilterClick: (filter: string) => void;
}

export interface PaginateFavoriteProps {
    totalHalaman: number;
    halamanSaatIni: number;
    paginasi: (nomorHalaman: number) => void;
}

export interface PaginateNumberProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
}

export interface Anime {
    title: string;
    url: string;
    coverImg: string;
    sinopsis: string;
    infoItems: string[];
    otherEpisodes: { title: string; url: string }[];
    episodes: { title: string; iframeSrc: string }[];
}
export interface TableDashboardProps {
    currentAnimes: Anime[];
    currentPage: number;
    itemsPerPage: number;
    allAnimes: Anime[];
    openDetailsModal: (anime: Anime) => void;
    deleteAnime: (anime: Anime) => void;
    openEditModal: (anime: Anime) => void;
    selectedAnimes: Anime[];
    setSelectedAnimes: (animes: Anime[]) => void;
}

export interface TableFavoriteProps {
    favorites: string[];
    selectedFavorites: Set<string>;
    setSelectedFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
    handleDeleteFavorite: (title: string) => void;
    favoriteSearchQuery: string;
    toggleSelect: (title: string) => void;
}

export interface TablePaginateProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}