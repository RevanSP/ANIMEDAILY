import Layout from "../layout/Layout";
import { db, collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "../../lib/firebase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BsBuildings, BsCameraReels, BsCheckCircle, BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight, BsCloudUpload, BsExclamationDiamond, BsExclamationOctagon, BsExclamationTriangle, BsFileEarmarkPlay, BsHourglassSplit, BsImage, BsPencilSquare, BsPlusCircle, BsSearch, BsTrash2, BsTypeH1, BsTypeH2, BsTypeH3, BsXCircle, BsXOctagon } from "react-icons/bs";

export default function Dashboard() {
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedAnimeIds, setSelectedAnimeIds] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const isLoggedInDeveloper = document.cookie
      .split('; ')
      .find(row => row.startsWith('isLoggedInDeveloper='))
      ?.split('=')[1] === 'true';

    const email = process.env.NEXT_PUBLIC_EMAILDEV;
    const password = process.env.NEXT_PUBLIC_PASSWORDDEV;

    if (!isLoggedInDeveloper || email !== process.env.NEXT_PUBLIC_EMAILDEV || password !== process.env.NEXT_PUBLIC_PASSWORDDEV) {
      document.cookie = "isLoggedInDeveloper=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      router.push('/');
    }
  }, [router]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRedeploy = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/redeploy', { method: 'POST' });
      const data = await res.json();

      setMessage(res.ok ? 'Redeploy successful !' : data.error || 'Something went wrong');
      setIsSuccess(res.ok);

      if (res.ok) setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to trigger redeploy');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimeData = async () => {
    try {
      const animeCollection = collection(db, "anime");
      const animeSnapshot = await getDocs(animeCollection);
      const animeList = animeSnapshot.docs.map((doc) => {
        const data = doc.data();
        const infoItems = data.infoItems || [];
        return {
          id: doc.id,
          title: data.title || infoItems.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() || "Unknown Title",
          coverImg: data.coverImg || "",
          sinopsis: data.sinopsis || "",
          altTitle: infoItems.find(item => item.startsWith("Judul:"))?.split(":")[1]?.trim() || "",
          altTitleJapanese: infoItems.find(item => item.startsWith("Japanese:"))?.split(":")[1]?.trim() || "",
          status: infoItems.find(item => item.startsWith("Status:"))?.split(":")[1]?.trim() || "",
          studio: infoItems.find(item => item.startsWith("Studio:"))?.split(":")[1]?.trim() || "",
          duration: infoItems.find(item => item.startsWith("Durasi:"))?.split(":")[1]?.trim() || "",
          season: infoItems.find(item => item.startsWith("Season:"))?.split(":")[1]?.trim() || "",
          type: infoItems.find(item => item.startsWith("Tipe:"))?.split(":")[1]?.trim() || "",
          totalEpisodes: infoItems.find(item => item.startsWith("Episodes:"))?.split(":")[1]?.trim() || "",
          genre: infoItems.find(item => item.startsWith("Genre:"))?.split(":")[1]?.trim() || "",
          episodes: data.episodes || []
        };
      });

      animeList.sort((a, b) => {
        const titleA = a.title.trim().toLowerCase();
        const titleB = b.title.trim().toLowerCase();
        return !isNaN(titleA) && !isNaN(titleB)
          ? Number(titleA) - Number(titleB)
          : titleA.localeCompare(titleB);
      });

      setAnimeData(animeList);
    } catch (error) {
      console.error("Error fetching anime data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredAnimeData = animeData.filter((anime) =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnimeData.length / itemsPerPage);

  const currentData = filteredAnimeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginationRange = () => {
    const rangeSize = isMobile ? 5 : 10;
    const startPage = Math.floor((currentPage - 1) / rangeSize) * rangeSize + 1;
    const endPage = Math.min(startPage + rangeSize - 1, totalPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const allAnimeIds = animeData.map((anime) => anime.id);
      setSelectedAnimeIds(allAnimeIds);
    } else {
      setSelectedAnimeIds([]);
    }
  };

  const handleSelectSingleChange = (animeId, event) => {
    if (event.target.checked) {
      setSelectedAnimeIds((prev) => [...prev, animeId]);
    } else {
      setSelectedAnimeIds((prev) => prev.filter((id) => id !== animeId));
    }
  };

  const isAllSelected = selectedAnimeIds.length === animeData.length;
  const isIndeterminate = selectedAnimeIds.length > 0 && selectedAnimeIds.length < animeData.length;

  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
  const [animeToDelete, setAnimeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenDeleteModal = (animeId = null) => {
    if (animeId) {
      setIsMultipleDelete(false);
      setAnimeToDelete(animeId);
    } else {
      setIsMultipleDelete(true);
      setAnimeToDelete(null);
    }
    document.getElementById('delete_confirm').showModal();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isMultipleDelete) {
        await Promise.all(
          selectedAnimeIds.map(async (id) => {
            await deleteDoc(doc(db, "anime", id));
          })
        );
        setSelectedAnimeIds([]);
      } else {
        await deleteDoc(doc(db, "anime", animeToDelete));
      }

      setAnimeData((prevData) => {
        if (isMultipleDelete) {
          return prevData.filter((anime) => !selectedAnimeIds.includes(anime.id));
        } else {
          return prevData.filter((anime) => anime.id !== animeToDelete);
        }
      });

      setToastMessage('Anime deleted successfully !');
      setShowToast(true);

      setTimeout(() => {
        setFadeOut(true);
      }, 3000);

      setTimeout(() => {
        setShowToast(false);
        setFadeOut(false);
      }, 6000);

      document.getElementById('delete_confirm').close();

    } catch (error) {
      console.error("Error deleting anime:", error);
      setToastMessage('Failed to delete anime');
      setShowToast(true);

      setTimeout(() => {
        setFadeOut(true);
      }, 3000);

      setTimeout(() => {
        setShowToast(false);
        setFadeOut(false);
      }, 6000);

    } finally {
      setIsDeleting(false);
      setAnimeToDelete(null);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animeDetails, setAnimeDetails] = useState({
    title: '', coverImg: '', altTitle: '', altTitleJapanese: '', status: '', studio: '',
    duration: '', season: '', type: '', genre: '', sinopsis: '', totalEpisodes: ''
  });

  const [episodes, setEpisodes] = useState([{ title: '', iframeSrc: '' }]);

  const handleChange = (e, field) => setEditAnimeDetails(prev => ({ ...prev, [field]: e.target.value || '' }));

  const handleEpisodeChange = (e, index, field) => setEpisodes(prev => {
    const updated = [...prev];
    updated[index][field] = e.target.value || '';
    return updated;
  });

  const addEpisode = () => setEpisodes(prev => [...prev, { title: '', iframeSrc: '' }]);
  const removeEpisode = index => setEpisodes(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const animeData = {
      ...animeDetails,
      infoItems: [
        `Judul: ${animeDetails.title}`,
        `Japanese: ${animeDetails.altTitleJapanese}`,
        `Status: ${animeDetails.status}`,
        `Studio: ${animeDetails.studio}`,
        `Durasi: ${animeDetails.duration}`,
        `Season: ${animeDetails.season}`,
        `Tipe: ${animeDetails.type}`,
        `Episodes: ${animeDetails.totalEpisodes}`,
        `Genre: ${animeDetails.genre}`
      ],
      episodes: episodes.map(({ title, iframeSrc }) => ({ title, iframeSrc }))
    };

    try {
      await addDoc(collection(db, "anime"), animeData);
      setToastMessage('Anime data added successfully !');
      fetchAnimeData();
      resetForm();
    } catch (error) {
      setToastMessage('Error adding anime data.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      showToastWithFadeOut();
    }
  };

  const resetForm = () => {
    setAnimeDetails({
      title: '', coverImg: '', altTitle: '', altTitleJapanese: '', status: '', studio: '',
      duration: '', season: '', type: '', genre: '', sinopsis: '', totalEpisodes: ''
    });
    setEpisodes([{ title: '', iframeSrc: '' }]);
    const modal = document.getElementById("add_anime");
    if (modal) modal.close();
  };

  const [editAnimeDetails, setEditAnimeDetails] = useState({
    title: '', coverImg: '', altTitle: '', altTitleJapanese: '', status: '', studio: '',
    duration: '', season: '', type: '', genre: '', sinopsis: '', totalEpisodes: ''
  });

  const [editEpisodes, setEditEpisodes] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (anime) => {
    const dialog = document.getElementById("edit_anime");
    dialog.showModal();

    setEditAnimeDetails({
      title: anime.title || '',
      coverImg: anime.coverImg || '',
      altTitle: anime.altTitle || '',
      altTitleJapanese: anime.altTitleJapanese || '',
      status: anime.status || '',
      studio: anime.studio || '',
      duration: anime.duration || '',
      season: anime.season || '',
      type: anime.type || '',
      genre: anime.genre || '',
      sinopsis: anime.sinopsis || '',
      totalEpisodes: anime.totalEpisodes || ''
    });

    setEditEpisodes(anime.episodes || [{ title: '', iframeSrc: '' }]);
    setCurrentEditId(anime.id);
  };

  const [currentEditId, setCurrentEditId] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEpisodeEditChange = (e, index, field) => {
    setEditEpisodes(prev => {
      const updated = [...prev];
      updated[index][field] = e.target.value || '';
      return updated;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentEditId) return;

    setIsSubmitting(true);

    const updatedAnimeData = {
      ...editAnimeDetails,
      infoItems: [
        `Judul: ${editAnimeDetails.altTitle}`,
        `Japanese: ${editAnimeDetails.altTitleJapanese}`,
        `Status: ${editAnimeDetails.status}`,
        `Studio: ${editAnimeDetails.studio}`,
        `Durasi: ${editAnimeDetails.duration}`,
        `Season: ${editAnimeDetails.season}`,
        `Tipe: ${editAnimeDetails.type}`,
        `Episodes: ${editAnimeDetails.totalEpisodes}`,
        `Genre: ${editAnimeDetails.genre}`
      ],
      episodes: editEpisodes
    };

    try {
      await updateDoc(doc(db, "anime", currentEditId), updatedAnimeData);
      setToastMessage('Anime data updated successfully !');
      await fetchAnimeData();
      document.getElementById("edit_anime").close();
    } catch (error) {
      setToastMessage('Error updating anime data.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setCurrentEditId(null);
      showToastWithFadeOut();
    }
  };

  const handleEpisodeRemove = (e, index) => {
    e.preventDefault();

    setEditEpisodes(prev => prev.filter((_, i) => i !== index));
  };

  const addEpisodes = () => {
    setEditEpisodes(prev => [
      ...prev,
      { title: '', iframeSrc: '' }
    ]);
  };

  const showToastWithFadeOut = () => {
    setShowToast(true);
    setTimeout(() => setFadeOut(true), 3000);
    setTimeout(() => { setShowToast(false); setFadeOut(false); }, 6000);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAnimeData();
    };

    fetchData();

  }, []);

  return (
    <Layout>
      <dialog id="edit_anime" className="modal" open={isModalOpen}>
        <div className="modal-box border-orange border-2 rounded-lg w-11/12 max-w-full">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">EDIT ANIME</h3>

          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[{ icon: <BsTypeH1 />, placeholder: "TITLE", value: editAnimeDetails.title, field: "title" },
              { icon: <BsImage />, placeholder: "COVER IMG", value: editAnimeDetails.coverImg, field: "coverImg" },
              { icon: <BsTypeH2 />, placeholder: "ALT TITLE", value: editAnimeDetails.altTitle, field: "altTitle" },
              { icon: <BsTypeH3 />, placeholder: "ALT TITLE (JAPANESE)", value: editAnimeDetails.altTitleJapanese, field: "altTitleJapanese" },
              { icon: <BsExclamationOctagon />, placeholder: "STATUS", value: editAnimeDetails.status, field: "status" },
              { icon: <BsBuildings />, placeholder: "STUDIO", value: editAnimeDetails.studio, field: "studio" },
              { icon: <BsHourglassSplit />, placeholder: "DURATION", value: editAnimeDetails.duration, field: "duration" },
              { icon: <BsExclamationTriangle />, placeholder: "SEASON", value: editAnimeDetails.season, field: "season" },
              { icon: <BsExclamationDiamond />, placeholder: "TYPE", value: editAnimeDetails.type, field: "type" },
              { icon: <BsFileEarmarkPlay />, placeholder: "TOTAL EPISODE", value: editAnimeDetails.totalEpisodes, field: "totalEpisodes" }].map((field, index) => (
                <label key={index} className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 input-sm">
                  {field.icon}
                  <input
                    type="text"
                    className="grow text-xs"
                    placeholder={field.placeholder}
                    value={field.value || ''}
                    onChange={(e) => handleChange(e, field.field)}
                    required
                  />
                </label>
              ))}
            </div>
            <label className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 mb-4 input-sm">
              <BsCameraReels className="text-xs" />
              <input
                type="text"
                className="grow text-xs"
                placeholder="GENRE"
                value={editAnimeDetails.genre || ''}
                onChange={(e) => handleChange(e, "genre")}
                required
              />
            </label>
            <textarea
              className="textarea textarea-bordered text-xs border-2 border-orange bg-base-200 w-full mb-2"
              placeholder="SYNOPSIS"
              value={editAnimeDetails.sinopsis || ''}
              onChange={(e) => handleChange(e, "sinopsis")}
              required
              rows={7}
            ></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editEpisodes.map((episode, index) => (
                <div key={index} className="join w-full">
                  <input
                    className="input input-bordered join-item border-2 border-orange bg-base-200 w-full input-sm"
                    placeholder="TITLE EPISODE"
                    type="text"
                    value={episode.title || ''}
                    onChange={(e) => handleEpisodeEditChange(e, index, "title")}
                    required
                  />
                  <input
                    className="input input-bordered join-item border-2 border-orange bg-base-200 w-36 input-sm"
                    placeholder="IFRAME SOURCE VIDEO"
                    type="url"
                    value={episode.iframeSrc || ''}
                    onChange={(e) => handleEpisodeEditChange(e, index, "iframeSrc")}
                    required
                  />
                  <button
                    className="btn join-item border-2 border-orange btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange"
                    onClick={(e) => handleEpisodeRemove(e, index)}
                  >
                    <BsXOctagon className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <div className="join">
                <button
                  className="btn btn-sm bg-orange hover:bg-base-300 hover:text-orange rounded-lg join-item"
                  type="button"
                  onClick={addEpisodes}
                >
                  ADD EPISODE
                </button>
                <button
                  className="btn btn-sm bg-orange hover:bg-base-300 hover:text-orange rounded-lg join-item"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "SUBMIT"
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      </dialog>
      <dialog id="add_anime" className="modal">
        <div className="modal-box border-orange border-2 rounded-lg w-11/12 max-w-full">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">ADD ANIME</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { label: "TITLE", icon: <BsTypeH1 />, field: "title", type: "text" },
                { label: "COVER IMG", icon: <BsImage />, field: "coverImg", type: "url" },
                { label: "ALT TITLE", icon: <BsTypeH2 />, field: "altTitle", type: "text" },
                { label: "ALT TITLE (JAPANESE)", icon: <BsTypeH3 />, field: "altTitleJapanese", type: "text" },
                { label: "STATUS", icon: <BsExclamationOctagon />, field: "status", type: "text" },
                { label: "STUDIO", icon: <BsBuildings />, field: "studio", type: "text" },
                { label: "DURATION", icon: <BsHourglassSplit />, field: "duration", type: "text" },
                { label: "SEASON", icon: <BsExclamationTriangle />, field: "season", type: "text" },
                { label: "TYPE", icon: <BsExclamationDiamond />, field: "type", type: "text" },
              ].map(({ label, icon, field, type }) => (
                <label key={field} className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 input-sm">
                  {icon}
                  <input
                    type={type}
                    className="grow text-xs"
                    placeholder={label}
                    value={animeDetails[field]}
                    onChange={(e) => handleChange(e, field)}
                    required
                  />
                </label>
              ))}
              <label className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 input-sm">
                <BsFileEarmarkPlay className="text-xs" />
                <input
                  type="text"
                  className="grow text-xs"
                  placeholder="TOTAL EPISODE"
                  value={animeDetails.totalEpisodes}
                  onChange={(e) => handleChange(e, "totalEpisodes")}
                  required
                />
              </label>
            </div>
            <label className="input input-bordered flex items-center gap-2 border-2 border-orange bg-base-200 mb-4 input-sm">
              <BsCameraReels className="text-xs" />
              <input
                type="text"
                className="grow text-xs"
                placeholder="GENRE"
                value={animeDetails.genre}
                onChange={(e) => handleChange(e, "genre")}
                required
              />
            </label>
            <textarea
              className="textarea textarea-bordered text-xs border-2 border-orange bg-base-200 w-full mb-2"
              placeholder="SYNOPSIS"
              value={animeDetails.sinopsis}
              onChange={(e) => handleChange(e, "sinopsis")}
              required
              rows={7}
            ></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {episodes.map((episode, index) => (
                <div key={index} className="join w-full">
                  <input
                    className="input input-bordered join-item border-2 border-orange bg-base-200 w-full input-sm"
                    placeholder={`EPISODE ${index + 1}`}
                    type="text"
                    value={episode.title}
                    onChange={(e) => handleEpisodeChange(e, index, 'title')}
                    required
                  />
                  <input
                    className="input input-bordered join-item border-2 border-orange bg-base-200 w-36 input-sm"
                    placeholder="IFRAME SOURCE VIDEO"
                    type="url"
                    value={episode.iframeSrc}
                    onChange={(e) => handleEpisodeChange(e, index, 'iframeSrc')}
                    required
                  />
                  {index > 0 && (
                    <button
                      className="btn join-item border-2 border-orange btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange"
                      type="button"
                      onClick={() => removeEpisode(index)}
                    >
                      <BsXOctagon className="text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-action">
              <div className="join">
                <button
                  className="btn btn-sm bg-orange hover:bg-base-300 hover:text-orange rounded-lg join-item"
                  type="button"
                  onClick={addEpisode}
                >
                  ADD EPISODE
                </button>
                <button
                  className="btn btn-sm bg-orange hover:bg-base-300 hover:text-orange rounded-lg join-item"
                  type="submit"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "SUBMIT"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
      <dialog id="delete_confirm" className="modal">
        <div className="modal-box border-orange border-2 rounded-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">DELETE ANIME</h3>
          <p className="py-4">
            {isMultipleDelete
              ? `Are you sure you want to delete ${selectedAnimeIds.length} selected anime ?`
              : "Are you sure you want to delete this anime ?"}
          </p>
          <div className="modal-action">
            <button
              className="btn bg-orange hover:bg-base-300 hover:text-orange rounded-lg btn-sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : "SUBMIT"}
            </button>
          </div>
        </div>
      </dialog>
      <dialog id="redeploy" className="modal">
        <div className="modal-box border-orange border-2 rounded-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">REDEPLOY</h3>
          <p className="py-4 font-bold">
            Are you sure you want to redeploy the latest changes?
          </p>
          <p className="pb-4">
            By clicking &apos;SUBMIT&apos;, the application will refresh and revalidate the data on the homepage, ensuring the latest content is available without waiting for the automatic revalidation time.
          </p>
          <p className="pb-4">
            NOTE: The homepage content is generated using Static Site Generation (SSG). When you trigger a redeploy, the content will be refreshed immediately, allowing the latest changes to be available without waiting for the regular revalidation period. This process takes approximately 3 minutes. After about 3 minutes, you can refresh the SSG page to see the latest data.
          </p>
          <div className="modal-action">
            <button
              className="btn bg-orange hover:bg-base-300 hover:text-orange rounded-lg btn-sm"
              onClick={handleRedeploy}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : isSuccess ? (
                <BsCheckCircle />
              ) : (
                'SUBMIT'
              )}
            </button>
          </div>
        </div>
      </dialog>
      <section className="py-8 mt-14">
        <div className="mx-auto px-6">
          <div className="card w-full bg-base-300">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <label className="input input-bordered flex items-center gap-2 input-sm border-2 border-orange bg-base-200 w-40 sm:w-full">
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search Anime"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <BsSearch className="hidden sm:block" />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDeleteModal()}
                    className="btn btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange"
                    disabled={selectedAnimeIds.length === 0}
                  >
                    <BsXCircle className="text-xs" />
                  </button>
                  <button
                    onClick={() => document.getElementById('add_anime').showModal()}
                    className="btn btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange"
                  >
                    <BsPlusCircle className="text-xs" />
                  </button>
                  <button
                    onClick={() => document.getElementById('redeploy').showModal()}
                    className="btn btn-sm btn-square bg-orange hover:bg-base-300 hover:text-orange"
                  >
                    <BsCloudUpload className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-xs table-zebra">
                  <thead>
                    <tr>
                      <th className="truncate">
                        <input
                          type="checkbox"
                          className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                          checked={isAllSelected}
                          onChange={handleSelectAllChange}
                          ref={(input) => {
                            if (input) input.indeterminate = isIndeterminate;
                          }}
                        />
                      </th>
                      <th className="truncate">TITLE</th>
                      <th className="truncate">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="3" className="text-center text-xs">Loading ...</td>
                      </tr>
                    ) : currentData.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-xs">No animes found.</td>
                      </tr>
                    ) : (
                      currentData.map((anime) => (
                        <tr key={anime.id}>
                          <th className="truncate">
                            <input
                              type="checkbox"
                              className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                              checked={selectedAnimeIds.includes(anime.id)}
                              onChange={(e) => handleSelectSingleChange(anime.id, e)}
                            />
                          </th>
                          <td className="truncate text-xs">{anime.title}</td>
                          <td className="truncate">
                            <div className="join">
                              <button className="btn join-item btn-xs btn-square text-orange" onClick={() => handleEdit(anime)}>
                                <BsPencilSquare className="text-xs" />
                              </button>

                              <button
                                className="btn join-item btn-xs btn-square text-orange"
                                onClick={() => handleOpenDeleteModal(anime.id)}
                              >
                                <BsTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th className="truncate">
                        <input
                          type="checkbox"
                          className="checkbox [--chkbg:theme(colors.orange)] checkbox-xs bg-base-300"
                          checked={isAllSelected}
                          onChange={handleSelectAllChange}
                          ref={(input) => {
                            if (input) input.indeterminate = isIndeterminate;
                          }}
                        />
                      </th>
                      <th className="truncate">TITLE</th>
                      <th className="truncate">ACTION</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex space-x-2 justify-center mt-3">
                  <button
                    className="join-item btn btn-xs btn-square text-orange"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <BsChevronDoubleLeft className="text-xs" />
                  </button>
                  <button
                    className="join-item btn btn-xs btn-square text-orange"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <BsChevronLeft className="text-xs" />
                  </button>
                  {getPaginationRange().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`join-item btn btn-xs btn-square text-orange ${currentPage === pageNumber ? 'btn-active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    className="join-item btn btn-xs btn-square text-orange"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <BsChevronRight className="text-xs" />
                  </button>
                  <button
                    className="join-item btn btn-xs btn-square text-orange"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <BsChevronDoubleRight className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {showToast && (
        <div className={`z-50 toast toast-center mb-24 ${fadeOut ? 'fade-out' : ''}`}>
          <div className="alert bg-base-300 border-2 border-orange rounded-xl">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const cookies = context.req.headers.cookie || "";
  const isLoggedInDeveloper = cookies.includes("isLoggedInDeveloper=true");

  if (isLoggedInDeveloper) {
    const emailCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('email='));
    const email = emailCookie ? emailCookie.split('=')[1] : null;

    if (email !== process.env.NEXT_PUBLIC_EMAILDEV) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    console.log("User is logged in as a Developer.");

    return { props: {} };
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
