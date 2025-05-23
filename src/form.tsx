import { useState } from "react"
import './login.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Navigate } from "react-router";
import { useUser } from "./Context/UserContext";
type FormProps = {
  isLogin: boolean;
}
function Form({ isLogin }: FormProps) {
 const[email,setEmail]=useState('');
 const[erreurEmail,setErreurEmail]=useState(false);  
 const[password,setPassword]=useState('');
 const[nom,setNom]=useState('');
 const[prenom,setPrenom]=useState('');
 const [dateNaissance, setDateNaissance] = useState<Date | null>(null);
 const { setUser } = useUser();
 const[rememberMe,setRememberMe]=useState(false);
 const[navige,setNavige]=useState(false);
 const[erreur,setErreur]=useState(false);
 const[loading,setLoading]=useState(false);
 const changer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user={
        username:nom+prenom,
        email:email,
        password:password
      }
    if(isLogin){
      const personne={
        identifier:email,
        password:password
      }
      if(email && password){
      setLoading(true);
        axios.post("https://tmdb-database-strapi.onrender.com/api/auth/local",personne).then((respo)=>{
      if(respo.data){
        console.log(respo.data);
        const pers={
          id:respo.data.user.id,
          Nom_user:respo.data.user.Nom_user,
          Prenom_user:respo.data.user.Prenom_user,
          email_user:respo.data.user.email,
          Date_naissance:respo.data.user.Date_naissance,
        }
        Cookies.set('user', JSON.stringify(pers), { expires: rememberMe ? 1 : 1/24, secure: true, sameSite: 'strict' });
        Cookies.set('token', respo.data.jwt, { expires: rememberMe ? 1 : 1/24, secure: true, sameSite: 'strict' });
        setUser(pers);
        toast.success("Connexion reussite");
        setNavige(true);//pour permettre d'allez a la page d'acceuil
      }

    }).catch((err)=>{
      setErreur(true);
      console.log(err)
    }).finally(()=>{
      setLoading(false);
    })
      }else{
        toast.error("vous remplir les deux champ")
      }
    }else{
        if(nom && prenom && dateNaissance ){
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(email)) {
            toast.error("vous devez inserer l'email correctement")
            return
          }
          if (password.length < 8) {
            toast.error("le mot de passe doit contenir au moins 8 caracteres");
            return;
          }
        setLoading(true);
          axios.post("https://tmdb-database-strapi.onrender.com/api/auth/local/register",user).then((respo)=>{
                      const idUser=respo.data.user.id;
                      const token=respo.data.jwt;
                      const pers={
                        id:idUser,
                        Nom_user:nom,
                        Prenom_user:prenom,
                        email_user:email,
                        Date_naissance:dateNaissance+""
                      }
                      const personne={
                        id:idUser,
                        Nom_user:nom,
                        Prenom_user:prenom,
                        Date_naissance:dateNaissance+""
                      }
                      Cookies.set('user', JSON.stringify(pers), { expires: rememberMe ? 1 : 1/24, secure: true, sameSite: 'strict' });
                      Cookies.set('token', respo.data.jwt, { expires: rememberMe ? 1 : 1/24, secure: true, sameSite: 'strict' });
                      setUser(pers);
                      toast.success("Inscription avec succes");
                      axios.put(`https://tmdb-database-strapi.onrender.com/api/users/${idUser}`,personne,{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                    }).then((respo)=>{
                      if(respo.data){
                        setNavige(true);
                      }
                    })
                    }).catch((erreur)=>{
                      const response=erreur.response.data.error.message;
                      if (response.includes("Email")) {
                        toast.error("Email est déjà utilisé");
                        setErreurEmail(true);
                      }
                    }).finally(()=>{
                      setLoading(false);
                    })
        }else{
          toast.error("tous les champs sont obligatoire");
        }
      
    }
  }



    return (
      <>
      
      {navige?<Navigate to="/Acceuil"  replace={true} />:null}
        {isLogin?<form className="flex flex-col  to-blue-500  sm:px-10 rounded-xl shadow-md kaka " style={{background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)", backdropFilter: "blur(8px)"}} onSubmit={changer}>
            <p className="text-2xl sm:text-3xl  text-white font-semibold mt-8">Account Login</p>
            <div className="flex flex-col mt-12">
                <label  className=" text-white">Email adresse</label>
                <input type="email" className="pl-1 mt-4 h-10 rounded-lg bg-transparent border-2 border-solid border-white focus:border-4 text-white outline-none placeholder:text-white" id={erreur?'error':undefined} placeholder="exemple123@gmail.com" onChange={(e)=>{
                  setEmail(e.target.value);
                  setErreur(false);
                }}></input>
            </div>
            <div className="flex flex-col mt-6">
                <label className=" text-white">Mot de passe</label>
                <input type="password"  className="pl-1 mt-4 h-10 rounded-lg bg-transparent border-2 border-solid  border-white outline-none focus:border-4 text-white placeholder:text-white" id={erreur?'error':undefined} placeholder="************" onChange={(e)=>{
                  setPassword(e.target.value);
                  setErreur(false)
                }}></input>
            </div>
            {erreur?<div className='mt-2'>
              <p className='text-red-600 text-sm'>email ou mot de passe incorrecte</p>
            </div>:null}
            <div className="flex justify-between items-center pt-6">
            <div className=" flex items-center
             
             ">
              <input type="checkbox" onClick={(e) => setRememberMe((e.target as HTMLInputElement).checked)} className="flex h-4 w-4"></input>
              <p className="pl-2 text-white">Remember me</p>
            </div>
            <p className="text-white">Need help?</p>
            
            
            
            </div>
            
            <button className=" text-white mt-12 px-2 py-2 rounded-lg boutton" style={{backgroundColor:"#0029FF"}}>{loading ? (
        <>
          <div className="w-4 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Chargement...
        </>
      ) : (
        "Se connecter"
      )}</button>
        </form>:
        
        
        <form className="flex flex-col  to-blue-500  sm:px-10 rounded-xl shadow-md " style={{background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)", backdropFilter: "blur(8px)"}} onSubmit={changer}>
            <p className="text-2xl sm:text-3xl  text-white font-semibold mt-4 self-center">Inscription</p>
            <div className="flex flex-col mt-3">
                <label  className=" text-white">Nom</label>
                <input type="text" className="pl-1 mt-1 h-10 rounded-lg bg-transparent border-2 border-solid border-white focus:border-4 text-white outline-none placeholder:text-gray-300" placeholder="exemple:Sadi" onChange={(e)=>{
                  setNom(e.target.value);
                  setErreur(false);
                }}></input>
            </div>
            <div className="flex flex-col mt-3">
                <label  className=" text-white">Prenom</label>
                <input type="text" className="pl-1 mt-1 h-10 rounded-lg bg-transparent border-2 border-solid border-white focus:border-4 text-white outline-none placeholder:text-gray-300"  placeholder="exemple:massin" onChange={(e)=>{
                  setPrenom(e.target.value);
                  setErreur(false);
                }}></input>
            </div>
            <div className="flex flex-col mt-3">
                <label  className=" text-white">Email adresse</label>
                <input type="email" className="pl-1 mt-1 h-10 rounded-lg bg-transparent border-2 border-solid border-white focus:border-4 text-white outline-none placeholder:text-gray-300" id={erreurEmail?'error':undefined} placeholder="exemple123@gmail.com" onChange={(e)=>{
                  setEmail(e.target.value);
                  setErreurEmail(false);
                }}></input>
            </div>
            <div className="flex flex-col mt-3">
                <label className=" text-white">Mot de passe</label>
                <input type="password"  className="pl-1 mt-1 h-10 rounded-lg bg-transparent border-2 border-solid  border-white outline-none focus:border-4 text-white placeholder:text-gray-300"  placeholder="************" onChange={(e)=>{
                  setPassword(e.target.value);
                  setErreur(false)
                }}></input>
            </div>
            <div className="flex mt-2 w-[400px]">
            <div className="flex flex-col">
            
            </div>
            <div className="flex flex-col ml-1">
            <label className=" text-white">Date de naissance</label>
            <DatePicker
              selected={dateNaissance}
              onChange={(date) => setDateNaissance(date)}
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100} // montre les 100 dernières annees
              maxDate={new Date()}         
              placeholderText="Choisir une date"
              withPortal={false}
              className="p-2 mt-1 border-2 border-solid  border-white text-white rounded-lg"
            />

            </div>

            </div>
        
            {erreur?<div className='mt-2'>
              <p className='text-red-600 text-sm'>email ou mot de passe incorrecte</p>
            </div>:null}

            
            <button className=" text-white mt-8 px-2 py-2 rounded-lg mb-8 boutton" style={{backgroundColor:"#0029FF"}}>{loading ? (
        <>
          <div className="w-4 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Chargement...
        </>
      ) : (
        "Confirmer"
      )}</button>
        </form>}
      </>
    )
  }
  
  export default Form;