import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import axios2 from "../utils/axios";
import Sidenav from "../partials/sidenav";
import Flashmessage from "./Flashmessage";
import HistoryCard from "../partials/HistoryCard";
import Loading from "./Loading";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [wallpaper, setWallpaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [getError, setError] = useState(null);
  const [movieHistory, setMovieHistory] = useState([]);
  const navigate = useNavigate();

  document.title = `Profile | Godcrafts`;

  // Fetch trending movie wallpaper
  const getHeaderWallpaper = async () => {
    try {
      const { data } = await axios2.get("trending/all/day");
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        setWallpaper(
          `https://image.tmdb.org/t/p/original/${data.results[randomIndex].backdrop_path}`
        );
      } else {
        setError("No wallpaper results found");
      }
    } catch (error) {
      setError("Error fetching wallpaper");
      console.error(error);
    }
  };

  // Fetch profile data
  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const authToken = localStorage.getItem("authToken");
      if (!token && !authToken) {
        setError("No token found");
        navigate("/login");
        return;
      }

      const authHeader = `Bearer ${token || authToken}`;
      const response = await axios.get("https://movies-backend-07f5.onrender.com/profile", {
        headers: { Authorization: authHeader },
      });

      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        setError("Unauthorized access");
        navigate("/login");
      } else {
        setError("Error fetching profile data");
      }
    }
  };

  // Initialize component
  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) || [];
        setMovieHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing history:", error);
      }
    }

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([getProfile(), getHeaderWallpaper()]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const avatar = `https://movies-backend-07f5.onrender.com/${profileData?.avatar}`;
  const googleProfile = profileData?.googleProfile;
  const defaultProfile = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Sidenav />
      {getError && <Flashmessage message={getError} />}
      <div
        className="w-screen min-h-screen bg-cover bg-center overflow-hidden overflow-y-auto relative"
        style={{ backgroundImage: `url(${wallpaper})` }}
      >
        <nav className="absolute top-0 left-0 w-full flex items-center justify-between p-5 z-10">
          <h1 className="text-3xl font-semibold">Profile</h1>
          <Link to="/settings" className="bg-red-500 text-white px-3 py-2 rounded-md">
            Settings
          </Link>
        </nav>
        <div className="profdets flex min-h-full flex-col bg-black/15 backdrop-blur-[2px] p-5 items-center">
          {/* Profile Information */}
          <div className="flex flex-col items-center">
            <img
              src={`${googleProfile || avatar || defaultProfile}`}
              alt="profile"
              className="w-[150px] h-[150px] rounded-full object-cover bg-transparent border-2 border-white"
            />
          </div>
          <h1 className="text-3xl mt-3 font-semibold">{profileData?.username}</h1>
          <p>{profileData?.email}</p>

          {/* Movie History Section */}
          <div className="movie-history w-full min-h-full mt-5">
            <h2 className="text-2xl font-semibold">Watched History</h2>
            {movieHistory.length === 0 ? (
              <p>No movies watched yet.</p>
            ) : (
              <div>
                <HistoryCard data={movieHistory} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
