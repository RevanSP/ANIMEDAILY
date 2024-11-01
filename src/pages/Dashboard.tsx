import React, { useEffect, useState } from 'react';
import NavbarDashboard from '../components/NavbarDashboard';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import TableDashboard from '../components/TableDashboard';
import TablePaginate from '../components/TablePaginate';
import EditForm from '../components/EditForm';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AddForm from '../components/AddForm';
import { Anime } from '../types/type';

const Dashboard: React.FC = () => {
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [selectedAnimes, setSelectedAnimes] = useState<Anime[]>([]);
    const itemsPerPage = 20;

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role);

        const fetchData = async () => {
            try {
                const apiKey = import.meta.env.VITE_API_KEY;
                const response = await fetch(`https://anime-daily-express.vercel.app/data/anime?apikey=${apiKey}`);
                const data = await response.json();
                setAnimes(data);
            } catch (error) {
                console.error('Error fetching anime data:', error);
            }
        };
        fetchData();
    }, []);

    const deleteAnime = async (anime: Anime) => {
        const titleToDelete = anime.title || anime.infoItems.find(item => item.startsWith("Judul:"))?.split(": ")[1];

        if (!titleToDelete) {
            showToast('No title available for deletion');
            return;
        }

        try {
            const apiKey = import.meta.env.VITE_API_KEY;
            const response = await fetch(`https://anime-daily-express.vercel.app/data/anime/${titleToDelete}?apikey=${apiKey}`, { method: 'DELETE' });
            if (response.ok) {
                setAnimes(prevAnimes => prevAnimes.filter(anime =>
                    anime.title !== titleToDelete &&
                    !anime.infoItems.some(item => item.startsWith("Judul:") && item.split(": ")[1] === titleToDelete)
                ));
                showToast(`Successfully deleted ${titleToDelete}`);
            } else {
                showToast('Failed to delete anime');
            }
        } catch (error) {
            console.error('Error deleting anime:', error);
            showToast('Error deleting anime');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editedAnime) {
            const updatedAnime = {
                ...editedAnime,
                title: editedAnime.title || "Untitled"
            };

            try {
                const apiKey = import.meta.env.VITE_API_KEY;
                const response = await fetch(`https://anime-daily-express.vercel.app/data/anime/${updatedAnime.title}?apikey=${apiKey}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedAnime),
                });

                if (response.ok) {
                    setAnimes(prevAnimes =>
                        prevAnimes.map(anime => (anime.title === updatedAnime.title ? updatedAnime : anime))
                    );

                    showToast(`Successfully updated ${updatedAnime.title}`);

                    setTimeout(() => {
                        const modalElement = document.getElementById('editModal');
                        if (modalElement) {
                            const editModal = new window.bootstrap.Modal(modalElement);
                            editModal.hide();
                        }
                        window.location.reload();
                    }, 1500);
                } else {
                    console.error('Failed to update anime');
                }
            } catch (error) {
                console.error('Error updating anime:', error);
            }
        }
    };

    const deleteSelectedAnimes = async () => {
        if (selectedAnimes.length === 0) {
            showToast('No animes selected for deletion');
            return;
        }

        const titlesToDelete = selectedAnimes.map(anime =>
            anime.title || anime.infoItems.find(item => item.startsWith("Judul:"))?.split(": ")[1]
        ).filter(Boolean);

        if (titlesToDelete.length === 0) {
            showToast('No valid titles available for deletion');
            return;
        }

        try {
            const apiKey = import.meta.env.VITE_API_KEY;

            for (const titleToDelete of titlesToDelete) {
                const response = await fetch(`https://anime-daily-express.vercel.app/data/anime/${titleToDelete}?apikey=${apiKey}`, { method: 'DELETE' });
                if (response.ok) {
                    setAnimes(prevAnimes => prevAnimes.filter(anime =>
                        anime.title !== titleToDelete &&
                        !anime.infoItems.some(item => item.startsWith("Judul:") && item.split(": ")[1] === titleToDelete)
                    ));
                } else {
                    showToast(`Failed to delete ${titleToDelete}`);
                    return;
                }
            }

            setSelectedAnimes([]);
            showToast('Successfully deleted selected animes');
        } catch (error) {
            console.error('Error deleting animes:', error);
            showToast('Error deleting selected animes');
        }
    };


    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const openDetailsModal = (anime: Anime) => {
        setSelectedAnime(anime);
        const modalElement = document.getElementById('detailsModal');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        const toastElement = document.getElementById('liveToast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    };

    const filteredAnimes = animes.filter(anime =>
        anime.infoItems.some(info => info.startsWith('Judul:') && info.toLowerCase().includes(searchQuery.toLowerCase())) ||
        anime.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastAnime = currentPage * itemsPerPage;
    const indexOfFirstAnime = indexOfLastAnime - itemsPerPage;
    const currentAnimes = filteredAnimes.slice(indexOfFirstAnime, indexOfLastAnime);
    const totalPages = Math.ceil(filteredAnimes.length / itemsPerPage);

    const [editedAnime, setEditedAnime] = useState<Anime | null>(null);
    const openEditModal = (anime: Anime) => {
        setSelectedAnime(anime);
        setEditedAnime(anime);
        const editModalElement = document.getElementById('editModal');

        if (editModalElement) {
            const editModal = new window.bootstrap.Modal(editModalElement);
            editModal.show();
        } else {
            console.error('Edit modal element not found');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Anime) => {
        if (editedAnime) {
            setEditedAnime({ ...editedAnime, [field]: e.target.value });
        }
    };

    const handleInfoItemChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (editedAnime) {
            const newInfoItems = [...editedAnime.infoItems];
            newInfoItems[index] = e.target.value;
            setEditedAnime({ ...editedAnime, infoItems: newInfoItems });
        }
    };

    const handleOtherEpisodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (editedAnime) {
            const newOtherEpisodes = [...editedAnime.otherEpisodes];
            const { name } = e.target;
            newOtherEpisodes[index] = {
                ...newOtherEpisodes[index],
                [name]: e.target.value,
            };
            setEditedAnime({ ...editedAnime, otherEpisodes: newOtherEpisodes });
        }
    };

    const hasChanges = () => {
        if (!editedAnime || !selectedAnime) return false;

        return (
            editedAnime.title !== selectedAnime.title ||
            editedAnime.url !== selectedAnime.url ||
            editedAnime.coverImg !== selectedAnime.coverImg ||
            editedAnime.sinopsis !== selectedAnime.sinopsis ||
            JSON.stringify(editedAnime.infoItems) !== JSON.stringify(selectedAnime.infoItems) ||
            JSON.stringify(editedAnime.otherEpisodes) !== JSON.stringify(selectedAnime.otherEpisodes)
        );
    };

    const openAddModal = () => {
        const addModalElement = document.getElementById('addModal');
        if (addModalElement) {
            const addModal = new window.bootstrap.Modal(addModalElement);
            addModal.show();
        } else {
            console.error('Add modal element not found');
        }
    };

    const [otherEpisodes, setOtherEpisodes] = useState([{ title: '', url: '' }]);
    const [infoItems, setInfoItems] = useState(['']);

    const handleAddOtherEpisode = () => {
        const newEpisode = { title: '', url: '' };
        setOtherEpisodes([...otherEpisodes, newEpisode]);
    };
    const handleDeleteOtherEpisode = (index: number) => {
        const updatedEpisodes = [...otherEpisodes];
        updatedEpisodes.splice(index, 1);
        setOtherEpisodes(updatedEpisodes);
    };

    const handleAddInfoItem = () => {
        setInfoItems([...infoItems, '']);
    };

    const handleDeleteInfoItem = (index: number) => {
        const updatedInfoItems = [...infoItems];
        updatedInfoItems.splice(index, 1);
        setInfoItems(updatedInfoItems);
    };

    const updateOtherEpisode = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        setOtherEpisodes(prev => {
            const updatedEpisodes = [...prev];
            updatedEpisodes[index] = { ...updatedEpisodes[index], [name]: value };
            return updatedEpisodes;
        });
    };
    const updateInfoItem = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        setInfoItems(prev => {
            const updatedInfoItems = [...prev];
            updatedInfoItems[index] = value;
            return updatedInfoItems;
        });
    };

    const addInfoItemField = () => {
        if (editedAnime) {
            const newInfoItems = [...editedAnime.infoItems, ''];
            setEditedAnime({ ...editedAnime, infoItems: newInfoItems });
        }
    };

    const addOtherEpisodeField = () => {
        if (editedAnime) {
            const newOtherEpisode = { title: '', url: '' };

            const newOtherEpisodes = [newOtherEpisode, ...editedAnime.otherEpisodes];
            const newIframeSrcs = ['', ...editedAnime.episodes.map(ep => ep.iframeSrc)];

            setEditedAnime({
                ...editedAnime,
                otherEpisodes: newOtherEpisodes,
                episodes: newIframeSrcs.map((src, index) => ({
                    ...editedAnime.episodes[index],
                    iframeSrc: src
                }))
            });
        }
    };

    const handleRemoveInfoItem = (index: number) => {
        setEditedAnime((prev) => {
            if (!prev) return null;
            const updatedInfoItems = prev.infoItems.filter((_, i) => i !== index);
            return { ...prev, infoItems: updatedInfoItems };
        });
    };

    const handleRemoveOtherEpisode = (index: number) => {
        setEditedAnime((prev) => {
            if (!prev) return null;
            const updatedOtherEpisodes = prev.otherEpisodes.filter((_, i) => i !== index);
            return { ...prev, otherEpisodes: updatedOtherEpisodes };
        });
    };

    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [coverImgUrl, setCoverImgUrl] = useState('');
    const [sinopsis, setSinopsis] = useState('');

    const isFormValid = () => {
        return (
            title.trim() !== '' &&
            url.trim() !== '' &&
            coverImgUrl.trim() !== '' &&
            sinopsis.trim() !== '' &&
            infoItems.every(item => item.trim() !== '') &&
            otherEpisodes.every(episode => episode.title.trim() !== '' && episode.url.trim() !== '')
        );
    };

    return (
        <div>
            <NavbarDashboard />
            <Hero />
            <div className="container-fluid px-3 my-4">
                <h1 className="mb-0 text-center"><u>ANIME DATA</u></h1>
                <div className="input-group mt-5">
                    <div className="btn-group" role="group">
                        <button
                            className="btn btn-dark border-light border-2 rounded-end-0 rounded-start"
                            onClick={() => openAddModal()}
                        >
                            <i className="bi bi-plus"></i>
                        </button>
                    </div>
                    <input
                        type="search"
                        className="form-control border-2 border-light"
                        placeholder="Title ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setCurrentPage(1)}
                    />
                    <div className="btn-group" role="group">
                        <button
                            className="btn btn-dark border-light border-2 rounded-0 rounded-end"
                            disabled={userRole === 'guest' || selectedAnimes.length === 0}
                            onClick={deleteSelectedAnimes}
                        >
                            <i className="bi bi-file-earmark-x"></i>
                        </button>
                    </div>
                </div>
                <div className="card border-light border-3 border mt-3" id="card-genre" data-aos="fade-up">
                    <div className="card-body">
                        <div className="table-responsive">
                            <TableDashboard
                                currentAnimes={currentAnimes}
                                allAnimes={animes}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                openDetailsModal={openDetailsModal}
                                deleteAnime={deleteAnime}
                                openEditModal={openEditModal}
                                selectedAnimes={selectedAnimes}
                                setSelectedAnimes={setSelectedAnimes}
                            />
                        </div>
                        <TablePaginate
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
            <Footer />
            <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header text-light ">
                        <strong className="me-auto">ACTION</strong>
                        <button type="button" className="btn-close bg-light" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div className="toast-body bg-dark text-light">
                        {toastMessage}
                    </div>
                </div>
            </div>
            <div className="modal fade" id="addModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable modal-fullscreen">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addModalLabel">ADD</h5>
                            <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <AddForm
                                title={title}
                                setTitle={setTitle}
                                url={url}
                                setUrl={setUrl}
                                coverImgUrl={coverImgUrl}
                                setCoverImgUrl={setCoverImgUrl}
                                sinopsis={sinopsis}
                                setSinopsis={setSinopsis}
                                infoItems={infoItems}
                                updateInfoItem={updateInfoItem}
                                handleDeleteInfoItem={handleDeleteInfoItem}
                                otherEpisodes={otherEpisodes}
                                updateOtherEpisode={updateOtherEpisode}
                                handleDeleteOtherEpisode={handleDeleteOtherEpisode}
                                isFormValid={isFormValid}
                                userRole={userRole}
                            />
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleAddOtherEpisode}
                                >
                                    <i className="bi bi-plus"></i> Other Episode
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleAddInfoItem}
                                >
                                    <i className="bi bi-plus"></i> Info Item
                                </button>
                            </div>
                            <button type="button" className="btn btn-light btn-sm" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable modal-fullscreen">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editModalLabel">EDIT</h5>
                            <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <EditForm
                                editedAnime={editedAnime}
                                userRole={userRole}
                                handleInputChange={handleInputChange}
                                handleInfoItemChange={handleInfoItemChange}
                                handleOtherEpisodeChange={handleOtherEpisodeChange}
                                handleEditSubmit={handleEditSubmit}
                                hasChanges={hasChanges}
                                onRemoveInfoItem={handleRemoveInfoItem}
                                onRemoveOtherEpisode={handleRemoveOtherEpisode}
                            />
                        </div>
                        <div className="modal-footer py-1 d-flex justify-content-between">
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={addOtherEpisodeField}
                                >
                                    <i className="bi bi-plus"></i> Other Episode
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={addInfoItemField}
                                >
                                    <i className="bi bi-plus"></i> Info Item
                                </button>
                            </div>
                            <button type="button" className="btn btn-light btn-sm" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="detailsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="detailsModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="detailsModalLabel">DETAIL</h5>
                            <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex">
                            {selectedAnime && (
                                <div className="d-flex align-items-start">
                                    <div className="flex-shrink-0">
                                        <img loading="lazy"
                                            src={selectedAnime.coverImg}
                                            alt={selectedAnime.title}
                                            className="img-fluid mr-5 h-auto"
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                    <div className="flex-grow-1 overflow-auto" >
                                        <ul>
                                            {selectedAnime.infoItems.map((info, index) => (
                                                <li className="small" key={index}>{info}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-body small">
                            <p className="overflow-auto small" style={{ maxHeight: '200px' }}>
                                {selectedAnime?.sinopsis}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
