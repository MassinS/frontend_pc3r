import {Film,TVShow,Comment} from '../constant.ts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar,faHeart,faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { useState,useEffect } from 'react';
import axios from "axios";
import Cookies from 'js-cookie';
import logo from '../assets/IMDb-Logo-700x394.png'
import { useUser } from '../Context/UserContext';
import './Acceuil.css';
import image from '../assets/download.png'
import toast from 'react-hot-toast';
import Recommendation from './Recommendation.tsx';
import Rating from '@mui/material/Rating';

type commentEntity = {
  id: number;
  documentId: string;
  id_media_type: string;  
  media_type: 'movie' | 'TV';  
  commentaire: string;
  createdAt: string; 
  updatedAt: string;
  publishedAt: string;
  date_commentaire: string | null;
  id_user: {
                id: number;
                documentId: string;
                username: string;
                email: string;
                provider: string;
                confirmed: boolean;
                blocked: boolean;
                createdAt: string;
                updatedAt: string;
                publishedAt: string;
                Date_naissance: string;
                Nom_user: string;
                Prenom_user: string;
            }

};

function Details({type,clicked}:{type: string,clicked: Film | TVShow}){
    const[genres,setGenres]=useState<string []>([]);
    const [comment, setComment] = useState('');
    const token=Cookies.get('token');
    const [page, setPage] = useState(1);
    const [changed, setChanged] = useState(false);
    const [comments, setComments] = useState<Comment []>([]);
    const[totalComments,setTotal]=useState(0);
    const [clickedOne,setClicked]=useState<Film | TVShow>(clicked);
    const[typeClicked,setType]=useState(type);
    const { user } = useUser();
    const COMMENTS_PER_PAGE = 10;
    const [note, setNote] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const[liked,setLiked]=useState(false);
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const[showMenu,setShowMenu]=useState(false);
    const[averageVote,setAverageVote]=useState(clickedOne.vote_average_website);
    const[total,setTotalVote]=useState(clickedOne.vote_count_website);
    const [loading,setLoading]=useState(false);
    const [loadinglike,setLoadingLike]=useState(false);
    const[loadingComment,setLoadingComment]=useState(false);
    const[loadingAddcomment,setLoadingAddComment]=useState(false);
    const[loadingstar,setLoadingStar]=useState(false);
    const displayTitle = type === 'movie'
  ? (clickedOne as Film).title
  : (clickedOne as TVShow).Name;
  const displayDate = type === 'movie'
  ? (clickedOne as Film).release_date
  : (clickedOne as TVShow).first_air_date;
  const displayUrl = type === 'movie'
  ? (clickedOne as Film).Backdrop_path
  : (clickedOne as TVShow).backdrop_path;

    const handleRateClick = async () => {
  if (note !== null) {
    try {
      setLoadingStar(true);
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
      const existing = await axios.get(`https://tmdb-database-strapi.onrender.com/api/votes?filters[id_media_type][$eq]=${id}&filters[media_type][$eq]=${type}&filters[id_user][$eq]=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (existing.data?.data?.length > 0) {
        // Vote existant → on le met à jour
        const voteId = existing.data.data[0].documentId;
        await axios.put(`https://tmdb-database-strapi.onrender.com/api/votes/${voteId}`, {
          data: {
            vote: note
          }
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success("Vote mis à jour !");
      } else {
        let id_media_type: string | undefined;
        if (type === "movie" && "id_film" in clickedOne) {
          id_media_type = clickedOne.id_film;
        } else if (type === "TV" && "id_TvShow" in clickedOne) {
          id_media_type = clickedOne.id_TvShow;
        } else {
          throw new Error("clickedOne ne correspond à aucun type connu");
        }
        await axios.post(`https://tmdb-database-strapi.onrender.com/api/votes`, {
          data: {
            id_media_type,
            media_type: type,
            vote: note,
            id_user: user?.id
          }
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success("Vote ajouté avec succès !");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    }finally {
      setLoadingStar(false);
    }

    setIsModalOpen(false);
  }
};
const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`https://tmdb-database-strapi.onrender.com/api/commentaires/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowMenu(!showMenu);
      if (response.status === 204 || response.status === 200) {
        setComments((prev) => prev?.filter((comment) => comment.idc !== id));
        toast.success("Commentaire supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression du commentaire");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
      toast.error("Erreur lors de la suppression du commentaire");
    }
  };

const handleLike = async () => {
    try {
      setLoadingLike(true);
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
      const existing = await axios.get(`https://tmdb-database-strapi.onrender.com/api/Favorites?filters[id_media_type][$eq]=${id}&filters[media_type][$eq]=${type}&filters[id_user][$eq]=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (existing.data?.data?.length > 0) {
        // Like existant → on le supprime
        const likeId = existing.data.data[0].documentId;
        await axios.delete(`https://tmdb-database-strapi.onrender.com/api/Favorites/${likeId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLiked(false);
        toast.success("Like supprimé !");
      } else {
        // Nouveau like
        await axios.post(`https://tmdb-database-strapi.onrender.com/api/Favorites`, {
          data: {
            id_media_type: id,
            media_type: type,
            id_user: user?.id
          }
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setLiked(true);
        toast.success("Like ajouté avec succès !");
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue");
    }finally {
      setLoadingLike(false);
    }
}

    const handleRecommendationClick = (film: Film | TVShow, newType: string) => {
    setGenres([]); 
    setComments([]);
    setPage(1);  
    setClicked(film);
    setType(newType);
    setChanged(!changed);
    setNote(null);
    setLiked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });   
  };

    useEffect(()=>{
        clickedOne.genre_tv_films.map((id)=>{
            axios.get(`https://tmdb-database-strapi.onrender.com/api/genre-Tv-shows?filters[id_genre][$eq]=${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
            }).then((respo)=>{
                if (respo.data.data.length > 0) {
                 const genre = respo.data.data[0].nom_genre;
                 setGenres((prev) => {
                    if (!prev.includes(genre)) {
                        return [...prev, genre];
                    }
                    return prev;
                    });
                }
            }).catch((err) => {
           console.error(`Erreur pour le genre ID ${id}:`, err);
         });
        })
    },[clickedOne,typeClicked]);

    useEffect(()=>{
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
       axios.get(`https://tmdb-database-strapi.onrender.com/api/votes/average?id_media_type=${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo)=>{
            if(respo.data){
                const averageVote = respo.data.average;
                setAverageVote(averageVote);
            }
        }).catch((err) => {
            console.error(`Erreur pour le genre ID ${clickedOne.genre_tv_films}:`, err);
        });
      
    },[note]);

    useEffect(()=>{
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
        axios.get(`https://tmdb-database-strapi.onrender.com/api/votes?filters[id_media_type][$eq]=${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo)=>{
            if(respo.data){
                const totalVote = respo.data.meta.pagination.total;
                setTotalVote(totalVote);
            }
        }).catch((err) => {
            console.error(err);
        });
      
    },[note]);

    useEffect(()=>{
        if(averageVote===null || total===null){
            return;
        }
        console.log(averageVote);
      let url:string;
        if(type==="movie"){
            url=`https://tmdb-database-strapi.onrender.com/api/films/${clickedOne.documentId}`
        }else{
            url=`https://tmdb-database-strapi.onrender.com/api/Tv-shows/${clickedOne.documentId}`
        }
        axios.put(url,{
            data: {
                vote_average_website: averageVote,
                vote_count_website: total,
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo)=>{
          console.log(respo.data);
            if(respo.data){
                console.log("Vote mis à jour avec succès");
            }
        }
        ).catch((err) => {
            console.error(`Erreur pour le genre ID ${clickedOne.genre_tv_films}:`, err);
        }
        )
    },[averageVote,total,note]);




    useEffect(()=>{
      setLoading(true);
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
        axios.get(`https://tmdb-database-strapi.onrender.com/api/votes?filters[id_media_type][$eq]=${id}&filters[media_type][$eq]=${type}&filters[id_user][$eq]=${user?.id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo)=>{
            if(respo.data){
                console.log(respo.data);
            }
            if(respo.data.data.length>0){
                setNote(respo.data.data[0].vote);
            }
        }
        ).catch((err) => {
            console.error(`Erreur pour le genre ID ${clickedOne.genre_tv_films}:`, err);
        }
        ).finally(()=>{
            setLoading(false);
        }
        )
    },[clickedOne]);

    useEffect(()=>{
      setLoadingLike(true);
      let id: string | undefined;
      if (type === "movie" && "id_film" in clickedOne) {
        id = clickedOne.id_film;
      } else if (type === "TV" && "id_TvShow" in clickedOne) {
        id = clickedOne.id_TvShow;
      } else {
        throw new Error("Type ou propriétés inconnues");
      }
        axios.get(`https://tmdb-database-strapi.onrender.com/api/Favorites?filters[id_media_type][$eq]=${id}&filters[media_type][$eq]=${type}&filters[id_user][$eq]=${user?.id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo)=>{
            if(respo.data.data.length>0){
                setLiked(true);
            }
        }
        ).catch((err) => {
            console.error(`Erreur pour le genre ID ${clickedOne.genre_tv_films}:`, err);
        }
        ).finally(()=>{
            setLoadingLike(false);
        }
        )
    },[clickedOne]);


    useEffect(()=>{
        setLoadingComment(true);
        let id: string | undefined;
        if (type === "movie" && "id_film" in clickedOne) {
          id = clickedOne.id_film;
        } else if (type === "TV" && "id_TvShow" in clickedOne) {
          id = clickedOne.id_TvShow;
        } else {
          throw new Error("Type ou propriétés inconnues");
        }
        axios.get(`https://tmdb-database-strapi.onrender.com/api/commentaires?filters[id_media_type][$eq]=${id}&filters[media_type][$eq]=${typeClicked}&pagination[page]=${page}&pagination[pageSize]=${COMMENTS_PER_PAGE}&populate=id_user`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response)=>{
            if(response.data){
                console.log(response.data);
                const totalComments = response.data.meta.pagination.total;
                setTotal(totalComments);
                const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
                if (page > totalPages) {
                    setPage(totalPages);
                }
                const data = response.data.data;
                data.map((item:commentEntity)=>{
                    const commentText = item.commentaire;
                    const id = item.documentId;
                    const nom = item.id_user.Nom_user;
                    const prenom = item.id_user.Prenom_user;
                    const id_user = item.id_user.id;
                    setComments((prev) => {
                        // Vérifie si un commentaire avec le même idc existe déjà
                        const alreadyExists = prev?.some((c) => c.idc === id);

                        if (alreadyExists) {
                            return prev; // Ne rien changer
                        }

                        const newComment = {
                            commentText: commentText,
                            nom: nom,
                            prenom: prenom,
                            idc: id,
                            idU: id_user
                        };
                        return [...prev|| [], newComment]; // Ajouter le nouveau commentaire
                    });
                })
                
        }
        }).catch((erreur)=>{
            console.log(erreur)
        }).finally(()=>{
            setLoadingComment(false);
        }
        )
    },[clickedOne,typeClicked,changed,page]);

    

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
         setLoadingAddComment(true);
        let id: string | undefined;
        if (type === "movie" && "id_film" in clickedOne) {
          id = clickedOne.id_film;
        } else if (type === "TV" && "id_TvShow" in clickedOne) {
          id = clickedOne.id_TvShow;
        } else {
          throw new Error("Type ou propriétés inconnues");
        }
        axios.post("https://tmdb-database-strapi.onrender.com/api/commentaires", {

            data: {
                id_media_type: id,
                media_type: typeClicked,
                commentaire: comment,
                id_user: user?.id
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((respo) => {
            if (respo.data) {
                setComment('');
                setChanged(!changed);
                toast.success("Commentaire ajouté avec succès");
            }
        }).catch((erreur) => {
            console.log(erreur)
        }).finally(()=>{
            setLoadingAddComment(false);
        }
        )
    }



    return(
        <>

        <div className="w-full h-full flex flex-col items-center">
        <div className="w-full flex flex-col relative min-h-[400px] rounded-lg overflow-hidden mt-8">
            <img
                src={`https://image.tmdb.org/t/p/original${displayUrl}`}
                className="w-full h-full object-cover"
            />
  
  {/* Overlay flou pour le texte */}
  <div className="absolute bottom-0 left-0 w-full h-full bg-black/40 backdrop-blur-[2px] text-white p-4">

  {isModalOpen && (
  <div className="fixed inset-0  flex items-center justify-center z-50">
    <div className="bg-[#1e1e1e] text-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
      <button
        onClick={()=> setIsModalOpen(false)}
        className="absolute text-center top-[-24px] right-[-20px] text-white text-xl bg-gray-500 rounded-2xl px-2 anime"
      >
        &times;
      </button>
      
      <div className="flex flex-col items-center">
        <div className="text-yellow-400 font-semibold mb-2 uppercase text-sm">Noter ceci</div>
        <div className="text-lg font-bold mb-4 text-center">{displayTitle}</div>

        <div className="flex justify-center mb-4">
          <Rating
                name="film-rating"
                value={note}
                max={10} 
                precision={1} 
                onChange={(event) => {
                const target = event.target as HTMLInputElement;
                const newValue = target.value;
                setNote(Number(newValue));
                }}
            />
        </div>

        <button className={`w-[200px] px-6 py-2 rounded-full anime transition-colors duration-300
            ${note === null
            ? 'bg-gray-600 text-white opacity-50 cursor-not-allowed'
            : 'bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer'}
        `} onClick={handleRateClick} disabled={note === null}>
          {loadingstar ? (
        <>
          <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Chargement...
        </>
      ) : (
        "Noter"
      )}
        </button>
      </div>
    </div>
  </div>
)}

   <div className='flex w-full h-full'>
    <div className='w-1/2 pl-10'>
     <h2 className="text-2xl font-bold">{displayTitle}</h2>
     <div className='flex mt-2'>
        <p className='text-[9px] text-gray-400'>{typeClicked==="TV"?"TV-Show":"Movie"}</p>
        <p className='text-[9px] text-gray-400 ml-1'>|</p>
        {genres.map((genre,id)=>{
            return(
              <p key={id} className='text-[9px] text-gray-400 ml-1'>{genre} |</p>  
            )
        })}
     </div>
     <div className='flex mt-2'>
            <p className='text-[9px] text-gray-400'>Date de sortie:</p>
            <p className='text-[9px] text-gray-400 ml-1'>{displayDate}</p>
            </div>
     <div className='flex mt-2 items-center'>
        <FontAwesomeIcon icon={faStar} className="text-lg w-5 text-yellow-300" />
        <div className="flex pl-1">
            <li className="list-none text-white text-[16px]">
                {clickedOne.vote_average_tmdb}
            </li>
            <li className="list-none ml-1 text-gray-400 text-[10px] self-center">
                /10
            </li>
       </div>
       <img
        src={logo}
        alt="logo"
        className="w-8 h-4 object-cover ml-2"
        />
        <div className="flex pl-4 items-center">
          <FontAwesomeIcon icon={faStar} className="text-lg w-5 text-green-400" />
            <li className="list-none text-white text-[16px] pl-1">
                {clickedOne.vote_average_website}
            </li>
            <li className="list-none ml-1 text-gray-400 text-[10px] self-center">
                /10
            </li>
            </div>
     </div>
     <p className="text-[11px] mt-2 text-gray-200 leading-loose">{clickedOne.overview}</p>
        <div className="flex mt-4">
            {loading?<div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            :<div className='flex justify-between items-center'>
             {note!=null?<p className="text-lg text-gray-400">Ma note</p>:null}
        <div className="flex items-center px-4 py-0.5 rounded-2xl hover:bg-gray-500 group cursor-pointer" style={{ '--tw-bg-opacity': '0.2' } as React.CSSProperties} onClick={()=>setIsModalOpen(true)}>
            <FontAwesomeIcon
                icon={faStar}
                className={`w-5 h-5 stroke-green-400 ${
                    note !== null ? 'text-green-400' : 'text-transparent'
                }`}
                style={{ strokeWidth: 40 }}
                />
          <p className="text-lg ml-2 text-green-400">{note===null?`Noter`:`${note}/10`}</p>
        </div>                
            </div>}
            
            {loadinglike?<div className="ml-10 w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            :<div className="flex items-center px-4 py-0.5 rounded-2xl hover:bg-gray-500 group cursor-pointer" style={{ '--tw-bg-opacity': '0.2' } as React.CSSProperties} onClick={handleLike}>
            <FontAwesomeIcon
                icon={faHeart}
                className={`w-5 h-5 stroke-red-600 ${
                    liked === true ? 'text-red-600' : 'text-transparent'
                }`}
                style={{ strokeWidth: 40 }}
                />
          <p className="text-lg ml-2 text-white">J'aime</p>
        </div>}


        </div>
    </div>
    <img
      src={`https://image.tmdb.org/t/p/w500${clickedOne.poster_path}`}
      className="w-56 h-80 object-cover rounded-lg ml-40"
    />

   </div>

  </div>
   
</div>

<div className="w-full flex justify-center">
   <div className="w-full bg-black/60 backdrop-blur-md p-6 rounded-xl text-white">
    
    {/* Formulaire d'ajout */}
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea 
        className="w-full p-3 rounded-md input text-white resize-none" 
        placeholder="Ajoutez un commentaire..."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="mt-2 px-4 py-2 bg-red-700 anime rounded-md">{loadingAddcomment ? (
        <>
          <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Chargement...
        </>
      ) : (
        "Publier"
      )}</button>
    </form>

     <h2 className="text-2xl font-bold mb-4">Commentaires</h2>

    {/* Liste des commentaires */}
    {loadingComment?<div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
    :<div className="max-h-60 overflow-y-auto pr-2">
        {comments?.length === 0 ? (
    <p className="text-gray-400">Aucun commentaire pour le moment.</p>
    ) : (
    comments?.map((c, index) => (
        <div key={index} className="flex p-3 rounded-xl h-14 mt-2 commentaire ml-2 py-2 mb-2">
         <img src={image} className="h-10 w-10 rounded-full"></img>
        <div className='flex flex-col ml-2'>
         <p className="text-xs text-gray-400"> {c?.nom} {c?.prenom}</p>
         <p className="text-sm mt-1">{c?.commentText}</p>
        </div>
        {c?.idU===user?.id?<div className="relative top-[-2px] right-[-20px] ">
          <button onClick={() =>{ setMenuOpen(index); setShowMenu(!showMenu)}}>
            <FontAwesomeIcon icon={faEllipsisVertical} className="text-gray-500 hover:text-white anime " />
          </button>
          </div>:null}
           {menuOpen === index && showMenu && (
            <div className="relative top-[-2px] right-[-32px] rounded commentaire z-10 anime">
              <button
                onClick={() => handleDelete(c.idc)}
                className="block px-4 py-2 text-white  text-sm w-full text-left"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
  ))
)}
    </div>}
    {(totalComments>(comments?.length??0))?<div className="flex justify-center mt-4">
      <button
        className="px-4 py-2 bg-red-700 anime rounded-md"
        onClick={() => setPage((prev) => prev + 1)}
      >
        Voir plus
      </button>
      </div>:null}
      <Recommendation type={typeClicked} clicked={clickedOne} onRecommendationClick={handleRecommendationClick} />

  </div>
  </div>

        </div>
        </>
    
        

    )
}
export default Details;